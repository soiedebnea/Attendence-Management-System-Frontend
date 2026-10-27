import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setSession } from '../api.js';

export default function Login() {
  const navigate = useNavigate();
  const [needsSetup, setNeedsSetup] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.setupStatus().then((r) => setNeedsSetup(r.needsSetup)).catch(() => {});
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const data = needsSetup ? await api.register(form) : await api.login(form);
      setSession(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login">
      <form className="login-card" onSubmit={submit}>
        <h1 className="brand">Roll Call</h1>
        <p className="muted">
          {needsSetup ? 'Create the administrator account to get started.' : 'Sign in to take attendance.'}
        </p>
        {needsSetup && (
          <label>Full name<input required value={form.name} onChange={set('name')} /></label>
        )}
        <label>Email<input type="email" required value={form.email} onChange={set('email')} /></label>
        <label>Password<input type="password" required minLength={6} value={form.password} onChange={set('password')} /></label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn primary" disabled={busy}>
          {needsSetup ? 'Create account' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
