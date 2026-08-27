import 'dotenv/config';
import amqp, { ConsumeMessage } from 'amqplib';

const EXCHANGE = process.env.RABBITMQ_EXCHANGE || 'task_events';
const QUEUE = 'notification-service';
const DEAD_LETTER_EXCHANGE = process.env.RABBITMQ_DLX_EXCHANGE || 'task_events.dlx';
const DEAD_LETTER_QUEUE = 'notification-service.dlq';

interface TaskEventMessage {
  task: { id: number; title: string; deadline?: string | null };
  user: string;
}

function logNotification(routingKey: string, event: TaskEventMessage): void {
  if (routingKey === 'task.deadline_approaching') {
    console.log(
      `Notification: task "${event.task.title}" (assigned to ${event.user}) is due soon — deadline ${event.task.deadline}`
    );
    return;
  }
  const verbs: Record<string, string> = {
    'task.created': 'created',
    'task.updated': 'updated',
    'task.deleted': 'deleted',
  };
  const verb = verbs[routingKey] || routingKey;
  console.log(`Notification: task "${event.task.title}" was ${verb} by ${event.user}`);
}

async function subscribe(): Promise<void> {
  const url = process.env.RABBITMQ_URL as string;
  const connection = await amqp.connect(url);
  const channel = await connection.createChannel();
  await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
  await channel.assertExchange(DEAD_LETTER_EXCHANGE, 'fanout', { durable: true });
  await channel.assertQueue(DEAD_LETTER_QUEUE, { durable: true });
  await channel.bindQueue(DEAD_LETTER_QUEUE, DEAD_LETTER_EXCHANGE, '');
  await channel.assertQueue(QUEUE, {
    durable: true,
    arguments: { 'x-dead-letter-exchange': DEAD_LETTER_EXCHANGE },
  });
  await channel.bindQueue(QUEUE, EXCHANGE, 'task.*');
  await channel.consume(QUEUE, (message: ConsumeMessage | null) => {
    if (!message) return;
    try {
      logNotification(message.fields.routingKey, JSON.parse(message.content.toString()));
      channel.ack(message);
    } catch (error) {
      console.error(`notification-service: failed to process event (${error})`);
      channel.nack(message, false, false);
    }
  });
  console.log('notification-service: connected to rabbitmq, waiting for events...');
}

subscribe().catch((error) => {
  console.error(`notification-service: rabbitmq connection failed (${error})`);
  process.exitCode = 1;
});
