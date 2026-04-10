import { useState, useEffect } from 'react';
import { patientApi, doctorApi, appointmentApi } from '../services/api';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import { CalendarPlus, Search, Clock, User, Stethoscope, CheckCircle } from 'lucide-react';

export default function BookAppointment() {
  const [step, setStep] = useState(1);
  const [patientSearch, setPatientSearch] = useState('');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(null);

  useEffect(() => { doctorApi.getAvailable().then(r=>setDoctors(r.data)).catch(()=>{}); }, []);

  useEffect(() => {
    if (selectedDoctor && date) {
      appointmentApi.slots(selectedDoctor.id, date).then(r=>setSlots(r.data)).catch(()=>setSlots([]));
    }
  }, [selectedDoctor, date]);

  const searchPatients = async () => {
    if (!patientSearch.trim()) return;
    try { const r = await patientApi.getAll(0, patientSearch); setPatients(r.data.content||[]); }
    catch { toast.error('Search failed'); }
  };

  const confirm = async () => {
    if (!selectedPatient || !selectedDoctor || !selectedSlot) { toast.error('Please complete all steps'); return; }
    setLoading(true);
    try {
      const r = await appointmentApi.book({
        patientId: selectedPatient.id, doctorId: selectedDoctor.id,
        appointmentDate: date, appointmentTime: selectedSlot.time
      });
      setBooked(r.data); setStep(5); toast.success('Appointment booked!');
    } catch(e) { toast.error(e.response?.data||'Booking failed'); }
    finally { setLoading(false); }
  };

  const reset = () => { setStep(1);setSelectedPatient(null);setSelectedDoctor(null);setSelectedSlot(null);setBooked(null);setPatients([]);setPatientSearch(''); };

  const STEPS = ['Find Patient','Select Doctor','Choose Slot','Confirm','Done'];

  return (
    <Layout>
      <div className="fade-in" style={{display:'flex',flexDirection:'column',gap:24}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:800,color:'var(--white)'}}>Book Appointment</h1>
          <p style={{color:'var(--muted)',fontSize:13,marginTop:4}}>Smart slot booking with real-time queue estimation</p>
        </div>

        {/* Stepper */}
        <div style={{display:'flex',gap:0,alignItems:'center'}}>
          {STEPS.map((s,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',flex:i<STEPS.length-1?1:'none'}}>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                <div style={{
                  width:30,height:30,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:12,fontWeight:700,transition:'all .2s',
                  background: step>i+1?'var(--primary)':step===i+1?'var(--accent)':'var(--border)',
                  color: step>i+1||step===i+1?'#fff':'var(--muted)'
                }}>{step>i+1?'✓':i+1}</div>
                <div style={{fontSize:10,color:step===i+1?'var(--white)':'var(--muted)',whiteSpace:'nowrap'}}>{s}</div>
              </div>
              {i<STEPS.length-1&&<div style={{flex:1,height:2,background:step>i+1?'var(--primary)':'var(--border)',margin:'0 8px',marginBottom:18,transition:'background .3s'}}/>}
            </div>
          ))}
        </div>

        <div className="card">
          {/* Step 1: Patient */}
          {step===1&&(
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              <h3 style={{fontSize:16,fontWeight:700,color:'var(--white)'}}>Find Patient</h3>
              <div style={{display:'flex',gap:8}}>
                <input className="form-input" placeholder="Search by name, phone, or MF code..."
                  value={patientSearch} onChange={e=>setPatientSearch(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&searchPatients()}/>
                <button className="btn btn-accent" onClick={searchPatients}><Search size={15}/> Search</button>
              </div>
              {patients.map(p=>(
                <div key={p.id} onClick={()=>{setSelectedPatient(p);setStep(2);}}
                  style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 16px',background:'var(--surface)',borderRadius:8,border:`1px solid ${selectedPatient?.id===p.id?'var(--primary)':'var(--border)'}`,cursor:'pointer',transition:'all .2s'}}>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <div style={{width:36,height:36,borderRadius:10,background:'var(--primary-dim)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--primary)',fontWeight:700,fontSize:14}}>
                      {p.name[0]}
                    </div>
                    <div>
                      <div style={{fontWeight:600,color:'var(--white)'}}>{p.name}</div>
                      <div style={{fontSize:12,color:'var(--muted)'}}>{p.phone} · {p.gender||'—'} · {p.bloodGroup||'—'}</div>
                    </div>
                  </div>
                  <div className="token" style={{fontSize:16}}>{p.patientCode}</div>
                </div>
              ))}
            </div>
          )}

          {/* Step 2: Doctor */}
          {step===2&&(
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <h3 style={{fontSize:16,fontWeight:700,color:'var(--white)'}}>Select Doctor</h3>
                <div style={{padding:'6px 12px',background:'var(--primary-dim)',borderRadius:8,fontSize:12,color:'var(--primary)',fontWeight:600}}>
                  Patient: {selectedPatient?.name}
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:12}}>
                {doctors.map(d=>(
                  <div key={d.id} onClick={()=>{setSelectedDoctor(d);setStep(3);}}
                    style={{padding:'16px',background:'var(--surface)',borderRadius:10,border:`2px solid ${selectedDoctor?.id===d.id?'var(--primary)':'var(--border)'}`,cursor:'pointer',transition:'all .2s'}}>
                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                      <div style={{width:40,height:40,borderRadius:12,background:'linear-gradient(135deg,var(--primary),var(--accent))',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700}}>
                        {d.name.split(' ').pop()[0]}
                      </div>
                      <div>
                        <div style={{fontWeight:700,color:'var(--white)',fontSize:13}}>{d.name}</div>
                        <div style={{fontSize:11,color:'var(--muted)'}}>{d.qualification}</div>
                      </div>
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span className="badge badge-blue">{d.department}</span>
                      <span style={{fontSize:11,color:'var(--muted)',display:'flex',alignItems:'center',gap:4}}>
                        <Clock size={11}/> ~{d.avgConsultationMinutes}m/patient
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-ghost" onClick={()=>setStep(1)}>← Back</button>
            </div>
          )}

          {/* Step 3: Slot */}
          {step===3&&(
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
                <h3 style={{fontSize:16,fontWeight:700,color:'var(--white)'}}>Choose Time Slot</h3>
                <input type="date" className="form-input" style={{width:'auto'}} value={date} min={new Date().toISOString().split('T')[0]} onChange={e=>setDate(e.target.value)}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:10}}>
                {slots.map((s,i)=>(
                  <div key={i} onClick={()=>s.available&&setSelectedSlot(s)}
                    style={{
                      padding:'12px',borderRadius:10,textAlign:'center',cursor:s.available?'pointer':'not-allowed',
                      border:`2px solid ${!s.available?'var(--border)':selectedSlot===s?'var(--primary)':'var(--border)'}`,
                      background: !s.available?'transparent':selectedSlot===s?'var(--primary-dim)':'var(--surface)',
                      opacity: s.available?1:.45, transition:'all .2s'
                    }}>
                    <div style={{fontSize:14,fontWeight:700,color:s.available?'var(--white)':'var(--muted)'}}>{s.time}</div>
                    <div style={{fontSize:10,color:s.available?'var(--primary)':'var(--muted)',marginTop:3}}>
                      {s.available?`Q-${s.queuePosition}`:'Booked'}
                    </div>
                  </div>
                ))}
                {slots.length===0&&<div style={{gridColumn:'1/-1',textAlign:'center',color:'var(--muted)',padding:30}}>Loading slots...</div>}
              </div>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <button className="btn btn-ghost" onClick={()=>setStep(2)}>← Back</button>
                <button className="btn btn-accent" disabled={!selectedSlot} onClick={()=>setStep(4)}>Continue →</button>
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step===4&&(
            <div style={{display:'flex',flexDirection:'column',gap:20}}>
              <h3 style={{fontSize:16,fontWeight:700,color:'var(--white)'}}>Confirm Appointment</h3>
              {[
                ['Patient', selectedPatient?.name, <User size={16}/>],
                ['Patient Code', selectedPatient?.patientCode, null],
                ['Doctor', selectedDoctor?.name, <Stethoscope size={16}/>],
                ['Department', selectedDoctor?.department, null],
                ['Date', date, <CalendarPlus size={16}/>],
                ['Time', selectedSlot?.time, <Clock size={16}/>],
                ['Queue Position', `#${selectedSlot?.queuePosition}`, null],
                ['Est. Wait', `~${(selectedSlot?.queuePosition-1)*(selectedDoctor?.avgConsultationMinutes||15)} mins`, <Clock size={16}/>],
              ].map(([lbl,val,icon])=>(
                <div key={lbl} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',background:'var(--surface)',borderRadius:8}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,color:'var(--muted)',fontSize:13}}>
                    {icon}<span>{lbl}</span>
                  </div>
                  <div style={{fontWeight:600,color:'var(--white)',fontSize:13}}>{val||'—'}</div>
                </div>
              ))}
              <div style={{display:'flex',gap:12,justifyContent:'flex-end'}}>
                <button className="btn btn-ghost" onClick={()=>setStep(3)}>← Back</button>
                <button className="btn btn-primary" disabled={loading} onClick={confirm}>
                  {loading?<span className="spinner" style={{width:16,height:16,borderWidth:2}}/>:'✓ Confirm Booking'}
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Done */}
          {step===5&&booked&&(
            <div style={{textAlign:'center',padding:'20px 0',display:'flex',flexDirection:'column',alignItems:'center',gap:16}}>
              <div style={{width:64,height:64,borderRadius:'50%',background:'var(--primary-dim)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <CheckCircle size={36} color="var(--primary)"/>
              </div>
              <div>
                <div style={{fontSize:20,fontWeight:800,color:'var(--white)'}}>Appointment Confirmed!</div>
                <div style={{color:'var(--muted)',fontSize:13,marginTop:6}}>Queue token issued to patient</div>
              </div>
              <div style={{background:'var(--surface)',borderRadius:12,padding:'20px 32px',border:'1px solid var(--primary)',textAlign:'center'}}>
                <div style={{fontSize:11,color:'var(--muted)',textTransform:'uppercase',letterSpacing:1,marginBottom:6}}>OPD Token</div>
                <div style={{fontSize:48,fontWeight:900,color:'var(--primary)',letterSpacing:-2}}>MF-{String(booked.queueNumber).padStart(3,'0')}</div>
                <div style={{fontSize:12,color:'var(--muted)',marginTop:4}}>{booked.doctorName} · {booked.appointmentTime}</div>
              </div>
              <button className="btn btn-ghost" onClick={reset}>Book Another</button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
