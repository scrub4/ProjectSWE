import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import "./SeatBite.css";

const font  = `'Outfit', sans-serif`;
const fontD = `'Bebas Neue', sans-serif`;
const oc    = "#e85d04";
const orangeBg = "rgba(232,93,4,0.12)";

const CHAIN = {
  muvi: { color:oc, bg:orangeBg, label:"muvi Cinemas", emoji:"🟣" },
  AMC:  { color:oc, bg:orangeBg, label:"AMC Cinemas",  emoji:"🔴" },
  VOX:  { color:oc, bg:orangeBg, label:"VOX Cinemas",  emoji:"🩷" },
};

const ADMIN_CHAIN = {
  muvi: { color:"#6c2dc7", bg:"rgba(108,45,199,0.12)" },
  AMC:  { color:"#c41230", bg:"rgba(196,18,48,0.12)" },
  VOX:  { color:"#e6007e", bg:"rgba(230,0,126,0.12)" },
};

const ORDER_STAGES = [
  { key:"confirmed", labelEn:"Order Confirmed", icon:"✓",  desc:"Your order has been received" },
  { key:"preparing", labelEn:"Preparing",       icon:"👨‍🍳", desc:"Our team is preparing your items" },
  { key:"onway",     labelEn:"On the Way",       icon:"🚶", desc:"A runner is heading to your seat" },
  { key:"delivered", labelEn:"Delivered",        icon:"🎉", desc:"Enjoy! بالعافية" },
];

const S = {
  btn:(p=true,col)=>({
    background:p?(col?`linear-gradient(135deg,${col},${col}cc)`:`linear-gradient(135deg,${oc},#dc2f02)`):"rgba(255,255,255,0.08)",
    color:"#fff",border:p?"none":"1px solid rgba(255,255,255,0.12)",
    padding:"12px 24px",borderRadius:10,fontFamily:font,fontSize:14,
    fontWeight:600,cursor:"pointer",transition:"all 0.2s",
    display:"inline-flex",alignItems:"center",gap:8,
  }),
  pill:(a,col)=>({
    padding:"6px 14px",borderRadius:20,border:"none",
    background:a?(col||oc):"rgba(255,255,255,0.08)",
    color:a?"#fff":"rgba(255,255,255,0.5)",
    fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:font,
  }),
  glass:{background:"rgba(255,255,255,0.06)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:20,marginBottom:16},
  panel:{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:16,marginBottom:10},
  input:{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,padding:"13px 14px",color:"#fff",fontFamily:font,fontSize:14,outline:"none",boxSizing:"border-box"},
};

function encodeTicket(d){ return btoa(JSON.stringify(d)); }
function decodeTicket(s){ try{ return JSON.parse(atob(s.trim())); }catch{ return null; } }

const DEMO_QR = [
  encodeTicket({ticketId:"TKT-8821",movie:"Project Hail Mary",seat:"C5",cinema:"VOX Riyadh Park",chain:"VOX",showtime:"7:30 PM",date:"28 Apr 2026",rating:"PG-15",hall:"Hall 3"}),
  encodeTicket({ticketId:"TKT-8822",movie:"Scream 7",seat:"F8",cinema:"AMC KAFD",chain:"AMC",showtime:"9:00 PM",date:"28 Apr 2026",rating:"R18",hall:"Hall 7"}),
  encodeTicket({ticketId:"TKT-8823",movie:"Hoppers",seat:"A4",cinema:"muvi Nakheel Mall",chain:"muvi",showtime:"5:00 PM",date:"28 Apr 2026",rating:"PG",hall:"Hall 1"}),
];

const FALLBACK_MENUS = {
  AMC:[
    {id:1,nameEn:"AMC Classic Popcorn",name:"فشار كلاسيك",price:22,emoji:"🍿",cat:"snacks"},
    {id:2,nameEn:"AMC Large Combo",name:"كومبو كبير",price:55,emoji:"🎬",cat:"combos"},
    {id:3,nameEn:"Coca-Cola",name:"كوكاكولا",price:13,emoji:"🥤",cat:"drinks"},
    {id:4,nameEn:"ICEE Blue Raspberry",name:"آيسي توت",price:16,emoji:"🧊",cat:"drinks"},
    {id:5,nameEn:"Nachos & Cheese",name:"ناتشوز",price:30,emoji:"🧀",cat:"snacks"},
    {id:6,nameEn:"Hot Dog",name:"هوت دوق",price:24,emoji:"🌭",cat:"meals"},
    {id:7,nameEn:"Smash Burger",name:"برجر",price:38,emoji:"🍔",cat:"meals"},
    {id:8,nameEn:"Loaded Fries",name:"بطاطس",price:20,emoji:"🍟",cat:"snacks"},
    {id:9,nameEn:"Water",name:"موية",price:5,emoji:"💧",cat:"drinks"},
    {id:10,nameEn:"Mini Pizza",name:"ميني بيتزا",price:32,emoji:"🍕",cat:"meals"},
  ],
  VOX:[
    {id:1,nameEn:"VOX Signature Popcorn",name:"فشار VOX",price:25,emoji:"🍿",cat:"snacks"},
    {id:2,nameEn:"VOX Combo Deal",name:"كومبو VOX",price:60,emoji:"🎭",cat:"combos"},
    {id:3,nameEn:"Pepsi Max",name:"بيبسي ماكس",price:14,emoji:"🥤",cat:"drinks"},
    {id:4,nameEn:"Mango Slushie",name:"سلاش مانجو",price:17,emoji:"🥭",cat:"drinks"},
    {id:5,nameEn:"Caramel Popcorn",name:"فشار كراميل",price:28,emoji:"🍯",cat:"snacks"},
    {id:6,nameEn:"Chicken Strips",name:"شرائح دجاج",price:35,emoji:"🍗",cat:"meals"},
    {id:7,nameEn:"Gourmet Burger",name:"برجر جورميه",price:42,emoji:"🍔",cat:"meals"},
    {id:8,nameEn:"Ice Cream Cup",name:"آيس كريم",price:18,emoji:"🍦",cat:"snacks"},
    {id:9,nameEn:"Iced Latte",name:"لاتيه مثلج",price:22,emoji:"☕",cat:"drinks"},
    {id:10,nameEn:"Water",name:"موية",price:5,emoji:"💧",cat:"drinks"},
  ],
  muvi:[
    {id:1,nameEn:"muvi Popcorn",name:"فشار موفي",price:20,emoji:"🍿",cat:"snacks"},
    {id:2,nameEn:"muvi Mega Combo",name:"كومبو ميغا",price:52,emoji:"🟣",cat:"combos"},
    {id:3,nameEn:"Pepsi",name:"بيبسي",price:12,emoji:"🥤",cat:"drinks"},
    {id:4,nameEn:"Berry Slushie",name:"سلاش توت",price:15,emoji:"🧊",cat:"drinks"},
    {id:5,nameEn:"Nachos Grande",name:"ناتشوز",price:28,emoji:"🧀",cat:"snacks"},
    {id:6,nameEn:"Hot Dog",name:"هوت دوق",price:22,emoji:"🌭",cat:"meals"},
    {id:7,nameEn:"Smash Burger",name:"برجر",price:35,emoji:"🍔",cat:"meals"},
    {id:8,nameEn:"Chicken Nuggets",name:"ناقتس دجاج",price:25,emoji:"🍗",cat:"meals"},
    {id:9,nameEn:"Loaded Fries",name:"بطاطس",price:18,emoji:"🍟",cat:"snacks"},
    {id:10,nameEn:"Water",name:"موية",price:5,emoji:"💧",cat:"drinks"},
  ],
};

async function askClaude(prompt){
  const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1500,tools:[{type:"web_search_20250305",name:"web_search"}],messages:[{role:"user",content:prompt}]})});
  if(!res.ok) throw new Error(`API ${res.status}`);
  const data=await res.json();
  return data.content?.filter(b=>b.type==="text").map(b=>b.text).join("\n")||"";
}
function parseJSON(raw){try{const m=raw.match(/\[[\s\S]*\]/);if(m)return JSON.parse(m[0]);}catch{}return null;}

// ─── inline keyframes injected once ───────────────────────────────────────────
const QR_STYLES=`
@keyframes qr-corner-pulse {
  0%,100%{opacity:1;} 50%{opacity:0.35;}
}
@keyframes qr-scan {
  0%{top:6%;opacity:0.9;} 48%{opacity:1;} 50%{top:88%;} 52%{opacity:1;} 100%{top:6%;opacity:0.9;}
}
@keyframes qr-fade-in {
  from{opacity:0;transform:scale(0.96);} to{opacity:1;transform:scale(1);}
}
@keyframes qr-success-ring {
  0%{transform:scale(0.7);opacity:0;} 60%{opacity:1;} 100%{transform:scale(1.3);opacity:0;}
}
@keyframes qr-drag-bounce {
  0%,100%{transform:translateY(0);} 50%{transform:translateY(-6px);}
}
@keyframes qr-shimmer {
  0%{opacity:0.25;} 50%{opacity:0.55;} 100%{opacity:0.25;}
}
`;

function QRScanner({onScan}){
  const [mode,setMode]=useState("camera");   // "camera" | "upload"
  const [scanning,setScanning]=useState(false);
  const [uploadState,setUploadState]=useState("idle"); // idle | reading | success | fail
  const [previewSrc,setPreviewSrc]=useState(null);
  const [dragging,setDragging]=useState(false);
  const [err,setErr]=useState(null);
  const videoRef=useRef(null);
  const streamRef=useRef(null);
  const timerRef=useRef(null);
  const fileRef=useRef(null);
  const canvasRef=useRef(null);

  // inject styles once
  useEffect(()=>{
    if(document.getElementById("qr-styles"))return;
    const s=document.createElement("style");
    s.id="qr-styles";s.textContent=QR_STYLES;
    document.head.appendChild(s);
  },[]);

  useEffect(()=>()=>cleanup(),[]);

  const cleanup=useCallback(()=>{
    clearTimeout(timerRef.current);
    if(streamRef.current){streamRef.current.getTracks().forEach(t=>t.stop());streamRef.current=null;}
    setScanning(false);
  },[]);

  const switchMode=useCallback((m)=>{
    cleanup();
    setUploadState("idle");
    setPreviewSrc(null);
    setErr(null);
    setMode(m);
  },[cleanup]);

  // ── Camera scan ─────────────────────────────────────────────────────────────
  const startScan=useCallback(async()=>{
    setErr(null);setScanning(true);
    const demo=DEMO_QR[Math.floor(Math.random()*DEMO_QR.length)];
    try{
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment",width:{ideal:1280},height:{ideal:720}}});
      streamRef.current=stream;
      if(videoRef.current){videoRef.current.srcObject=stream;videoRef.current.play();}
      // Simulate detection after 2.8s
      timerRef.current=setTimeout(()=>{
        cleanup();
        const d=decodeTicket(demo);
        if(d)onScan(d);
      },2800);
    }catch{
      // No camera – fallback to demo after short delay
      timerRef.current=setTimeout(()=>{
        setScanning(false);
        const d=decodeTicket(demo);
        if(d)onScan(d);
      },1800);
    }
  },[cleanup,onScan]);

  // ── Image QR decode via jsQR (CDN) ──────────────────────────────────────────
  const tryDecodeImage=useCallback((file)=>{
    if(!file||!file.type.startsWith("image/"))return;
    setUploadState("reading");setErr(null);
    const reader=new FileReader();
    reader.onload=e=>{
      setPreviewSrc(e.target.result);
      const img=new Image();
      img.onload=()=>{
        const canvas=canvasRef.current||document.createElement("canvas");
        canvas.width=img.width;canvas.height=img.height;
        const ctx=canvas.getContext("2d");
        ctx.drawImage(img,0,0);
        const imageData=ctx.getImageData(0,0,canvas.width,canvas.height);
        // Try jsQR if available (loaded from CDN lazily)
        const tryJsQR=()=>{
          if(window.jsQR){
            const result=window.jsQR(imageData.data,imageData.width,imageData.height);
            if(result?.data){
              const decoded=decodeTicket(result.data);
              if(decoded){setUploadState("success");setTimeout(()=>onScan(decoded),600);return;}
            }
            // jsQR found nothing – fall to demo
            fallback();
          } else {
            // Load jsQR dynamically
            const script=document.createElement("script");
            script.src="https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js";
            script.onload=tryJsQR;
            script.onerror=fallback;
            document.head.appendChild(script);
          }
        };
        const fallback=()=>{
          // Can't decode real QR – use a random demo ticket to demo the flow
          const demo=DEMO_QR[Math.floor(Math.random()*DEMO_QR.length)];
          const d=decodeTicket(demo);
          if(d){setUploadState("success");setTimeout(()=>onScan(d),700);}
          else{setUploadState("fail");setErr("Could not read QR code. Try a clearer image.");}
        };
        tryJsQR();
      };
      img.onerror=()=>{setUploadState("fail");setErr("Could not load image.");};
      img.src=e.target.result;
    };
    reader.readAsDataURL(file);
  },[onScan]);

  const handleFileChange=useCallback(e=>{
    const file=e.target.files?.[0];
    if(file)tryDecodeImage(file);
    e.target.value="";
  },[tryDecodeImage]);

  const handleDrop=useCallback(e=>{
    e.preventDefault();setDragging(false);
    const file=e.dataTransfer.files?.[0];
    if(file)tryDecodeImage(file);
  },[tryDecodeImage]);

  // ── Corner SVG ──────────────────────────────────────────────────────────────
  const Corner=({pos})=>{
    const top=pos.includes("t");const left=pos.includes("l");
    return(
      <div style={{
        position:"absolute",
        [top?"top":"bottom"]:0,[left?"left":"right"]:0,
        width:36,height:36,
        borderTop:top?`3px solid ${oc}`:"none",
        borderBottom:!top?`3px solid ${oc}`:"none",
        borderLeft:left?`3px solid ${oc}`:"none",
        borderRight:!left?`3px solid ${oc}`:"none",
        borderRadius:top&&left?"8px 0 0 0":top&&!left?"0 8px 0 0":!top&&left?"0 0 0 8px":"0 0 8px 0",
        animation:`qr-corner-pulse 2s ease-in-out infinite`,
        animationDelay:pos==="tl"?"0s":pos==="tr"?"0.2s":pos==="bl"?"0.4s":"0.6s",
      }}/>
    );
  };

  const FRAME_SIZE=280;

  return(
    <div className="seatbite-scanner" style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"0 0 32px",width:"100%"}}>
      <canvas ref={canvasRef} style={{display:"none"}}/>

      {/* Brand */}
      <div style={{fontFamily:fontD,fontSize:44,letterSpacing:4,color:"#fff",lineHeight:1,marginBottom:2}}>SEATBITE</div>
      <div style={{fontSize:12,color:"rgba(255,255,255,0.35)",marginBottom:24,letterSpacing:1}}>TICKET SCANNER · ماسح التذاكر</div>

      {/* Mode tabs */}
      <div style={{display:"flex",background:"rgba(255,255,255,0.06)",borderRadius:14,padding:4,marginBottom:24,gap:4,width:"100%",maxWidth:FRAME_SIZE}}>
        {[{id:"camera",icon:"📷",label:"Camera"},{id:"upload",icon:"🖼️",label:"Upload"}].map(m=>(
          <button key={m.id} onClick={()=>switchMode(m.id)} style={{
            flex:1,padding:"10px 0",borderRadius:10,border:"none",fontFamily:font,fontSize:13,fontWeight:600,cursor:"pointer",
            transition:"all 0.2s",
            background:mode===m.id?`linear-gradient(135deg,${oc},#dc2f02)`:"transparent",
            color:mode===m.id?"#fff":"rgba(255,255,255,0.4)",
            boxShadow:mode===m.id?"0 2px 12px rgba(232,93,4,0.4)":"none",
          }}>
            <span style={{marginRight:6}}>{m.icon}</span>{m.label}
          </button>
        ))}
      </div>

      {/* ── CAMERA MODE ── */}
      {mode==="camera"&&(
        <>
          <div style={{
            width:FRAME_SIZE,height:FRAME_SIZE,borderRadius:20,overflow:"hidden",
            background:"#000",position:"relative",marginBottom:20,
            boxShadow:`0 0 0 1px rgba(255,255,255,0.07), 0 24px 48px rgba(0,0,0,0.6)`,
            animation:"qr-fade-in 0.3s ease",
          }}>
            {scanning?(
              <>
                <video ref={videoRef} style={{width:"100%",height:"100%",objectFit:"cover"}} muted playsInline/>
                {/* Dark vignette overlay */}
                <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.65) 100%)"}}/>
                {/* Viewfinder box */}
                <div style={{
                  position:"absolute",
                  top:"50%",left:"50%",
                  transform:"translate(-50%,-50%)",
                  width:"62%",height:"62%",
                }}>
                  <Corner pos="tl"/><Corner pos="tr"/><Corner pos="bl"/><Corner pos="br"/>
                  {/* Scan line */}
                  <div style={{
                    position:"absolute",left:0,right:0,height:2,
                    background:`linear-gradient(90deg,transparent,${oc},rgba(232,93,4,0.6),${oc},transparent)`,
                    boxShadow:`0 0 12px ${oc}, 0 0 4px ${oc}`,
                    animation:"qr-scan 2s linear infinite",
                  }}/>
                </div>
                {/* Status bar */}
                <div style={{
                  position:"absolute",bottom:0,left:0,right:0,
                  padding:"12px 16px",
                  background:"linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                  display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                }}>
                  <span style={{width:7,height:7,borderRadius:"50%",background:oc,animation:"pulse 1s infinite",display:"inline-block"}}/>
                  <span style={{fontSize:12,color:"rgba(255,255,255,0.8)",fontWeight:500}}>Scanning for QR code…</span>
                </div>
              </>
            ):(
              <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:0}}>
                {/* Static viewfinder idle state */}
                <div style={{position:"relative",width:"62%",height:"62%"}}>
                  <Corner pos="tl"/><Corner pos="tr"/><Corner pos="bl"/><Corner pos="br"/>
                  <div style={{
                    position:"absolute",inset:0,display:"flex",flexDirection:"column",
                    alignItems:"center",justifyContent:"center",gap:8,
                  }}>
                    <div style={{fontSize:32,opacity:0.3}}>▦</div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,0.2)",textAlign:"center",lineHeight:1.4}}>Place QR<br/>here</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {!scanning?(
            <button onClick={startScan} style={{
              ...S.btn(),padding:"14px 36px",fontSize:15,marginBottom:12,
              boxShadow:`0 8px 32px rgba(232,93,4,0.4)`,
              borderRadius:14,letterSpacing:0.5,
            }}>
              📷 Start Scanning
            </button>
          ):(
            <button onClick={cleanup} style={{...S.btn(false),padding:"12px 28px",fontSize:14,marginBottom:12}}>
              ✕ Cancel
            </button>
          )}
          {err&&<div style={{fontSize:12,color:"rgba(255,120,80,0.9)",marginBottom:8,textAlign:"center"}}>❌ {err}</div>}
        </>
      )}

      {/* ── UPLOAD MODE ── */}
      {mode==="upload"&&(
        <>
          <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleFileChange}/>
          <div
            onClick={()=>uploadState==="idle"||uploadState==="fail"?fileRef.current?.click():null}
            onDragOver={e=>{e.preventDefault();setDragging(true);}}
            onDragLeave={()=>setDragging(false)}
            onDrop={handleDrop}
            style={{
              width:FRAME_SIZE,height:FRAME_SIZE,borderRadius:20,
              border:`2px dashed ${dragging?oc:uploadState==="success"?"#22c55e":uploadState==="fail"?"rgba(255,80,80,0.5)":"rgba(255,255,255,0.12)"}`,
              background:dragging?`rgba(232,93,4,0.08)`:uploadState==="success"?"rgba(34,197,94,0.06)":"rgba(255,255,255,0.03)",
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
              cursor:uploadState==="reading"?"default":"pointer",
              position:"relative",overflow:"hidden",marginBottom:20,
              transition:"all 0.25s ease",
              animation:"qr-fade-in 0.3s ease",
              boxShadow:dragging?`0 0 0 4px rgba(232,93,4,0.15)`:"none",
            }}
          >
            {previewSrc&&(
              <img src={previewSrc} alt="" style={{
                position:"absolute",inset:0,width:"100%",height:"100%",
                objectFit:"cover",opacity:uploadState==="success"?0.4:0.25,
                borderRadius:18,
              }}/>
            )}

            {uploadState==="idle"&&(
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,position:"relative",zIndex:1}}>
                <div style={{
                  width:64,height:64,borderRadius:16,
                  background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,
                  animation:dragging?"qr-drag-bounce 0.6s ease infinite":"none",
                }}>
                  {dragging?"📂":"🖼️"}
                </div>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:14,fontWeight:600,color:"#fff",marginBottom:4}}>
                    {dragging?"Drop it here":"Upload QR Image"}
                  </div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",lineHeight:1.6}}>
                    Drag & drop or tap to choose<br/>JPG, PNG, HEIC supported
                  </div>
                </div>
                <div style={{
                  padding:"6px 16px",borderRadius:20,
                  background:`rgba(232,93,4,0.15)`,border:`1px solid rgba(232,93,4,0.3)`,
                  fontSize:11,color:oc,fontWeight:600,letterSpacing:0.5,
                }}>BROWSE FILES</div>
              </div>
            )}

            {uploadState==="reading"&&(
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14,position:"relative",zIndex:1}}>
                <div style={{
                  width:52,height:52,borderRadius:"50%",
                  border:`3px solid rgba(255,255,255,0.1)`,borderTopColor:oc,
                  animation:"spin 0.8s linear infinite",
                }}/>
                <div style={{fontSize:13,color:"rgba(255,255,255,0.6)",fontWeight:500}}>Reading QR code…</div>
                {/* shimmer lines */}
                <div style={{width:120,height:6,borderRadius:4,background:"rgba(255,255,255,0.08)",animation:"qr-shimmer 1.2s infinite"}}/>
                <div style={{width:80,height:6,borderRadius:4,background:"rgba(255,255,255,0.05)",animation:"qr-shimmer 1.2s infinite 0.3s"}}/>
              </div>
            )}

            {uploadState==="success"&&(
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,position:"relative",zIndex:1}}>
                {/* Success ring pulse */}
                <div style={{position:"relative",width:64,height:64}}>
                  <div style={{
                    position:"absolute",inset:0,borderRadius:"50%",
                    border:`2px solid #22c55e`,
                    animation:"qr-success-ring 1s ease-out forwards",
                  }}/>
                  <div style={{
                    width:64,height:64,borderRadius:"50%",
                    background:"rgba(34,197,94,0.15)",border:"2px solid #22c55e",
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,
                  }}>✓</div>
                </div>
                <div style={{fontSize:14,fontWeight:700,color:"#22c55e"}}>QR Code Found!</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>Loading your ticket…</div>
              </div>
            )}

            {uploadState==="fail"&&(
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,position:"relative",zIndex:1}}>
                <div style={{
                  width:64,height:64,borderRadius:"50%",
                  background:"rgba(255,80,80,0.1)",border:"2px solid rgba(255,80,80,0.4)",
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,
                }}>✕</div>
                <div style={{fontSize:13,fontWeight:600,color:"rgba(255,100,100,0.9)"}}>Couldn't read QR</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",textAlign:"center",lineHeight:1.5}}>
                  Try a clearer, well-lit photo<br/>of the QR code
                </div>
                <button
                  onClick={e=>{e.stopPropagation();setUploadState("idle");setPreviewSrc(null);setErr(null);}}
                  style={{...S.btn(false),padding:"7px 18px",fontSize:12}}
                >Try Again</button>
              </div>
            )}
          </div>

          {(uploadState==="idle"||uploadState==="fail")&&(
            <button onClick={()=>fileRef.current?.click()} style={{
              ...S.btn(),padding:"14px 36px",fontSize:15,marginBottom:12,
              boxShadow:`0 8px 32px rgba(232,93,4,0.35)`,borderRadius:14,
            }}>
              🖼️ Choose Image
            </button>
          )}
        </>
      )}

      {/* ── DEMO TICKETS ──────────────────────────────────────────────────────── */}
      <div style={{width:"100%",marginTop:8}}>
        <div style={{
          display:"flex",alignItems:"center",gap:10,marginBottom:14,
        }}>
          <div style={{flex:1,height:1,background:"rgba(255,255,255,0.07)"}}/>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.2)",fontWeight:700,letterSpacing:2,whiteSpace:"nowrap"}}>DEMO TICKETS</div>
          <div style={{flex:1,height:1,background:"rgba(255,255,255,0.07)"}}/>
        </div>
        {DEMO_QR.map((encoded,i)=>{
          const d=decodeTicket(encoded);
          const ch=CHAIN[d?.chain]||CHAIN.AMC;
          const col=(ADMIN_CHAIN[d?.chain]||ADMIN_CHAIN.AMC).color;
          return(
            <button key={i} className="seatbite-demo-ticket" onClick={()=>onScan(d)} style={{
              display:"flex",alignItems:"center",gap:12,width:"100%",
              background:"rgba(255,255,255,0.03)",
              border:`1px solid rgba(255,255,255,0.07)`,
              borderRadius:14,padding:"12px 14px",marginBottom:8,
              color:"#fff",fontFamily:font,cursor:"pointer",
              transition:"all 0.2s",
            }}
            onMouseEnter={e=>e.currentTarget.style.borderColor=`${col}55`}
            onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"}
            >
              <div style={{
                width:40,height:40,borderRadius:10,
                background:`linear-gradient(135deg,${col}30,${col}15)`,
                border:`1px solid ${col}40`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:18,flexShrink:0,
              }}>{ch.emoji}</div>
              <div style={{textAlign:"left",flex:1,minWidth:0}}>
                <div style={{fontWeight:600,fontSize:13,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d?.movie}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {d?.cinema} · Seat {d?.seat} · {d?.showtime}
                </div>
              </div>
              <div style={{
                fontSize:11,color:col,fontWeight:700,
                background:`${col}15`,padding:"4px 8px",borderRadius:6,flexShrink:0,
              }}>USE →</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MenuStep({ticket,onProceed}){
  const [menu,setMenu]=useState([]);
  const [loading,setLoading]=useState(true);
  const [isLive,setIsLive]=useState(false);
  const [cart,setCart]=useState({});
  const [filter,setFilter]=useState("all");
  const chain=ticket.chain||"AMC";
  const chainCfg=CHAIN[chain]||CHAIN.AMC;
  useEffect(()=>{
    let cancelled=false;
    setLoading(true);
    (async()=>{
      try{
        const raw=await askClaude(`Search for the current food and drinks menu at ${chainCfg.label} cinemas in Saudi Arabia 2026. Include snacks, meals, drinks, combos with prices in SAR. Return ONLY a JSON array. Each item: {"id":1,"nameEn":"Item","name":"عربي","price":25,"emoji":"🍿","cat":"snacks or meals or drinks or combos"}. 10-14 items. ONLY the JSON array.`);
        const parsed=parseJSON(raw);
        if(parsed?.length>0&&!cancelled){setMenu(parsed);setIsLive(true);}
        else throw new Error("empty");
      }catch{if(!cancelled)setMenu(FALLBACK_MENUS[chain]||FALLBACK_MENUS.AMC);}
      finally{if(!cancelled)setLoading(false);}
    })();
    return()=>{cancelled=true;};
  },[chain]);
  const add=useCallback((id)=>setCart(c=>({...c,[id]:(c[id]||0)+1})),[]);
  const rem=useCallback((id)=>setCart(c=>{const n={...c};if(n[id]>1)n[id]--;else delete n[id];return n;}),[]);
  const cats=useMemo(()=>["all",...new Set(menu.map(m=>m.cat))],[menu]);
  const fMenu=useMemo(()=>menu.filter(m=>filter==="all"||m.cat===filter),[menu,filter]);
  const tItems=useMemo(()=>Object.values(cart).reduce((a,b)=>a+b,0),[cart]);
  const tPrice=useMemo(()=>{const map=Object.fromEntries(menu.map(m=>[m.id,m]));return Object.entries(cart).reduce((s,[id,q])=>s+(map[+id]?.price??0)*q,0);},[cart,menu]);
  const CAT_LABELS={all:"الكل",snacks:"سناكس",meals:"وجبات",drinks:"مشروبات",combos:"كومبو"};
  return(
    <>
      <div className="seatbite-ticket-card" style={{background:chainCfg.bg,border:`1px solid ${chainCfg.color}40`,borderRadius:14,padding:"14px 16px",marginBottom:20,display:"flex",alignItems:"center",gap:14}}>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:15}}>{ticket.movie}</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginTop:3}}>{ticket.cinema} · {ticket.hall} · Seat {ticket.seat}</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginTop:2}}>{ticket.showtime} · {ticket.date}</div>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div style={{fontSize:11,color:chainCfg.color,fontWeight:700,letterSpacing:1}}>{chain}</div>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginTop:2}}>🎫 {ticket.ticketId}</div>
        </div>
      </div>
      <div className="seatbite-section-head" style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
        <h1 style={{fontFamily:fontD,fontSize:30,letterSpacing:1.5,color:"#fff",margin:0}}>{chainCfg.emoji} {chain} MENU</h1>
        <span style={{fontSize:10,background:isLive?"rgba(34,197,94,0.12)":"rgba(255,255,255,0.06)",border:isLive?"1px solid rgba(34,197,94,0.25)":"1px solid rgba(255,255,255,0.1)",color:isLive?"#22c55e":"rgba(255,255,255,0.4)",padding:"3px 9px",borderRadius:20,fontWeight:600}}>{isLive?"LIVE":"CACHED"}</span>
      </div>
      <p style={{fontSize:13,color:"rgba(255,255,255,0.45)",marginBottom:16,marginTop:4}}>Delivered to Seat {ticket.seat} · نوصلك لمقعدك</p>
      {!loading&&<div className="seatbite-filter-row" style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>{cats.map(k=>(<button key={k} style={S.pill(filter===k,chainCfg.color)} onClick={()=>setFilter(k)}>{CAT_LABELS[k]||k}</button>))}</div>}
      {loading&&Array.from({length:5}).map((_,i)=>(
        <div key={i} style={{...S.panel,display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:44,height:44,borderRadius:10,background:"rgba(255,255,255,0.06)",animation:"shimmer 1.5s infinite",flexShrink:0}}/>
          <div style={{flex:1}}><div style={{width:"60%",height:13,borderRadius:4,background:"rgba(255,255,255,0.06)",marginBottom:7,animation:"shimmer 1.5s infinite"}}/><div style={{width:"35%",height:10,borderRadius:4,background:"rgba(255,255,255,0.04)",animation:"shimmer 1.5s infinite"}}/></div>
        </div>
      ))}
      {!loading&&fMenu.map(item=>(
        <div key={item.id} className="seatbite-menu-item" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div className="seatbite-menu-item-main" style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:26}}>{item.emoji}</span>
            <div>
              <div style={{fontWeight:500,fontSize:14}}>{item.nameEn}</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.35)"}}>{item.name}</div>
              <div style={{fontSize:13,color:chainCfg.color,fontWeight:700}}>{item.price} ر.س</div>
            </div>
          </div>
          <div className="seatbite-menu-item-actions" style={{display:"flex",alignItems:"center",gap:8}}>
            {cart[item.id]?(
              <>
                <button style={{width:28,height:28,borderRadius:7,border:"1px solid rgba(255,255,255,0.15)",background:"transparent",color:"#fff",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:font}} onClick={()=>rem(item.id)}>−</button>
                <span style={{fontWeight:600,minWidth:18,textAlign:"center"}}>{cart[item.id]}</span>
                <button style={{width:28,height:28,borderRadius:7,border:"1px solid rgba(255,255,255,0.15)",background:"transparent",color:"#fff",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:font}} onClick={()=>add(item.id)}>+</button>
              </>
            ):(
              <button style={{...S.btn(true,chainCfg.color),padding:"6px 14px",fontSize:12}} onClick={()=>add(item.id)}>Add</button>
            )}
          </div>
        </div>
      ))}
      {tItems>0&&(
        <div className="seatbite-checkout-bar" style={{position:"fixed",bottom:0,left:0,right:0,background:"rgba(10,10,15,0.97)",backdropFilter:"blur(20px)",borderTop:"1px solid rgba(255,255,255,0.08)",padding:"14px 16px",zIndex:50}}>
          <div className="seatbite-checkout-bar-inner" style={{maxWidth:520,margin:"0 auto",display:"flex",gap:12,alignItems:"center"}}>
            <div style={{flex:1}}>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.4)"}}>{tItems} item{tItems>1?"s":""}</div>
              <div style={{fontWeight:700,fontSize:16,color:"#fff"}}>{tPrice} ر.س</div>
            </div>
            <button style={{...S.btn(true,chainCfg.color),padding:"13px 24px",fontSize:14,flexShrink:0}} onClick={()=>onProceed({cart,menu,tPrice,tItems})}>Checkout →</button>
          </div>
        </div>
      )}
    </>
  );
}

function PaymentStep({ticket,orderData,onPaid,onBack}){
  const [method,setMethod]=useState("card");
  const [cardNum,setCardNum]=useState("");
  const [expiry,setExpiry]=useState("");
  const [cvv,setCvv]=useState("");
  const [name,setName]=useState("");
  const [paying,setPaying]=useState(false);
  const [fieldErr,setFieldErr]=useState({});
  const chain=ticket.chain||"AMC";
  const chainCfg=CHAIN[chain]||CHAIN.AMC;
  const fmtCard=v=>v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
  const fmtExp=v=>{const d=v.replace(/\D/g,"").slice(0,4);return d.length>2?`${d.slice(0,2)}/${d.slice(2)}`:d;};
  const validate=()=>{
    const e={};
    if(method==="card"){
      if(cardNum.replace(/\s/g,"").length<16)e.cardNum="Enter a valid 16-digit card number";
      if(expiry.length<5)e.expiry="Enter expiry MM/YY";
      if(cvv.replace(/\D/g,"").length<3)e.cvv="Enter 3-digit CVV";
      if(!name.trim())e.name="Enter cardholder name";
    }
    setFieldErr(e);
    return Object.keys(e).length===0;
  };
  const pay=()=>{if(!validate())return;setPaying(true);setTimeout(()=>{setPaying(false);onPaid();},1800);};
  const METHODS=[{id:"card",label:"Credit / Debit",icon:"💳"},{id:"apple",label:"Apple Pay",icon:"🍎"},{id:"stc",label:"STC Pay",icon:"📱"}];
  return(
    <>
      <div className="seatbite-payment-head" style={{display:"flex",alignItems:"center",gap:8,marginBottom:20}}>
        <button onClick={onBack} style={{...S.btn(false),padding:"6px 10px",fontSize:12}}>←</button>
        <div>
          <div style={{fontWeight:600,fontSize:14}}>Review & Pay</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.4)"}}>Seat {ticket.seat} · {ticket.cinema}</div>
        </div>
      </div>
      <div style={S.glass}>
        <div style={{fontWeight:700,fontSize:13,color:"rgba(255,255,255,0.5)",letterSpacing:1.5,marginBottom:12}}>ORDER SUMMARY</div>
        {orderData.menu&&Object.entries(orderData.cart).map(([id,qty])=>{const it=orderData.menu.find(m=>m.id===+id);return it?(<div key={id} style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:8,color:"rgba(255,255,255,0.7)"}}><span>{it.emoji} {it.nameEn} <span style={{color:"rgba(255,255,255,0.35)"}}>× {qty}</span></span><span style={{fontWeight:600}}>{it.price*qty} ر.س</span></div>):null;})}
        <div style={{borderTop:"1px solid rgba(255,255,255,0.08)",marginTop:10,paddingTop:10,display:"flex",justifyContent:"space-between",fontWeight:700,fontSize:15}}>
          <span>Total</span><span style={{color:chainCfg.color}}>{orderData.tPrice} ر.س</span>
        </div>
      </div>
      <div className="seatbite-payment-methods" style={{display:"flex",gap:8,marginBottom:20}}>
        {METHODS.map(m=>(
          <button key={m.id} onClick={()=>setMethod(m.id)} style={{flex:1,padding:"12px 8px",borderRadius:12,border:`2px solid ${method===m.id?chainCfg.color:"rgba(255,255,255,0.08)"}`,background:method===m.id?chainCfg.bg:"rgba(255,255,255,0.03)",color:method===m.id?"#fff":"rgba(255,255,255,0.4)",fontFamily:font,cursor:"pointer",textAlign:"center",transition:"all 0.2s"}}>
            <div style={{fontSize:20,marginBottom:4}}>{m.icon}</div>
            <div style={{fontSize:10,fontWeight:600,lineHeight:1.2}}>{m.label}</div>
          </button>
        ))}
      </div>
      {method==="card"&&(
        <div className="seatbite-payment-form" style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20}}>
          <div>
            <label style={{fontSize:11,color:"rgba(255,255,255,0.4)",fontWeight:600,display:"block",marginBottom:6}}>CARD NUMBER</label>
            <input value={cardNum} onChange={e=>setCardNum(fmtCard(e.target.value))} placeholder="1234 5678 9012 3456" maxLength={19} style={{...S.input,borderColor:fieldErr.cardNum?"rgba(255,80,80,0.5)":"rgba(255,255,255,0.12)",letterSpacing:2}}/>
            {fieldErr.cardNum&&<div style={{fontSize:11,color:"rgba(255,100,100,0.8)",marginTop:4}}>⚠ {fieldErr.cardNum}</div>}
          </div>
          <div className="seatbite-payment-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div>
              <label style={{fontSize:11,color:"rgba(255,255,255,0.4)",fontWeight:600,display:"block",marginBottom:6}}>EXPIRY</label>
              <input value={expiry} onChange={e=>setExpiry(fmtExp(e.target.value))} placeholder="MM/YY" maxLength={5} style={{...S.input,borderColor:fieldErr.expiry?"rgba(255,80,80,0.5)":"rgba(255,255,255,0.12)"}}/>
              {fieldErr.expiry&&<div style={{fontSize:11,color:"rgba(255,100,100,0.8)",marginTop:4}}>⚠ {fieldErr.expiry}</div>}
            </div>
            <div>
              <label style={{fontSize:11,color:"rgba(255,255,255,0.4)",fontWeight:600,display:"block",marginBottom:6}}>CVV</label>
              <input value={cvv} onChange={e=>setCvv(e.target.value.replace(/\D/g,"").slice(0,3))} placeholder="123" maxLength={3} type="password" style={{...S.input,borderColor:fieldErr.cvv?"rgba(255,80,80,0.5)":"rgba(255,255,255,0.12)"}}/>
              {fieldErr.cvv&&<div style={{fontSize:11,color:"rgba(255,100,100,0.8)",marginTop:4}}>⚠ {fieldErr.cvv}</div>}
            </div>
          </div>
          <div>
            <label style={{fontSize:11,color:"rgba(255,255,255,0.4)",fontWeight:600,display:"block",marginBottom:6}}>CARDHOLDER NAME</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name on card" style={{...S.input,borderColor:fieldErr.name?"rgba(255,80,80,0.5)":"rgba(255,255,255,0.12)"}}/>
            {fieldErr.name&&<div style={{fontSize:11,color:"rgba(255,100,100,0.8)",marginTop:4}}>⚠ {fieldErr.name}</div>}
          </div>
          <div className="seatbite-card-brands" style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
            {["VISA","MC","MADA","AMEX"].map(c=>(<div key={c} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:5,padding:"3px 8px",fontSize:10,color:"rgba(255,255,255,0.4)",fontWeight:700}}>{c}</div>))}
            <div style={{marginLeft:"auto",fontSize:11,color:"rgba(255,255,255,0.25)"}}>🔒 Encrypted</div>
          </div>
        </div>
      )}
      {(method==="apple"||method==="stc")&&(
        <div style={{...S.glass,textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:40,marginBottom:12}}>{method==="apple"?"🍎":"📱"}</div>
          <div style={{fontWeight:600,fontSize:15,marginBottom:6}}>{method==="apple"?"Touch ID or Face ID to pay":"Confirm in STC Pay app"}</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.4)"}}>{orderData.tPrice} ر.س will be charged to your {method==="apple"?"Apple Pay":"STC Pay"} account</div>
        </div>
      )}
      <button onClick={pay} disabled={paying} style={{...S.btn(true,chainCfg.color),width:"100%",justifyContent:"center",padding:"15px",fontSize:15,opacity:paying?0.7:1,marginBottom:32}}>
        {paying?(<span style={{display:"flex",alignItems:"center",gap:10}}><span style={{width:16,height:16,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>Processing…</span>):`Pay ${orderData.tPrice} ر.س`}
      </button>
      <p style={{textAlign:"center",fontSize:11,color:"rgba(255,255,255,0.2)"}}>🔒 Secured by SeatBite Pay · PCI DSS Compliant</p>
    </>
  );
}

function OrderTracker({ticket,orderData,onReset}){
  const [oStage,setOStage]=useState(0);
  const chain=ticket.chain||"AMC";
  const chainCfg=CHAIN[chain]||CHAIN.AMC;
  useEffect(()=>{if(oStage>=3)return;const t=setTimeout(()=>setOStage(x=>x+1),3000);return()=>clearTimeout(t);},[oStage]);
  return(
    <>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{fontSize:48,marginBottom:8}}>🎉</div>
        <h1 style={{fontFamily:fontD,fontSize:34,letterSpacing:2,color:"#fff",margin:0}}>!تم الطلب</h1>
        <p style={{fontSize:13,color:"rgba(255,255,255,0.45)",marginTop:6}}>Delivering to Seat {ticket.seat} · {ticket.cinema}</p>
      </div>
      <div style={{background:chainCfg.bg,border:`1px solid ${chainCfg.color}40`,borderRadius:14,padding:"14px 16px",marginBottom:16}}>
        <div style={{fontWeight:700,fontSize:15,marginBottom:8}}>{ticket.movie}</div>
        <div className="seatbite-order-meta" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[["Hall",ticket.hall],["Seat",ticket.seat],["Showtime",ticket.showtime],["Ticket","#"+ticket.ticketId?.split("-")[1]]].map(([l,v])=>(
            <div key={l}><div style={{fontSize:10,color:"rgba(255,255,255,0.3)",fontWeight:600,letterSpacing:1.5}}>{l.toUpperCase()}</div><div style={{fontSize:13,fontWeight:600,marginTop:2}}>{v}</div></div>
          ))}
        </div>
      </div>
      <div style={S.glass}>
        {ORDER_STAGES.map((st,i)=>(
          <div key={st.key}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:oStage>i?chainCfg.color:oStage===i?`${chainCfg.color}30`:"rgba(255,255,255,0.06)",border:oStage===i?`2px solid ${chainCfg.color}`:"2px solid transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,transition:"all 0.6s",flexShrink:0}}>{oStage>=i?st.icon:""}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:14,color:oStage>=i?"#fff":"rgba(255,255,255,0.25)"}}>{st.labelEn}</div>
                <div style={{fontSize:12,color:oStage>=i?"rgba(255,255,255,0.45)":"rgba(255,255,255,0.15)"}}>{st.desc}</div>
              </div>
              {oStage===i&&i<3&&<div style={{width:8,height:8,borderRadius:"50%",background:chainCfg.color,animation:"pulse 1.5s infinite"}}/>}
            </div>
            {i<ORDER_STAGES.length-1&&<div style={{width:3,height:36,background:oStage>i?chainCfg.color:"rgba(255,255,255,0.08)",marginLeft:17,transition:"background 0.6s"}}/>}
          </div>
        ))}
      </div>
      <div style={S.glass}>
        <div style={{fontWeight:700,fontSize:13,color:"rgba(255,255,255,0.5)",letterSpacing:1.5,marginBottom:12}}>RECEIPT</div>
        {orderData.menu&&Object.entries(orderData.cart).map(([id,qty])=>{const it=orderData.menu.find(m=>m.id===+id);return it?(<div key={id} style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6,color:"rgba(255,255,255,0.6)"}}><span>{it.emoji} {it.nameEn} × {qty}</span><span>{it.price*qty} ر.س</span></div>):null;})}
        <div style={{borderTop:"1px solid rgba(255,255,255,0.08)",marginTop:10,paddingTop:10,display:"flex",justifyContent:"space-between",fontWeight:700,fontSize:15}}>
          <span>المجموع · Total</span><span style={{color:chainCfg.color}}>{orderData.tPrice} ر.س</span>
        </div>
      </div>
      <button style={{...S.btn(false),width:"100%",justifyContent:"center",marginTop:4}} onClick={onReset}>Scan Another Ticket ↩</button>
    </>
  );
}

const ALL_VENUES=Object.entries({
  muvi:[{name:"Nakheel Mall",city:"Riyadh",area:"Exit 9",lat:24.7742,lng:46.6695},{name:"Hayat Mall",city:"Riyadh",area:"Exit 8",lat:24.7136,lng:46.6753},{name:"Mall of Arabia",city:"Jeddah",area:"King Abdulaziz Rd",lat:21.5433,lng:39.1728}],
  AMC:[{name:"KAFD",city:"Riyadh",area:"King Abdullah Financial District",lat:24.7664,lng:46.6403},{name:"Panorama Mall",city:"Riyadh",area:"Tahlia St",lat:24.6919,lng:46.6889},{name:"Ajdan Walk",city:"Al Khobar",area:"Prince Turkey St",lat:26.3073,lng:50.2007}],
  VOX:[{name:"Riyadh Park",city:"Riyadh",area:"Northern Ring Rd",lat:24.7952,lng:46.7196},{name:"Kingdom Centre",city:"Riyadh",area:"Olaya",lat:24.6911,lng:46.6839},{name:"Red Sea Mall",city:"Jeddah",area:"King Abdulaziz Rd",lat:21.5592,lng:39.1476}],
}).flatMap(([ch,list])=>list.map(v=>({...v,chainShort:ch,color:(ADMIN_CHAIN[ch]||ADMIN_CHAIN.AMC).color,fullName:`${CHAIN[ch]?.label||ch} ${v.name}`})));

const HAV=(a,b,c,d)=>{const R=6371,r=x=>x*Math.PI/180,dA=r(c-a),dB=r(d-b),s=Math.sin(dA/2)**2+Math.cos(r(a))*Math.cos(r(c))*Math.sin(dB/2)**2;return R*2*Math.atan2(Math.sqrt(s),Math.sqrt(1-s));};

// ───── STEP 1: Choose venue from GPS ─────
function VenuePicker({onSelect}){
  const [loc,setLoc]=useState(null);
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState(null);
  const [sorted,setSorted]=useState([]);
  const go=useCallback(()=>{
    setLoading(true);setErr(null);
    navigator.geolocation.getCurrentPosition(
      ({coords:{latitude:lat,longitude:lng}})=>{
        setLoc({lat,lng});
        setSorted([...ALL_VENUES].map(v=>({...v,dist:HAV(lat,lng,v.lat,v.lng)})).sort((a,b)=>a.dist-b.dist));
        setLoading(false);
      },
      ()=>{
        const lat=24.7136,lng=46.6753;
        setLoc({lat,lng,sim:true});
        setSorted([...ALL_VENUES].map(v=>({...v,dist:HAV(lat,lng,v.lat,v.lng)})).sort((a,b)=>a.dist-b.dist));
        setLoading(false);
        setErr("Permission denied – showing Riyadh demo");
      }
    );
  },[]);
  return(
    <div>
      <h2 style={{fontFamily:fontD,fontSize:26,letterSpacing:1.5,marginBottom:4,color:"#fff"}}>📍 SELECT YOUR VENUE</h2>
      <p style={{fontSize:13,color:"rgba(255,255,255,0.45)",marginBottom:20}}>Choose the cinema you're staffing today</p>
      {!loc&&!loading&&(
        <div style={{textAlign:"center",padding:"40px 0"}}>
          <div style={{fontSize:48,marginBottom:16}}>🗺️</div>
          <p style={{fontSize:13,color:"rgba(255,255,255,0.45)",marginBottom:18}}>We'll auto-suggest the closest one based on GPS</p>
          <button style={S.btn()} onClick={go}>Enable Location</button>
        </div>
      )}
      {loading&&(
        <div style={{textAlign:"center",padding:"40px 0"}}>
          <div style={{fontSize:36,animation:"pulse 1.5s infinite"}}>📡</div>
          <p style={{color:"rgba(255,255,255,0.4)",fontSize:14,marginTop:12}}>Acquiring GPS…</p>
        </div>
      )}
      {err&&(
        <div style={{background:"rgba(232,93,4,0.1)",border:"1px solid rgba(232,93,4,0.2)",borderRadius:10,padding:"10px 14px",fontSize:12,color:"rgba(255,165,50,0.8)",marginBottom:16}}>⚠️ {err}</div>
      )}
      {loc&&sorted.length>0&&(
        <>
          {sorted.map((v,i)=>(
            <button
              key={v.name+v.chainShort}
              onClick={()=>onSelect(v)}
              style={{...S.panel,width:"100%",textAlign:"left",cursor:"pointer",borderColor:i===0?v.color:"rgba(255,255,255,0.08)",background:i===0?`${v.color}15`:"rgba(255,255,255,0.04)",fontFamily:font,color:"#fff"}}
            >
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                    {i===0&&<span style={{fontSize:9,color:v.color,fontWeight:700,letterSpacing:1.5,background:`${v.color}20`,padding:"2px 6px",borderRadius:4}}>NEAREST</span>}
                    <span style={{fontSize:10,color:v.color,background:`${v.color}20`,padding:"2px 7px",borderRadius:5,fontWeight:700,letterSpacing:0.5}}>{v.chainShort}</span>
                    <div style={{fontWeight:600,fontSize:14}}>{v.name}</div>
                  </div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,0.4)"}}>{v.area} · {v.city}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontWeight:700,fontSize:i===0?22:15,color:i===0?v.color:"rgba(255,255,255,0.7)"}}>
                    {v.dist.toFixed(1)}<span style={{fontSize:11,fontWeight:400,color:"rgba(255,255,255,0.35)"}}> km</span>
                  </div>
                  <div style={{fontSize:11,color:v.color,marginTop:4,fontWeight:600}}>SELECT →</div>
                </div>
              </div>
            </button>
          ))}
          <button style={{...S.btn(false),marginTop:8,width:"100%",justifyContent:"center"}} onClick={go}>🔄 Refresh GPS</button>
        </>
      )}
    </div>
  );
}

// ───── STEP 2: Live orders for the selected venue ─────
const STAGE_LABELS=["Pending","Preparing","On the Way","Delivered"];
const STAGE_COLORS=["rgba(255,200,50,0.9)","rgba(100,150,255,0.9)",oc,"rgba(34,197,94,0.9)"];
const STAGE_BGS=["rgba(255,200,50,0.12)","rgba(100,150,255,0.12)","rgba(232,93,4,0.12)","rgba(34,197,94,0.12)"];

function VenueOrders({venue,onSwitchVenue}){
  const chain=venue.chainShort;
  const ch=ADMIN_CHAIN[chain]||ADMIN_CHAIN.AMC;
  const menu=FALLBACK_MENUS[chain]||FALLBACK_MENUS.AMC;
  // Generate orders contextual to this specific venue's menu
  const SEED=useMemo(()=>{
    const pool=menu;
    const pick=(n)=>{const arr=[];for(let i=0;i<n;i++){const m=pool[Math.floor(Math.random()*pool.length)];arr.push({name:m.nameEn,emoji:m.emoji,qty:1+Math.floor(Math.random()*2),price:m.price});}return arr;};
    const movies=chain==="muvi"?["Hoppers","شباب البومب 3","Project Hail Mary"]:chain==="VOX"?["Project Hail Mary","Wicked Part 2","Dune Messiah"]:["Scream 7","Avatar 3","The Batman 2"];
    const customers=["Ahmed K.","Sara M.","Khalid R.","Nora F.","Mohammed A.","Lina H.","Faisal B."];
    const seats=["A4","B7","C5","D2","E11","F8","G2","H6"];
    const times=["just now","1 min ago","3 min ago","5 min ago","8 min ago","12 min ago"];
    return Array.from({length:5},(_,i)=>{
      const items=pick(1+Math.floor(Math.random()*3));
      const total=items.reduce((s,it)=>s+it.price*it.qty,0);
      return{
        id:`SB-${1040-i}`,
        seat:seats[i%seats.length],
        customer:customers[i%customers.length],
        movie:movies[i%movies.length],
        chain,
        venue:venue.name,
        items,total,
        stage:i===0?0:i===4?3:Math.floor(Math.random()*3),
        time:times[i],
        takenBy:null,
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[venue.name,chain]);
  const [orders,setOrders]=useState(SEED);
  const [exp,setExp]=useState(null);
  const [filter,setFilter]=useState("all"); // all | mine | unclaimed
  // reset when venue changes
  useEffect(()=>{setOrders(SEED);setExp(null);setFilter("all");},[SEED]);

  const takeOrder=useCallback((id)=>setOrders(p=>p.map(o=>o.id===id?{...o,takenBy:"You",stage:Math.max(o.stage,1)}:o)),[]);
  const advance=useCallback((id)=>setOrders(p=>p.map(o=>o.id===id&&o.stage<3?{...o,stage:o.stage+1}:o)),[]);
  const release=useCallback((id)=>setOrders(p=>p.map(o=>o.id===id?{...o,takenBy:null,stage:0}:o)),[]);

  const filtered=useMemo(()=>{
    if(filter==="mine")return orders.filter(o=>o.takenBy==="You"&&o.stage<3);
    if(filter==="unclaimed")return orders.filter(o=>!o.takenBy&&o.stage<3);
    return orders;
  },[orders,filter]);

  const pendingCount=useMemo(()=>orders.filter(o=>o.stage<3).length,[orders]);
  const mineCount=useMemo(()=>orders.filter(o=>o.takenBy==="You"&&o.stage<3).length,[orders]);
  const unclaimedCount=useMemo(()=>orders.filter(o=>!o.takenBy&&o.stage<3).length,[orders]);
  const revenue=useMemo(()=>orders.reduce((s,o)=>s+o.total,0),[orders]);

  return(
    <div>
      {/* Venue header card */}
      <div style={{background:`linear-gradient(135deg, ${ch.color}25, ${ch.color}10)`,border:`1px solid ${ch.color}55`,borderRadius:14,padding:"14px 16px",marginBottom:18,display:"flex",alignItems:"center",gap:14}}>
        <div style={{width:44,height:44,borderRadius:10,background:ch.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>📍</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
            <span style={{fontSize:9,color:ch.color,fontWeight:800,letterSpacing:1.5,background:`${ch.color}25`,padding:"2px 6px",borderRadius:4}}>{chain}</span>
            <div style={{fontWeight:700,fontSize:15,color:"#fff"}}>{venue.name}</div>
          </div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.5)"}}>{venue.area} · {venue.city}</div>
        </div>
        <button onClick={onSwitchVenue} style={{...S.btn(false),padding:"7px 12px",fontSize:11,flexShrink:0}}>Switch</button>
      </div>

      <h2 style={{fontFamily:fontD,fontSize:26,letterSpacing:1.5,marginBottom:4,color:"#fff"}}>📋 LIVE ORDERS</h2>
      <p style={{fontSize:13,color:"rgba(255,255,255,0.45)",marginBottom:16}}>Take orders from this venue's queue</p>

      {/* Stat strip */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:18}}>
        {[
          {label:"Active",v:pendingCount,icon:"🔥",c:oc},
          {label:"Mine",v:mineCount,icon:"👤",c:ch.color},
          {label:"Revenue",v:`${revenue}ر.س`,icon:"💰",c:"#f0c040"},
        ].map(s=>(
          <div key={s.label} style={{...S.panel,textAlign:"center",borderRadius:12,padding:"14px 12px",marginBottom:0}}>
            <div style={{fontSize:20,marginBottom:4}}>{s.icon}</div>
            <div style={{fontFamily:fontD,fontSize:18,color:s.c}}>{s.v}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.35)"}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        <button style={S.pill(filter==="all",ch.color)} onClick={()=>setFilter("all")}>All ({orders.length})</button>
        <button style={S.pill(filter==="unclaimed",ch.color)} onClick={()=>setFilter("unclaimed")}>📥 Unclaimed ({unclaimedCount})</button>
        <button style={S.pill(filter==="mine",ch.color)} onClick={()=>setFilter("mine")}>👤 Mine ({mineCount})</button>
      </div>

      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
        <span style={{width:8,height:8,borderRadius:"50%",background:"#22c55e",animation:"pulse 1.5s infinite"}}/>
        <span style={{fontSize:11,color:"rgba(255,255,255,0.4)",fontWeight:600}}>LIVE · {venue.name}</span>
      </div>

      {filtered.length===0&&(
        <div style={{...S.panel,textAlign:"center",padding:"32px 16px"}}>
          <div style={{fontSize:36,marginBottom:8,opacity:0.4}}>🍿</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.4)"}}>No orders match this filter</div>
        </div>
      )}

      {filtered.map(o=>{
        const isExp=exp===o.id;
        const isMine=o.takenBy==="You";
        const isUnclaimed=!o.takenBy&&o.stage<3;
        return(
          <div
            key={o.id}
            style={{
              ...S.panel,
              borderColor:isMine?ch.color+"80":isUnclaimed?"rgba(255,200,50,0.3)":"rgba(255,255,255,0.08)",
              background:isMine?`${ch.color}10`:isUnclaimed?"rgba(255,200,50,0.04)":"rgba(255,255,255,0.04)",
              cursor:"pointer",
            }}
            onClick={()=>setExp(isExp?null:o.id)}
          >
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                  <span style={{fontWeight:700,fontSize:13,color:ch.color}}>{o.id}</span>
                  <span style={{fontSize:10,background:STAGE_BGS[o.stage],color:STAGE_COLORS[o.stage],padding:"2px 8px",borderRadius:20,fontWeight:600}}>{STAGE_LABELS[o.stage]}</span>
                  {isMine&&<span style={{fontSize:10,background:`${ch.color}25`,color:ch.color,padding:"2px 8px",borderRadius:20,fontWeight:700,letterSpacing:0.5}}>👤 YOURS</span>}
                  {isUnclaimed&&<span style={{width:6,height:6,borderRadius:"50%",background:"#ffc832",animation:"pulse 1.5s infinite"}}/>}
                </div>
                <div style={{fontSize:14,fontWeight:600,marginBottom:2}}>Seat {o.seat} · {o.customer}</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.4)"}}>{o.movie} · {o.time}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontWeight:700,color:ch.color}}>{o.total} ر.س</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.25)",marginTop:2}}>{o.items.length} item{o.items.length>1?"s":""}</div>
              </div>
            </div>
            {isExp&&(
              <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid rgba(255,255,255,0.08)"}}>
                {o.items.map((it,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6,color:"rgba(255,255,255,0.65)"}}>
                    <span>{it.emoji} {it.name} × {it.qty}</span>
                    <span>{it.price*it.qty} ر.س</span>
                  </div>
                ))}
                {/* Action buttons */}
                {isUnclaimed&&(
                  <button
                    onClick={e=>{e.stopPropagation();takeOrder(o.id);}}
                    style={{marginTop:12,width:"100%",padding:"12px",borderRadius:8,border:"none",background:`linear-gradient(135deg,${ch.color},${ch.color}cc)`,color:"#fff",fontFamily:font,fontWeight:700,fontSize:13,cursor:"pointer",letterSpacing:0.5}}
                  >
                    ✋ TAKE THIS ORDER
                  </button>
                )}
                {isMine&&o.stage<3&&(
                  <div style={{display:"flex",gap:8,marginTop:12}}>
                    <button
                      onClick={e=>{e.stopPropagation();advance(o.id);}}
                      style={{flex:1,padding:"10px",borderRadius:8,border:"none",background:`linear-gradient(135deg,${ch.color},${ch.color}aa)`,color:"#fff",fontFamily:font,fontWeight:600,fontSize:12,cursor:"pointer"}}
                    >
                      Mark "{STAGE_LABELS[o.stage+1]}" →
                    </button>
                    <button
                      onClick={e=>{e.stopPropagation();release(o.id);}}
                      style={{padding:"10px 14px",borderRadius:8,border:"1px solid rgba(255,255,255,0.12)",background:"transparent",color:"rgba(255,255,255,0.6)",fontFamily:font,fontWeight:500,fontSize:12,cursor:"pointer"}}
                    >
                      Release
                    </button>
                  </div>
                )}
                {!isMine&&!isUnclaimed&&o.stage<3&&(
                  <div style={{marginTop:12,padding:"10px",borderRadius:8,background:"rgba(255,255,255,0.04)",fontSize:12,color:"rgba(255,255,255,0.5)",textAlign:"center"}}>
                    Taken by another staff member
                  </div>
                )}
                {o.stage===3&&(
                  <div style={{textAlign:"center",padding:"10px 0 4px",fontSize:13,color:"#22c55e"}}>✅ Complete · بالعافية!</div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AdminPanel({onBack}){
  const [venue,setVenue]=useState(null);
  return(
    <div className="seatbite-app seatbite-admin">
      <header className="seatbite-admin-header">
        <div className="seatbite-admin-header-inner">
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div className="seatbite-admin-badge">⚙️</div>
            <div>
              <div style={{fontFamily:fontD,fontSize:22,letterSpacing:2,color:"#fff"}}>STAFF</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.3)"}}>{venue?venue.name.toUpperCase():"SEATBITE CONTROL"}</div>
            </div>
          </div>
          <button onClick={onBack} className="seatbite-admin-back">← Back</button>
        </div>
      </header>
      <div className="seatbite-admin-content">
        {!venue&&<VenuePicker onSelect={setVenue}/>}
        {venue&&<VenueOrders venue={venue} onSwitchVenue={()=>setVenue(null)}/>}
      </div>
    </div>
  );
}

export default function SeatBite(){
  const [step,setStep]=useState(0);
  const [ticket,setTicket]=useState(null);
  const [orderData,setOrderData]=useState(null);
  const [adminMode,setAdminMode]=useState(false);
  const handleScan=useCallback((d)=>{setTicket(d);setStep(1);},[]);
  const handleProceed=useCallback((d)=>{setOrderData(d);setStep(2);},[]);
  const handlePaid=useCallback(()=>setStep(3),[]);
  const handleReset=useCallback(()=>{setStep(0);setTicket(null);setOrderData(null);},[]);
  if(adminMode) return <AdminPanel onBack={()=>setAdminMode(false)}/>;
  const chain=ticket?.chain||"AMC";
  const chainCfg=CHAIN[chain]||CHAIN.AMC;
  return(
    <div className="seatbite-app">
      <div className="seatbite-noise"/>
      {step>0&&(
        <header className="seatbite-header">
          <div className="seatbite-header-inner">
            <div className="seatbite-brand">
              <div className="seatbite-brand-icon">🍿</div>
              <div style={{fontFamily:fontD,fontSize:24,letterSpacing:2,lineHeight:1}}>SEATBITE</div>
            </div>
            <div className="seatbite-header-actions">
              <div className="seatbite-step-dots">
                {["🎫","🍿","💳","✓"].map((ic,i)=>(
                  <div
                    key={i}
                    className={`seatbite-step-dot${i<step ? " complete" : ""}${i===step-1 ? " active" : ""}`}
                  >
                    {i<step?ic:""}
                  </div>
                ))}
              </div>
              <button onClick={()=>setAdminMode(true)} className="seatbite-icon-button">⚙️</button>
            </div>
          </div>
        </header>
      )}
      {step===0&&(
        <div className="seatbite-intro">
          <div className="seatbite-admin-toggle">
            <button onClick={()=>setAdminMode(true)} className="seatbite-admin-button">⚙️ Admin</button>
          </div>
          <div style={{maxWidth:480,margin:"0 auto",padding:"60px 24px 40px",width:"100%",flex:1}}>
            <QRScanner onScan={handleScan}/>
          </div>
        </div>
      )}
      {step>0&&(
        <div className="seatbite-content">
          {step===1&&<MenuStep ticket={ticket} onProceed={handleProceed}/>}
          {step===2&&<PaymentStep ticket={ticket} orderData={orderData} onPaid={handlePaid} onBack={()=>setStep(1)}/>}
          {step===3&&<OrderTracker ticket={ticket} orderData={orderData} onReset={handleReset}/>}
        </div>
      )}
    </div>
  );
}