import React from 'react';
import { Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { clearSession, getToken, getUser } from './api.js';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Students from './pages/Students.jsx';
import MarkAttendance from './pages/MarkAttendance.jsx';
import Reports from './pages/Reports.jsx';

function Shell({ children }) {
  const navigate = useNavigate();
  const user = getUser();
  const signOut = () => {
    clearSession();
    navigate('/login');
  };
  return (
    <div className="shell">
      <aside className="sidebar">
        <h1 className="brand">Roll Call</h1>
        <nav>
          <NavLink to="/" end>Today</NavLink>
          <NavLink to="/mark">Mark attendance</NavLink>
          <NavLink to="/students">Students</NavLink>
          <NavLink to="/reports">Reports</NavLink>
        </nav>
        <div className="sidebar-foot">
          <span>{user?.name}</span>
          <button className="link" onClick={signOut}>Sign out</button>
        </div>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}

function Private({ children }) {
  return getToken() ? <Shell>{children}</Shell> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Private><Dashboard /></Private>} />
      <Route path="/mark" element={<Private><MarkAttendance /></Private>} />
      <Route path="/students" element={<Private><Students /></Private>} />
      <Route path="/reports" element={<Private><Reports /></Private>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
