import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { getCollegeById } from "@/data/colleges";
import type { College } from "@/data/colleges";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const fmtFee = (n: number) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(2)}L` : `₹${(n / 1000).toFixed(0)}K`;

const typeColor: Record<string, string> = {
  Government: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Private:    "bg-violet-100 text-violet-700 border-violet-200",
  Deemed:     "bg-amber-100 text-amber-700 border-amber-200",
};

const TABS = [
  { id: "about",      label: "About" },
  { id: "courses",    label: "Courses & Fees" },
  { id: "placements", label: "Placements" },
  { id: "facilities", label: "Facilities" },
];

export default function CollegeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const college = id ? getCollegeById(id) : undefined;

  const [activeTab, setActiveTab] = useState("about");
  const [saved, setSaved]         = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const token  = localStorage.getItem("token");
    if (!userId || !token || !college) return;
    fetch(`${API}/api/profile/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        const names: string[] = (data.savedColleges || []).map((c: any) =>
          typeof c === "string" ? c : c.name
        );
        setSaved(names.includes(college.name));
      })
      .catch(() => {});
  }, [college]);

  // scroll to section — offset accounts for header (~64px) only, tabs are NOT sticky
  const scrollToSection = (tabId: string) => {
    setActiveTab(tabId);
    const el = document.getElementById(`section-${tabId}`);
    if (!el) return;
    const OFFSET = 80; // just the header
    const y = el.getBoundingClientRect().top + window.scrollY - OFFSET;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const handleSave = async () => {
    if (!college) return;
    const userId = localStorage.getItem("userId");
    const token  = localStorage.getItem("token");
    if (!userId || !token) { navigate("/login"); return; }
    const endpoint = saved ? `${API}/api/profile/unsave` : `${API}/api/profile/save`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId, collegeName: college.name }),
    });
    if (res.ok) setSaved(s => !s);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  if (!college) {
    return (
      <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <Header />
        <div className="flex-1 flex items-center justify-center flex-col gap-4 text-slate-500">
          <p className="text-xl font-bold">College not found</p>
          <Link to="/colleges" className="text-[#0b2647] font-semibold underline">← Back to Colleges</Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#f6f7f8] text-slate-900 antialiased"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-weight: normal; font-style: normal;
          line-height: 1; display: inline-block;
          white-space: nowrap; direction: ltr;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .course-card:hover { box-shadow: 0 8px 24px rgba(11,38,71,0.10); }
        .stat-card { background: rgba(11,38,71,0.04); border: 1px solid rgba(11,38,71,0.08); }
      `}</style>

      {/* ── sticky header only ── */}
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <nav className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <Link to="/" className="hover:text-[#0b2647]">Home</Link>
          <span>›</span>
          <Link to="/colleges" className="hover:text-[#0b2647]">Colleges</Link>
          <span>›</span>
          <span className="text-slate-600">{college.shortName}</span>
        </nav>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">

        {/* ── HERO ── */}
        <div className="relative overflow-hidden rounded-2xl mb-6 shadow-2xl min-h-[200px]">
          <img
            src={college.imageUrl}
            alt={college.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={e => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80";
            }}
          />
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(135deg,rgba(11,38,71,0.93) 0%,rgba(26,74,138,0.86) 100%)" }} />

          <div className="relative z-10 p-6 md:p-10">
            <div className="flex flex-wrap gap-2 mb-4">
              {college.approvedBy.map(b => (
                <span key={b} className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold tracking-wider uppercase border border-white/20 text-white">
                  {b}
                </span>
              ))}
            </div>

            <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-white mb-3 leading-tight">
              {college.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-blue-200 mb-6 text-sm">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">location_on</span>
                {college.city}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">calendar_today</span>
                Est. {college.established}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-yellow-400">star</span>
                <span className="font-bold text-white">{college.rating} Rating</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">workspace_premium</span>
                Rank #{college.ranking}
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${typeColor[college.type]}`}>
                {college.type}
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              <a href={college.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#ffbf00] hover:bg-amber-400 text-[#0b2647] px-6 py-3 rounded-xl font-bold transition-all shadow-lg text-sm">
                Visit Website
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </a>
              {college.applicationLink && (
                <a href={college.applicationLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 border-2 border-white/50 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-bold transition-all text-sm">
                  Apply Now
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
              )}
              <button onClick={handleSave}
                className="flex items-center gap-2 border-2 border-white/30 hover:bg-white/10 text-white px-5 py-3 rounded-xl font-bold transition-all text-sm">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill={saved ? "#ef4444" : "none"} stroke={saved ? "#ef4444" : "white"} strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {saved ? "Saved" : "Save"}
              </button>
              <button onClick={handleShare}
                className="flex items-center gap-2 border-2 border-white/30 hover:bg-white/10 text-white px-5 py-3 rounded-xl font-bold transition-all text-sm">
                <span className="material-symbols-outlined text-sm">share</span>
                {showCopied ? "Copied!" : "Share"}
              </button>
            </div>
          </div>
        </div>

        {/* ── TABS — NOT sticky, just inline ── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-8 overflow-hidden">
          <div className="flex overflow-x-auto no-scrollbar">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? "border-[#0b2647] text-[#0b2647] bg-[#0b2647]/5"
                    : "border-transparent text-slate-500 hover:text-[#0b2647] hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── CONTENT GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-12">

            {/* ── ABOUT ── */}
            <section id="section-about">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0b2647]">info</span>
                About the Institution
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">{college.description}</p>
              <p className="text-slate-600 leading-relaxed">
                Affiliated with <strong>{college.affiliation}</strong>, the institution has been
                shaping careers since <strong>{college.established}</strong>. With{" "}
                {college.courses.length} programs, it continues to be a top choice for students
                across India.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                {[
                  { icon: "menu_book",    label: "Programs",    value: `${college.courses.length}+` },
                  { icon: "trending_up",  label: "Avg Package", value: `₹${college.placement.averagePackage}L` },
                  { icon: "emoji_events", label: "Top Package", value: `₹${college.placement.highestPackage}L` },
                  { icon: "verified",     label: "Placed",      value: `${college.placement.placementRate}%` },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="stat-card rounded-xl p-4 text-center">
                    <span className="material-symbols-outlined text-[#0b2647] text-2xl">{icon}</span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{label}</p>
                    <p className="text-xl font-extrabold text-[#0b2647] mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ── COURSES ── */}
            <section id="section-courses">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0b2647]">menu_book</span>
                Courses Offered
              </h2>
              <div className="space-y-4">
                {college.courses.map(course => (
                  <div key={course.id}
                    className="course-card p-5 md:p-6 bg-white rounded-xl border border-slate-200 transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{course.name}</h3>
                        <div className="flex flex-wrap gap-3 mt-1.5 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            {course.duration}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">groups</span>
                            {course.seats} seats
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">grade</span>
                            Cutoff: {course.cutoffMarks}%
                          </span>
                        </div>
                        {course.specializations && course.specializations.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {course.specializations.map(s => (
                              <span key={s} className="text-xs bg-[#0b2647]/5 text-[#0b2647] px-2 py-0.5 rounded-md font-semibold">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="md:text-right shrink-0">
                        <p className="text-xl font-extrabold text-blue-600">{fmtFee(course.fees)}/yr</p>
                        {college.applicationLink && (
                          <a href={college.applicationLink} target="_blank" rel="noopener noreferrer"
                            className="inline-block mt-2 text-xs font-bold text-[#0b2647] border border-[#0b2647]/30 px-3 py-1.5 rounded-lg hover:bg-[#0b2647]/5 transition-colors">
                            Apply →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── PLACEMENTS ── */}
            <section id="section-placements">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0b2647]">trending_up</span>
                Placement Highlights
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[
                  { label: "Average Package", value: `₹${college.placement.averagePackage} LPA` },
                  { label: "Highest Package", value: `₹${college.placement.highestPackage} LPA` },
                  { label: "Placement Rate",  value: `${college.placement.placementRate}%` },
                ].map(({ label, value }) => (
                  <div key={label} className="stat-card rounded-xl p-6">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-3xl font-extrabold text-[#0b2647]">{value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Top Recruiters</p>
                <div className="flex flex-wrap gap-3">
                  {college.placement.topRecruiters.map(r => (
                    <span key={r} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 shadow-sm">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* ── FACILITIES ── */}
            <section id="section-facilities">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0b2647]">apartment</span>
                Campus Facilities
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {college.facilities.map(f => (
                  <div key={f} className="flex items-center gap-2.5 bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
                    <span className="material-symbols-outlined text-[#0b2647] text-xl">check_circle</span>
                    <span className="text-sm font-medium text-slate-700">{f}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── SIDEBAR ── */}
          <aside className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-base font-bold mb-4">Quick Facts</h3>
              <ul className="space-y-4">
                {[
                  { icon: "account_balance",  label: "Affiliation",   value: college.affiliation },
                  { icon: "category",         label: "Type",          value: college.type },
                  { icon: "calendar_today",   label: "Established",   value: String(college.established) },
                  { icon: "workspace_premium",label: "NIRF Rank",     value: `#${college.ranking}` },
                  { icon: "star",             label: "Rating",        value: `${college.rating} / 5` },
                  { icon: "menu_book",        label: "Total Courses", value: `${college.courses.length} Programs` },
                ].map(({ icon, label, value }) => (
                  <li key={label} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#0b2647] text-xl mt-0.5">{icon}</span>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</p>
                      <p className="text-sm font-semibold text-slate-800">{value}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-base font-bold mb-4">Accreditations</h3>
              <div className="flex flex-wrap gap-2">
                {college.approvedBy.map(a => (
                  <span key={a} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-bold">
                    ✓ {a}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-base font-bold mb-4">Fee Range</h3>
              <div className="space-y-2.5">
                {college.courses.slice(0, 5).map(c => (
                  <div key={c.id} className="flex justify-between items-center">
                    <span className="text-xs text-slate-600 truncate mr-2">
                      {c.name.replace("B.Tech ", "").replace("B.E. ", "").replace("M.Tech ", "M.")}
                    </span>
                    <span className="text-xs font-bold text-[#0b2647] shrink-0">{fmtFee(c.fees)}/yr</span>
                  </div>
                ))}
                {college.courses.length > 5 && (
                  <p className="text-xs text-slate-400">+{college.courses.length - 5} more</p>
                )}
              </div>
            </div>

            <div className="bg-[#0b2647] text-white p-6 rounded-xl shadow-lg">
              <h3 className="text-base font-bold mb-2">Need help deciding?</h3>
              <p className="text-blue-200 text-sm mb-5">
                Let our AI match you with the best programs based on your profile.
              </p>
              <Link to="/recommend"
                className="w-full flex items-center justify-center gap-2 bg-[#ffbf00] text-[#0b2647] py-3 rounded-xl font-extrabold text-sm hover:bg-amber-400 transition-colors">
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                Get AI Recommendation
              </Link>
            </div>
          </aside>
        </div>
      </main>

      {/* ── STICKY BOTTOM BAR ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3 px-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex h-10 w-10 bg-[#0b2647]/10 rounded-full items-center justify-center text-[#0b2647]">
              <span className="material-symbols-outlined">smart_toy</span>
            </div>
            <div>
              <p className="font-bold text-sm">Not sure if this is the right fit?</p>
              <p className="text-xs text-slate-500">Our AI can help you decide based on your profile.</p>
            </div>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Link to="/colleges"
              className="flex-1 sm:flex-none px-5 py-2.5 border-2 border-[#0b2647] text-[#0b2647] font-bold rounded-xl text-sm hover:bg-[#0b2647]/5 transition-all text-center">
              ← All Colleges
            </Link>
            <Link to="/recommend"
              className="flex-1 sm:flex-none px-5 py-2.5 bg-[#0b2647] text-white font-bold rounded-xl text-sm shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
              Get Recommendation
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}