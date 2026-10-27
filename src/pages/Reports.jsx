import React from 'react';
import { useEffect, useState } from 'react';
import { api } from '../api.js';

const monthStart = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toLocaleDateString('en-CA');
};
const todayStr = () => new Date().toLocaleDateString('en-CA');

export default function Reports() {
  const [tab, setTab] = useState('summary');
  const [filters, setFilters] = useState({ from: monthStart(), to: todayStr(), className: '' });
  const [classes, setClasses] = useState([]);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { api.classes().then(setClasses).catch(() => {}); }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    (tab === 'summary' ? api.summary(filters) : api.absences(filters))
      .then(setRows)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [tab, filters]);

  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });

  return (
    <>
      <header className="page-head">
        <h2>Reports</h2>
        <button className="btn" onClick={() => api.exportCsv(filters).catch((e) => setError(e.message))}>Download CSV</button>
      </header>

      <div className="panel toolbar">
        <label>From<input type="date" value={filters.from} onChange={set('from')} /></label>
        <label>To<input type="date" value={filters.to} onChange={set('to')} /></label>
        <label>Class
          <select value={filters.className} onChange={set('className')}>
            <option value="">All classes</option>
            {classes.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
      </div>

      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'summary'} className={tab === 'summary' ? 'on' : ''} onClick={() => setTab('summary')}>Attendance summary</button>
        <button role="tab" aria-selected={tab === 'absences'} className={tab === 'absences' ? 'on' : ''} onClick={() => setTab('absences')}>Absence log</button>
      </div>

      <section className="panel">
        {error && <p className="error" role="alert">{error}</p>}
        {loading ? <p className="muted">Loadingâ€¦</p> : rows.length === 0 ? (
          <p className="empty">No attendance records in this date range.</p>
        ) : tab === 'summary' ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Roll</th><th>Name</th><th>Class</th><th>Days</th><th>Present</th><th>Absent</th><th>Late</th><th>Excused</th><th>Attendance</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.studentId}>
                    <td>{r.rollNo}</td><td>{r.name}</td><td>{r.className}</td><td>{r.total}</td>
                    <td>{r.present}</td><td>{r.absent}</td><td>{r.late}</td><td>{r.excused}</td>
                    <td><span className={`pct ${r.percentage < 75 ? 'low' : ''}`}>{r.percentage}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Roll</th><th>Name</th><th>Class</th><th>Guardian phone</th><th>Note</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r._id}>
                    <td>{r.date}</td><td>{r.student.rollNo}</td><td>{r.student.name}</td><td>{r.student.className}</td>
                    <td>{r.student.guardianPhone || 'â€”'}</td><td>{r.note || 'â€”'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === 'summary' && rows.length > 0 && <p className="muted small">Attendance below 75% is highlighted. Late counts as attended.</p>}
      </section>
    </>
  );
}
