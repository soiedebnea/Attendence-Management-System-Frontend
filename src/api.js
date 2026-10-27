const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getToken = () => localStorage.getItem('token');
export const setSession = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};
export const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
export const getUser = () => JSON.parse(localStorage.getItem('user') || 'null');

async function request(path, { method = 'GET', body, raw } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (raw) return res;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && getToken()) {
      clearSession();
      window.location.href = '/login';
    }
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
}

export const qs = (obj) => {
  const p = new URLSearchParams(Object.entries(obj).filter(([, v]) => v));
  return p.toString() ? `?${p}` : '';
};

export const api = {
  setupStatus: () => request('/auth/setup-status'),
  login: (b) => request('/auth/login', { method: 'POST', body: b }),
  register: (b) => request('/auth/register', { method: 'POST', body: b }),
  classes: () => request('/students/classes'),
  students: (params = {}) => request('/students' + qs(params)),
  addStudent: (b) => request('/students', { method: 'POST', body: b }),
  updateStudent: (id, b) => request(`/students/${id}`, { method: 'PUT', body: b }),
  deleteStudent: (id) => request(`/students/${id}`, { method: 'DELETE' }),
  attendance: (params) => request('/attendance' + qs(params)),
  saveAttendance: (b) => request('/attendance/bulk', { method: 'POST', body: b }),
  daily: (date) => request('/reports/daily' + qs({ date })),
  summary: (params) => request('/reports/summary' + qs(params)),
  absences: (params) => request('/reports/absences' + qs(params)),
  exportCsv: async (params) => {
    const res = await request('/reports/export.csv' + qs(params), { raw: true });
    if (!res.ok) throw new Error('Could not export the report');
    const url = URL.createObjectURL(await res.blob());
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  },
};

export const today = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time