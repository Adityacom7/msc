import 'dotenv/config';
import express, { Request, Response } from 'express';
import { init } from './db';
import { Task } from './models/Task';
import authenticate from './middleware/auth';
import { connectWithRetry as connectRabbitMQ, publishEvent as publishRabbitMQEvent } from './rabbitmq';
import { startDeadlineChecker } from './deadlineChecker';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4002;
function publishTaskEvent(routingKey: string, task: unknown, username: string): void {
  publishRabbitMQEvent(routingKey, task, username);
}

app.get('/health', (_req: Request, res: Response) => res.json({ status: 'ok' }));

app.use(authenticate);

app.get('/tasks', async (req: Request, res: Response) => {
  const tasks = await Task.findAll({
    where: { user_id: req.user!.id },
    order: [['created_at', 'DESC']],
  });
  res.json(tasks);
});

app.post('/tasks', async (req: Request, res: Response) => {
  const { title, description, deadline } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'title is required' });
  }

  const task = await Task.create({
    user_id: req.user!.id,
    username: req.user!.username,
    title,
    description: description || null,
    deadline: deadline ? new Date(deadline) : null,
  });
  publishTaskEvent('task.created', task, req.user!.username);
  res.status(201).json(task);
});

app.put('/tasks/:id', async (req: Request, res: Response) => {
  const { title, description, status, deadline } = req.body;
  const task = await Task.findOne({ where: { id: req.params.id, user_id: req.user!.id } });
  if (!task) {
    return res.status(404).json({ error: 'task not found' });
  }

  const fields: Partial<{
    title: string;
    description: string;
    status: string;
    deadline: Date | null;
    deadline_notified: boolean;
    updated_at: Date;
  }> = {
    updated_at: new Date(),
  };
  if (title !== undefined) fields.title = title;
  if (description !== undefined) fields.description = description;
  if (status !== undefined) fields.status = status;
  if (deadline !== undefined) {
    const nextDeadline = deadline ? new Date(deadline) : null;
    fields.deadline = nextDeadline;
    // A changed deadline deserves its own approaching-soon notification.
    if (nextDeadline?.getTime() !== task.deadline?.getTime()) {
      fields.deadline_notified = false;
    }
  }
  await task.update(fields);

  publishTaskEvent('task.updated', task, req.user!.username);
  res.json(task);
});

app.delete('/tasks/:id', async (req: Request, res: Response) => {
  const task = await Task.findOne({ where: { id: req.params.id, user_id: req.user!.id } });
  if (!task) {
    return res.status(404).json({ error: 'task not found' });
  }
  await task.destroy();
  publishTaskEvent('task.deleted', task, req.user!.username);
  res.status(204).send();
});

async function start() {
  await init();
  await connectRabbitMQ();
  startDeadlineChecker();
  app.listen(PORT, () => console.log(`task-service listening on ${PORT}`));
}

start();
