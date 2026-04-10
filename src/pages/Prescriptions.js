import { useState, useEffect, useRef } from 'react';
import { patientApi, doctorApi, prescriptionApi } from '../services/api';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import { FileText, Plus, Search, Printer, Pill, X } from 'lucide-react';

const BLANK_MED = { name:'', dose:'', frequency:'', days:'' };

export default function Prescriptions() {
  const [mode, setMode] = useState('view'); // view | new
  const [patientSearch, setPatientSearch] = useState('');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({ doctorId:'', diagnosis:'', notes:'', medicines:[{...BLANK_MED}] });
  const [loading, setLoading] = useState(false);
  const printRef = useRef();

  useEffect(() => { doctorApi.getAll().then(r=>setDoctors(r.data)); }, []);

  const searchPt = async () => {
    if (!patientSearch.trim()) return;
    try { const r = await patientApi.getAll(0, patientSearch); setPatients(r.data.content||[]); }
    catch { toast.error('Search failed'); }
  };

  const selectPatient = async (p) => {
    setSelectedPatient(p);
    try { const r = await prescriptionApi.history(p.id); setHistory(r.data); }
    catch { setHistory([]); }
  };

  const addMed = () => setForm(f=>({...f, medicines:[...f.medicines,{...BLANK_MED}]}));
  const removeMed = (i) => setForm(f=>({...f, medicines:f.medicines.filter((_,idx)=>idx!==i)}));
  const setMed = (i,k,v) => setForm(f=>({...f,medicines:f.medicines.map((m,idx)=>idx===i?{...m,[k]:v}:m)}));

  const submit = async () => {
    if (!selectedPatient||!form.doctorId||!form.diagnosis) { toast.error('Fill required fields'); return; }
    setLoading(true);
    try {
      await prescriptionApi.issue({
        patientId: selectedPatient.id,
        doctorId: parseInt(form.doctorId),
        diagnosis: form.diagnosis,
        notes: form.notes,
        medicinesJson: JSON.stringify(form.medicines)
      });
      toast.success('Prescription issued!');
      setMode('view');
      selectPatient(selectedPatient);
      setForm({ doctorId:'', diagnosis:'', notes:'', medicines:[{...BLANK_MED}] });
    } catch { toast.error('Failed to issue'); }
    finally { setLoading(false); }
  };

  const print = () => window.print();

  const parseMeds = (json) => { try { return JSON.parse(json)||[]; } catch { return []; } };

  return (
    <Layout>
      <div className="fade-in" style={{display:'flex',flexDirection:'column',gap:24}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:16}}>
          <div>
            <h1 style={{fontSize:22,fontWeight:800,color:'var(--white)'}}>Prescriptions</h1>
            <p style={{color:'var(--muted)',fontSize:13,marginTop:4}}>Issue & view patient prescription history</p>
          </div>
          {selectedPatient&&(
            <button className="btn btn-primary" onClick={()=>setMode(m=>m==='new'?'view':'new')}>
              <Plus size={15}/> {mode==='new'?'Cancel':'New Prescription'}
            </button>
          )}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:20}}>
          {/* Left: Patient search */}
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div style={{display:'flex',gap:8}}>
              <input className="form-input" placeholder="Search patient..." value={patientSearch}
                onChange={e=>setPatientSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&searchPt()}/>
              <button className="btn btn-ghost" onClick={searchPt}><Search size={15}/></button>
            </div>
            {patients.map(p=>(
              <div key={p.id} onClick={()=>selectPatient(p)}
                style={{
                  padding:'12px 14px', borderRadius:10, cursor:'pointer',
                  background: selectedPatient?.id===p.id?'var(--primary-dim)':'var(--card)',
                  border:`1px solid ${selectedPatient?.id===p.id?'var(--primary)':'var(--border)'}`,
                  transition:'all .2s'
                }}>
                <div style={{fontWeight:600,color:'var(--white)',fontSize:13}}>{p.name}</div>
                <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{p.patientCode} · {p.phone}</div>
              </div>
            ))}
          </div>

          {/* Right: Content */}
          <div>
            {!selectedPatient&&(
              <div style={{textAlign:'center',padding:60,color:'var(--muted)',background:'var(--card)',borderRadius:'var(--radius)',border:'1px dashed var(--border)'}}>
                <FileText size={36} style={{margin:'0 auto 12px',opacity:.3}}/>
                <div>Search and select a patient to view prescriptions</div>
              </div>
            )}

            {selectedPatient&&mode==='new'&&(
              <div className="card" style={{display:'flex',flexDirection:'column',gap:18}}>
                <div style={{fontWeight:700,color:'var(--white)',fontSize:15,display:'flex',alignItems:'center',gap:8}}>
                  <FileText size={16} color="var(--primary)"/> New Prescription for {selectedPatient.name}
                </div>

                <div className="form-group">
                  <label className="form-label">Doctor *</label>
                  <select className="form-input" value={form.doctorId} onChange={e=>setForm(f=>({...f,doctorId:e.target.value}))}>
                    <option value="">Select doctor</option>
                    {doctors.map(d=><option key={d.id} value={d.id}>{d.name} ({d.department})</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Diagnosis *</label>
                  <input className="form-input" placeholder="e.g. Acute Viral Fever" value={form.diagnosis}
                    onChange={e=>setForm(f=>({...f,diagnosis:e.target.value}))}/>
                </div>

                <div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                    <label className="form-label" style={{margin:0}}>Medicines</label>
                    <button className="btn btn-ghost btn-sm" onClick={addMed}><Plus size={13}/> Add</button>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:8}}>
                    {form.medicines.map((m,i)=>(
                      <div key={i} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr auto',gap:8,alignItems:'center'}}>
                        <input className="form-input" placeholder="Medicine name" value={m.name} onChange={e=>setMed(i,'name',e.target.value)}/>
                        <input className="form-input" placeholder="Dose" value={m.dose} onChange={e=>setMed(i,'dose',e.target.value)}/>
                        <input className="form-input" placeholder="Frequency" value={m.frequency} onChange={e=>setMed(i,'frequency',e.target.value)}/>
                        <input className="form-input" placeholder="Days" value={m.days} onChange={e=>setMed(i,'days',e.target.value)}/>
                        <button onClick={()=>removeMed(i)} style={{background:'none',border:'none',color:'var(--danger)',cursor:'pointer'}}><X size={16}/></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <input className="form-input" placeholder="Additional instructions..." value={form.notes}
                    onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/>
                </div>

                <div style={{display:'flex',justifyContent:'flex-end',gap:12}}>
                  <button className="btn btn-ghost" onClick={()=>setMode('view')}>Cancel</button>
                  <button className="btn btn-primary" disabled={loading} onClick={submit}>
                    {loading?<span className="spinner" style={{width:16,height:16,borderWidth:2}}/>:<><FileText size={14}/> Issue Prescription</>}
                  </button>
                </div>
              </div>
            )}

            {selectedPatient&&mode==='view'&&(
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                {history.length===0&&(
                  <div style={{textAlign:'center',padding:40,color:'var(--muted)',background:'var(--card)',borderRadius:'var(--radius)',border:'1px dashed var(--border)'}}>
                    No prescriptions yet for {selectedPatient.name}
                  </div>
                )}
                {history.map(rx=>(
                  <div key={rx.id} className="card" style={{gap:14,display:'flex',flexDirection:'column'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:10}}>
                      <div>
                        <div style={{fontWeight:700,color:'var(--white)',fontSize:15}}>{rx.diagnosis}</div>
                        <div style={{fontSize:12,color:'var(--muted)',marginTop:2}}>
                          {rx.issuedDate} · Dr. {rx.doctor?.name||'Unknown'}
                        </div>
                      </div>
                      <button className="btn btn-ghost btn-sm" onClick={print}><Printer size={13}/> Print</button>
                    </div>
                    {parseMeds(rx.medicinesJson).length>0&&(
                      <div style={{background:'var(--surface)',borderRadius:8,padding:12}}>
                        <div style={{fontSize:11,color:'var(--muted)',textTransform:'uppercase',letterSpacing:.5,marginBottom:8,display:'flex',alignItems:'center',gap:6}}>
                          <Pill size={11}/> Medicines
                        </div>
                        {parseMeds(rx.medicinesJson).map((m,i)=>(
                          <div key={i} style={{display:'flex',gap:16,padding:'6px 0',borderBottom:'1px solid var(--border)',fontSize:13,flexWrap:'wrap'}}>
                            <span style={{fontWeight:600,color:'var(--white)',minWidth:120}}>{m.name}</span>
                            <span style={{color:'var(--muted)'}}>{m.dose}</span>
                            <span style={{color:'var(--muted)'}}>{m.frequency}</span>
                            <span style={{color:'var(--muted)'}}>{m.days} days</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {rx.notes&&<div style={{fontSize:12,color:'var(--muted)',fontStyle:'italic'}}>Note: {rx.notes}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
