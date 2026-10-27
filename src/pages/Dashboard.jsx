import React from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, today } from '../api.js';

export default function Dashboard() {
  const [d, setD] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.daily(today()).then(setD).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!d) return <p className="muted">Loadingâ€¦</p>;

  const stats = [
    ['present', 'Present', d.present],
    ['absent', 'Absent', d.absent],
    ['late', 'Late', d.late],
    ['excused', 'Excused', d.excused],
  ];

  return (
    <>
      <header className="page-head">
        <h2>Today, {new Date(d.date + 'T00:00').toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
        <Link className="btn primary" to="/mark">Mark attendance</Link>
      </header>

      {d.totalStudents === 0 ? (
        <p className="empty">No students yet. <Link to="/students">Add your first student</Link> to begin.</p>
      ) : (
        <>
          <div className="stat-row">
            {stats.map(([key, label, n]) => (
              <div key={key} className={`stat ${key}`}>
                <strong>{n}</strong>
                <span>{label}</span>
              </div>
            ))}
            <div className="stat">
              <strong>{d.notMarked}</strong>
              <span>Not marked yet</span>
            </div>
          </div>

          <section className="panel">
            <h3>Absent today</h3>
            {d.absentees.length === 0 ? (
              <p className="muted">{d.marked ? 'No absences recorded.' : 'Attendance has not been marked today.'}</p>
            ) : (
              <table>
                <thead><tr><th>Roll</th><th>Name</th><th>Class</th><th>Guardian phone</th></tr></thead>
                <tbody>
                  {d.absentees.map((s) => (
                    <tr key={s._id}><td>{s.rollNo}</td><td>{s.name}</td><td>{s.className}</td><td>{s.guardianPhone || 'â€”'}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </>
  );
}
