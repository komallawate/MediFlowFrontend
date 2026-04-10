import { useState, useEffect, useCallback } from 'react';
import { doctorApi, appointmentApi } from '../services/api';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import { RefreshCw, Clock, PlayCircle, CheckCircle, XCircle, Monitor } from 'lucide-react';

const STATUS_CONFIG = {
  BOOKED:      { label:'Waiting',     badge:'badge-blue',   color:'#3D8EF0' },
  IN_PROGRESS: { label:'In Progress', badge:'badge-yellow',  color:'#FFB020' },
  COMPLETED:   { label:'Completed',   badge:'badge-green',   color:'#00C9A7' },
  CANCELLED:   { label:'Cancelled',   badge:'badge-red',     color:'#FF4757' },
};

export default function OpdQueue() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [queue, setQueue] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => { doctorApi.getAll().then(r=>setDoctors(r.data)); }, []);

  const loadQueue = useCallback(async () => {
    if (!selectedDoctor) return;
    setLoading(true);
    try { const r = await appointmentApi.doctorQueue(selectedDoctor.id, date); setQueue(r.data); }
    catch { toast.error('Failed to load queue'); }
    finally { setLoading(false); }
  }, [selectedDoctor, date]);

  useEffect(() => { loadQueue(); }, [loadQueue]);

  useEffect(() => {
    if (!autoRefresh) return;
    const t = setInterval(loadQueue, 15000);
    return () => clearInterval(t);
  }, [autoRefresh, loadQueue]);

  const updateStatus = async (apptId, action) => {
    try {
      if (action==='start') await appointmentApi.start(apptId);
      else if (action==='complete') await appointmentApi.complete(apptId);
      else if (action==='cancel') await appointmentApi.cancel(apptId,'Cancelled from queue');
      toast.success('Status updated');
      loadQueue();
    } catch { toast.error('Action failed'); }
  };

  const waiting = queue.filter(q=>q.status==='BOOKED').length;
  const inProgress = queue.filter(q=>q.status==='IN_PROGRESS').length;
  const completed = queue.filter(q=>q.status==='COMPLETED').length;

  return (
    <Layout>
      <div className="fade-in" style={{display:'flex',flexDirection:'column',gap:24}}>
        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:16}}>
          <div>
            <h1 style={{fontSize:22,fontWeight:800,color:'var(--white)'}}>Live OPD Queue</h1>
            <p style={{color:'var(--muted)',fontSize:13,marginTop:4}}>Real-time queue management with smart wait estimation</p>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
            <input type="date" className="form-input" style={{width:'auto'}} value={date} onChange={e=>setDate(e.target.value)}/>
            <button className={`btn ${autoRefresh?'btn-primary':'btn-ghost'}`} onClick={()=>setAutoRefresh(a=>!a)}>
              <RefreshCw size={14}/> {autoRefresh?'Auto':'Manual'}
            </button>
            <button className="btn btn-ghost" onClick={loadQueue} disabled={loading}><RefreshCw size={14}/></button>
          </div>
        </div>

        {/* Doctor selector */}
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          {doctors.map(d=>(
            <button key={d.id} onClick={()=>setSelectedDoctor(d)}
              className={`btn ${selectedDoctor?.id===d.id?'btn-accent':'btn-ghost'}`} style={{fontSize:12}}>
              <Monitor size={13}/> {d.name.split(' ').slice(-2).join(' ')} · {d.department}
            </button>
          ))}
        </div>

        {!selectedDoctor&&(
          <div style={{textAlign:'center',padding:60,color:'var(--muted)',background:'var(--card)',borderRadius:'var(--radius)',border:'1px dashed var(--border)'}}>
            <Monitor size={40} style={{margin:'0 auto 12px',opacity:.3}}/>
            <div>Select a doctor to view their OPD queue</div>
          </div>
        )}

        {selectedDoctor&&(
          <>
            {/* Stats bar */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
              {[['Total',queue.length,'#5A7A9F'],['Waiting',waiting,'#3D8EF0'],['In Progress',inProgress,'#FFB020'],['Completed',completed,'#00C9A7']].map(([lbl,val,col])=>(
                <div key={lbl} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:'14px 18px',textAlign:'center'}}>
                  <div style={{fontSize:28,fontWeight:800,color:col}}>{val}</div>
                  <div style={{fontSize:11,color:'var(--muted)',textTransform:'uppercase',letterSpacing:.5}}>{lbl}</div>
                </div>
              ))}
            </div>

            {/* Queue table */}
            <div className="card" style={{padding:0,overflow:'hidden'}}>
              <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div style={{fontWeight:700,color:'var(--white)',fontSize:15}}>{selectedDoctor.name}'s Queue</div>
                {autoRefresh&&<div style={{display:'flex',alignItems:'center',gap:6,fontSize:11,color:'var(--primary)'}}>
                  <span className="pulse-dot"/> Auto-refreshing every 15s
                </div>}
              </div>

              {loading&&queue.length===0&&(
                <div style={{display:'flex',justifyContent:'center',padding:40}}><div className="spinner"/></div>
              )}

              {queue.length===0&&!loading&&(
                <div style={{textAlign:'center',padding:40,color:'var(--muted)'}}>No appointments for this date</div>
              )}

              {queue.map((entry)=>(
                <div key={entry.appointmentId} style={{
                  display:'flex',alignItems:'center',gap:16,padding:'16px 20px',
                  borderBottom:'1px solid var(--border)',
                  background: entry.status==='IN_PROGRESS'?'rgba(255,176,32,.05)':'transparent',
                  transition:'background .3s'
                }}>
                  {/* Token */}
                  <div style={{
                    width:56,height:56,borderRadius:14,
                    background: entry.status==='IN_PROGRESS'?'rgba(255,176,32,.15)':'var(--primary-dim)',
                    display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flexShrink:0
                  }}>
                    <div style={{fontSize:16,fontWeight:900,color:entry.status==='IN_PROGRESS'?'var(--warning)':'var(--primary)',lineHeight:1}}>
                      {entry.tokenDisplay}
                    </div>
                    <div style={{fontSize:9,color:'var(--muted)',marginTop:2}}>TOKEN</div>
                  </div>

                  {/* Info */}
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,color:'var(--white)',fontSize:14}}>{entry.patientName}</div>
                    <div style={{display:'flex',gap:10,marginTop:4,flexWrap:'wrap'}}>
                      <span style={{fontSize:11,color:'var(--muted)'}}>{entry.patientCode}</span>
                      <span style={{fontSize:11,color:'var(--muted)',display:'flex',alignItems:'center',gap:3}}>
                        <Clock size={11}/>{entry.appointmentTime}
                      </span>
                      {entry.status==='BOOKED'&&entry.estimatedWaitMinutes>0&&(
                        <span style={{fontSize:11,color:'var(--warning)',display:'flex',alignItems:'center',gap:3}}>
                          ~{entry.estimatedWaitMinutes}m wait
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status badge */}
                  <span className={`badge ${STATUS_CONFIG[entry.status]?.badge||'badge-gray'}`}>
                    {STATUS_CONFIG[entry.status]?.label||entry.status}
                  </span>

                  {/* Actions */}
                  <div style={{display:'flex',gap:6,flexShrink:0}}>
                    {entry.status==='BOOKED'&&(
                      <button className="btn btn-accent btn-sm" onClick={()=>updateStatus(entry.appointmentId,'start')}>
                        <PlayCircle size={13}/> Start
                      </button>
                    )}
                    {entry.status==='IN_PROGRESS'&&(
                      <button className="btn btn-primary btn-sm" onClick={()=>updateStatus(entry.appointmentId,'complete')}>
                        <CheckCircle size={13}/> Done
                      </button>
                    )}
                    {(entry.status==='BOOKED'||entry.status==='IN_PROGRESS')&&(
                      <button className="btn btn-ghost btn-sm" onClick={()=>updateStatus(entry.appointmentId,'cancel')}>
                        <XCircle size={13}/>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
