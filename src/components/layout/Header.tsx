import { Link, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { AuthModal } from "@/components/auth/AuthModal";
import { User, Heart, Star, FileText, LogOut, ChevronDown } from "lucide-react";

const DISPLAY = "'Bricolage Grotesque', sans-serif";
const BODY    = "'DM Sans', sans-serif";

// ── nav links ──
const NAV_LINKS = [
  { to: "/colleges", label: "Colleges" },
  { to: "/recommend", label: "AI Match" },
];

// ── tools dropdown items ──
const TOOLS = [
  { to: "/compare", icon: "compare_arrows", label: "Compare Colleges",  desc: "Side-by-side view" },
  { to: "/cutoff",  icon: "grade",          label: "Cutoff Checker",    desc: "Am I eligible?" },
  { to: "/roi",     icon: "calculate",      label: "ROI Calculator",    desc: "Is it worth it?" },
  { to: "/budget",  icon: "wallet",         label: "Budget Planner",    desc: "Total cost breakdown" },
];

export function Header() {
  const location = useLocation();
  const [authOpen, setAuthOpen]       = useState(false);
  const [userOpen, setUserOpen]       = useState(false);
  const [toolsOpen, setToolsOpen]     = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);

  const userRef  = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = !!localStorage.getItem("token");
  const userStr    = localStorage.getItem("user");
  const user       = userStr ? JSON.parse(userStr) : null;

  const isActive = (path: string) => location.pathname === path;

  // close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userRef.current  && !userRef.current.contains(e.target as Node))  setUserOpen(false);
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) setToolsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    window.location.href = "/";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=DM+Sans:ital,opsz,wght@0,9..40,100..900;1,9..40,100..900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined { font-family:'Material Symbols Outlined'; font-weight:normal; font-style:normal; line-height:1; display:inline-block; white-space:nowrap; direction:ltr; }
        .nav-link { position:relative; }
        .nav-link::after { content:''; position:absolute; bottom:-4px; left:0; width:0; height:2px; background:#565699; border-radius:2px; transition:width 0.2s ease; }
        .nav-link:hover::after, .nav-link.active::after { width:100%; }
        .tools-item:hover { background:rgba(86,86,153,0.06); }
        @keyframes fadeDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .dropdown-anim { animation:fadeDown 0.18s ease both; }
        @keyframes slideDown { from{opacity:0;max-height:0} to{opacity:1;max-height:400px} }
        .mobile-menu { animation:slideDown 0.25s ease both; overflow:hidden; }
      `}</style>

      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-md shadow-sm" style={{ fontFamily: BODY }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            {/* ── LOGO ── */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0" style={{ textDecoration:"none" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm"
                style={{ background:"linear-gradient(135deg,#0b2647,#565699)" }}>
                <span className="material-symbols-outlined text-sm">school</span>
              </div>
              <span className="text-lg font-extrabold text-slate-900" style={{ fontFamily:DISPLAY, letterSpacing:"-0.02em" }}>
                CollegeMatch
              </span>
            </Link>

            {/* ── DESKTOP NAV ── */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(link => (
                <Link key={link.to} to={link.to}
                  className={`nav-link px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${isActive(link.to) ? "text-[#565699] active" : "text-slate-600 hover:text-[#565699]"}`}
                  style={{ fontFamily:DISPLAY, textDecoration:"none" }}>
                  {link.label}
                </Link>
              ))}

              {/* Tools dropdown */}
              <div className="relative" ref={toolsRef}>
                <button
                  onClick={() => setToolsOpen(o => !o)}
                  className={`nav-link flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${toolsOpen ? "text-[#565699]" : "text-slate-600 hover:text-[#565699]"}`}
                  style={{ fontFamily:DISPLAY }}>
                  Tools
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${toolsOpen ? "rotate-180" : ""}`} />
                </button>

                {toolsOpen && (
                  <div className="dropdown-anim absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden p-2">
                    {TOOLS.map(tool => (
                      <Link key={tool.to} to={tool.to}
                        onClick={() => setToolsOpen(false)}
                        className="tools-item flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
                        style={{ textDecoration:"none" }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background:"rgba(86,86,153,0.1)" }}>
                          <span className="material-symbols-outlined text-sm text-[#565699]">{tool.icon}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800" style={{ fontFamily:DISPLAY }}>{tool.label}</p>
                          <p className="text-xs text-gray-400">{tool.desc}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* ── RIGHT SIDE ── */}
            <div className="flex items-center gap-3">
              {isLoggedIn ? (
                <div className="relative" ref={userRef}>
                  <button
                    onClick={() => setUserOpen(o => !o)}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-gray-200 hover:border-[#565699] transition-colors shadow-sm">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ background:"linear-gradient(135deg,#0b2647,#565699)", fontFamily:DISPLAY }}>
                      {user?.name ? user.name[0].toUpperCase() : <User className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-sm font-semibold text-slate-700 hidden sm:block max-w-[80px] truncate" style={{ fontFamily:DISPLAY }}>
                      {user?.name?.split(" ")[0] || "Account"}
                    </span>
                    <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${userOpen ? "rotate-180" : ""}`} />
                  </button>

                  {userOpen && (
                    <div className="dropdown-anim absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                      {/* user info */}
                      <div className="px-4 py-3 border-b border-gray-100" style={{ background:"linear-gradient(135deg,rgba(86,86,153,0.05),rgba(11,38,71,0.03))" }}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                            style={{ background:"linear-gradient(135deg,#0b2647,#565699)", fontFamily:DISPLAY }}>
                            {user?.name?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-gray-900 truncate" style={{ fontFamily:DISPLAY }}>{user?.name}</p>
                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* menu */}
                      <div className="py-1.5 px-1.5">
                        {[
                          { to:"/profile",           icon:<User className="w-4 h-4 text-[#565699]" />,    label:"My Profile" },
                          { to:"/profile",            icon:<Heart className="w-4 h-4 text-red-400" />,    label:"Saved Colleges" },
                          { to:"/recommend",          icon:<Star className="w-4 h-4 text-amber-400" />,   label:"AI Recommendations" },
                          { to:"/compare",            icon:<span className="material-symbols-outlined text-base text-blue-500">compare_arrows</span>, label:"Compare" },
                        ].map(item => (
                          <Link key={item.label} to={item.to}
                            onClick={() => setUserOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            style={{ textDecoration:"none", fontFamily:BODY }}>
                            {item.icon}
                            {item.label}
                          </Link>
                        ))}
                      </div>

                      <div className="border-t border-gray-100 p-1.5">
                        <button onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
                          style={{ fontFamily:BODY }}>
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={() => setAuthOpen(true)}
                  className="px-5 py-2 rounded-full text-sm font-bold text-white transition-all hover:opacity-90 hover:scale-105 active:scale-95 shadow-sm"
                  style={{ background:"linear-gradient(135deg,#0b2647,#565699)", fontFamily:DISPLAY }}>
                  Login / Register
                </button>
              )}

              {/* mobile hamburger */}
              <button
                onClick={() => setMobileOpen(o => !o)}
                className="md:hidden flex flex-col gap-1.5 w-8 h-8 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                <span className={`block w-5 h-0.5 bg-slate-600 rounded transition-all ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
                <span className={`block w-5 h-0.5 bg-slate-600 rounded transition-all ${mobileOpen ? "opacity-0" : ""}`} />
                <span className={`block w-5 h-0.5 bg-slate-600 rounded transition-all ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* ── MOBILE MENU ── */}
        {mobileOpen && (
          <div className="mobile-menu md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
            {NAV_LINKS.map(link => (
              <Link key={link.to} to={link.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${isActive(link.to) ? "bg-indigo-50 text-[#565699]" : "text-slate-700 hover:bg-gray-50"}`}
                style={{ textDecoration:"none", fontFamily:DISPLAY }}>
                {link.label}
              </Link>
            ))}

            {/* tools in mobile */}
            <div className="pt-2 pb-1">
              <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1" style={{ fontFamily:DISPLAY }}>Tools</p>
              {TOOLS.map(tool => (
                <Link key={tool.to} to={tool.to}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors"
                  style={{ textDecoration:"none", fontFamily:DISPLAY }}>
                  <span className="material-symbols-outlined text-base text-[#565699]">{tool.icon}</span>
                  {tool.label}
                </Link>
              ))}
            </div>

            {!isLoggedIn && (
              <div className="pt-2">
                <button onClick={() => { setAuthOpen(true); setMobileOpen(false); }}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white"
                  style={{ background:"linear-gradient(135deg,#0b2647,#565699)", fontFamily:DISPLAY }}>
                  Login / Register
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}