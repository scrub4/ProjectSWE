import { useState, useEffect, useCallback } from "react";

/*──────────────────────────────────────────────
  FALLBACK DATA — real movies & venues used
  when API is unavailable (local dev)
──────────────────────────────────────────────*/
const FALLBACK_MOVIES = [
  { id: 1, title: "Project Hail Mary", genre: "Sci-Fi", rating: "PG-15", lang: "EN", poster: "🚀", chains: ["muvi", "AMC", "VOX"] },
  { id: 2, title: "Scream 7", genre: "Horror", rating: "R18", lang: "EN", poster: "😱", chains: ["muvi", "AMC", "VOX"] },
  { id: 3, title: "Hoppers", genre: "Animation", rating: "PG", lang: "EN", poster: "🐰", chains: ["muvi", "VOX"] },
  { id: 4, title: "The Raiders", genre: "Action", rating: "PG-13", lang: "EN", poster: "⚔️", chains: ["AMC", "VOX"] },
  { id: 5, title: "Marty Supreme", genre: "Drama", rating: "R18", lang: "EN", poster: "🏓", chains: ["muvi", "VOX"] },
  { id: 6, title: "Super Mario Galaxy Movie", genre: "Animation", rating: "PG", lang: "EN", poster: "⭐", chains: ["muvi", "AMC", "VOX"] },
  { id: 7, title: "Ready or Not 2", genre: "Horror", rating: "R18", lang: "EN", poster: "🎭", chains: ["AMC", "VOX"] },
  { id: 8, title: "Protector", genre: "Action", rating: "R15", lang: "EN", poster: "🛡️", chains: ["muvi", "AMC"] },
  { id: 9, title: "شباب البومب 3", genre: "Comedy", rating: "PG-12", lang: "AR", poster: "💣", chains: ["muvi", "AMC", "VOX"] },
  { id: 10, title: "Family Business", genre: "Drama", rating: "R15", lang: "AR", poster: "👨‍👩‍👦", chains: ["muvi", "VOX"] },
  { id: 11, title: "You, Me & Tuscany", genre: "Romance", rating: "PG-15", lang: "EN", poster: "🇮🇹", chains: ["AMC", "VOX"] },
  { id: 12, title: "The Strangers: Chapter 3", genre: "Horror", rating: "R18", lang: "EN", poster: "🔪", chains: ["muvi", "AMC"] },
];

const ALL_VENUES = {
  muvi: [
    { name: "Nakheel Mall", city: "Riyadh", area: "Exit 9" },
    { name: "Mall of Arabia", city: "Jeddah", area: "King Abdulaziz Rd" },
    { name: "Hayat Mall", city: "Riyadh", area: "Exit 8" },
    { name: "Al Hamra Mall", city: "Riyadh", area: "Olaya" },
    { name: "The View", city: "Riyadh", area: "King Fahd Rd" },
    { name: "U-Walk", city: "Riyadh", area: "Anas Ibn Malik Rd" },
  ],
  AMC: [
    { name: "KAFD", city: "Riyadh", area: "King Abdullah Financial District" },
    { name: "Panorama Mall", city: "Riyadh", area: "Tahlia St" },
    { name: "Riyadh Gallery", city: "Riyadh", area: "King Fahd Rd" },
    { name: "Stars Avenue", city: "Jeddah", area: "Madinah Rd" },
    { name: "Ajdan Walk", city: "Al Khobar", area: "Prince Turkey St" },
  ],
  VOX: [
    { name: "Riyadh Park", city: "Riyadh", area: "Northern Ring Rd" },
    { name: "Kingdom Centre", city: "Riyadh", area: "Olaya" },
    { name: "Red Sea Mall", city: "Jeddah", area: "King Abdulaziz Rd" },
    { name: "West Avenue Mall", city: "Dammam", area: "King Fahd Rd" },
    { name: "Town Square", city: "Jeddah", area: "Al Andalus" },
    { name: "The Esplanade", city: "Riyadh", area: "Thumamah Rd" },
  ],
};

const CHAIN_COLORS = { muvi: "#6c2dc7", AMC: "#c41230", VOX: "#e6007e" };

function getVenuesForMovie(movie) {
  const chains = movie.chains || ["muvi", "AMC", "VOX"];
  const results = [];
  chains.forEach((ch) => {
    const list = ALL_VENUES[ch] || [];
    // pick 2-3 random venues per chain
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    shuffled.slice(0, 2 + Math.floor(Math.random() * 2)).forEach((v, i) => {
      results.push({
        ...v,
        id: `${ch}-${i}`,
        chain: `${ch} Cinemas`,
        chainShort: ch,
        color: CHAIN_COLORS[ch] || "#e85d04",
      });
    });
  });
  return results;
}

/*──────────────────────────────────────────────
  STATIC DATA
──────────────────────────────────────────────*/
const MENU = [
  { id: 1, name: "فشار كلاسيك", nameEn: "Classic Popcorn", price: 20, emoji: "🍿", cat: "snacks" },
  { id: 2, name: "فشار كراميل", nameEn: "Caramel Popcorn", price: 25, emoji: "🍿", cat: "snacks" },
  { id: 3, name: "بيبسي", nameEn: "Pepsi", price: 12, emoji: "🥤", cat: "drinks" },
  { id: 4, name: "سلاش توت", nameEn: "Berry Slushie", price: 15, emoji: "🧊", cat: "drinks" },
  { id: 5, name: "سلاش مانجو", nameEn: "Mango Slushie", price: 15, emoji: "🥭", cat: "drinks" },
  { id: 6, name: "ناتشوز", nameEn: "Nachos Grande", price: 28, emoji: "🧀", cat: "snacks" },
  { id: 7, name: "هوت دوق", nameEn: "Hot Dog", price: 22, emoji: "🌭", cat: "meals" },
  { id: 8, name: "برجر", nameEn: "Smash Burger", price: 35, emoji: "🍔", cat: "meals" },
  { id: 9, name: "بطاطس", nameEn: "Loaded Fries", price: 18, emoji: "🍟", cat: "snacks" },
  { id: 10, name: "ناقتس دجاج", nameEn: "Chicken Nuggets", price: 25, emoji: "🍗", cat: "meals" },
  { id: 11, name: "آيس كريم", nameEn: "Ice Cream", price: 18, emoji: "🍦", cat: "snacks" },
  { id: 12, name: "قهوة مثلجة", nameEn: "Iced Coffee", price: 18, emoji: "☕", cat: "drinks" },
  { id: 13, name: "ميني بيتزا", nameEn: "Mini Pizza", price: 30, emoji: "🍕", cat: "meals" },
  { id: 14, name: "موية", nameEn: "Water", price: 5, emoji: "💧", cat: "drinks" },
];

const ORDER_STAGES = [
  { key: "confirmed", labelEn: "Order Confirmed", icon: "✓", desc: "Your order has been received" },
  { key: "preparing", labelEn: "Preparing", icon: "👨‍🍳", desc: "Our team is preparing your items" },
  { key: "onway", labelEn: "On the Way", icon: "🚶", desc: "A runner is heading to your seat" },
  { key: "delivered", labelEn: "Delivered", icon: "🎉", desc: "Enjoy! بالعافية" },
];

const SEAT_ROWS = [
  { row: "A", seats: [1,2,3,0,4,5,6,7,0,8,9,10] },
  { row: "B", seats: [1,2,3,0,4,5,6,7,0,8,9,10] },
  { row: "C", seats: [1,2,3,0,4,5,6,7,0,8,9,10] },
  { row: "D", seats: [1,2,3,0,4,5,6,7,0,8,9,10] },
  { row: "E", seats: [1,2,3,4,0,5,6,7,8,0,9,10,11,12] },
  { row: "F", seats: [1,2,3,4,0,5,6,7,8,0,9,10,11,12] },
  { row: "G", seats: [1,2,3,4,0,5,6,7,8,0,9,10,11,12] },
  { row: "H", seats: [1,2,3,4,0,5,6,7,8,0,9,10,11,12] },
];
const TAKEN = ["A3","A7","B5","B6","C2","C8","D4","E3","E7","E8","F1","F10","G5","G6","H2","H11"];

const GENRE_EMOJI = { Action:"⚔️", Horror:"😱", "Sci-Fi":"🚀", Animation:"🐰", Comedy:"😂", Drama:"🎭", Romance:"💕", Thriller:"🔪", Fantasy:"🐉", Adventure:"🏔️", Family:"👨‍👩‍👦", default:"🎬" };

const font = `'Outfit', sans-serif`;
const fontD = `'Bebas Neue', sans-serif`;
const oc = "#e85d04";

/*──────────────────────────────────────────────
  API HELPER — tries Claude API, falls back
──────────────────────────────────────────────*/
async function askClaude(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  return data.content?.filter((b) => b.type === "text").map((b) => b.text).join("\n") || "";
}

function parseJSON(raw) {
  try { const m = raw.match(/\[[\s\S]*\]/); if (m) return JSON.parse(m[0]); } catch {}
  return null;
}

/*──────────────────────────────────────────────
  COMPONENT
──────────────────────────────────────────────*/
export default function SeatBite() {
  const [step, setStep] = useState(0);
  const [movies, setMovies] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [movie, setMovie] = useState(null);
  const [venues, setVenues] = useState([]);
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [venue, setVenue] = useState(null);
  const [seat, setSeat] = useState(null);
  const [cart, setCart] = useState({});
  const [filter, setFilter] = useState("all");
  const [langF, setLangF] = useState("all");
  const [oStage, setOStage] = useState(0);
  const [loadMsg, setLoadMsg] = useState("Searching Saudi cinemas...");

  /* ── Fetch movies: try API, fallback to static ── */
  useEffect(() => {
    let cancelled = false;
    const msgs = ["Searching Saudi cinemas...", "Checking muvi Cinemas...", "Scanning AMC listings...", "Loading VOX showtimes...", "Almost ready..."];
    let i = 0;
    const iv = setInterval(() => { i = (i + 1) % msgs.length; if (!cancelled) setLoadMsg(msgs[i]); }, 2200);

    (async () => {
      try {
        const raw = await askClaude(
          `Search for movies currently showing (now playing) in Saudi Arabia cinemas (muvi, AMC, VOX) right now in 2026. Return ONLY a JSON array, no other text. Each object: {"title":"...","genre":"...","rating":"PG-13","lang":"EN or AR","chains":["muvi","AMC","VOX"]}. Include 10-15 movies. Return ONLY the JSON array.`
        );
        const parsed = parseJSON(raw);
        if (parsed && parsed.length > 0 && !cancelled) {
          setMovies(parsed.map((m, i) => ({ ...m, id: i + 1, poster: GENRE_EMOJI[m.genre] || GENRE_EMOJI.default })));
          setIsLive(true);
        } else throw new Error("empty");
      } catch {
        // Fallback to curated data (still real movies)
        if (!cancelled) {
          setMovies(FALLBACK_MOVIES);
          setIsLive(false);
        }
      } finally {
        if (!cancelled) setLoadingMovies(false);
        clearInterval(iv);
      }
    })();
    return () => { cancelled = true; clearInterval(iv); };
  }, []);

  /* ── Fetch venues: try API, fallback to static ── */
  const fetchVenues = useCallback(async (selectedMovie) => {
    setLoadingVenues(true);
    setVenues([]);
    try {
      const chains = selectedMovie.chains || ["muvi", "AMC", "VOX"];
      const raw = await askClaude(
        `Search for cinemas/venues in Saudi Arabia currently showing "${selectedMovie.title}" at: ${chains.join(", ")}. Return ONLY a JSON array. Each object: {"chain":"muvi Cinemas or AMC Cinemas or VOX Cinemas","name":"Mall name","city":"City","area":"area/road"}. 6-10 venues. ONLY JSON.`
      );
      const parsed = parseJSON(raw);
      if (parsed && parsed.length > 0) {
        setVenues(parsed.map((v, i) => ({
          ...v, id: `v${i}`,
          chainShort: v.chain?.split(" ")[0] || "Cinema",
          color: Object.entries(CHAIN_COLORS).find(([k]) => v.chain?.toLowerCase().includes(k.toLowerCase()))?.[1] || oc,
        })));
      } else throw new Error("empty");
    } catch {
      // Fallback
      setVenues(getVenuesForMovie(selectedMovie));
    } finally {
      setLoadingVenues(false);
    }
  }, []);

  /* ── Order stage auto-advance ── */
  useEffect(() => {
    if (step === 4 && oStage < 3) { const t = setTimeout(() => setOStage((x) => x + 1), 3000); return () => clearTimeout(t); }
  }, [step, oStage]);

  const tItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const tPrice = Object.entries(cart).reduce((s, [id, q]) => { const it = MENU.find((m) => m.id === +id); return s + (it ? it.price * q : 0); }, 0);
  const add = (id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const rem = (id) => setCart((c) => { const n = { ...c }; if (n[id] > 1) n[id]--; else delete n[id]; return n; });
  const fMovies = movies.filter((m) => langF === "all" || m.lang === langF);
  const fMenu = MENU.filter((m) => filter === "all" || m.cat === filter);

  /* ── Styles ── */
  const btn = (p = true) => ({ background: p ? `linear-gradient(135deg, ${oc}, #dc2f02)` : "rgba(255,255,255,0.08)", color: "#fff", border: p ? "none" : "1px solid rgba(255,255,255,0.12)", padding: "12px 24px", borderRadius: 10, fontFamily: font, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", display: "inline-flex", alignItems: "center", gap: 8 });
  const cardSt = (sel) => ({ background: sel ? "rgba(232,93,4,0.15)" : "rgba(255,255,255,0.04)", border: sel ? `2px solid ${oc}` : "2px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 16, marginBottom: 10, cursor: "pointer", transition: "all 0.25s" });
  const fbtn = (a) => ({ padding: "6px 14px", borderRadius: 20, border: "none", background: a ? oc : "rgba(255,255,255,0.08)", color: a ? "#fff" : "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font });
  const stSeat = (st) => {
    const b = { width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, cursor: "pointer", border: "none", fontFamily: font, transition: "all 0.15s" };
    if (st === "t") return { ...b, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.15)", cursor: "not-allowed" };
    if (st === "s") return { ...b, background: oc, color: "#fff", boxShadow: `0 0 12px rgba(232,93,4,0.5)` };
    return { ...b, background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)" };
  };
  const glass = { background: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20, marginBottom: 16 };
  const Back = ({ to }) => <button onClick={() => setStep(to)} style={{ ...btn(false), padding: "6px 10px", fontSize: 12 }}>←</button>;

  const Skeleton = ({ count = 4 }) => (
    <>{Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "2px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 16, marginBottom: 10, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 52, height: 68, borderRadius: 10, background: "rgba(255,255,255,0.06)", animation: "shimmer 1.5s infinite" }} />
        <div style={{ flex: 1 }}>
          <div style={{ width: "70%", height: 14, borderRadius: 4, background: "rgba(255,255,255,0.06)", marginBottom: 8, animation: "shimmer 1.5s infinite" }} />
          <div style={{ width: "40%", height: 10, borderRadius: 4, background: "rgba(255,255,255,0.04)", animation: "shimmer 1.5s infinite" }} />
        </div>
      </div>
    ))}</>
  );

  const StatusBadge = () => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: isLive ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.08)", border: isLive ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(255,255,255,0.12)", padding: "3px 10px", borderRadius: 20, fontSize: 11, color: isLive ? "#22c55e" : "rgba(255,255,255,0.5)", fontWeight: 600 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: isLive ? "#22c55e" : "rgba(255,255,255,0.3)", animation: isLive ? "pulse 1.5s infinite" : "none" }} />
      {isLive ? "LIVE" : "CACHED"}
    </span>
  );

  return (
    <div style={{ fontFamily: font, minHeight: "100vh", background: "#0a0a0f", color: "#f0ece4", position: "relative", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.04, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      <header style={{ background: `linear-gradient(135deg, ${oc} 0%, #dc2f02 100%)`, padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 4px 30px rgba(232,93,4,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: "#fff", color: oc, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, fontSize: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>🍿</div>
          <div style={{ fontFamily: fontD, fontSize: 28, letterSpacing: 2, lineHeight: 1 }}>SEATBITE</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {tItems > 0 && <span style={{ background: "rgba(232,93,4,0.15)", color: oc, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{tItems} · {tPrice} ر.س</span>}
          <button style={{ ...btn(false), padding: "8px 14px", fontSize: 13, background: "rgba(255,255,255,0.15)", border: "none" }}>تسجيل</button>
        </div>
      </header>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 16px 100px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 28 }}>
          {[0,1,2,3,4].map((i) => <div key={i} style={{ width: step === i ? 32 : 10, height: 10, borderRadius: 5, background: step >= i ? oc : "rgba(255,255,255,0.15)", transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)" }} />)}
        </div>

        {/* ═══ STEP 0: Movies ═══ */}
        {step === 0 && <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <h1 style={{ fontFamily: fontD, fontSize: 32, letterSpacing: 1.5, color: "#fff" }}>NOW SHOWING 🇸🇦</h1>
            {!loadingMovies && <StatusBadge />}
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 20 }}>
            {loadingMovies ? loadMsg : `${movies.length} movies · muvi · AMC · VOX`}
          </p>
          {!loadingMovies && <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {[["all","All"],["EN","English"],["AR","عربي"]].map(([k,l]) => <button key={k} style={fbtn(langF === k)} onClick={() => setLangF(k)}>{l}</button>)}
          </div>}
          {loadingMovies && <Skeleton count={5} />}
          {!loadingMovies && fMovies.map((m) => (
            <div key={m.id} style={cardSt(movie?.id === m.id)} onClick={() => setMovie(m)}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 52, height: 68, borderRadius: 10, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>{m.poster}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{m.title}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>{m.genre} · {m.rating} · {m.lang}</div>
                  {m.chains && <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                    {m.chains.map((c) => <span key={c} style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: `${CHAIN_COLORS[c] || "#555"}25`, color: CHAIN_COLORS[c] || "#aaa", fontWeight: 600 }}>{c}</span>)}
                  </div>}
                </div>
                {movie?.id === m.id && <div style={{ color: oc, fontSize: 20 }}>●</div>}
              </div>
            </div>
          ))}
          {!loadingMovies && <button style={{ ...btn(), width: "100%", justifyContent: "center", marginTop: 12, opacity: movie ? 1 : 0.4 }} disabled={!movie} onClick={() => { setStep(1); fetchVenues(movie); }}>Find Cinemas Showing This →</button>}
        </>}

        {/* ═══ STEP 1: Venues ═══ */}
        {step === 1 && <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Back to={0} /><span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{movie.title}</span></div>
          <h1 style={{ fontFamily: fontD, fontSize: 32, letterSpacing: 1.5, marginBottom: 4, color: "#fff" }}>WHERE TO WATCH</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 20 }}>
            {loadingVenues ? "Finding cinemas showing this movie..." : `${venues.length} venues showing "${movie.title}"`}
          </p>
          {loadingVenues && <Skeleton count={4} />}
          {!loadingVenues && venues.map((v) => (
            <div key={v.id} style={cardSt(venue?.id === v.id)} onClick={() => setVenue(v)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{v.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>{v.area} · {v.city}</div>
                </div>
                <span style={{ fontSize: 11, color: v.color, background: `${v.color}20`, padding: "3px 8px", borderRadius: 6, fontWeight: 600 }}>{v.chainShort}</span>
              </div>
            </div>
          ))}
          {!loadingVenues && venues.length > 0 && <button style={{ ...btn(), width: "100%", justifyContent: "center", marginTop: 12, opacity: venue ? 1 : 0.4 }} disabled={!venue} onClick={() => setStep(2)}>Choose Your Seat →</button>}
        </>}

        {/* ═══ STEP 2: Seat ═══ */}
        {step === 2 && <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Back to={1} /><span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{venue.chainShort} · {venue.name}</span></div>
          <h1 style={{ fontFamily: fontD, fontSize: 32, letterSpacing: 1.5, marginBottom: 4, color: "#fff" }}>CHOOSE YOUR SEAT</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 20 }}>Select the seat you're currently sitting in</p>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ width: "70%", height: 4, margin: "0 auto 6px", background: `linear-gradient(90deg, transparent, rgba(232,93,4,0.4), transparent)`, borderRadius: 2 }} />
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: 3 }}>الشاشة · SCREEN</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginBottom: 16 }}>
            {SEAT_ROWS.map(({ row, seats }) => (
              <div key={row} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 16, fontSize: 10, color: "rgba(255,255,255,0.25)", textAlign: "right", marginRight: 4 }}>{row}</span>
                {seats.map((se, i) => se === 0 ? <div key={`g${i}`} style={{ width: 20 }} /> : (
                  <button key={`${row}${se}`} style={stSeat(TAKEN.includes(`${row}${se}`) ? "t" : seat === `${row}${se}` ? "s" : "o")}
                    disabled={TAKEN.includes(`${row}${se}`)} onClick={() => setSeat(`${row}${se}`)}>{se}</button>
                ))}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 16 }}>
            {[["Available","rgba(255,255,255,0.12)"],["Your Seat",oc],["Occupied","rgba(255,255,255,0.06)"]].map(([l,c]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: c }} />{l}
              </div>
            ))}
          </div>
          {seat && <div style={{ textAlign: "center", marginBottom: 8, fontSize: 14 }}>You're in seat <strong style={{ color: oc }}>{seat}</strong></div>}
          <button style={{ ...btn(), width: "100%", justifyContent: "center", opacity: seat ? 1 : 0.4 }} disabled={!seat} onClick={() => setStep(3)}>Order to My Seat →</button>
        </>}

        {/* ═══ STEP 3: Menu ═══ */}
        {step === 3 && <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Back to={2} /><span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Seat {seat} · {venue.name}</span></div>
          <h1 style={{ fontFamily: fontD, fontSize: 32, letterSpacing: 1.5, marginBottom: 4, color: "#fff" }}>SNACKS & DRINKS 🍿</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 20 }}>نوصلك لمقعدك · Delivered to seat {seat}</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {[["all","الكل"],["snacks","سناكس"],["meals","وجبات"],["drinks","مشروبات"]].map(([k,l]) => <button key={k} style={fbtn(filter === k)} onClick={() => setFilter(k)}>{l}</button>)}
          </div>
          {fMenu.map((item) => (
            <div key={item.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>{item.emoji}</span>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{item.nameEn}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{item.name}</div>
                  <div style={{ fontSize: 13, color: oc, fontWeight: 600 }}>{item.price} ر.س</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {cart[item.id] ? <>
                  <button style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font }} onClick={() => rem(item.id)}>−</button>
                  <span style={{ fontWeight: 600, minWidth: 18, textAlign: "center" }}>{cart[item.id]}</span>
                  <button style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font }} onClick={() => add(item.id)}>+</button>
                </> : <button style={{ ...btn(), padding: "6px 14px", fontSize: 12 }} onClick={() => add(item.id)}>Add</button>}
              </div>
            </div>
          ))}
          {tItems > 0 && (
            <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(10,10,15,0.95)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "14px 16px", zIndex: 50 }}>
              <div style={{ maxWidth: 520, margin: "0 auto" }}>
                <button style={{ ...btn(), width: "100%", justifyContent: "center", padding: "14px 24px", fontSize: 15 }} onClick={() => { setStep(4); setOStage(0); }}>اطلب الآن · {tPrice} ر.س</button>
              </div>
            </div>
          )}
        </>}

        {/* ═══ STEP 4: Order Timeline ═══ */}
        {step === 4 && <>
          <h1 style={{ fontFamily: fontD, fontSize: 32, letterSpacing: 1.5, marginBottom: 4, color: "#fff" }}>!تم الطلب</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 20 }}>Delivering to seat {seat} · {venue.name}, {venue.city}</p>
          <div style={glass}>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{movie.title} · {venue.chain}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginBottom: 16 }}>{venue.name} · {venue.area}</div>
            {ORDER_STAGES.map((st, i) => (
              <div key={st.key}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: oStage > i ? oc : oStage === i ? "rgba(232,93,4,0.2)" : "rgba(255,255,255,0.06)", border: oStage === i ? `2px solid ${oc}` : "2px solid transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, transition: "all 0.6s", flexShrink: 0 }}>
                    {oStage >= i ? st.icon : ""}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: oStage >= i ? "#fff" : "rgba(255,255,255,0.25)" }}>{st.labelEn}</div>
                    <div style={{ fontSize: 12, color: oStage >= i ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.15)" }}>{st.desc}</div>
                  </div>
                  {oStage === i && i < 3 && <div style={{ width: 8, height: 8, borderRadius: "50%", background: oc, animation: "pulse 1.5s infinite" }} />}
                </div>
                {i < ORDER_STAGES.length - 1 && <div style={{ width: 3, height: 36, background: oStage > i ? oc : "rgba(255,255,255,0.08)", marginLeft: 17, transition: "background 0.6s" }} />}
              </div>
            ))}
          </div>
          <div style={glass}>
            <div style={{ fontWeight: 600, marginBottom: 10 }}>Your Items</div>
            {Object.entries(cart).map(([id, qty]) => { const it = MENU.find((m) => m.id === +id); return it ? (
              <div key={id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6, color: "rgba(255,255,255,0.6)" }}>
                <span>{it.emoji} {it.nameEn} × {qty}</span><span>{it.price * qty} ر.س</span>
              </div>
            ) : null; })}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
              <span>المجموع · Total</span><span style={{ color: oc }}>{tPrice} ر.س</span>
            </div>
          </div>
          <button style={{ ...btn(false), width: "100%", justifyContent: "center", marginTop: 8 }}
            onClick={() => { setStep(0); setMovie(null); setVenue(null); setSeat(null); setCart({}); setOStage(0); }}>
            طلب جديد · New Order
          </button>
        </>}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.5)} }
        @keyframes shimmer { 0%{opacity:0.3} 50%{opacity:0.6} 100%{opacity:0.3} }
        * { box-sizing: border-box; margin: 0; }
        button:hover { filter: brightness(1.1); }
      `}</style>
    </div>
  );
}