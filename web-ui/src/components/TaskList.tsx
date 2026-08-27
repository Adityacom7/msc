import type { Task } from '../api';
import { TaskItem } from './TaskItem';

export function TaskList({
  tasks,
  onAdvanceStatus,
  onSaveDetails,
  onDelete,
}: {
  tasks: Task[];
  onAdvanceStatus: (task: Task) => void;
  onSaveDetails: (task: Task, title: string, description: string, deadline: string) => void;
  onDelete: (task: Task) => void;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-[0.8rem] font-semibold uppercase tracking-[0.06em] text-muted mb-3.5">Tasks</h2>
      {tasks.length === 0 && <p className="text-muted text-sm">No tasks yet.</p>}
      <ul className="list-none m-0 p-0 flex flex-col gap-2">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onAdvanceStatus={onAdvanceStatus}
            onSaveDetails={onSaveDetails}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </section>
  );
}
