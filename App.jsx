import { useState, useRef, useEffect } from "react";

// ═══════════════════════════════════════════════════════════
// 🔧 GANTI URL INI DENGAN URL GOOGLE APPS SCRIPT KAMU
// Cara dapat URL: script.google.com → Deploy → Web App → Copy URL
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyCDVi2xRRm-h3AHf4r61Qh5d-1GK2qSvSHj3Z34abN9owliE4b4lfJ-V5rgE0SQ39Rlg/exec";
// ═══════════════════════════════════════════════════════════

const BRANDS = ["Bintang","Heineken","Bintang Zero","Amstel","Tiger","Guinness"];
const POSM_TYPES = ["Spanduk","Neon Box","Sticker","Cooler Branding","Meja/Kursi Branding","Banner Stand","Hanging Mobile"];
const SALES_REPS = ["Andi Pratama","Budi Santoso","Citra Dewi","Deni Kurniawan","Eka Putri","Fajar Nugroho","Gita Rahayu","Hendra Wibowo"];
const STATUS_OPTIONS = ["Terpasang","Belum Terpasang","Rusak / Perlu Ganti"];

const brandColor = { Bintang:"#f59e0b",Heineken:"#16a34a","Bintang Zero":"#0ea5e9",Amstel:"#dc2626",Tiger:"#ea580c",Guinness:"#374151" };
const brandBg    = { Bintang:"#fef3c7",Heineken:"#dcfce7","Bintang Zero":"#e0f2fe",Amstel:"#fee2e2",Tiger:"#ffedd5",Guinness:"#1f2937" };
const brandTxt   = { Bintang:"#92400e",Heineken:"#14532d","Bintang Zero":"#075985",Amstel:"#7f1d1d",Tiger:"#7c2d12",Guinness:"#f9fafb" };
const SM = {
  "Terpasang":          { bg:"#dcfce7",text:"#15803d",dot:"#22c55e",icon:"✅" },
  "Belum Terpasang":    { bg:"#fef9c3",text:"#a16207",dot:"#eab308",icon:"⏳" },
  "Rusak / Perlu Ganti":{ bg:"#fee2e2",text:"#b91c1c",dot:"#ef4444",icon:"⚠️" },
};
const emptyForm = { outlet:"",address:"",salesRep:"",brand:"",posm:"",status:"",notes:"",photos:[],date:new Date().toISOString().split("T")[0] };

/* ── helpers ── */
function Tag({ children, color="#78630a", bg="#f0e8d0" }) {
  return <span style={{ background:bg,color,borderRadius:99,padding:"3px 9px",fontSize:11,fontWeight:700,whiteSpace:"nowrap" }}>{children}</span>;
}
function MiniBar({ pct }) {
  return (
    <div style={{ background:"#e5d9b6",borderRadius:99,height:6,overflow:"hidden",flex:1 }}>
      <div style={{ width:`${pct}%`,background:"linear-gradient(90deg,#c7a94e,#f0c940)",height:"100%",borderRadius:99,transition:"width .5s" }} />
    </div>
  );
}
function Spinner() {
  return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 20px",gap:12 }}>
      <div style={{ width:36,height:36,border:"3px solid #f0e8d0",borderTop:"3px solid #c7a94e",borderRadius:"50%",animation:"spin 0.8s linear infinite" }} />
      <div style={{ fontSize:13,color:"#a07820",fontWeight:600 }}>Memuat data...</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* Photo upload */
function PhotoUpload({ photos, onChange }) {
  const ref = useRef();
  const add = e => Array.from(e.target.files).forEach(f => {
    const r = new FileReader(); r.onload = ev => onChange([...photos,{url:ev.target.result,name:f.name}]); r.readAsDataURL(f);
  });
  return (
    <div>
      <div onClick={()=>ref.current.click()} style={{ border:"2px dashed #c7a94e",borderRadius:12,padding:"18px 12px",textAlign:"center",cursor:"pointer",background:"#fffbf0" }}>
        <div style={{ fontSize:26 }}>📸</div>
        <div style={{ fontWeight:700,fontSize:13,color:"#92400e",marginTop:3 }}>Upload / Foto Bukti POSM</div>
        <div style={{ fontSize:11,color:"#b45309",marginTop:2 }}>Tap untuk kamera atau galeri</div>
        <input ref={ref} type="file" accept="image/*" multiple capture="environment" style={{ display:"none" }} onChange={add} />
      </div>
      {photos.length>0&&(
        <div style={{ display:"flex",flexWrap:"wrap",gap:8,marginTop:10 }}>
          {photos.map((p,i)=>(
            <div key={i} style={{ position:"relative" }}>
              <img src={p.url} alt="" style={{ width:70,height:70,objectFit:"cover",borderRadius:10,border:"2px solid #c7a94e" }} />
              <button onClick={()=>onChange(photos.filter((_,j)=>j!==i))} style={{ position:"absolute",top:-6,right:-6,background:"#ef4444",color:"#fff",border:"none",borderRadius:"50%",width:20,height:20,fontSize:11,cursor:"pointer",fontWeight:900,lineHeight:"20px",textAlign:"center" }}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* Bottom Sheet */
function Sheet({ open, onClose, title, children }) {
  useEffect(()=>{ document.body.style.overflow=open?"hidden":""; return()=>{ document.body.style.overflow=""; }; },[open]);
  if (!open) return null;
  return (
    <div style={{ position:"fixed",inset:0,zIndex:300 }}>
      <style>{`@keyframes su{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
      <div onClick={onClose} style={{ position:"absolute",inset:0,background:"rgba(0,0,0,.5)",backdropFilter:"blur(4px)" }} />
      <div style={{ position:"absolute",bottom:0,left:0,right:0,background:"#fff",borderRadius:"20px 20px 0 0",maxHeight:"92dvh",display:"flex",flexDirection:"column",boxShadow:"0 -8px 40px rgba(0,0,0,.2)",animation:"su .3s ease" }}>
        <div style={{ width:38,height:4,background:"#d1d5db",borderRadius:99,margin:"12px auto 0",flexShrink:0 }} />
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 18px",borderBottom:"1px solid #f0e8d0",flexShrink:0 }}>
          <span style={{ fontFamily:"'Playfair Display',serif",fontWeight:800,fontSize:17 }}>{title}</span>
          <button onClick={onClose} style={{ background:"#f3f4f6",border:"none",borderRadius:"50%",width:30,height:30,fontSize:16,cursor:"pointer",lineHeight:"30px",textAlign:"center" }}>×</button>
        </div>
        <div style={{ overflowY:"auto",padding:"16px 18px 40px",flex:1,WebkitOverflowScrolling:"touch" }}>{children}</div>
      </div>
    </div>
  );
}

/* Toast notification */
function Toast({ msg, type="success" }) {
  if (!msg) return null;
  const colors = { success:{ bg:"#dcfce7",text:"#15803d",border:"#22c55e" }, error:{ bg:"#fee2e2",text:"#b91c1c",border:"#ef4444" }, loading:{ bg:"#fef9c3",text:"#a16207",border:"#eab308" } };
  const c = colors[type];
  return (
    <div style={{ position:"fixed",top:80,left:"50%",transform:"translateX(-50%)",zIndex:500,background:c.bg,color:c.text,border:`1.5px solid ${c.border}`,borderRadius:12,padding:"12px 20px",fontSize:13,fontWeight:700,boxShadow:"0 4px 20px rgba(0,0,0,.15)",whiteSpace:"nowrap",maxWidth:"90vw",textAlign:"center" }}>
      {msg}
    </div>
  );
}

/* Setup Guide Banner */
function SetupBanner({ onDismiss }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background:"linear-gradient(135deg,#fef3c7,#fffbf0)",border:"2px solid #f59e0b",borderRadius:14,padding:"14px 16px",marginBottom:14 }}>
      <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:6 }}>
        <span style={{ fontSize:20 }}>⚙️</span>
        <span style={{ fontWeight:800,fontSize:14,color:"#92400e" }}>Belum terhubung ke Google Sheets</span>
      </div>
      <div style={{ fontSize:12,color:"#a07820",marginBottom:10,lineHeight:1.5 }}>
        Data masih tersimpan lokal. Ikuti panduan di bawah untuk sinkronisasi ke Google Sheets.
      </div>
      <button onClick={()=>setOpen(!open)} style={{ background:"#f59e0b",color:"#fff",border:"none",borderRadius:8,padding:"8px 14px",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>
        {open?"▲ Tutup Panduan":"▼ Lihat Cara Setup"}
      </button>
      {open&&(
        <div style={{ marginTop:12,background:"#fff",borderRadius:10,padding:"14px",border:"1px solid #f0e8d0" }}>
          <div style={{ fontWeight:700,fontSize:12,color:"#78630a",marginBottom:8 }}>📋 Langkah Setup Google Sheets:</div>
          {[
            { n:"1", text:"Buka script.google.com → klik New Project" },
            { n:"2", text:'Hapus semua kode, paste kode Apps Script dari chat' },
            { n:"3", text:"Klik Deploy → New Deployment → pilih Web App" },
            { n:"4", text:'Set "Execute as: Me" dan "Who has access: Anyone"' },
            { n:"5", text:"Klik Deploy → Copy URL yang muncul" },
            { n:"6", text:"Buka file .jsx ini, ganti PASTE_URL_... di baris paling atas dengan URL tadi" },
          ].map(s=>(
            <div key={s.n} style={{ display:"flex",gap:8,marginBottom:6,alignItems:"flex-start" }}>
              <span style={{ background:"#f59e0b",color:"#fff",borderRadius:"50%",width:20,height:20,fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1 }}>{s.n}</span>
              <span style={{ fontSize:12,color:"#44310a",lineHeight:1.5 }}>{s.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const iStyle = { width:"100%",padding:"12px 14px",borderRadius:12,border:"1.5px solid #e5d9b6",fontSize:15,fontFamily:"'DM Sans',sans-serif",background:"#fffbf0",outline:"none",boxSizing:"border-box",color:"#1a1200",WebkitAppearance:"none" };
const lStyle = { fontSize:11,fontWeight:700,color:"#78630a",marginBottom:5,display:"block",letterSpacing:".05em",textTransform:"uppercase" };
function F({ label, children }) { return <div style={{ marginBottom:14 }}><label style={lStyle}>{label}</label>{children}</div>; }
const btnGold = { background:"linear-gradient(135deg,#c7a94e,#f0c940)",color:"#1a1200",border:"none",borderRadius:12,padding:"14px 20px",fontWeight:800,fontSize:15,cursor:"pointer",width:"100%",fontFamily:"'DM Sans',sans-serif",WebkitTapHighlightColor:"transparent" };

/* ════ GOOGLE SHEETS API ════ */
const isConfigured = () => GOOGLE_SCRIPT_URL && !GOOGLE_SCRIPT_URL.includes("PASTE_URL");

async function fetchFromSheets() {
  const res = await fetch(GOOGLE_SCRIPT_URL + "?action=get&t=" + Date.now(), {
    method: "GET",
    mode: "cors",
  });
  const rows = await res.json();
  if (!Array.isArray(rows)) throw new Error("Invalid response");
  return rows.slice(1).filter(r => r[1]).map((r,i) => ({
    id: i+1,
    date: r[0]||"", outlet: r[1]||"", address: r[2]||"",
    salesRep: r[3]||"", brand: r[4]||"", posm: r[5]||"",
    status: r[6]||"", notes: r[7]||"", photos: [],
    rowIndex: i+2,
  }));
}

// POST via URL params (GET request) to avoid CORS
async function postToSheets(payload) {
  const params = new URLSearchParams({
    action: payload.action,
    date: payload.date||"",
    outlet: payload.outlet||"",
    address: payload.address||"",
    salesRep: payload.salesRep||"",
    brand: payload.brand||"",
    posm: payload.posm||"",
    status: payload.status||"",
    notes: payload.notes||"",
    rowIndex: payload.rowIndex||"",
    t: Date.now(),
  });
  await fetch(GOOGLE_SCRIPT_URL + "?" + params.toString(), {
    method: "GET",
    mode: "cors",
  });
}

async function saveToSheets(data) {
  await postToSheets({ action:"add", ...data });
}

async function updateInSheets(data) {
  await postToSheets({ action:"update", ...data });
}

async function deleteFromSheets(rowIndex) {
  await postToSheets({ action:"delete", rowIndex });
}

/* ════ MAIN APP ════ */
export default function App() {
  const [tab, setTab]           = useState("dashboard");
  const [activations, setActivations] = useState([
    { id:1,outlet:"Warung Bu Sari",address:"Jl. Merdeka No.12, Bandung",salesRep:"Andi Pratama",brand:"Bintang",posm:"Spanduk",status:"Terpasang",notes:"Posisi strategis depan pintu",photos:[],date:"2025-05-01",rowIndex:2 },
    { id:2,outlet:"Toko Pak Bejo",address:"Jl. Raya Cimahi No.5",salesRep:"Budi Santoso",brand:"Heineken",posm:"Cooler Branding",status:"Belum Terpasang",notes:"Owner belum ada",photos:[],date:"2025-05-02",rowIndex:3 },
    { id:3,outlet:"Warung Mang Udin",address:"Jl. Setiabudhi No.88",salesRep:"Citra Dewi",brand:"Bintang Zero",posm:"Sticker",status:"Rusak / Perlu Ganti",notes:"Sticker lama pudar",photos:[],date:"2025-05-03",rowIndex:4 },
  ]);
  const [loading, setLoading]   = useState(false);
  const [syncing, setSyncing]   = useState(false);
  const [toast, setToast]       = useState({ msg:"",type:"success" });
  const [form, setForm]         = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterRep, setFilterRep]       = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterBrand, setFilterBrand]   = useState("Semua");
  const [search, setSearch]     = useState("");
  const [expandId, setExpandId] = useState(null);
  const [exportMsg, setExportMsg] = useState("");
  const [lastSync, setLastSync] = useState(null);

  const showToast = (msg, type="success", duration=3000) => {
    setToast({msg,type});
    setTimeout(()=>setToast({msg:"",type:"success"}),duration);
  };

  /* load from sheets on mount */
  useEffect(()=>{
    if (isConfigured()) loadFromSheets();
  },[]);

  const loadFromSheets = async () => {
    setLoading(true);
    try {
      const data = await fetchFromSheets();
      setActivations(data);
      setLastSync(new Date());
      showToast("✅ Data berhasil dimuat dari Google Sheets");
    } catch(e) {
      showToast("⚠️ Gagal load dari Sheets. Cek URL Apps Script kamu.","error");
    }
    setLoading(false);
  };

  const openAdd  = ()     => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEdit = item   => { setForm({...item}); setEditId(item.id); setShowForm(true); };
  const closeForm = ()    => { setShowForm(false); setEditId(null); };

  const save = async () => {
    if (!form.outlet||!form.address||!form.salesRep||!form.brand||!form.posm||!form.status) {
      showToast("⚠️ Lengkapi semua field wajib (*)","error"); return;
    }
    setSyncing(true);
    showToast("⏳ Menyimpan data...","loading",10000);
    try {
      if (editId) {
        const item = activations.find(x=>x.id===editId);
        if (isConfigured()) await updateInSheets({...form, rowIndex: item.rowIndex});
        setActivations(a=>a.map(x=>x.id===editId?{...form,id:editId,rowIndex:item.rowIndex}:x));
      } else {
        if (isConfigured()) await saveToSheets(form);
        const newItem = {...form, id:Date.now(), rowIndex: activations.length+2};
        setActivations(a=>[...a,newItem]);
      }
      closeForm();
      showToast(isConfigured()?"✅ Tersimpan ke Google Sheets!":"✅ Tersimpan (lokal)");
      if (isConfigured()) setTimeout(()=>loadFromSheets(),1500);
    } catch(e) {
      showToast("❌ Gagal menyimpan. Coba lagi.","error");
    }
    setSyncing(false);
  };

  const del = async (id) => {
    if (!window.confirm("Hapus data ini?")) return;
    setSyncing(true);
    try {
      const item = activations.find(x=>x.id===id);
      if (isConfigured()) await deleteFromSheets(item.rowIndex);
      setActivations(a=>a.filter(x=>x.id!==id));
      showToast("🗑️ Data berhasil dihapus");
      if (isConfigured()) setTimeout(()=>loadFromSheets(),1500);
    } catch(e) {
      showToast("❌ Gagal hapus.","error");
    }
    setSyncing(false);
  };

  const filtered = activations.filter(a=>
    (filterRep==="Semua"||a.salesRep===filterRep)&&
    (filterStatus==="Semua"||a.status===filterStatus)&&
    (filterBrand==="Semua"||a.brand===filterBrand)&&
    (!search||a.outlet.toLowerCase().includes(search.toLowerCase())||a.address.toLowerCase().includes(search.toLowerCase()))
  );

  const total=activations.length,
    tOk=activations.filter(a=>a.status==="Terpasang").length,
    tPend=activations.filter(a=>a.status==="Belum Terpasang").length,
    tRusak=activations.filter(a=>a.status==="Rusak / Perlu Ganti").length,
    pct=total?Math.round(tOk/total*100):0;

  const repStats=SALES_REPS.map(name=>({
    name, total:activations.filter(a=>a.salesRep===name).length,
    done:activations.filter(a=>a.salesRep===name&&a.status==="Terpasang").length,
  })).filter(r=>r.total>0);

  const activeFilters=[filterRep,filterStatus,filterBrand].filter(x=>x!=="Semua").length;

  const exportCSV = () => {
    const rows=[["Tanggal","Outlet","Alamat","Sales Rep","Brand","POSM","Status","Catatan"],...filtered.map(a=>[a.date,a.outlet,a.address,a.salesRep,a.brand,a.posm,a.status,a.notes])];
    const blob=new Blob([rows.map(r=>r.map(c=>`"${c}"`).join(",")).join("\n")],{type:"text/csv"});
    const el=document.createElement("a"); el.href=URL.createObjectURL(blob); el.download="MBI_Aktivasi.csv"; el.click();
    setExportMsg("✅ Berhasil diexport!"); setTimeout(()=>setExportMsg(""),3000);
  };

  const TABS=[{id:"dashboard",icon:"📊",label:"Dashboard"},{id:"aktivasi",icon:"📋",label:"Aktivasi"},{id:"laporan",icon:"📤",label:"Laporan"}];

  return (
    <div style={{ maxWidth:430,margin:"0 auto",minHeight:"100dvh",background:"#faf6ed",fontFamily:"'DM Sans',sans-serif",color:"#1a1200",display:"flex",flexDirection:"column" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet" />
      <style>{`*{box-sizing:border-box;-webkit-font-smoothing:antialiased}input,select,textarea{font-size:16px!important}button{-webkit-tap-highlight-color:transparent}`}</style>

      <Toast msg={toast.msg} type={toast.type} />

      {/* ── HEADER ── */}
      <div style={{ background:"linear-gradient(155deg,#1a1200 0%,#3d2900 100%)",padding:"14px 18px 0",position:"sticky",top:0,zIndex:100,boxShadow:"0 3px 16px rgba(0,0,0,.28)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:10,paddingBottom:12 }}>
          <div style={{ width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,#c7a94e,#f0c940)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>🍺</div>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:900,color:"#f0c940",lineHeight:1.15,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>MBI Activation Tracker</div>
            <div style={{ fontSize:9.5,color:"#c7a94e80",letterSpacing:".08em",marginTop:1,display:"flex",alignItems:"center",gap:6 }}>
              <span>PT MULTI BINTANG INDONESIA</span>
              {isConfigured()&&<span style={{ background:"#22c55e30",color:"#22c55e",borderRadius:99,padding:"1px 7px",fontSize:9,fontWeight:700 }}>● LIVE</span>}
            </div>
          </div>
          <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4 }}>
            <div style={{ background:"rgba(240,201,64,.12)",border:"1px solid #c7a94e50",borderRadius:20,padding:"4px 11px",fontSize:11,fontWeight:700,color:"#f0c940" }}>{total} outlet</div>
            {isConfigured()&&(
              <button onClick={loadFromSheets} disabled={loading} style={{ background:"transparent",border:"1px solid #c7a94e40",borderRadius:20,padding:"3px 10px",fontSize:10,color:"#c7a94e",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600 }}>
                {loading?"⏳":"🔄"} Refresh
              </button>
            )}
          </div>
        </div>
        {/* last sync */}
        {isConfigured()&&lastSync&&(
          <div style={{ fontSize:10,color:"#c7a94e60",textAlign:"right",paddingBottom:8,marginTop:-6 }}>
            Terakhir sync: {lastSync.toLocaleTimeString("id-ID")}
          </div>
        )}
        {/* tabs */}
        <div style={{ display:"flex" }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1,background:tab===t.id?"#f0c940":"transparent",color:tab===t.id?"#1a1200":"#c7a94e",border:"none",borderRadius:"10px 10px 0 0",padding:"8px 4px 7px",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all .18s",display:"flex",flexDirection:"column",alignItems:"center",gap:1 }}>
              <span style={{ fontSize:16 }}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",paddingBottom:tab==="aktivasi"?90:20 }}>

        {/* ════ DASHBOARD ════ */}
        {tab==="dashboard"&&(
          <div style={{ padding:"14px 14px",display:"flex",flexDirection:"column",gap:12 }}>
            {!isConfigured()&&<SetupBanner />}
            {loading?<Spinner />:(
              <>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8 }}>
                  {[{label:"Terpasang",count:tOk,...SM["Terpasang"]},{label:"Pending",count:tPend,...SM["Belum Terpasang"]},{label:"Rusak",count:tRusak,...SM["Rusak / Perlu Ganti"]}].map(c=>(
                    <div key={c.label} style={{ background:c.bg,borderRadius:14,padding:"12px 6px",textAlign:"center",border:`1.5px solid ${c.dot}35` }}>
                      <div style={{ fontSize:18 }}>{c.icon}</div>
                      <div style={{ fontSize:22,fontWeight:900,color:c.text,fontFamily:"'Playfair Display',serif",lineHeight:1.1 }}>{c.count}</div>
                      <div style={{ fontSize:10,color:c.text,fontWeight:700,marginTop:2,lineHeight:1.2 }}>{c.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background:"#fff",borderRadius:16,padding:"16px",border:"1px solid #f0e8d0",boxShadow:"0 2px 10px #0000000a" }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                    <span style={{ fontWeight:700,fontSize:13,color:"#78630a" }}>Overall POSM Progress</span>
                    <span style={{ fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:900,color:"#c7a94e" }}>{pct}%</span>
                  </div>
                  <div style={{ background:"#f0e8d0",borderRadius:99,height:12,overflow:"hidden" }}>
                    <div style={{ width:`${pct}%`,background:"linear-gradient(90deg,#c7a94e,#f0c940)",height:"100%",borderRadius:99,transition:"width .6s" }} />
                  </div>
                  <div style={{ fontSize:11,color:"#a07820",marginTop:6 }}>{tOk} terpasang dari {total} outlet</div>
                </div>
                <div style={{ background:"#fff",borderRadius:16,padding:"16px",border:"1px solid #f0e8d0",boxShadow:"0 2px 10px #0000000a" }}>
                  <div style={{ fontWeight:700,fontSize:13,color:"#78630a",marginBottom:12 }}>Per Sales Rep</div>
                  {repStats.length===0?<div style={{ color:"#ccc",fontSize:13 }}>Belum ada data</div>:repStats.map(r=>(
                    <div key={r.name} style={{ marginBottom:10 }}>
                      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                        <span style={{ fontSize:12,fontWeight:600 }}>{r.name}</span>
                        <span style={{ fontSize:11,color:"#a07820",fontWeight:700 }}>{r.done}/{r.total}</span>
                      </div>
                      <MiniBar pct={r.total?r.done/r.total*100:0} />
                    </div>
                  ))}
                </div>
                <div style={{ background:"#fff",borderRadius:16,padding:"16px",border:"1px solid #f0e8d0",boxShadow:"0 2px 10px #0000000a" }}>
                  <div style={{ fontWeight:700,fontSize:13,color:"#78630a",marginBottom:10 }}>Brand Distribution</div>
                  <div style={{ display:"flex",flexWrap:"wrap",gap:7 }}>
                    {BRANDS.map(b=>{ const c=activations.filter(a=>a.brand===b).length; if(!c)return null; return(
                      <span key={b} style={{ background:brandBg[b],color:brandTxt[b],borderRadius:99,padding:"5px 12px",fontSize:12,fontWeight:700,border:`1px solid ${brandColor[b]}40` }}>{b} · {c}</span>
                    );})}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ════ AKTIVASI ════ */}
        {tab==="aktivasi"&&(
          <div style={{ padding:"14px 14px 0" }}>
            <div style={{ display:"flex",gap:8,marginBottom:10 }}>
              <div style={{ flex:1,position:"relative" }}>
                <span style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:15,pointerEvents:"none",opacity:.5 }}>🔍</span>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari outlet / alamat..." style={{ ...iStyle,paddingLeft:38,fontSize:14 }} />
              </div>
              <button onClick={()=>setShowFilter(true)} style={{ background:activeFilters>0?"#f0c940":"#fff",border:`1.5px solid ${activeFilters>0?"#c7a94e":"#e5d9b6"}`,borderRadius:12,padding:"0 15px",cursor:"pointer",fontSize:18,position:"relative",flexShrink:0,minWidth:50 }}>
                🎛{activeFilters>0&&<span style={{ position:"absolute",top:5,right:5,background:"#ef4444",color:"#fff",borderRadius:"50%",width:16,height:16,fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center" }}>{activeFilters}</span>}
              </button>
            </div>
            <div style={{ fontSize:11,color:"#a07820",fontWeight:700,marginBottom:10,letterSpacing:".04em" }}>{filtered.length} DARI {total} AKTIVASI</div>
            {loading?<Spinner />:(<>
              {filtered.length===0&&<div style={{ textAlign:"center",padding:"50px 20px",color:"#bbb" }}><div style={{ fontSize:42 }}>📭</div><div style={{ marginTop:8,fontSize:13 }}>Tidak ada data ditemukan</div></div>}
              {filtered.map(item=>{
                const sm=SM[item.status]||{}; const bc=brandColor[item.brand]||"#c7a94e"; const isOpen=expandId===item.id;
                return (
                  <div key={item.id} style={{ background:"#fff",borderRadius:16,marginBottom:10,border:"1px solid #f0e8d0",borderLeft:`4px solid ${bc}`,boxShadow:"0 2px 8px #0000000a",overflow:"hidden" }}>
                    <div onClick={()=>setExpandId(isOpen?null:item.id)} style={{ padding:"14px 14px 12px",cursor:"pointer" }}>
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:8 }}>
                        <div style={{ flex:1,minWidth:0 }}>
                          <div style={{ fontWeight:800,fontSize:15,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{item.outlet}</div>
                          <div style={{ fontSize:11,color:"#a07820",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>📍 {item.address}</div>
                        </div>
                        <span style={{ background:sm.bg,color:sm.text,borderRadius:99,padding:"4px 10px",fontSize:11,fontWeight:700,flexShrink:0 }}>{sm.icon} {item.status}</span>
                      </div>
                      <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                        <Tag>👤 {item.salesRep.split(" ")[0]}</Tag>
                        <Tag color={brandTxt[item.brand]} bg={brandBg[item.brand]}>🍺 {item.brand}</Tag>
                        <Tag color="#0369a1" bg="#e0f2fe">📌 {item.posm}</Tag>
                      </div>
                    </div>
                    {isOpen&&(
                      <div style={{ borderTop:"1px solid #f0e8d0",padding:"12px 14px 14px",background:"#fffbf0" }}>
                        <div style={{ fontSize:12,color:"#6b7280",marginBottom:10,display:"flex",flexWrap:"wrap",gap:10 }}>
                          <span>📅 {item.date}</span>
                          {item.notes&&<span style={{ fontStyle:"italic" }}>💬 {item.notes}</span>}
                        </div>
                        {item.photos?.length>0&&(
                          <div style={{ display:"flex",gap:6,marginBottom:12,flexWrap:"wrap" }}>
                            {item.photos.map((p,i)=><img key={i} src={p.url} alt="" style={{ width:66,height:66,objectFit:"cover",borderRadius:10,border:"2px solid #c7a94e" }} />)}
                          </div>
                        )}
                        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                          <button onClick={()=>openEdit(item)} style={{ ...btnGold,padding:"11px" }}>✏️ Edit</button>
                          <button onClick={()=>del(item.id)} style={{ background:"#fee2e2",color:"#b91c1c",border:"none",borderRadius:12,padding:"11px",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>🗑️ Hapus</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </>)}
          </div>
        )}

        {/* ════ LAPORAN ════ */}
        {tab==="laporan"&&(
          <div style={{ padding:"14px 14px",display:"flex",flexDirection:"column",gap:12 }}>
            {/* sync status card */}
            <div style={{ background: isConfigured()?"#dcfce7":"#fef9c3",borderRadius:16,padding:"14px 16px",border:`1.5px solid ${isConfigured()?"#22c55e":"#eab308"}`,display:"flex",alignItems:"center",gap:10 }}>
              <span style={{ fontSize:22 }}>{isConfigured()?"☁️":"💾"}</span>
              <div>
                <div style={{ fontWeight:700,fontSize:13,color:isConfigured()?"#15803d":"#a16207" }}>
                  {isConfigured()?"Terhubung ke Google Sheets":"Mode Lokal (belum terhubung)"}
                </div>
                <div style={{ fontSize:11,color:isConfigured()?"#166534":"#854d0e",marginTop:2 }}>
                  {isConfigured()?`Data real-time · ${total} total entri`:"Data hanya tersimpan di perangkat ini"}
                </div>
              </div>
            </div>

            <div style={{ background:"#fff",borderRadius:16,padding:"18px",border:"1px solid #f0e8d0",boxShadow:"0 2px 10px #0000000a" }}>
              <div style={{ fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:900,marginBottom:4 }}>Export Laporan</div>
              <div style={{ fontSize:12,color:"#a07820",marginBottom:16 }}>Download data ke Excel / Google Sheets (.csv)</div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16 }}>
                {[{label:"Total Outlet",val:total,icon:"🏪",bg:"#fffbf0"},{label:"POSM Terpasang",val:`${tOk} (${pct}%)`,icon:"✅",bg:"#dcfce7"},{label:"Belum Pasang",val:tPend,icon:"⏳",bg:"#fef9c3"},{label:"Perlu Ganti",val:tRusak,icon:"⚠️",bg:"#fee2e2"}].map(s=>(
                  <div key={s.label} style={{ background:s.bg,borderRadius:12,padding:"12px 14px",border:"1px solid #f0e8d0" }}>
                    <div style={{ fontSize:18 }}>{s.icon}</div>
                    <div style={{ fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:900 }}>{s.val}</div>
                    <div style={{ fontSize:10,color:"#a07820",fontWeight:700,marginTop:2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <button onClick={exportCSV} style={btnGold}>📥 Download CSV</button>
              {exportMsg&&<div style={{ textAlign:"center",color:"#16a34a",fontWeight:700,fontSize:13,marginTop:10 }}>{exportMsg}</div>}
            </div>

            <div style={{ background:"#fff",borderRadius:16,padding:"18px",border:"1px solid #f0e8d0",boxShadow:"0 2px 10px #0000000a" }}>
              <div style={{ fontWeight:700,fontSize:13,color:"#78630a",marginBottom:14 }}>Rekap per Sales Rep</div>
              {SALES_REPS.map(rep=>{
                const items=activations.filter(a=>a.salesRep===rep); if(!items.length)return null;
                const done=items.filter(a=>a.status==="Terpasang").length;
                const pend=items.filter(a=>a.status==="Belum Terpasang").length;
                const rusak=items.filter(a=>a.status==="Rusak / Perlu Ganti").length;
                return (
                  <div key={rep} style={{ borderBottom:"1px solid #f0e8d0",paddingBottom:12,marginBottom:12 }}>
                    <div style={{ fontWeight:700,fontSize:13,marginBottom:6 }}>{rep}</div>
                    <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                      <Tag color="#15803d" bg="#dcfce7">✅ {done}</Tag>
                      <Tag color="#a16207" bg="#fef9c3">⏳ {pend}</Tag>
                      {rusak>0&&<Tag color="#b91c1c" bg="#fee2e2">⚠️ {rusak}</Tag>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* FAB */}
      {tab==="aktivasi"&&(
        <button onClick={openAdd} disabled={syncing} style={{ position:"fixed",bottom:24,right:20,zIndex:200,width:58,height:58,borderRadius:"50%",background:"linear-gradient(135deg,#c7a94e,#f0c940)",color:"#1a1200",border:"none",fontSize:30,cursor:"pointer",boxShadow:"0 6px 24px #c7a94e66",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,lineHeight:1,opacity:syncing?.7:1 }}>+</button>
      )}

      {/* ════ FILTER SHEET ════ */}
      <Sheet open={showFilter} onClose={()=>setShowFilter(false)} title="🎛 Filter">
        {[{label:"Sales Rep",val:filterRep,set:setFilterRep,opts:["Semua",...SALES_REPS]},{label:"Status POSM",val:filterStatus,set:setFilterStatus,opts:["Semua",...STATUS_OPTIONS]},{label:"Brand",val:filterBrand,set:setFilterBrand,opts:["Semua",...BRANDS]}].map(f=>(
          <F key={f.label} label={f.label}><select value={f.val} onChange={e=>f.set(e.target.value)} style={iStyle}>{f.opts.map(o=><option key={o}>{o}</option>)}</select></F>
        ))}
        <button onClick={()=>{setFilterRep("Semua");setFilterStatus("Semua");setFilterBrand("Semua");}} style={{ ...btnGold,background:"#f3f4f6",color:"#6b7280",marginBottom:10 }}>Reset Filter</button>
        <button onClick={()=>setShowFilter(false)} style={btnGold}>Terapkan ✓</button>
      </Sheet>

      {/* ════ FORM SHEET ════ */}
      <Sheet open={showForm} onClose={closeForm} title={editId?"✏️ Edit Aktivasi":"➕ Tambah Aktivasi"}>
        <F label="Nama Outlet *"><input value={form.outlet} onChange={e=>setForm(p=>({...p,outlet:e.target.value}))} placeholder="cth: Warung Bu Sari" style={iStyle} /></F>
        <F label="Alamat Outlet *"><input value={form.address} onChange={e=>setForm(p=>({...p,address:e.target.value}))} placeholder="cth: Jl. Merdeka No.5, Bandung" style={iStyle} /></F>
        <F label="Sales Representative *">
          <select value={form.salesRep} onChange={e=>setForm(p=>({...p,salesRep:e.target.value}))} style={iStyle}>
            <option value="">-- Pilih Sales Rep --</option>
            {SALES_REPS.map(o=><option key={o}>{o}</option>)}
          </select>
        </F>
        <F label="Brand *">
          <select value={form.brand} onChange={e=>setForm(p=>({...p,brand:e.target.value}))} style={iStyle}>
            <option value="">-- Pilih Brand --</option>
            {BRANDS.map(o=><option key={o}>{o}</option>)}
          </select>
        </F>
        <F label="Jenis POSM *">
          <select value={form.posm} onChange={e=>setForm(p=>({...p,posm:e.target.value}))} style={iStyle}>
            <option value="">-- Pilih POSM --</option>
            {POSM_TYPES.map(o=><option key={o}>{o}</option>)}
          </select>
        </F>
        <F label="Status POSM *">
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            {STATUS_OPTIONS.map(s=>{ const sm=SM[s]; const sel=form.status===s; return(
              <button key={s} onClick={()=>setForm(p=>({...p,status:s}))} style={{ background:sel?sm.bg:"#fff",border:`2px solid ${sel?sm.dot:"#e5d9b6"}`,borderRadius:12,padding:"12px 14px",display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",width:"100%",textAlign:"left",transition:"all .15s" }}>
                <span style={{ fontSize:18 }}>{sm.icon}</span>
                <span style={{ fontWeight:700,fontSize:14,color:sel?sm.text:"#6b7280" }}>{s}</span>
                {sel&&<span style={{ marginLeft:"auto",color:sm.dot,fontWeight:900 }}>✓</span>}
              </button>
            );})}
          </div>
        </F>
        <F label="Tanggal"><input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} style={iStyle} /></F>
        <F label="Catatan"><textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="cth: Outlet kooperatif, lokasi strategis" rows={3} style={{ ...iStyle,resize:"none" }} /></F>
        <F label="📸 Foto Bukti POSM"><PhotoUpload photos={form.photos} onChange={photos=>setForm(p=>({...p,photos}))} /></F>
        <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr",gap:10,marginTop:8 }}>
          <button onClick={save} disabled={syncing} style={{ ...btnGold,opacity:syncing?.7:1 }}>{syncing?"⏳ Menyimpan...":editId?"💾 Simpan":"✅ Tambah"}</button>
          <button onClick={closeForm} style={{ background:"#f3f4f6",color:"#6b7280",border:"none",borderRadius:12,padding:"14px",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>Batal</button>
        </div>
      </Sheet>
    </div>
  );
}
