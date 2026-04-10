import { useEffect, useState } from 'react';
import { appointmentApi } from '../services/api';
import { Users, CalendarCheck, Stethoscope, Activity, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import Layout from '../components/layout/Layout';
import './Dashboard.css';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: color + '20', color }}>
      <Icon size={22} />
    </div>
    <div className="stat-body">
      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentApi.dashboardStats()
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="dashboard fade-in">
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-sub">Real-time hospital overview — {new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
          </div>
          <div className="live-badge">
            <span className="pulse-dot" />
            Live
          </div>
        </div>

        {loading ? (
          <div className="center-spinner"><div className="spinner" /></div>
        ) : (
          <>
            <div className="stat-grid">
              <StatCard icon={CalendarCheck} label="Today's Appointments" value={stats?.todayAppointments} color="#3D8EF0" sub="Across all departments" />
              <StatCard icon={Users} label="Total Patients" value={stats?.totalPatients} color="#00C9A7" sub="Registered in system" />
              <StatCard icon={CheckCircle2} label="Completed Today" value={stats?.completedToday} color="#00C9A7" sub="Consultations done" />
              <StatCard icon={Stethoscope} label="Active Doctors" value={stats?.totalDoctors} color="#FFB020" sub="On duty today" />
            </div>

            <div className="dept-section">
              <h2 className="section-title"><Activity size={18} className="icon" /> Department Queue Status</h2>
              {stats?.departmentSummaries?.length === 0 && (
                <div className="empty-state">No active queues today. Appointments will appear here.</div>
              )}
              <div className="dept-grid">
                {stats?.departmentSummaries?.map((d, i) => (
                  <div key={i} className="dept-card">
                    <div className="dept-header">
                      <div>
                        <div className="dept-name">{d.department}</div>
                        <div className="dept-doctor">{d.doctorName}</div>
                      </div>
                      <div className="dept-wait">
                        <Clock size={13} />
                        <span>~{d.estimatedWaitForNext}m wait</span>
                      </div>
                    </div>
                    <div className="dept-counts">
                      <div className="dept-count waiting">
                        <span className="count-num">{d.waiting}</span>
                        <span className="count-lbl">Waiting</span>
                      </div>
                      <div className="dept-count inprogress">
                        <span className="count-num">{d.inProgress}</span>
                        <span className="count-lbl">In Progress</span>
                      </div>
                      <div className="dept-count done">
                        <span className="count-num">{d.completed}</span>
                        <span className="count-lbl">Done</span>
                      </div>
                    </div>
                    <div className="dept-bar">
                      <div className="dept-bar-fill" style={{
                        width: `${Math.min(100, (d.completed / Math.max(1, d.waiting + d.inProgress + d.completed)) * 100)}%`
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
