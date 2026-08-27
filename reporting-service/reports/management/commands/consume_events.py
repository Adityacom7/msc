import json
import os
import time

import pika
from django.core.management.base import BaseCommand

from reports.models import TaskEvent

EXCHANGE = os.environ.get("RABBITMQ_EXCHANGE", "task_events")
DEAD_LETTER_EXCHANGE = os.environ.get("RABBITMQ_DLX_EXCHANGE", "task_events.dlx")
DEAD_LETTER_QUEUE = "reporting-service.dlq"


class Command(BaseCommand):
    help = "Subscribes to task-service's RabbitMQ events and records events for reporting"

    def handle(self, *args, **options):
        url = os.environ["RABBITMQ_URL"]

        while True:
            try:
                self.stdout.write(f"reporting-consumer: connecting to rabbitmq at {url}")
                connection = pika.BlockingConnection(pika.URLParameters(url))
                channel = connection.channel()
                channel.exchange_declare(exchange=EXCHANGE, exchange_type="topic", durable=True)
                channel.exchange_declare(exchange=DEAD_LETTER_EXCHANGE, exchange_type="fanout", durable=True)
                channel.queue_declare(queue=DEAD_LETTER_QUEUE, durable=True)
                channel.queue_bind(exchange=DEAD_LETTER_EXCHANGE, queue=DEAD_LETTER_QUEUE)
                channel.queue_declare(
                    queue="reporting-service",
                    durable=True,
                    arguments={"x-dead-letter-exchange": DEAD_LETTER_EXCHANGE},
                )
                channel.queue_bind(exchange=EXCHANGE, queue="reporting-service", routing_key="task.*")

                def callback(ch, method, properties, body):
                    try:
                        payload = json.loads(body)
                        task = payload["task"]
                        TaskEvent.objects.create(
                            routing_key=method.routing_key,
                            task_id=task["id"],
                            title=task["title"],
                            username=payload["user"],
                        )
                        self.stdout.write(
                            f"reporting-consumer: recorded {method.routing_key} for task {task['id']}"
                        )
                        ch.basic_ack(delivery_tag=method.delivery_tag)
                    except Exception as err:
                        self.stderr.write(f"reporting-consumer: failed to process message ({err})")
                        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

                channel.basic_consume(queue="reporting-service", on_message_callback=callback)
                self.stdout.write("reporting-consumer: connected, waiting for events...")
                channel.start_consuming()
            except pika.exceptions.AMQPConnectionError as err:
                self.stderr.write(f"reporting-consumer: RabbitMQ connection error ({err}), reconnecting in 3s...")
                time.sleep(3)
