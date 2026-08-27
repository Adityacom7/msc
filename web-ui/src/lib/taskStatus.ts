export const STATUS_CYCLE: Record<string, string> = {
  pending: 'in_progress',
  in_progress: 'done',
  done: 'pending',
};

export function nextStatus(current: string): string {
  return STATUS_CYCLE[current] ?? 'pending';
}

const STATUS_RAIL_COLOR: Record<string, string> = {
  pending: 'border-l-pending',
  in_progress: 'border-l-inprogress',
  done: 'border-l-done',
};

export function statusRailColor(status: string): string {
  return STATUS_RAIL_COLOR[status] ?? 'border-l-muted';
}
