import { useState } from 'react';
import type { Task } from '../api';
import { statusRailColor } from '../lib/taskStatus';
import { toDatetimeLocalValue, isOverdue } from '../lib/deadline';

export function TaskItem({
  task,
  onAdvanceStatus,
  onSaveDetails,
  onDelete,
}: {
  task: Task;
  onAdvanceStatus: (task: Task) => void;
  onSaveDetails: (task: Task, title: string, description: string, deadline: string) => void;
  onDelete: (task: Task) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [deadline, setDeadline] = useState(toDatetimeLocalValue(task.deadline));

  function startEdit() {
    setTitle(task.title);
    setDescription(task.description ?? '');
    setDeadline(toDatetimeLocalValue(task.deadline));
    setEditing(true);
  }

  function save() {
    onSaveDetails(task, title, description, deadline);
    setEditing(false);
  }

  const railColor = statusRailColor(task.status);
  const overdue = isOverdue(task.deadline) && task.status !== 'done';

  if (editing) {
    return (
      <li className={`flex flex-col gap-2 bg-surface border border-line border-l-4 rounded px-4 py-3 ${railColor}`}>
        <input
          className="px-[0.7rem] py-[0.4rem] border border-line rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="px-[0.7rem] py-[0.4rem] border border-line rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="description (optional)"
        />
        <input
          className="px-[0.7rem] py-[0.4rem] border border-line rounded font-mono text-sm text-muted"
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          aria-label="deadline (optional)"
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setEditing(false)}
            className="text-muted px-2.5 py-1.5 text-sm bg-transparent border-0 cursor-pointer hover:text-ink"
          >
            Cancel
          </button>
          <button onClick={save} className="bg-ink text-white rounded px-2.5 py-1.5 text-sm cursor-pointer">
            Save
          </button>
        </div>
      </li>
    );
  }

  return (
    <li
      className={`flex flex-col sm:flex-row sm:items-center items-stretch justify-between gap-4 bg-surface border border-line border-l-4 rounded px-4 py-3 ${railColor}`}
    >
      <div>
        <strong className="font-medium">{task.title}</strong>
        {task.description && <p className="mt-[0.2rem] mb-0 text-muted text-sm">{task.description}</p>}
        {task.deadline && (
          <p className={`mt-[0.2rem] mb-0 text-sm font-mono ${overdue ? 'text-danger' : 'text-muted'}`}>
            due {new Date(task.deadline).toLocaleString()}
            {overdue ? ' — overdue' : ''}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2.5 shrink-0 justify-end">
        <button
          onClick={() => onAdvanceStatus(task)}
          className="border border-line bg-paper rounded px-2.5 py-1.5 font-mono text-[0.8rem] cursor-pointer transition-colors duration-150 hover:bg-line"
        >
          {task.status}
        </button>
        <button
          onClick={startEdit}
          className="text-muted border border-transparent bg-transparent rounded px-2.5 py-1.5 cursor-pointer hover:text-ink"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(task)}
          className="text-danger border border-transparent bg-transparent rounded px-2.5 py-1.5 cursor-pointer hover:bg-[#fdf0ef]"
        >
          Delete
        </button>
      </div>
    </li>
  );
}
