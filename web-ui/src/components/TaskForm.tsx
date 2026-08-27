import { FormEvent, useState } from 'react';

export function TaskForm({
  onCreate,
}: {
  onCreate: (title: string, description: string, deadline: string) => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await onCreate(title, description, deadline);
    setTitle('');
    setDescription('');
    setDeadline('');
  }

  return (
    <section className="mb-10">
      <h2 className="text-[0.8rem] font-semibold uppercase tracking-[0.06em] text-muted mb-3.5">New task</h2>
      <form className="flex flex-wrap gap-2" onSubmit={handleSubmit}>
        <input
          className="flex-1 min-w-[10rem] px-[0.7rem] py-[0.55rem] border border-line rounded"
          placeholder="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          className="flex-1 min-w-[10rem] px-[0.7rem] py-[0.55rem] border border-line rounded"
          placeholder="description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          className="px-[0.7rem] py-[0.55rem] border border-line rounded font-mono text-sm text-muted"
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          aria-label="deadline (optional)"
        />
        <button type="submit" className="bg-ink text-white border-0 rounded px-[1.1rem] cursor-pointer">
          Add
        </button>
      </form>
    </section>
  );
}
