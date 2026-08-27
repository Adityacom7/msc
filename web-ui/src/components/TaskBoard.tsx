import { useEffect, useState } from 'react';
import * as api from '../api';
import { ApiError } from '../api';
import type { ReportsSummary, Task } from '../api';
import { useAuth } from '../context/AuthContext';
import { nextStatus } from '../lib/taskStatus';
import { TaskForm } from './TaskForm';
import { TaskList } from './TaskList';
import { ReportsPanel } from './ReportsPanel';

export function TaskBoard() {
  const { token, setError, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [summary, setSummary] = useState<ReportsSummary | null>(null);

  async function handleAuthAware<T>(action: () => Promise<T>): Promise<T | undefined> {
    try {
      return await action();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        return undefined;
      }
      setError(err instanceof Error ? err.message : 'Something went wrong');
      return undefined;
    }
  }

  async function refreshTasks() {
    const result = await handleAuthAware(() => api.listTasks(token as string));
    if (result) setTasks(result);
  }

  async function refreshSummary() {
    const result = await handleAuthAware(() => api.getReportsSummary());
    if (result) setSummary(result);
  }

  useEffect(() => {
    refreshTasks();
    refreshSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleCreate(title: string, description: string, deadline: string) {
    setError(null);
    const created = await handleAuthAware(() =>
      api.createTask(token as string, title, description, deadline)
    );
    if (created) {
      setTasks((prev) => [created, ...prev]);
      refreshSummary();
    }
  }

  async function handleAdvanceStatus(task: Task) {
    setError(null);
    const updated = await handleAuthAware(() =>
      api.updateTask(token as string, task.id, { status: nextStatus(task.status) })
    );
    if (updated) {
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      refreshSummary();
    }
  }

  async function handleSaveDetails(task: Task, title: string, description: string, deadline: string) {
    setError(null);
    const updated = await handleAuthAware(() =>
      api.updateTask(token as string, task.id, { title, description, deadline: deadline || null })
    );
    if (updated) {
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    }
  }

  async function handleDelete(task: Task) {
    setError(null);
    const ok = await handleAuthAware(async () => {
      await api.deleteTask(token as string, task.id);
      return true;
    });
    if (ok) {
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      refreshSummary();
    }
  }

  return (
    <div>
      <TaskForm onCreate={handleCreate} />
      <TaskList
        tasks={tasks}
        onAdvanceStatus={handleAdvanceStatus}
        onSaveDetails={handleSaveDetails}
        onDelete={handleDelete}
      />
      <ReportsPanel summary={summary} onRefresh={refreshSummary} />
    </div>
  );
}
