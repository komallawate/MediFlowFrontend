import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Activity, Eye, EyeOff, Lock, User } from 'lucide-react';

export default function AuthPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.username, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch { toast.error('Invalid credentials'); }
    finally { setLoading(false); }
  };

  const demos = [['admin','admin123','Admin'],['doctor1','doctor123','Doctor'],['receptionist','recept123','Receptionist']];

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'var(--bg)',
      backgroundImage:'radial-gradient(ellipse at 20% 50%, #00C9A710 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #3D8EF015 0%, transparent 60%)'
    }}>
      <div style={{ width:'100%', maxWidth:400, padding:'0 16px' }}>
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{
            width:64, height:64, borderRadius:18,
            background:'linear-gradient(135deg, var(--primary), var(--accent))',
            display:'flex', alignItems:'center', justifyContent:'center',
            margin:'0 auto 14px', boxShadow:'0 8px 32px #00C9A740'
          }}><Activity size={32} color="#fff" /></div>
          <h1 style={{ fontSize:28, fontWeight:800, color:'var(--white)', letterSpacing:'-1px' }}>
            Medi<span style={{ color:'var(--primary)' }}>Flow</span>
          </h1>
          <p style={{ color:'var(--muted)', fontSize:13, marginTop:6 }}>Smart OPD Management System</p>
        </div>

        <div className="card" style={{ boxShadow:'var(--shadow-lg)' }}>
          <h2 style={{ fontSize:16, fontWeight:700, color:'var(--white)', marginBottom:22 }}>Sign in to your account</h2>
          <form onSubmit={handle} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <div style={{ position:'relative' }}>
                <User size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--muted)' }} />
                <input className="form-input" style={{ paddingLeft:36 }} placeholder="Enter username"
                  value={form.username} onChange={e => setForm(f=>({...f,username:e.target.value}))} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position:'relative' }}>
                <Lock size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--muted)' }} />
                <input className="form-input" style={{ paddingLeft:36, paddingRight:40 }}
                  type={showPass?'text':'password'} placeholder="••••••••"
                  value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))} required />
                <button type="button" onClick={()=>setShowPass(s=>!s)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--muted)', cursor:'pointer' }}>
                  {showPass?<EyeOff size={14}/>:<Eye size={14}/>}
                </button>
              </div>
            </div>
            <button className="btn btn-primary" style={{ marginTop:6, height:44 }} disabled={loading}>
              {loading ? <span className="spinner" style={{ width:18, height:18, borderWidth:2 }}/> : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop:18, padding:14, background:'var(--surface)', borderRadius:8, border:'1px solid var(--border)' }}>
            <p style={{ fontSize:11, color:'var(--muted)', marginBottom:8, fontWeight:600, textTransform:'uppercase', letterSpacing:'.5px' }}>Demo accounts</p>
            {demos.map(([u,p,r]) => (
              <div key={u} onClick={()=>setForm({username:u,password:p})}
                style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:12, color:'var(--text)', cursor:'pointer', padding:'4px 0', borderBottom:'1px solid var(--border)' }}>
                <span style={{ color:'var(--primary)', fontWeight:600 }}>{u}</span>
                <span style={{ color:'var(--muted)' }}>{p}</span>
                <span className="badge badge-blue" style={{ fontSize:10, padding:'1px 7px' }}>{r}</span>
              </div>
            ))}
            <p style={{ fontSize:11, color:'var(--muted)', marginTop:8 }}>Click any row to auto-fill</p>
          </div>
        </div>
      </div>
    </div>
  );
}
