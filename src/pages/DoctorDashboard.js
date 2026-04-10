import { useState, useEffect } from 'react';
import { doctorApi, appointmentApi } from '../services/api';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import { Stethoscope, Clock, ToggleLeft, ToggleRight, Users } from 'lucide-react';

export default function DoctorDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [dr, sm] = await Promise.all([doctorApi.getAll(), appointmentApi.queueSummary()]);
      setDoctors(dr.data); setSummaries(sm.data);
    } catch { toast.error('Load failed'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggleAvailability = async (id) => {
    try { await doctorApi.getAll(); const r = await fetch(`/api/doctors/${id}/toggle-availability`,{method:'PUT',headers:{'Authorization':`Bearer ${localStorage.getItem('mf_token')}`}}); if(r.ok){ toast.success('Availability updated'); load(); } }
    catch { toast.error('Failed'); }
  };

  const getSummary = (name) => summaries.find(s=>s.doctorName===name);

  const DEPT_COLORS = { Cardiology:'#FF4757', 'General Medicine':'#3D8EF0', Pediatrics:'#00C9A7', Orthopedics:'#FFB020', Dermatology:'#A78BFA' };

  return (
    <Layout>
      <div className="fade-in" style={{display:'flex',flexDirection:'column',gap:24}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:800,color:'var(--white)'}}>Doctors</h1>
          <p style={{color:'var(--muted)',fontSize:13,marginTop:4}}>Manage availability and view real-time workload</p>
        </div>

        {loading&&<div style={{display:'flex',justifyContent:'center',padding:60}}><div className="spinner"/></div>}

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:16}}>
          {doctors.map(d=>{
            const sm = getSummary(d.name);
            const col = DEPT_COLORS[d.department]||'var(--primary)';
            return (
              <div key={d.id} className="card" style={{position:'relative',overflow:'hidden'}}>
                {/* Accent bar */}
                <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${col},transparent)`}}/>

                <div style={{display:'flex',gap:14,alignItems:'flex-start',marginBottom:16}}>
                  <div style={{width:48,height:48,borderRadius:14,background:`${col}20`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <Stethoscope size={22} color={col}/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,color:'var(--white)',fontSize:15}}>{d.name}</div>
                    <div style={{fontSize:12,color:'var(--muted)',marginTop:2}}>{d.qualification}</div>
                    <span className="badge" style={{marginTop:6,background:`${col}20`,color:col}}>{d.department}</span>
                  </div>
                  <button onClick={()=>toggleAvailability(d.id)}
                    title="Toggle availability"
                    style={{background:'none',border:'none',cursor:'pointer',color:d.available?'var(--primary)':'var(--muted)'}}>
                    {d.available?<ToggleRight size={28}/>:<ToggleLeft size={28}/>}
                  </button>
                </div>

                <div style={{display:'flex',gap:8,marginBottom:14}}>
                  <span style={{fontSize:11,color:'var(--muted)',display:'flex',alignItems:'center',gap:4}}>
                    <Clock size={11}/> ~{d.avgConsultationMinutes}m/patient
                  </span>
                  <span style={{fontSize:11,color:d.available?'var(--primary)':'var(--danger)',marginLeft:'auto',fontWeight:600}}>
                    {d.available?'● Available':'● Unavailable'}
                  </span>
                </div>

                {sm?(
                  <div style={{background:'var(--surface)',borderRadius:8,padding:'12px',display:'flex',justifyContent:'space-around'}}>
                    {[['Waiting',sm.waiting,'#3D8EF0'],['In Progress',sm.inProgress,'#FFB020'],['Done',sm.completed,'#00C9A7']].map(([l,v,c])=>(
                      <div key={l} style={{textAlign:'center'}}>
                        <div style={{fontSize:20,fontWeight:800,color:c}}>{v}</div>
                        <div style={{fontSize:10,color:'var(--muted)'}}>{l}</div>
                      </div>
                    ))}
                  </div>
                ):(
                  <div style={{background:'var(--surface)',borderRadius:8,padding:'10px',textAlign:'center',fontSize:12,color:'var(--muted)',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                    <Users size={13}/> No appointments today
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
