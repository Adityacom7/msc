import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthForm } from './components/AuthForm';
import { TaskBoard } from './components/TaskBoard';
import { SystemStatus } from './components/SystemStatus';

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}

function Shell() {
  const { token, error, logout } = useAuth();

  return (
    <div className="max-w-[640px] mx-auto px-5 pt-8 pb-16">
      <header className="flex items-baseline justify-between border-b border-line pb-4 mb-6">
        <h1 className="text-[1.375rem] font-bold tracking-[-0.01em] m-0">Task Manager</h1>
        {token && (
          <button
            className="bg-transparent border-0 text-muted underline underline-offset-2 cursor-pointer p-0 hover:text-ink"
            onClick={logout}
          >
            Log out
          </button>
        )}
      </header>
      <SystemStatus />
      {error && (
        <div className="bg-[#fdf0ef] border border-[#f2c6c2] text-danger rounded px-3.5 py-2.5 text-sm mb-5">
          {error}
        </div>
      )}
      {token ? <TaskBoard /> : <AuthForm />}
    </div>
  );
}
