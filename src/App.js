import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage        from './pages/AuthPage';
import Dashboard       from './pages/Dashboard';
import PatientRegister from './pages/PatientRegister';
import BookAppointment from './pages/BookAppointment';
import OpdQueue        from './pages/OpdQueue';
import DoctorDashboard from './pages/DoctorDashboard';
import Prescriptions   from './pages/Prescriptions';

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--bg)' }}>
      <div style={{ textAlign:'center' }}>
        <div className="spinner" style={{ margin:'0 auto 12px' }} />
        <div style={{ color:'var(--muted)', fontSize:13 }}>Loading MediFlow...</div>
      </div>
    </div>
  );
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <AuthPage />} />
      <Route path="/dashboard"     element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/patients/new"  element={<PrivateRoute><PatientRegister /></PrivateRoute>} />
      <Route path="/appointments"  element={<PrivateRoute><BookAppointment /></PrivateRoute>} />
      <Route path="/queue"         element={<PrivateRoute><OpdQueue /></PrivateRoute>} />
      <Route path="/doctors"       element={<PrivateRoute><DoctorDashboard /></PrivateRoute>} />
      <Route path="/prescriptions" element={<PrivateRoute><Prescriptions /></PrivateRoute>} />
      <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: { background:'var(--card)', color:'var(--white)', border:'1px solid var(--border)', fontSize:13 },
          success: { iconTheme: { primary:'#00C9A7', secondary:'#0A1628' } },
          error:   { iconTheme: { primary:'#FF4757', secondary:'#0A1628' } },
        }} />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
