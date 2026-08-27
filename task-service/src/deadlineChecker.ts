import { Op } from 'sequelize';
import { Task } from './models/Task';
import { publishEvent } from './rabbitmq';

const WARNING_MINUTES = Number(process.env.DEADLINE_WARNING_MINUTES) || 60;
const CHECK_INTERVAL_MS = Number(process.env.DEADLINE_CHECK_INTERVAL_MS) || 30000;

async function checkApproachingDeadlines(): Promise<void> {
  const now = new Date();
  const warningCutoff = new Date(now.getTime() + WARNING_MINUTES * 60 * 1000);

  const tasks = await Task.findAll({
    where: {
      deadline: { [Op.ne]: null, [Op.lte]: warningCutoff },
      deadline_notified: false,
      status: { [Op.ne]: 'done' },
    },
  });

  for (const task of tasks) {
    publishEvent('task.deadline_approaching', task, task.username);
    await task.update({ deadline_notified: true });
    console.log(`task-service: deadline approaching for task ${task.id} ("${task.title}")`);
  }
}

export function startDeadlineChecker(): void {
  setInterval(() => {
    checkApproachingDeadlines().catch((err) =>
      console.error(`task-service: deadline check failed (${err})`)
    );
  }, CHECK_INTERVAL_MS);
  console.log(
    `task-service: deadline checker running (every ${CHECK_INTERVAL_MS}ms, warning window ${WARNING_MINUTES}m)`
  );
}
