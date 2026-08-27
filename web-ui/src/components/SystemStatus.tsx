import { useCallback, useEffect, useState } from 'react';
import * as api from '../api';

type CheckStatus = 'checking' | 'ok' | 'down';

const SERVICES: { label: string; check: () => Promise<unknown> }[] = [
  { label: 'gateway', check: api.getGatewayHealth },
  { label: 'auth', check: api.getAuthHealth },
  { label: 'reports', check: api.getReportsHealth },
];

const DOT_COLOR: Record<CheckStatus, string> = {
  checking: 'bg-muted',
  ok: 'bg-done',
  down: 'bg-danger',
};

export function SystemStatus() {
  const [statuses, setStatuses] = useState<CheckStatus[]>(SERVICES.map(() => 'checking'));

  const refresh = useCallback(() => {
    setStatuses(SERVICES.map(() => 'checking'));
    SERVICES.forEach((service, i) => {
      service
        .check()
        .then(() => setStatuses((prev) => prev.map((s, idx) => (idx === i ? 'ok' : s))))
        .catch(() => setStatuses((prev) => prev.map((s, idx) => (idx === i ? 'down' : s))));
    });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <section className="mb-6">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-[0.8rem] font-semibold uppercase tracking-[0.06em] text-muted m-0">System status</h2>
        <button
          onClick={refresh}
          className="bg-transparent border-0 text-muted underline underline-offset-2 cursor-pointer p-0 hover:text-ink text-sm"
        >
          Refresh
        </button>
      </div>
      <div className="bg-surface border border-line rounded px-5 py-3 font-mono text-sm flex flex-wrap gap-x-6 gap-y-1">
        {SERVICES.map((service, i) => (
          <div key={service.label} className="flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${DOT_COLOR[statuses[i]]}`} />
            {service.label}: {statuses[i]}
          </div>
        ))}
      </div>
    </section>
  );
}
