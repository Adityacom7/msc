import type { ReportsSummary } from '../api';

export function ReportsPanel({
  summary,
  onRefresh,
}: {
  summary: ReportsSummary | null;
  onRefresh: () => void;
}) {
  return (
    <section className="mb-10">
      <div className="flex items-baseline justify-between mb-3.5">
        <h2 className="text-[0.8rem] font-semibold uppercase tracking-[0.06em] text-muted m-0">
          Reports summary
        </h2>
        <button
          onClick={onRefresh}
          className="bg-transparent border-0 text-muted underline underline-offset-2 cursor-pointer p-0 hover:text-ink text-sm"
        >
          Refresh
        </button>
      </div>
      {summary ? (
        <div className="bg-surface border border-line rounded px-5 py-4 font-mono text-sm">
          <p className="mb-3 text-[1.05rem]">Total events: {summary.total_events}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="font-sans text-[0.7rem] uppercase tracking-[0.06em] text-muted mb-1.5 font-semibold">
                By event type
              </h3>
              <ul className="list-none m-0 p-0 flex flex-col gap-1">
                {summary.by_event_type.map((row) => (
                  <li key={row.routing_key}>
                    {row.routing_key}: {row.count}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-sans text-[0.7rem] uppercase tracking-[0.06em] text-muted mb-1.5 font-semibold">
                By user
              </h3>
              <ul className="list-none m-0 p-0 flex flex-col gap-1">
                {summary.by_user.map((row) => (
                  <li key={row.username}>
                    {row.username}: {row.count}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-muted text-sm">No report data yet.</p>
      )}
    </section>
  );
}
