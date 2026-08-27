export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: string;
  deadline: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportsSummary {
  total_events: number;
  by_event_type: { routing_key: string; count: number }[];
  by_user: { username: string; count: number }[];
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// web-ui is served from its own origin (a separate container/port), so
// API calls need the gateway's absolute URL rather than a relative path.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error || `Request failed (${res.status})`, res.status);
  }
  return body as T;
}

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

export function register(username: string, password: string): Promise<unknown> {
  return request('/auth/register', { method: 'POST', body: JSON.stringify({ username, password }) });
}

export function login(username: string, password: string): Promise<{ token: string }> {
  return request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
}

export function listTasks(token: string): Promise<Task[]> {
  return request('/tasks', { headers: authHeaders(token) });
}

export function createTask(
  token: string,
  title: string,
  description: string,
  deadline?: string
): Promise<Task> {
  return request('/tasks', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ title, description: description || undefined, deadline: deadline || undefined }),
  });
}

export function updateTask(
  token: string,
  id: number,
  fields: { title?: string; description?: string; status?: string; deadline?: string | null }
): Promise<Task> {
  return request(`/tasks/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(fields),
  });
}

export function deleteTask(token: string, id: number): Promise<void> {
  return request(`/tasks/${id}`, { method: 'DELETE', headers: authHeaders(token) });
}

export function getReportsSummary(): Promise<ReportsSummary> {
  return request('/reports/summary');
}

export interface HealthStatus {
  status: string;
}

export function getGatewayHealth(): Promise<HealthStatus> {
  return request('/health');
}

export function getAuthHealth(): Promise<HealthStatus> {
  return request('/auth/health');
}

export function getReportsHealth(): Promise<HealthStatus> {
  return request('/reports/health');
}
