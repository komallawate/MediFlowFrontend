import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, CalendarPlus, ListOrdered,
  Stethoscope, FileText, LogOut, Menu, X, Activity, ChevronRight
} from 'lucide-react';
import './Layout.css';

const NAV = [
  { to: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/patients/new',   icon: Users,            label: 'Register Patient' },
  { to: '/appointments',   icon: CalendarPlus,     label: 'Book Appointment' },
  { to: '/queue',          icon: ListOrdered,      label: 'OPD Queue' },
  { to: '/doctors',        icon: Stethoscope,      label: 'Doctors' },
  { to: '/prescriptions',  icon: FileText,         label: 'Prescriptions' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <Activity size={22} color="var(--primary)" />
          <span>Medi<strong>Flow</strong></span>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setOpen(false)}>
              <Icon size={18} />
              <span>{label}</span>
              <ChevronRight size={14} className="nav-chevron" />
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar">{user?.username?.[0]?.toUpperCase()}</div>
            <div className="user-info">
              <div className="user-name">{user?.username}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm logout-btn" onClick={handleLogout}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && <div className="overlay" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="main-wrap">
        <header className="topbar">
          <button className="mobile-menu-btn" onClick={() => setOpen(o => !o)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="topbar-title">
            <div className="live-indicator">
              <span className="pulse-dot" />
              <span>Live System</span>
            </div>
          </div>
        </header>
        <main className="main-content fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
