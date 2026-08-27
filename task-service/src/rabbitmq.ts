import amqp, { Channel } from 'amqplib';

const EXCHANGE = process.env.RABBITMQ_EXCHANGE || 'task_events';
let channel: Channel | undefined;

export async function connectWithRetry(retries = 10, delayMs = 3000): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const connection = await amqp.connect(process.env.RABBITMQ_URL as string);
      channel = await connection.createChannel();
      await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
      console.log('task-service: connected to rabbitmq');
      return;
    } catch (err) {
      console.log(`task-service: rabbitmq not ready, retrying (${attempt}/${retries})...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error('task-service: could not connect to rabbitmq after retries');
}

export function publishEvent(routingKey: string, task: unknown, username: string): void {
  if (!channel) {
    console.warn(`task-service: rabbitmq channel not ready, dropping event ${routingKey}`);
    return;
  }
  const payload = { task, user: username };
  channel.publish(EXCHANGE, routingKey, Buffer.from(JSON.stringify(payload)), { persistent: true });
}
