import { useState } from 'react';
import { patientApi } from '../services/api';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import { UserPlus, CheckCircle, Copy, Search } from 'lucide-react';

export default function PatientRegister() {
  const blank = { name:'',phone:'',email:'',dateOfBirth:'',gender:'',bloodGroup:'',address:'' };
  const [form, setForm] = useState(blank);
  const [registered, setRegistered] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchCode, setSearchCode] = useState('');
  const [foundPatient, setFoundPatient] = useState(null);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await patientApi.register(form);
      setRegistered(res.data); toast.success('Patient registered!'); setForm(blank);
    } catch(err) { toast.error(err.response?.data||'Registration failed'); }
    finally { setLoading(false); }
  };

  const searchPatient = async () => {
    if (!searchCode.trim()) return;
    try { const r = await patientApi.getByCode(searchCode.trim().toUpperCase()); setFoundPatient(r.data); }
    catch { toast.error('Patient not found'); setFoundPatient(null); }
  };

  return (
    <Layout>
      <div className="fade-in" style={{display:'flex',flexDirection:'column',gap:24}}>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
          <div>
            <h1 style={{fontSize:22,fontWeight:800,color:'var(--white)'}}>Register Patient</h1>
            <p style={{color:'var(--muted)',fontSize:13,marginTop:4}}>Each patient gets a unique MediFlow ID</p>
          </div>
          <div style={{display:'flex',gap:8}}>
            <input className="form-input" style={{width:180}} placeholder="Lookup MF-XXXXX"
              value={searchCode} onChange={e=>setSearchCode(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&searchPatient()}/>
            <button className="btn btn-ghost" onClick={searchPatient}><Search size={15}/> Find</button>
          </div>
        </div>

        {foundPatient && (
          <div className="card" style={{borderColor:'var(--primary)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontSize:16,fontWeight:700,color:'var(--white)'}}>{foundPatient.name}</div>
                <div style={{fontSize:12,color:'var(--muted)',marginTop:2}}>{foundPatient.phone} · {foundPatient.gender} · {foundPatient.bloodGroup}</div>
              </div>
              <div className="token">{foundPatient.patientCode}</div>
            </div>
          </div>
        )}

        {registered && (
          <div className="card fade-in" style={{borderColor:'var(--primary)',background:'linear-gradient(135deg,#00C9A710,#112240)'}}>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
              <CheckCircle size={24} color="var(--primary)"/>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:'var(--white)'}}>Patient Registered!</div>
                <div style={{fontSize:12,color:'var(--muted)'}}>Share the code below with the patient</div>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'var(--surface)',padding:'14px 18px',borderRadius:10,border:'1px solid var(--border)'}}>
              <div>
                <div style={{fontSize:11,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:4}}>Patient Code</div>
                <div className="token" style={{fontSize:30}}>{registered.patientCode}</div>
              </div>
              <button className="btn btn-ghost" onClick={()=>{navigator.clipboard.writeText(registered.patientCode);toast.success('Copied!');}}>
                <Copy size={14}/> Copy
              </button>
            </div>
          </div>
        )}

        <form className="card" onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:18}}>
          <h2 className="section-title"><UserPlus size={18} className="icon"/>Patient Details</h2>
          <div className="grid-2">
            {[['Full Name','name','text','e.g. Rahul Sharma',true],['Phone','phone','tel','10-digit mobile',true],
              ['Email','email','email','patient@email.com',false],['Date of Birth','dateOfBirth','date','',false]
            ].map(([lbl,key,type,ph,req])=>(
              <div className="form-group" key={key}>
                <label className="form-label">{lbl}{req?' *':''}</label>
                <input className="form-input" type={type} placeholder={ph} required={req}
                  value={form[key]} onChange={e=>set(key,e.target.value)}/>
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-input" value={form.gender} onChange={e=>set('gender',e.target.value)}>
                <option value="">Select</option>
                {['Male','Female','Other'].map(g=><option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select className="form-input" value={form.bloodGroup} onChange={e=>set('bloodGroup',e.target.value)}>
                <option value="">Select</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g=><option key={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <input className="form-input" placeholder="Street, City, State"
              value={form.address} onChange={e=>set('address',e.target.value)}/>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:12}}>
            <button type="button" className="btn btn-ghost" onClick={()=>setForm(blank)}>Clear</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading?<span className="spinner" style={{width:16,height:16,borderWidth:2}}/>:<><UserPlus size={15}/> Register</>}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
