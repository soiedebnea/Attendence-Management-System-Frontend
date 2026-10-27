import React from 'react';
import { useEffect, useState } from 'react';
import { api, getUser } from '../api.js';

const blank = { name: '', rollNo: '', className: '', guardianPhone: '' };

export default function Students() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const isAdmin = getUser()?.role === 'admin';

  const load = () => api.students({ search }).then(setList).catch((e) => setError(e.message));
  useEffect(() => { load(); }, [search]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      editing ? await api.updateStudent(editing, form) : await api.addStudent(form);
      setForm(blank);
      setEditing(null);
      load();
    } catch (err) { setError(err.message); }
  };

  const edit = (s) => {
    setEditing(s._id);
    setForm({ name: s.name, rollNo: s.rollNo, className: s.className, guardianPhone: s.guardianPhone || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (s) => {
    if (!window.confirm(`Delete ${s.name} and all of their attendance records?`)) return;
    try { await api.deleteStudent(s._id); load(); } catch (err) { setError(err.message); }
  };

  return (
    <>
      <header className="page-head"><h2>Students</h2></header>

      <form className="panel form-grid" onSubmit={submit}>
        <label>Name<input required value={form.name} onChange={set('name')} /></label>
        <label>Roll number<input required value={form.rollNo} onChange={set('rollNo')} /></label>
        <label>Class<input required placeholder="e.g. Grade 8-A" value={form.className} onChange={set('className')} /></label>
        <label>Guardian phone<input value={form.guardianPhone} onChange={set('guardianPhone')} /></label>
        <div className="form-actions">
          <button className="btn primary">{editing ? 'Save changes' : 'Add student'}</button>
          {editing && <button type="button" className="btn" onClick={() => { setEditing(null); setForm(blank); }}>Cancel</button>}
        </div>
      </form>
      {error && <p className="error" role="alert">{error}</p>}

      <section className="panel">
        <input className="search" placeholder="Search by name" value={search} onChange={(e) => setSearch(e.target.value)} />
        {list.length === 0 ? (
          <p className="empty">{search ? 'No students match that name.' : 'No students yet. Add one using the form above.'}</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Roll</th><th>Name</th><th>Class</th><th>Guardian phone</th><th></th></tr></thead>
              <tbody>
                {list.map((s) => (
                  <tr key={s._id}>
                    <td>{s.rollNo}</td><td>{s.name}</td><td>{s.className}</td><td>{s.guardianPhone || 'â€”'}</td>
                    <td className="row-actions">
                      <button className="link" onClick={() => edit(s)}>Edit</button>
                      {isAdmin && <button className="link danger" onClick={() => remove(s)}>Delete</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
