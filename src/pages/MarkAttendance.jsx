import React from 'react';
import { useEffect, useState } from 'react';
import { api, today } from '../api.js';

const STATUSES = [
  ['present', 'Present'],
  ['absent', 'Absent'],
  ['late', 'Late'],
  ['excused', 'Excused'],
];

export default function MarkAttendance() {
  const [date, setDate] = useState(today());
  const [classes, setClasses] = useState([]);
  const [className, setClassName] = useState('');
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({}); // studentId -> { status, note }
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.classes().then((c) => { setClasses(c); if (c[0]) setClassName(c[0]); }).catch((e) => setMsg({ type: 'error', text: e.message }));
  }, []);

  useEffect(() => {
    if (!className) return;
    setMsg({ type: '', text: '' });
    Promise.all([api.students({ className }), api.attendance({ date, className })])
      .then(([studs, recs]) => {
        setStudents(studs);
        const m = {};
        studs.forEach((s) => { m[s._id] = { status: 'present', note: '' }; }); // default to present
        recs.forEach((r) => { m[r.student] = { status: r.status, note: r.note || '' }; });
        setMarks(m);
      })
      .catch((e) => setMsg({ type: 'error', text: e.message }));
  }, [className, date]);

  const setStatus = (id, status) => setMarks({ ...marks, [id]: { ...marks[id], status } });
  const setNote = (id, note) => setMarks({ ...marks, [id]: { ...marks[id], note } });
  const markAll = (status) => {
    const m = {};
    students.forEach((s) => { m[s._id] = { ...marks[s._id], status }; });
    setMarks(m);
  };

  const save = async () => {
    setBusy(true);
    setMsg({ type: '', text: '' });
    try {
      const records = students.map((s) => ({ student: s._id, ...marks[s._id] }));
      await api.saveAttendance({ date, records });
      setMsg({ type: 'ok', text: `Saved attendance for ${records.length} students.` });
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    } finally { setBusy(false); }
  };

  const tally = STATUSES.map(([k, label]) => [label, students.filter((s) => marks[s._id]?.status === k).length]);

  return (
    <>
      <header className="page-head"><h2>Mark attendance</h2></header>

      <div className="panel toolbar">
        <label>Date<input type="date" max={today()} value={date} onChange={(e) => setDate(e.target.value)} /></label>
        <label>Class
          <select value={className} onChange={(e) => setClassName(e.target.value)}>
            {classes.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <button className="btn" onClick={() => markAll('present')}>Mark all present</button>
      </div>

      {classes.length === 0 ? (
        <p className="empty">Add students first, then come back to mark attendance.</p>
      ) : (
        <section className="panel">
          <ul className="roster">
            {students.map((s) => (
              <li key={s._id}>
                <div className="who"><span className="roll">{s.rollNo}</span>{s.name}</div>
                <div className="seg" role="group" aria-label={`Status for ${s.name}`}>
                  {STATUSES.map(([k, label]) => (
                    <button
                      key={k}
                      type="button"
                      className={`${k} ${marks[s._id]?.status === k ? 'on' : ''}`}
                      aria-pressed={marks[s._id]?.status === k}
                      onClick={() => setStatus(s._id, k)}
                    >{label}</button>
                  ))}
                </div>
                <input className="note" placeholder="Note (optional)" value={marks[s._id]?.note || ''} onChange={(e) => setNote(s._id, e.target.value)} />
              </li>
            ))}
          </ul>

          <footer className="save-bar">
            <span className="muted">{tally.map(([l, n]) => `${l} ${n}`).join('  |  ')}</span>
            <button className="btn primary" disabled={busy || !students.length} onClick={save}>Save attendance</button>
          </footer>
          {msg.text && <p className={msg.type === 'ok' ? 'ok' : 'error'} role="status">{msg.text}</p>}
        </section>
      )}
    </>
  );
}
