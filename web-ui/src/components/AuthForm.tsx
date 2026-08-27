import { FormEvent, useState } from 'react';
import * as api from '../api';
import { useAuth } from '../context/AuthContext';

export function AuthForm() {
  const { login, setError } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (mode === 'register') {
        await api.register(username, password);
      }
      const { token } = await api.login(username, password);
      login(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      className="max-w-[320px] mx-auto my-12 flex flex-col gap-3 bg-surface border border-line rounded-md p-7"
      onSubmit={handleSubmit}
    >
      <h2 className="m-0 mb-1 text-lg">{mode === 'login' ? 'Log in' : 'Register'}</h2>
      <input
        className="px-[0.7rem] py-[0.55rem] border border-line rounded"
        placeholder="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        className="px-[0.7rem] py-[0.55rem] border border-line rounded"
        placeholder="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button
        type="submit"
        disabled={submitting}
        className="bg-ink text-white border-0 rounded py-2.5 font-medium cursor-pointer mt-1 hover:bg-[#2a303b] disabled:opacity-60"
      >
        {mode === 'login' ? 'Log in' : 'Register & log in'}
      </button>
      <button
        type="button"
        className="self-center text-sm bg-transparent border-0 text-muted underline underline-offset-2 cursor-pointer p-0 hover:text-ink"
        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
      >
        {mode === 'login' ? 'Need an account? Register' : 'Have an account? Log in'}
      </button>
    </form>
  );
}
