import { useState, useRef, useEffect } from "react";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzLfur9C0wDhKFtAGkC-oZauSrz4taF4oAj_uRIoQ_p7qeLyxMzPay7215uy67xhgcPUA/exec";

// ═══════════════════════════════════════════════════════════
// 🔐 ROLE CONFIG
// ADMIN_PASSWORD: ganti dengan password admin kamu
const ADMIN_PASSWORD = "MBI@Admin2026";
// ═══════════════════════════════════════════════════════════
const CLOUDINARY_CLOUD  = "djsrywda5";
const CLOUDINARY_PRESET = "mbi_posm";

const BRANDS       = ["Kawan Senja"];
const POSM_TYPES   = ["DumBin","Poster Sticker A3","T-Shirt","Sunblind","Sticker Chiller","Tent Card Insertion"];
const SALES_REPS   = [
  "DSR BALI 1","DSR BALI 3","DSR BALI 4","DSR BALI 5",
  "DSR BALI 7","DSR BALI 9","DSR BALI 11","DSR BALI 12",
  "DSR BALI 13","DSR BALI 15","DSR BALI 16","DSR BALI 18",
  "DSR BALI 21","DSR BALI 22","DSR BALI 24","DSR BALI 25",
  "DSR BALI 26","DSR BALI 29","DSR BALI 30","DSR BALI 32",
  "DSR BALI 34","DSR BALI 36","DSR BALI 38","DSR BALI 39",
  "DSR BALI 40","DSR BALI 41","DSR BALI 42","DSR BALI 43",
  "DSR BALI 44","DSR BALI 46","DSR BALI 47","DSR BALI 48",
  "DSR BALI 51",
];
const STATUS_OPTIONS = ["Terpasang","Belum Terpasang","Rusak / Perlu Ganti"];
const CHANNELS       = ["WHS (Wholesalers)","TOFT (Traditional Off Trade)","TONT (Traditional On Trade)"];
const CHANNEL_CLASS  = {
  "WHS (Wholesalers)":           ["WHS"],
  "TOFT (Traditional Off Trade)":["PND (P&D - Proviand en Drank)","TLS (Traditional Liquor Store)","CVS (ConVenience Stores)"],
  "TONT (Traditional On Trade)": ["RNB (Resto N Bar)","STR (Standard Restaurant)","STB (Standard Bar/Pub/Cafe)"],
};

const MBISP_AREAS = [
  "BALI 1","BALI 2","BALI 3","BALI 4","BALI 5",
  "BALI 6","BALI 7","BALI 8","BALI 10",
];

const brandBg  = { "Kawan Senja":"#dcfce7" };
const brandTxt = { "Kawan Senja":"#14532d" };
const brandClr = { "Kawan Senja":"#16a34a" };

const SM = {
  "Terpasang":          { bg:"#dcfce7",text:"#15803d",dot:"#22c55e",icon:"✅" },
  "Belum Terpasang":    { bg:"#fef9c3",text:"#a16207",dot:"#eab308",icon:"⏳" },
  "Rusak / Perlu Ganti":{ bg:"#fee2e2",text:"#b91c1c",dot:"#ef4444",icon:"⚠️" },
};

const emptyForm = {
  outlet:"", address:"", disId:"", mbisp:"", salesRep:"", brand:"",
  posms:[], status:"", notes:"", photos:[],
  date:new Date().toISOString().split("T")[0],
  channel:"", channelClass:"", lat:"", lng:"", geoStatus:"",
};

/* ── helpers ── */
function Tag({ children, color="#78630a", bg="#f0e8d0" }) {
  return <span style={{ background:bg,color,borderRadius:99,padding:"3px 9px",fontSize:11,fontWeight:700,whiteSpace:"nowrap" }}>{children}</span>;
}
function MiniBar({ pct }) {
  return (
    <div style={{ background:"#e5d9b6",borderRadius:99,height:6,overflow:"hidden",flex:1 }}>
      <div style={{ width:`${pct}%`,background:"linear-gradient(90deg,#25671E,#48A111)",height:"100%",borderRadius:99,transition:"width .5s" }} />
    </div>
  );
}
function Spinner() {
  return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 20px",gap:12 }}>
      <div style={{ width:36,height:36,border:"3px solid #f0e8d0",borderTop:"3px solid #48A111",borderRadius:"50%",animation:"spin 0.8s linear infinite" }} />
      <div style={{ fontSize:13,color:"#a07820",fontWeight:600 }}>Memuat data...</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ── Toast ── */
function Toast({ msg, type="success" }) {
  if (!msg) return null;
  const colors = {
    success:{ bg:"#dcfce7",text:"#15803d",border:"#22c55e" },
    error:  { bg:"#fee2e2",text:"#b91c1c",border:"#ef4444" },
    loading:{ bg:"#fef9c3",text:"#a16207",border:"#eab308" },
  };
  const c = colors[type]||colors.success;
  return (
    <div style={{ position:"fixed",top:80,left:"50%",transform:"translateX(-50%)",zIndex:500,
      background:c.bg,color:c.text,border:`1.5px solid ${c.border}`,borderRadius:12,
      padding:"12px 20px",fontSize:13,fontWeight:700,boxShadow:"0 4px 20px rgba(0,0,0,.15)",
      whiteSpace:"nowrap",maxWidth:"90vw",textAlign:"center" }}>
      {msg}
    </div>
  );
}

/* ── Photo Upload ── */
function PhotoUpload({ photos, onChange, posms=[] }) {
  const ref = useRef();
  const add = e => Array.from(e.target.files).forEach(f => {
    const r = new FileReader();
    r.onload = ev => onChange([...photos,{url:ev.target.result,name:f.name,posmLabel:""}]);
    r.readAsDataURL(f);
  });
  return (
    <div>
      <div onClick={()=>ref.current.click()} style={{ border:"2px dashed #48A111",borderRadius:12,padding:"16px 12px",textAlign:"center",cursor:"pointer",background:"#f0fdf4" }}>
        <div style={{ fontSize:26 }}>📸</div>
        <div style={{ fontWeight:700,fontSize:13,color:"#14532d",marginTop:3 }}>Upload / Foto Bukti POSM</div>
        <div style={{ fontSize:11,color:"#16a34a",marginTop:2 }}>Bisa pilih lebih dari 1 foto sekaligus</div>
        <input ref={ref} type="file" accept="image/*" multiple capture="environment" style={{ display:"none" }} onChange={add} />
      </div>
      {photos.length>0&&(
        <div style={{ display:"flex",flexDirection:"column",gap:8,marginTop:10 }}>
          {photos.map((p,i)=>(
            <div key={i} style={{ display:"flex",gap:8,alignItems:"center",background:"#f0fdf4",borderRadius:12,padding:"8px 10px",border:"1.5px solid #bbf7d0" }}>
              <img src={p.url} alt="" style={{ width:58,height:58,objectFit:"cover",borderRadius:8,border:"2px solid #48A111",flexShrink:0 }} />
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontSize:11,color:"#14532d",fontWeight:700,marginBottom:4 }}>📌 Foto #{i+1} ini untuk POSM:</div>
                {posms.length>0?(
                  <select value={p.posmLabel||""} onChange={e=>onChange(photos.map((ph,j)=>j===i?{...ph,posmLabel:e.target.value}:ph))}
                    style={{ width:"100%",padding:"5px 8px",borderRadius:8,border:"1.5px solid #bbf7d0",fontSize:12,background:"#fff",fontFamily:"'DM Sans',sans-serif" }}>
                    <option value="">-- Pilih POSM --</option>
                    {posms.map(pm=><option key={pm}>{pm}</option>)}
                  </select>
                ):(
                  <div style={{ fontSize:11,color:"#6b7280",fontStyle:"italic" }}>Pilih POSM dulu di atas</div>
                )}
              </div>
              <button onClick={()=>onChange(photos.filter((_,j)=>j!==i))} style={{ background:"#fee2e2",color:"#ef4444",border:"none",borderRadius:"50%",width:24,height:24,fontSize:13,cursor:"pointer",fontWeight:900,lineHeight:"24px",textAlign:"center",flexShrink:0 }}>×</button>
            </div>
          ))}
          <div style={{ fontSize:11,color:"#16a34a",fontWeight:600 }}>📸 {photos.length} foto ter-upload</div>
        </div>
      )}
    </div>
  );
}

/* ── Bottom Sheet ── */
function Sheet({ open, onClose, title, children }) {
  useEffect(()=>{ document.body.style.overflow=open?"hidden":""; return()=>{ document.body.style.overflow=""; }; },[open]);
  if (!open) return null;
  return (
    <div style={{ position:"fixed",inset:0,zIndex:300 }}>
      <style>{`@keyframes su{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
      <div onClick={onClose} style={{ position:"absolute",inset:0,background:"rgba(0,0,0,.5)",backdropFilter:"blur(4px)" }} />
      <div style={{ position:"absolute",bottom:0,left:0,right:0,background:"#fff",borderRadius:"20px 20px 0 0",maxHeight:"92dvh",display:"flex",flexDirection:"column",boxShadow:"0 -8px 40px rgba(0,0,0,.2)",animation:"su .3s ease" }}>
        <div style={{ width:38,height:4,background:"#d1d5db",borderRadius:99,margin:"12px auto 0",flexShrink:0 }} />
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 18px",borderBottom:"1px solid #dcfce7",flexShrink:0 }}>
          <span style={{ fontFamily:"'Playfair Display',serif",fontWeight:800,fontSize:17 }}>{title}</span>
          <button onClick={onClose} style={{ background:"#f3f4f6",border:"none",borderRadius:"50%",width:30,height:30,fontSize:16,cursor:"pointer",lineHeight:"30px",textAlign:"center" }}>×</button>
        </div>
        <div style={{ overflowY:"auto",padding:"16px 18px 40px",flex:1,WebkitOverflowScrolling:"touch" }}>{children}</div>
      </div>
    </div>
  );
}

const iStyle = { width:"100%",padding:"12px 14px",borderRadius:12,border:"1.5px solid #bbf7d0",fontSize:15,fontFamily:"'DM Sans',sans-serif",background:"#f0fdf4",outline:"none",boxSizing:"border-box",color:"#1a1200",WebkitAppearance:"none" };
const lStyle = { fontSize:11,fontWeight:700,color:"#14532d",marginBottom:5,display:"block",letterSpacing:".05em",textTransform:"uppercase" };
function F({ label, children }) { return <div style={{ marginBottom:14 }}><label style={lStyle}>{label}</label>{children}</div>; }
const btnGreen = { background:"linear-gradient(135deg,#25671E,#48A111)",color:"#fff",border:"none",borderRadius:12,padding:"14px 20px",fontWeight:800,fontSize:15,cursor:"pointer",width:"100%",fontFamily:"'DM Sans',sans-serif",WebkitTapHighlightColor:"transparent" };

/* ── GPS helper ── */
function getGPS(onSuccess, onError) {
  if (!navigator.geolocation) { onError("Browser tidak support GPS"); return; }
  navigator.geolocation.getCurrentPosition(
    pos => onSuccess(
      pos.coords.latitude.toFixed(6),
      pos.coords.longitude.toFixed(6),
      Math.round(pos.coords.accuracy)
    ),
    () => onError("GPS tidak tersedia / ditolak"),
    { timeout:8000, maximumAge:0, enableHighAccuracy:true }
  );
}

function copyToClipboard(text) {
  if (navigator.clipboard) navigator.clipboard.writeText(text);
  else {
    const el = document.createElement("textarea");
    el.value = text; document.body.appendChild(el);
    el.select(); document.execCommand("copy");
    document.body.removeChild(el);
  }
}

/* ── Photo Compression ── */
async function compressPhoto(photoBase64, maxSizeKB=400) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      const maxDim = 800;
      if (width > maxDim || height > maxDim) {
        if (width > height) { height = Math.round(height * maxDim / width); width = maxDim; }
        else { width = Math.round(width * maxDim / height); height = maxDim; }
      }
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "medium";
      ctx.drawImage(img, 0, 0, width, height);
      let quality = 0.7, result = canvas.toDataURL("image/jpeg", quality), iter = 0;
      while (result.length * 0.75 / 1024 > maxSizeKB && quality > 0.3 && iter < 3) {
        quality -= 0.15; result = canvas.toDataURL("image/jpeg", quality); iter++;
      }
      resolve(result);
    };
    img.onerror = () => resolve(photoBase64);
    img.src = photoBase64;
  });
}

async function uploadPhotoToCloudinary(photoBase64, fileName) {
  try {
    const compressed = await compressPhoto(photoBase64, 400);
    const base64Data = compressed.split(",")[1];
    if (!base64Data) return "";
    const sizeKB = Math.round(base64Data.length * 0.75 / 1024);
    if (sizeKB > 800) return "";
    const formData = new FormData();
    formData.append("file", compressed);
    formData.append("upload_preset", CLOUDINARY_PRESET);
    formData.append("folder", "MBI_POSM");
    formData.append("public_id", fileName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_"));
    const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method:"POST", body:formData });
    if (!res.ok) return "";
    const data = await res.json();
    return data.secure_url || "";
  } catch(e) { return ""; }
}

/* ── Sheets API ── */
const isConfigured = () => GOOGLE_SCRIPT_URL && !GOOGLE_SCRIPT_URL.includes("PASTE_URL");

async function fetchFromSheets() {
  const res  = await fetch(GOOGLE_SCRIPT_URL + "?t=" + Date.now(), { method:"GET", mode:"cors" });
  const rows = await res.json();
  if (!Array.isArray(rows)) throw new Error("Invalid");
  return rows.slice(1).filter(r=>r[1]).map((r,i)=>({
    id:i+1, date:r[0]||"", outlet:r[1]||"", address:r[2]||"",
    salesRep:r[3]||"", brand:r[4]||"", posm:r[5]||"",
    status:r[6]||"", notes:r[7]||"", channel:r[8]||"",
    channelClass:r[9]||"", disId:r[10]||"", mbisp:r[11]||"",
    photoUrl:String(r[12]||""), lat:String(r[13]||""), lng:String(r[14]||""),
    posms: r[5] ? r[5].split(", ") : [], photos:[], rowIndex:i+2,
  }));
}

async function postToSheets(payload) {
  const params = new URLSearchParams({
    action:       payload.action,
    date:         payload.date||"",
    outlet:       payload.outlet||"",
    address:      payload.address||"",
    salesRep:     payload.salesRep||"",
    brand:        payload.brand||"",
    posm:         (payload.posms||[]).join(", ")||"",
    status:       payload.status||"",
    notes:        payload.notes||"",
    channel:      payload.channel||"",
    channelClass: payload.channelClass||"",
    disId:        payload.disId||"",
    mbisp:        payload.mbisp||"",
    photoUrl:     payload.photoUrl||"",
    lat:          payload.lat||"",
    lng:          payload.lng||"",
    rowIndex:     payload.rowIndex||"",
    t:            Date.now(),
  });
  await fetch(GOOGLE_SCRIPT_URL + "?" + params.toString(), { method:"GET", mode:"no-cors" });
  await new Promise(r => setTimeout(r, 2000));
}

async function saveToSheets(data) {
  let photoUrl = "";
  if (data.photos && data.photos.length > 0) {
    const outletClean = (data.outlet||"Outlet").replace(/[^a-zA-Z0-9]/g,"");
    const repClean    = (data.salesRep||"Rep").replace(/\s/g,"");
    const dateClean   = (data.date||"").replace(/-/g,"");
    const urls = [];
    for (let i = 0; i < data.photos.length; i++) {
      const photo     = data.photos[i];
      const posmClean = (photo.posmLabel||`POSM${i+1}`).replace(/[^a-zA-Z0-9]/g,"");
      const fileName  = `${outletClean}_${repClean}_${posmClean}_${dateClean}.jpg`;
      const url       = await uploadPhotoToCloudinary(photo.url, fileName);
      if (url) urls.push(url);
    }
    photoUrl = urls.join(" | ");
  }
  await postToSheets({ action:"add", ...data, photoUrl });
}

async function deleteFromSheets(rowIndex) {
  const params = new URLSearchParams({ action:"delete", rowIndex, t:Date.now() });
  await fetch(GOOGLE_SCRIPT_URL + "?" + params.toString(), { method:"GET", mode:"no-cors" });
  await new Promise(r => setTimeout(r, 1500));
}

/* ── Login Screen ── */
function LoginScreen({ onLogin }) {
  const [role, setRole]     = useState("user");
  const [pass, setPass]     = useState("");
  const [error, setError]   = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleLogin = () => {
    if (role === "admin") {
      if (pass === ADMIN_PASSWORD) {
        onLogin("admin");
      } else {
        setError("❌ Password salah. Coba lagi.");
        setTimeout(() => setError(""), 2500);
      }
    } else {
      onLogin("user");
    }
  };

  return (
    <div style={{ maxWidth:430, margin:"0 auto", minHeight:"100dvh",
      background:"linear-gradient(160deg,#25671E 0%,#1a4a14 60%,#0f2d0a 100%)",
      display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", padding:"24px 20px",
      fontFamily:"'DM Sans',sans-serif" }}>

      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet" />

      {/* Logo */}
      <div style={{ width:80, height:80, borderRadius:"50%",
        background:"linear-gradient(135deg,#F2B50B,#f0c940)",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:38, marginBottom:20,
        boxShadow:"0 8px 32px rgba(242,181,11,.4)" }}>🍺</div>

      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:26,
        fontWeight:900, color:"#F2B50B", marginBottom:4, textAlign:"center" }}>
        MBI Activation Tracker
      </div>
      <div style={{ fontSize:12, color:"rgba(242,181,11,.6)",
        letterSpacing:".08em", marginBottom:32, textAlign:"center" }}>
        PT MULTI BINTANG INDONESIA
      </div>

      {/* Card */}
      <div style={{ background:"#fff", borderRadius:20, padding:"24px 20px",
        width:"100%", boxShadow:"0 20px 60px rgba(0,0,0,.3)" }}>

        <div style={{ fontSize:14, fontWeight:700, color:"#14532d",
          marginBottom:14, textAlign:"center" }}>
          Masuk sebagai:
        </div>

        {/* Role selector */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:18 }}>
          {[
            { id:"user",  label:"👤 User",  sub:"Sales Rep / DSR" },
            { id:"admin", label:"🔐 Admin", sub:"PIC Area / Manager" },
          ].map(r => (
            <button key={r.id} onClick={()=>{ setRole(r.id); setPass(""); setError(""); }}
              style={{
                background: role===r.id ? "#dcfce7" : "#f9fafb",
                border: `2px solid ${role===r.id ? "#22c55e" : "#e5e7eb"}`,
                borderRadius:12, padding:"14px 10px", cursor:"pointer",
                fontFamily:"'DM Sans',sans-serif", transition:"all .15s",
                textAlign:"center",
              }}>
              <div style={{ fontSize:18, marginBottom:3 }}>{r.label.split(" ")[0]}</div>
              <div style={{ fontSize:13, fontWeight:700,
                color: role===r.id ? "#15803d" : "#374151" }}>{r.label.split(" ").slice(1).join(" ")}</div>
              <div style={{ fontSize:10, color:"#6b7280", marginTop:2 }}>{r.sub}</div>
            </button>
          ))}
        </div>

        {/* Admin password field */}
        {role==="admin"&&(
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:11, fontWeight:700, color:"#14532d",
              marginBottom:5, display:"block", letterSpacing:".05em",
              textTransform:"uppercase" }}>
              Password Admin
            </label>
            <div style={{ position:"relative" }}>
              <input
                type={showPass?"text":"password"}
                value={pass}
                onChange={e=>{ setPass(e.target.value); setError(""); }}
                onKeyDown={e=>e.key==="Enter"&&handleLogin()}
                placeholder="Masukkan password admin"
                style={{ width:"100%", padding:"12px 44px 12px 14px",
                  borderRadius:12, border:`1.5px solid ${error?"#ef4444":"#bbf7d0"}`,
                  fontSize:15, fontFamily:"'DM Sans',sans-serif",
                  background:"#f0fdf4", outline:"none", boxSizing:"border-box" }}
              />
              <button onClick={()=>setShowPass(!showPass)}
                style={{ position:"absolute", right:12, top:"50%",
                  transform:"translateY(-50%)", background:"none", border:"none",
                  cursor:"pointer", fontSize:18 }}>
                {showPass?"🙈":"👁️"}
              </button>
            </div>
            {error&&<div style={{ color:"#ef4444", fontSize:12,
              fontWeight:700, marginTop:6 }}>{error}</div>}
          </div>
        )}

        {/* Info box for user */}
        {role==="user"&&(
          <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0",
            borderRadius:10, padding:"10px 14px", marginBottom:16,
            fontSize:12, color:"#14532d" }}>
            <div style={{ fontWeight:700, marginBottom:2 }}>ℹ️ Akses User (DSR)</div>
            <div style={{ color:"#16a34a" }}>Bisa input & lihat data aktivasi. Tidak bisa hapus data.</div>
          </div>
        )}

        <button onClick={handleLogin}
          style={{ background:"linear-gradient(135deg,#25671E,#48A111)",
            color:"#fff", border:"none", borderRadius:12, padding:"14px",
            fontWeight:800, fontSize:15, cursor:"pointer",
            width:"100%", fontFamily:"'DM Sans',sans-serif" }}>
          {role==="admin"?"🔐 Masuk sebagai Admin":"👤 Masuk sebagai User"}
        </button>
      </div>

      <div style={{ fontSize:11, color:"rgba(242,181,11,.4)",
        marginTop:20, textAlign:"center" }}>
        v1.0 · MBI Activation Tracker
      </div>
    </div>
  );
}

/* ════ MAIN APP ════ */
export default function App() {
  const [role, setRole] = useState(null);
  const [tab, setTab]         = useState("dashboard");
  const [activations, setActivations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast]     = useState({ msg:"", type:"success" });
  const [form, setForm]       = useState(emptyForm);
  const [showForm, setShowForm]   = useState(false);
  const [editId, setEditId]       = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterRep, setFilterRep]       = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterBrand, setFilterBrand]   = useState("Semua");
  const [search, setSearch]   = useState("");
  const [expandId, setExpandId] = useState(null);
  const [exportMsg, setExportMsg] = useState("");
  const [lastSync, setLastSync]   = useState(null);
  const [copiedGPS, setCopiedGPS] = useState(false);

  const showToast = (msg, type="success", dur=3000) => {
    setToast({msg,type}); setTimeout(()=>setToast({msg:"",type:"success"}),dur);
  };

  useEffect(()=>{ if(isConfigured()) loadFromSheets(); },[]);

  const loadFromSheets = async () => {
    setLoading(true);
    try {
      const data = await fetchFromSheets();
      setActivations(data); setLastSync(new Date());
      showToast("✅ Data berhasil dimuat");
    } catch(e) { showToast("⚠️ Gagal load dari Sheets","error"); }
    setLoading(false);
  };

  const openAdd = () => {
    setForm(emptyForm); setEditId(null); setShowForm(true);
    setForm(f=>({...f, geoStatus:"⏳ Mengambil GPS..."}));
    getGPS(
      (lat,lng,acc) => setForm(f=>({...f, lat, lng, geoStatus:`✅ Akurasi ±${acc}m`})),
      (err)          => setForm(f=>({...f, geoStatus:`⚠️ ${err}`}))
    );
  };

  const openEdit = item => { setForm({...item}); setEditId(item.id); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditId(null); };

  const save = async () => {
    if (!form.outlet||!form.address||!form.disId||!form.mbisp||!form.salesRep||!form.brand||
        !(form.posms&&form.posms.length>0)||!form.status||!form.channel||!form.channelClass) {
      showToast("⚠️ Lengkapi semua field wajib (*)","error"); return;
    }
    if (!form.photos||form.photos.length===0) {
      showToast("📸 Foto bukti POSM wajib diupload!","error"); return;
    }
    setSyncing(true);
    const photoCount = form.photos?.length||0;
    showToast(`⏳ Menyimpan + upload ${photoCount} foto...`,"loading",60000);
    try {
      if (editId) {
        const item = activations.find(x=>x.id===editId);
        await postToSheets({...form, action:"update", rowIndex:item.rowIndex});
        setActivations(a=>a.map(x=>x.id===editId?{...form,id:editId,rowIndex:item.rowIndex}:x));
      } else {
        if (isConfigured()) await saveToSheets(form);
        setActivations(a=>[...a,{...form,id:Date.now(),rowIndex:a.length+2}]);
      }
      closeForm();
      showToast(`✅ Tersimpan! ${photoCount} foto ter-upload`);
      if (isConfigured()) setTimeout(()=>loadFromSheets(),2000);
    } catch(e) { showToast("❌ Gagal menyimpan. Coba lagi.","error"); }
    setSyncing(false);
  };

  const del = async id => {
    if (!window.confirm("Hapus data ini?")) return;
    setSyncing(true);
    // Optimistic update - hapus dari UI dulu, baru sync ke sheets
    setActivations(a=>a.filter(x=>x.id!==id));
    setExpandId(null);
    showToast("🗑️ Data berhasil dihapus");
    try {
      const item = activations.find(x=>x.id===id);
      if (isConfigured() && item) await deleteFromSheets(item.rowIndex);
    } catch(e) { showToast("⚠️ Sync hapus gagal, refresh manual","error"); }
    setSyncing(false);
  };

  const filtered = activations.filter(a=>
    (filterRep==="Semua"||a.salesRep===filterRep)&&
    (filterStatus==="Semua"||a.status===filterStatus)&&
    (filterBrand==="Semua"||a.brand===filterBrand)&&
    (!search||a.outlet.toLowerCase().includes(search.toLowerCase())||
     a.address.toLowerCase().includes(search.toLowerCase())||
     (a.disId||"").toLowerCase().includes(search.toLowerCase()))
  );

  const total=activations.length, tOk=activations.filter(a=>a.status==="Terpasang").length,
    tPend=activations.filter(a=>a.status==="Belum Terpasang").length,
    tRusak=activations.filter(a=>a.status==="Rusak / Perlu Ganti").length,
    pct=total?Math.round(tOk/total*100):0;

  const repStats=SALES_REPS.map(name=>({
    name, total:activations.filter(a=>a.salesRep===name).length,
    done:activations.filter(a=>a.salesRep===name&&a.status==="Terpasang").length,
  })).filter(r=>r.total>0);

  const activeFilters=[filterRep,filterStatus,filterBrand].filter(x=>x!=="Semua").length;

  const exportCSV = () => {
    const rows=[["Tanggal","Outlet","Alamat","ID DIS","Sales Rep","Brand","POSM","Status","Catatan","Channel","Class","Foto","Latitude","Longitude"],
      ...filtered.map(a=>[a.date,a.outlet,a.address,a.disId||"",a.salesRep,a.brand,a.posm||"",a.status,a.notes,a.channel||"",a.channelClass||"",a.photoUrl||"",a.lat||"",a.lng||""])];
    const blob=new Blob([rows.map(r=>r.map(c=>`"${c}"`).join(",")).join("\n")],{type:"text/csv"});
    const el=document.createElement("a"); el.href=URL.createObjectURL(blob); el.download="MBI_Aktivasi.csv"; el.click();
    setExportMsg("✅ Berhasil diexport!"); setTimeout(()=>setExportMsg(""),3000);
  };

  const TABS=[{id:"dashboard",icon:"📊",label:"Dashboard"},{id:"aktivasi",icon:"📋",label:"Aktivasi"},{id:"laporan",icon:"📤",label:"Laporan"}];

  // Show login screen if not logged in
  if (!role) return <LoginScreen onLogin={setRole} />;

  const isAdmin = role === "admin";

  return (
    <div style={{ maxWidth:430,margin:"0 auto",minHeight:"100dvh",background:"#f0fdf4",fontFamily:"'DM Sans',sans-serif",color:"#1a2e0f",display:"flex",flexDirection:"column" }}>
      <style dangerouslySetInnerHTML={{__html:`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800;900&display=swap');
        *{box-sizing:border-box;-webkit-font-smoothing:antialiased}
        input,select,textarea{font-size:16px!important}
        button{-webkit-tap-highlight-color:transparent}
      `}} />

      <Toast msg={toast.msg} type={toast.type} />

      {/* HEADER */}
      <div style={{ background:"linear-gradient(155deg,#25671E 0%,#1a4a14 100%)",padding:"14px 18px 0",position:"sticky",top:0,zIndex:100,boxShadow:"0 3px 16px rgba(0,0,0,.28)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:10,paddingBottom:12 }}>
          <div style={{ width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,#F2B50B,#f0c940)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>🍺</div>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:900,color:"#F2B50B",lineHeight:1.15,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>MBI Activation Tracker</div>
            <div style={{ fontSize:9.5,color:"rgba(242,181,11,.6)",letterSpacing:".08em",marginTop:1,display:"flex",alignItems:"center",gap:6 }}>
              <span>PT MULTI BINTANG INDONESIA</span>
              {isConfigured()&&<span style={{ background:"rgba(72,161,17,.3)",color:"#86efac",borderRadius:99,padding:"1px 7px",fontSize:9,fontWeight:700 }}>● LIVE</span>}
            </div>
          </div>
          <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4 }}>
            <div style={{ display:"flex",alignItems:"center",gap:6 }}>
              <div style={{ background:"rgba(242,181,11,.15)",border:"1px solid rgba(242,181,11,.4)",borderRadius:20,padding:"4px 11px",fontSize:11,fontWeight:700,color:"#F2B50B" }}>{total} outlet</div>
              <div style={{ background: isAdmin?"rgba(239,68,68,.2)":"rgba(72,161,17,.2)", border:`1px solid ${isAdmin?"rgba(239,68,68,.5)":"rgba(72,161,17,.5)"}`, borderRadius:20,padding:"4px 10px",fontSize:10,fontWeight:700,color:isAdmin?"#fca5a5":"#86efac" }}>
                {isAdmin?"🔐 Admin":"👤 User"}
              </div>
            </div>
            <div style={{ display:"flex",gap:4 }}>
              {isConfigured()&&(
                <button onClick={loadFromSheets} disabled={loading} style={{ background:"transparent",border:"1px solid rgba(72,161,17,.4)",borderRadius:20,padding:"3px 10px",fontSize:10,color:"#86efac",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600 }}>
                  {loading?"⏳":"🔄"} Refresh
                </button>
              )}
              <button onClick={()=>setRole(null)} style={{ background:"transparent",border:"1px solid rgba(239,68,68,.4)",borderRadius:20,padding:"3px 10px",fontSize:10,color:"#fca5a5",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600 }}>
                Keluar
              </button>
            </div>
          </div>
        </div>
        {isConfigured()&&lastSync&&(
          <div style={{ fontSize:10,color:"rgba(242,181,11,.5)",textAlign:"right",paddingBottom:6,marginTop:-6 }}>
            Sync: {lastSync.toLocaleTimeString("id-ID")}
          </div>
        )}
        <div style={{ display:"flex" }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1,background:tab===t.id?"#F2B50B":"transparent",color:tab===t.id?"#25671E":"rgba(242,181,11,.8)",border:"none",borderRadius:"10px 10px 0 0",padding:"8px 4px 7px",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all .18s",display:"flex",flexDirection:"column",alignItems:"center",gap:1 }}>
              <span style={{ fontSize:16 }}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",paddingBottom:tab==="aktivasi"?90:20 }}>

        {/* ── DASHBOARD ── */}
        {tab==="dashboard"&&(
          <div style={{ padding:"14px 14px",display:"flex",flexDirection:"column",gap:12 }}>
            {loading?<Spinner />:(
              <>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8 }}>
                  {[{label:"Terpasang",count:tOk,...SM["Terpasang"]},{label:"Pending",count:tPend,...SM["Belum Terpasang"]},{label:"Rusak",count:tRusak,...SM["Rusak / Perlu Ganti"]}].map(c=>(
                    <div key={c.label} style={{ background:c.bg,borderRadius:14,padding:"12px 6px",textAlign:"center",border:`1.5px solid ${c.dot}35` }}>
                      <div style={{ fontSize:18 }}>{c.icon}</div>
                      <div style={{ fontSize:22,fontWeight:900,color:c.text,fontFamily:"'Playfair Display',serif",lineHeight:1.1 }}>{c.count}</div>
                      <div style={{ fontSize:10,color:c.text,fontWeight:700,marginTop:2 }}>{c.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background:"#fff",borderRadius:16,padding:"16px",border:"1px solid #bbf7d0",boxShadow:"0 2px 10px #0000000a" }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                    <span style={{ fontWeight:700,fontSize:13,color:"#14532d" }}>Overall POSM Progress</span>
                    <span style={{ fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:900,color:"#25671E" }}>{pct}%</span>
                  </div>
                  <div style={{ background:"#dcfce7",borderRadius:99,height:12,overflow:"hidden" }}>
                    <div style={{ width:`${pct}%`,background:"linear-gradient(90deg,#25671E,#48A111)",height:"100%",borderRadius:99,transition:"width .6s" }} />
                  </div>
                  <div style={{ fontSize:11,color:"#16a34a",marginTop:6 }}>{tOk} terpasang dari {total} outlet</div>
                </div>
                <div style={{ background:"#fff",borderRadius:16,padding:"16px",border:"1px solid #bbf7d0",boxShadow:"0 2px 10px #0000000a" }}>
                  <div style={{ fontWeight:700,fontSize:13,color:"#14532d",marginBottom:12 }}>Per Sales Rep</div>
                  {repStats.length===0?<div style={{ color:"#ccc",fontSize:13 }}>Belum ada data</div>:repStats.map(r=>(
                    <div key={r.name} style={{ marginBottom:10 }}>
                      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                        <span style={{ fontSize:12,fontWeight:600 }}>{r.name}</span>
                        <span style={{ fontSize:11,color:"#16a34a",fontWeight:700 }}>{r.done}/{r.total}</span>
                      </div>
                      <MiniBar pct={r.total?r.done/r.total*100:0} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── AKTIVASI ── */}
        {tab==="aktivasi"&&(
          <div style={{ padding:"14px 14px 0" }}>
            <div style={{ display:"flex",gap:8,marginBottom:10 }}>
              <div style={{ flex:1,position:"relative" }}>
                <span style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:15,pointerEvents:"none",opacity:.5 }}>🔍</span>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari outlet / alamat / ID DIS..." style={{ ...iStyle,paddingLeft:38,fontSize:14 }} />
              </div>
              <button onClick={()=>setShowFilter(true)} style={{ background:activeFilters>0?"#F2B50B":"#fff",border:`1.5px solid ${activeFilters>0?"#F2B50B":"#bbf7d0"}`,borderRadius:12,padding:"0 15px",cursor:"pointer",fontSize:18,position:"relative",flexShrink:0,minWidth:50 }}>
                🎛{activeFilters>0&&<span style={{ position:"absolute",top:5,right:5,background:"#ef4444",color:"#fff",borderRadius:"50%",width:16,height:16,fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center" }}>{activeFilters}</span>}
              </button>
            </div>
            <div style={{ fontSize:11,color:"#16a34a",fontWeight:700,marginBottom:10,letterSpacing:".04em" }}>{filtered.length} DARI {total} AKTIVASI</div>
            {loading?<Spinner />:(
              <>
                {filtered.length===0&&<div style={{ textAlign:"center",padding:"50px 20px",color:"#bbb" }}><div style={{ fontSize:42 }}>📭</div><div style={{ marginTop:8,fontSize:13 }}>Tidak ada data ditemukan</div></div>}
                {filtered.map(item=>{
                  const sm=SM[item.status]||{}; const isOpen=expandId===item.id;
                  const posmList = item.posms?.length>0 ? item.posms : (item.posm ? item.posm.split(", ") : []);
                  return (
                    <div key={item.id} style={{ background:"#fff",borderRadius:16,marginBottom:10,border:"1px solid #bbf7d0",borderLeft:"4px solid #48A111",boxShadow:"0 2px 8px #0000000a",overflow:"hidden" }}>
                      <div onClick={()=>setExpandId(isOpen?null:item.id)} style={{ padding:"14px 14px 12px",cursor:"pointer" }}>
                        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:6 }}>
                          <div style={{ flex:1,minWidth:0 }}>
                            <div style={{ fontWeight:800,fontSize:15,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{item.outlet}</div>
                            {item.disId&&<div style={{ fontSize:11,color:"#be185d",fontWeight:700,marginTop:1 }}>🏪 {item.disId}</div>}
                            <div style={{ fontSize:11,color:"#16a34a",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>📍 {item.address}</div>
                          </div>
                          <span style={{ background:sm.bg,color:sm.text,borderRadius:99,padding:"4px 10px",fontSize:11,fontWeight:700,flexShrink:0 }}>{sm.icon} {item.status}</span>
                        </div>
                        <div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
                          <Tag color="#14532d" bg="#dcfce7">👤 {item.salesRep.replace("DSR BALI ","#")}</Tag>
                          {posmList.map((p,i)=><Tag key={i} color="#0369a1" bg="#e0f2fe">📌 {p}</Tag>)}
                          {item.channel&&<Tag color="#0891b2" bg="#cffafe">📡 {item.channel.split(" ")[0]}</Tag>}
                          {item.mbisp&&<Tag color="#be185d" bg="#fce7f3">🗺️ {item.mbisp}</Tag>}
                        {item.lat&&<Tag color="#7c3aed" bg="#ede9fe">📍 GPS</Tag>}
                        </div>
                      </div>
                      {isOpen&&(
                        <div style={{ borderTop:"1px solid #bbf7d0",padding:"12px 14px 14px",background:"#f0fdf4" }}>
                          <div style={{ fontSize:12,color:"#6b7280",marginBottom:10,display:"flex",flexWrap:"wrap",gap:10 }}>
                            <span>📅 {item.date}</span>
                            {item.channelClass&&<span>🏷️ {item.channelClass}</span>}
                            {item.notes&&<span style={{ fontStyle:"italic" }}>💬 {item.notes}</span>}
                          </div>

                          {/* GPS — copyable format */}
                          {item.lat&&item.lng&&(
                            <div style={{ background:"#ede9fe",borderRadius:10,padding:"10px 12px",marginBottom:10 }}>
                              <div style={{ fontSize:11,fontWeight:700,color:"#7c3aed",marginBottom:6 }}>📍 GPS Koordinat</div>
                              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                                <div
                                  onClick={()=>{
                                    copyToClipboard(`${item.lat}, ${item.lng}`);
                                    setCopiedGPS(item.id);
                                    setTimeout(()=>setCopiedGPS(false),2000);
                                  }}
                                  style={{ flex:1,background:"#fff",borderRadius:8,padding:"8px 12px",
                                    fontSize:13,fontWeight:700,color:"#7c3aed",cursor:"pointer",
                                    border:"1.5px solid #c4b5fd",letterSpacing:".02em",
                                    display:"flex",alignItems:"center",gap:6 }}
                                >
                                  <span style={{ fontSize:14 }}>{copiedGPS===item.id?"✅":"📋"}</span>
                                  <span>{item.lat}, {item.lng}</span>
                                </div>
                                <a href={`https://www.google.com/maps?q=${item.lat},${item.lng}`}
                                  target="_blank" rel="noreferrer"
                                  style={{ background:"#7c3aed",color:"#fff",borderRadius:8,padding:"8px 12px",fontSize:12,fontWeight:700,textDecoration:"none",whiteSpace:"nowrap" }}>
                                  🗺️ Maps
                                </a>
                              </div>
                              <div style={{ fontSize:10,color:"#7c3aed",marginTop:4,opacity:.7 }}>
                                Tap koordinat untuk copy → paste ke Google Maps
                              </div>
                            </div>
                          )}

                          {/* Photos */}
                          {item.photos?.length>0&&(
                            <div style={{ display:"flex",flexDirection:"column",gap:6,marginBottom:12 }}>
                              {item.photos.map((p,i)=>(
                                <div key={i} style={{ display:"flex",alignItems:"center",gap:8 }}>
                                  <img src={p.url} alt="" style={{ width:56,height:56,objectFit:"cover",borderRadius:8,border:"2px solid #48A111",flexShrink:0 }} />
                                  {p.posmLabel&&<Tag color="#0369a1" bg="#e0f2fe">📌 {p.posmLabel}</Tag>}
                                </div>
                              ))}
                            </div>
                          )}
                          {item.photoUrl&&typeof item.photoUrl==="string"&&(
                            <div style={{ fontSize:11,color:"#16a34a",marginBottom:10 }}>
                              📸 <a href={item.photoUrl.split(" | ")[0]} target="_blank" rel="noreferrer" style={{ color:"#16a34a",fontWeight:700 }}>Lihat Foto di Cloud</a>
                            </div>
                          )}

                          <div style={{ display:"grid",gridTemplateColumns:isAdmin?"1fr 1fr":"1fr",gap:8 }}>
                            <button onClick={()=>openEdit(item)} style={{ ...btnGreen,padding:"11px" }}>✏️ Edit</button>
                            {isAdmin&&(
                              <button onClick={()=>del(item.id)} style={{ background:"#fee2e2",color:"#b91c1c",border:"none",borderRadius:12,padding:"11px",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>🗑️ Hapus</button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* ── LAPORAN ── */}
        {tab==="laporan"&&(
          <div style={{ padding:"14px 14px",display:"flex",flexDirection:"column",gap:12 }}>
            <div style={{ background:"#fff",borderRadius:16,padding:"18px",border:"1px solid #bbf7d0",boxShadow:"0 2px 10px #0000000a" }}>
              <div style={{ fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:900,marginBottom:4,color:"#25671E" }}>Export Laporan</div>
              <div style={{ fontSize:12,color:"#16a34a",marginBottom:16 }}>Download ke Excel / Google Sheets (.csv) — termasuk ID DIS & GPS</div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16 }}>
                {[{label:"Total Outlet",val:total,icon:"🏪",bg:"#f0fdf4"},{label:"POSM Terpasang",val:`${tOk} (${pct}%)`,icon:"✅",bg:"#dcfce7"},{label:"Belum Pasang",val:tPend,icon:"⏳",bg:"#fef9c3"},{label:"Perlu Ganti",val:tRusak,icon:"⚠️",bg:"#fee2e2"}].map(s=>(
                  <div key={s.label} style={{ background:s.bg,borderRadius:12,padding:"12px 14px",border:"1px solid #bbf7d0" }}>
                    <div style={{ fontSize:18 }}>{s.icon}</div>
                    <div style={{ fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:900,color:"#25671E" }}>{s.val}</div>
                    <div style={{ fontSize:10,color:"#16a34a",fontWeight:700,marginTop:2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <button onClick={exportCSV} style={btnGreen}>📥 Download CSV</button>
              {exportMsg&&<div style={{ textAlign:"center",color:"#16a34a",fontWeight:700,fontSize:13,marginTop:10 }}>{exportMsg}</div>}
            </div>
            <div style={{ background:"#fff",borderRadius:16,padding:"18px",border:"1px solid #bbf7d0",boxShadow:"0 2px 10px #0000000a" }}>
              <div style={{ fontWeight:700,fontSize:13,color:"#14532d",marginBottom:14 }}>Rekap per Sales Rep</div>
              {SALES_REPS.map(rep=>{
                const items=activations.filter(a=>a.salesRep===rep); if(!items.length)return null;
                const done=items.filter(a=>a.status==="Terpasang").length;
                const pend=items.filter(a=>a.status==="Belum Terpasang").length;
                const rusak=items.filter(a=>a.status==="Rusak / Perlu Ganti").length;
                return(
                  <div key={rep} style={{ borderBottom:"1px solid #bbf7d0",paddingBottom:12,marginBottom:12 }}>
                    <div style={{ fontWeight:700,fontSize:13,marginBottom:6,color:"#14532d" }}>{rep}</div>
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
        <button onClick={openAdd} disabled={syncing} style={{ position:"fixed",bottom:24,right:20,zIndex:200,width:58,height:58,borderRadius:"50%",background:"linear-gradient(135deg,#25671E,#48A111)",color:"#fff",border:"none",fontSize:30,cursor:"pointer",boxShadow:"0 6px 24px rgba(37,103,30,.5)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,lineHeight:1,opacity:syncing?.7:1 }}>+</button>
      )}

      {/* FILTER SHEET */}
      <Sheet open={showFilter} onClose={()=>setShowFilter(false)} title="🎛 Filter">
        {[{label:"Sales Rep",val:filterRep,set:setFilterRep,opts:["Semua",...SALES_REPS]},{label:"Status POSM",val:filterStatus,set:setFilterStatus,opts:["Semua",...STATUS_OPTIONS]},{label:"Brand",val:filterBrand,set:setFilterBrand,opts:["Semua",...BRANDS]}].map(f=>(
          <F key={f.label} label={f.label}><select value={f.val} onChange={e=>f.set(e.target.value)} style={iStyle}>{f.opts.map(o=><option key={o}>{o}</option>)}</select></F>
        ))}
        <button onClick={()=>{setFilterRep("Semua");setFilterStatus("Semua");setFilterBrand("Semua");}} style={{ ...btnGreen,background:"#f3f4f6",color:"#6b7280",marginBottom:10 }}>Reset Filter</button>
        <button onClick={()=>setShowFilter(false)} style={btnGreen}>Terapkan ✓</button>
      </Sheet>

      {/* FORM SHEET */}
      <Sheet open={showForm} onClose={closeForm} title={editId?"✏️ Edit Aktivasi":"➕ Tambah Aktivasi"}>

        <F label="Nama Outlet *"><input value={form.outlet} onChange={e=>setForm(p=>({...p,outlet:e.target.value}))} placeholder="cth: Warung Bu Sari" style={iStyle} /></F>

        <F label="ID DIS Outlet *">
          <input value={form.disId} onChange={e=>setForm(p=>({...p,disId:e.target.value.toUpperCase()}))}
            placeholder="cth: 10001" style={iStyle} inputMode="text" autoCapitalize="characters" />
          <div style={{ fontSize:11,color:"#16a34a",marginTop:5,fontStyle:"italic" }}>
            💡 Masukkan ID DIS sesuai database. Jika belum ada, isi kode sementara.
          </div>
        </F>

        <F label="MBISP *">
          <select value={form.mbisp} onChange={e=>setForm(p=>({...p,mbisp:e.target.value}))} style={iStyle}>
            <option value="">-- Pilih MBISP --</option>
            {MBISP_AREAS.map(o=><option key={o}>{o}</option>)}
          </select>
        </F>

        <F label="Alamat Outlet *"><input value={form.address} onChange={e=>setForm(p=>({...p,address:e.target.value}))} placeholder="cth: Jl. Merdeka No.5, Denpasar" style={iStyle} /></F>

        {/* GPS Status */}
        <div style={{ background:form.lat?"#dcfce7":"#fef9c3",border:`1.5px solid ${form.lat?"#22c55e":"#eab308"}`,borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,marginBottom:14 }}>
          <span style={{ fontSize:20 }}>📍</span>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700,fontSize:12,color:form.lat?"#15803d":"#a16207" }}>
              {form.lat?"✅ Lokasi berhasil diambil":"Mengambil lokasi GPS..."}
            </div>
            {form.lat&&(
              <div
                onClick={()=>{ copyToClipboard(`${form.lat}, ${form.lng}`); showToast("📋 Koordinat di-copy!"); }}
                style={{ fontSize:12,color:"#15803d",marginTop:3,fontWeight:700,background:"#f0fdf4",borderRadius:6,padding:"3px 8px",display:"inline-block",cursor:"pointer",letterSpacing:".02em",border:"1px solid #bbf7d0" }}
              >
                📋 {form.lat}, {form.lng}
              </div>
            )}
            <div style={{ fontSize:11,color:"#6b7280",marginTop:2 }}>{form.geoStatus||"Pastikan GPS HP aktif"}</div>
          </div>
          {!form.lat&&(
            <button onClick={()=>{
              setForm(p=>({...p,geoStatus:"⏳ Mengambil GPS..."}));
              getGPS(
                (lat,lng,acc)=>setForm(p=>({...p,lat,lng,geoStatus:`✅ Akurasi ±${acc}m`})),
                (err)=>setForm(p=>({...p,geoStatus:`⚠️ ${err}`}))
              );
            }} style={{ background:"#F2B50B",border:"none",borderRadius:8,padding:"6px 12px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",color:"#25671E" }}>
              🔄 Retry
            </button>
          )}
        </div>

        <F label="Sales Representative *">
          <select value={form.salesRep} onChange={e=>setForm(p=>({...p,salesRep:e.target.value}))} style={iStyle}>
            <option value="">-- Pilih DSR --</option>
            {SALES_REPS.map(o=><option key={o}>{o}</option>)}
          </select>
        </F>

        <F label="Brand *">
          <select value={form.brand} onChange={e=>setForm(p=>({...p,brand:e.target.value}))} style={iStyle}>
            <option value="">-- Pilih Brand --</option>
            {BRANDS.map(o=><option key={o}>{o}</option>)}
          </select>
        </F>

        <F label="Channel *">
          <select value={form.channel} onChange={e=>setForm(p=>({...p,channel:e.target.value,channelClass:""}))} style={iStyle}>
            <option value="">-- Pilih Channel --</option>
            {CHANNELS.map(o=><option key={o}>{o}</option>)}
          </select>
        </F>

        {form.channel&&(
          <F label="Class *">
            <select value={form.channelClass} onChange={e=>setForm(p=>({...p,channelClass:e.target.value}))} style={iStyle}>
              <option value="">-- Pilih Class --</option>
              {(CHANNEL_CLASS[form.channel]||[]).map(o=><option key={o}>{o}</option>)}
            </select>
          </F>
        )}

        <F label="Jenis POSM * (pilih semua yang dipasang)">
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            {POSM_TYPES.map(posm=>{
              const selected=(form.posms||[]).includes(posm);
              return(
                <button key={posm} onClick={()=>{
                  const cur=form.posms||[];
                  setForm(p=>({...p,posms:selected?cur.filter(x=>x!==posm):[...cur,posm]}));
                }} style={{ background:selected?"#dcfce7":"#fff",border:`2px solid ${selected?"#22c55e":"#bbf7d0"}`,borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",width:"100%",textAlign:"left",transition:"all .15s" }}>
                  <span style={{ width:22,height:22,borderRadius:6,flexShrink:0,background:selected?"#22c55e":"#f0fdf4",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:900,color:"#fff",border:`1.5px solid ${selected?"#22c55e":"#bbf7d0"}` }}>{selected?"✓":""}</span>
                  <span style={{ fontWeight:selected?700:400,fontSize:14,color:selected?"#15803d":"#1a1200" }}>{posm}</span>
                </button>
              );
            })}
          </div>
          {(form.posms||[]).length>0&&(
            <div style={{ marginTop:8,fontSize:12,color:"#16a34a",fontWeight:700 }}>
              ✅ {(form.posms||[]).length} POSM dipilih: {(form.posms||[]).join(", ")}
            </div>
          )}
        </F>

        <F label="Status POSM *">
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            {STATUS_OPTIONS.map(s=>{ const sm=SM[s]; const sel=form.status===s; return(
              <button key={s} onClick={()=>setForm(p=>({...p,status:s}))} style={{ background:sel?sm.bg:"#fff",border:`2px solid ${sel?sm.dot:"#bbf7d0"}`,borderRadius:12,padding:"12px 14px",display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",width:"100%",textAlign:"left",transition:"all .15s" }}>
                <span style={{ fontSize:18 }}>{sm.icon}</span>
                <span style={{ fontWeight:700,fontSize:14,color:sel?sm.text:"#6b7280" }}>{s}</span>
                {sel&&<span style={{ marginLeft:"auto",color:sm.dot,fontWeight:900 }}>✓</span>}
              </button>
            );})}
          </div>
        </F>

        <F label="Tanggal"><input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} style={iStyle} /></F>
        <F label="Catatan"><textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="cth: Outlet kooperatif, lokasi strategis" rows={3} style={{ ...iStyle,resize:"none" }} /></F>
        <F label="📸 Foto Bukti POSM *"><PhotoUpload photos={form.photos} onChange={photos=>setForm(p=>({...p,photos}))} posms={form.posms||[]} /></F>

        <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr",gap:10,marginTop:8 }}>
          <button onClick={save} disabled={syncing} style={{ ...btnGreen,opacity:syncing?.7:1 }}>{syncing?"⏳ Menyimpan...":editId?"💾 Simpan":"✅ Tambah"}</button>
          <button onClick={closeForm} style={{ background:"#f3f4f6",color:"#6b7280",border:"none",borderRadius:12,padding:"14px",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>Batal</button>
        </div>
      </Sheet>
    </div>
  );
}
