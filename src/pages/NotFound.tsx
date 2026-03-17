import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const DISPLAY = "'Bricolage Grotesque', sans-serif";
const BODY    = "'DM Sans', sans-serif";

const QUICK_LINKS = [
  { to:"/colleges", icon:"school",          label:"Browse Colleges" },
  { to:"/recommend",icon:"auto_awesome",    label:"Get AI Match" },
  { to:"/compare",  icon:"compare_arrows",  label:"Compare Colleges" },
  { to:"/cutoff",   icon:"grade",           label:"Cutoff Checker" },
  { to:"/roi",      icon:"calculate",       label:"ROI Calculator" },
  { to:"/budget",   icon:"wallet",          label:"Budget Planner" },
];

export default function NotFound() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20 bg-[#f6f7f8]" style={{ fontFamily: BODY }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=DM+Sans:ital,opsz,wght@0,9..40,100..900;1,9..40,100..900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined { font-family:'Material Symbols Outlined'; font-weight:normal; font-style:normal; line-height:1; display:inline-block; white-space:nowrap; direction:ltr; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .float { animation:float 3s ease-in-out infinite; }
        .fade-in { animation:fadeUp 0.6s ease both; }
        .fade-in-2 { animation:fadeUp 0.6s ease both 0.15s; }
        .fade-in-3 { animation:fadeUp 0.6s ease both 0.3s; }
        .link-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(86,86,153,0.12); }
        .link-card { transition:transform 0.2s,box-shadow 0.2s; }
      `}</style>

      <div className="max-w-2xl w-full text-center">

        {/* floating 404 illustration */}
        <div className="float mb-8 inline-block">
          <div className="relative inline-flex items-center justify-center w-40 h-40 rounded-3xl shadow-2xl"
            style={{ background:"linear-gradient(135deg,#0b2647,#565699)" }}>
            {/* glow */}
            <div className="absolute inset-0 rounded-3xl blur-2xl opacity-30"
              style={{ background:"linear-gradient(135deg,#565699,#7b7bd4)" }} />
            <div className="relative text-center">
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1" style={{ fontFamily:DISPLAY }}>Error</p>
              <p className="text-white font-extrabold leading-none" style={{ fontFamily:DISPLAY, fontSize:"4rem" }}>404</p>
            </div>
          </div>
        </div>

        {/* text */}
        <h1 className="fade-in text-4xl font-extrabold text-slate-900 mb-3" style={{ fontFamily:DISPLAY, letterSpacing:"-0.02em" }}>
          Page Not Found
        </h1>
        <p className="fade-in-2 text-slate-500 text-base mb-2 leading-relaxed max-w-md mx-auto">
          The page <code className="bg-gray-100 px-2 py-0.5 rounded text-sm text-slate-700">{location.pathname}</code> doesn't exist.
        </p>
        <p className="fade-in-2 text-slate-400 text-sm mb-10">
          It may have been moved, deleted, or you might have mistyped the URL.
        </p>

        {/* primary CTAs */}
        <div className="fade-in-3 flex flex-wrap justify-center gap-3 mb-12">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-[#0b2647] text-[#0b2647] text-sm font-bold hover:bg-[#0b2647]/5 transition-all"
            style={{ fontFamily:DISPLAY }}>
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Go Back
          </button>
          <Link to="/"
            className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white transition-all hover:opacity-90 hover:scale-105"
            style={{ background:"linear-gradient(135deg,#0b2647,#565699)", fontFamily:DISPLAY, textDecoration:"none" }}>
            <span className="material-symbols-outlined text-sm">home</span>
            Back to Home
          </Link>
        </div>

        {/* quick links grid */}
        <div className="fade-in-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4" style={{ fontFamily:DISPLAY }}>
            Or go somewhere useful
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {QUICK_LINKS.map((link, i) => (
              <Link key={link.to} to={link.to}
                className="link-card bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm"
                style={{ textDecoration:"none", animationDelay:`${i*50}ms` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background:"rgba(86,86,153,0.08)" }}>
                  <span className="material-symbols-outlined text-base text-[#565699]">{link.icon}</span>
                </div>
                <span className="text-sm font-semibold text-slate-700 text-left leading-snug" style={{ fontFamily:DISPLAY }}>
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* footer note */}
        <p className="mt-12 text-xs text-gray-300">
          CollegeMatch · Helping Indian students find the right college
        </p>
      </div>
    </div>
  );
}