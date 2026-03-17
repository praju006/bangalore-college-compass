import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import HeroBackground from "@/components/HeroBackground";

// ── featured colleges mapped to their IDs in colleges.ts ──
const FEATURED_COLLEGES = [
  {
    id: "iisc",
    name: "Indian Institute of Science",
    location: "Bangalore, Karnataka",
    tag: "Research",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?w=600&q=80",
  },
  {
    id: "iit-bombay",
    name: "IIT Bombay",
    location: "Mumbai, Maharashtra",
    tag: "Engineering",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80",
  },
  {
    id: "iit-delhi",
    name: "IIT Delhi",
    location: "New Delhi, Delhi",
    tag: "Technology",
    image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=600&q=80",
  },
  {
    id: "iim-ahmedabad",
    name: "IIM Ahmedabad",
    location: "Ahmedabad, Gujarat",
    tag: "Management",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
  },
];

export default function Index() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-[#f6f6f7] text-slate-900"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700;800&family=Syne:wght@700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');
        .serif-sharp { font-family: 'Playfair Display', serif; }
        .material-symbols-outlined { font-family: 'Material Symbols Outlined'; font-weight: normal; font-style: normal; font-size: 24px; line-height: 1; letter-spacing: normal; text-transform: none; display: inline-block; white-space: nowrap; word-wrap: normal; direction: ltr; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        .fade-up-1 { animation: fadeUp 0.8s ease both 0.1s; }
        .fade-up-2 { animation: fadeUp 0.8s ease both 0.3s; }
        .fade-up-3 { animation: fadeUp 0.8s ease both 0.5s; }
        .fade-up-4 { animation: fadeUp 0.8s ease both 0.7s; }
        .float-anim { animation: float 4s ease-in-out infinite; }

        .card-shine {
          position: relative; overflow: hidden;
        }
        .card-shine::after {
          content: '';
          position: absolute; top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          transition: left 0.5s ease;
        }
        .card-shine:hover::after { left: 140%; }
      `}</style>

      <Header />

      {/* ── HERO ── */}
      <section className="relative flex min-h-[100vh] w-full flex-col items-center justify-center overflow-hidden px-6 py-28 text-center">

        {/* animated canvas background */}
        <HeroBackground />

        {/* subtle vignette over canvas */}
        <div className="absolute inset-0 z-[1]"
          style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(10,10,30,0.5) 100%)" }} />

        {/* content */}
        <div className="relative z-10 max-w-4xl">

          {/* eyebrow pill */}
          <div className="fade-up-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-md text-white/60 text-xs font-semibold tracking-widest uppercase mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f4c542] animate-pulse inline-block" />
            AI-Powered College Discovery for India
          </div>

          {/* headline */}
          <h1
            className="fade-up-2 serif-sharp font-bold leading-[1.1] text-white mb-6"
            style={{ fontSize: "clamp(2.4rem, 6vw, 5rem)", textShadow: "0 4px 40px rgba(0,0,0,0.5)" }}
          >
            Your Curated Path to the{" "}
            <span style={{ color: "#f4c542" }}>Right College</span>
          </h1>

          {/* subtext */}
          <p className="fade-up-3 mx-auto max-w-2xl text-base md:text-lg font-medium text-white/55 mb-10 leading-relaxed">
            A smart, AI-driven discovery platform designed to help Indian students find their perfect college — based on course, city, budget, and career goals.
          </p>

          {/* CTAs */}
          <div className="fade-up-3 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={() => navigate("/colleges")}
              className="w-full rounded-full px-8 py-4 text-sm font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-transform sm:w-auto"
              style={{ background: "#F4C542", color: "#1a1a3a", boxShadow: "0 8px 32px rgba(244,197,66,0.4)" }}
            >
              Explore Colleges
            </button>
            <button
              onClick={() => navigate("/recommend")}
              className="w-full rounded-full border border-white/25 bg-white/8 px-8 py-4 text-sm font-bold text-white backdrop-blur-sm hover:bg-white/15 transition-all hover:scale-105 active:scale-95 sm:w-auto"
            >
              Get AI Match
            </button>
          </div>

          {/* stats row */}
          <div className="fade-up-4 mt-16 flex flex-wrap justify-center gap-10 text-white/40 text-xs font-semibold tracking-widest uppercase">
            {[
              { value: "60+",  label: "Colleges" },
              { value: "16+",  label: "Cities" },
              { value: "100%", label: "Free" },
              { value: "AI",   label: "Powered" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-white mb-0.5" style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.8rem", fontWeight: 800, lineHeight: 1 }}>
                  {value}
                </p>
                <p>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-white/25 animate-bounce">
          <p className="text-[10px] tracking-widest uppercase">Scroll</p>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── FEATURED INSTITUTIONS ── */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12 flex items-end justify-between border-b pb-6" style={{ borderColor: "rgba(86,86,153,0.1)" }}>
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "#565699" }}>Prestige</span>
            <h2 className="serif-sharp mt-2 text-4xl font-bold">Featured Institutions</h2>
          </div>
          <button
            onClick={() => navigate("/colleges")}
            className="group flex items-center gap-2 text-sm font-bold hover:underline"
            style={{ color: "#565699" }}
          >
            View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_COLLEGES.map((college) => (
            // ── wired to detail page ──
            <Link
              key={college.id}
              to={`/colleges/${college.id}`}
              className="card-shine group cursor-pointer overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
              style={{ borderColor: "rgba(86,86,153,0.08)", textDecoration: "none" }}
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img
                  src={college.image}
                  alt={college.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={e => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1562774053-701939374585?w=600&q=80";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <span
                  className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(244,197,66,0.9)", color: "#1a1a3a" }}
                >
                  {college.tag}
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-[#565699] transition-colors leading-snug">
                  {college.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">location_on</span>
                  {college.location}
                </p>
                <div className="mt-3 flex items-center gap-1 text-[#565699] text-xs font-bold">
                  View Details
                  <span className="material-symbols-outlined text-xs transition-transform group-hover:translate-x-1">arrow_forward</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24" style={{ background: "rgba(86,86,153,0.05)" }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="serif-sharp text-4xl font-bold">The CollegeMatch Process</h2>
            <div className="mx-auto mt-4 h-1 w-24 rounded-full" style={{ background: "#565699" }} />
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {[
              { icon: "person_search", title: "Profile Assessment", desc: "Tell us your preferred city, course, and budget — we build your academic profile instantly." },
              { icon: "auto_awesome",  title: "Smart Matching",     desc: "We cross-reference college data to find institutions where you'll truly thrive — academically and financially." },
              { icon: "verified",      title: "Save & Apply",       desc: "Save your favourite colleges, compare options, and track your applications — all in one place." },
            ].map((step, i) => (
              <div key={step.title} className="relative text-center">
                <div
                  className="float-anim mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg"
                  style={{ animationDelay: `${i * 0.4}s` }}
                >
                  <span className="material-symbols-outlined text-3xl" style={{ color: "#565699" }}>{step.icon}</span>
                </div>
                <h3 className="mb-3 text-xl font-bold">{step.title}</h3>
                <p className="leading-relaxed text-slate-600">{step.desc}</p>
                {i < 2 && (
                  <div className="absolute right-0 top-8 hidden text-slate-200 md:block">
                    <span className="material-symbols-outlined text-4xl">trending_flat</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI CALLOUT ── */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl px-8 py-16 md:px-16 md:py-20" style={{ background: "#1a1a3a" }}>
          <div className="absolute right-0 top-0 h-full w-1/2 opacity-20 hidden lg:block">
            <div className="h-full w-full" style={{ background: "linear-gradient(to left, #565699, transparent)" }} />
          </div>
          <div className="relative z-10 flex flex-col items-start gap-8 lg:max-w-xl">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider"
              style={{ background: "rgba(86,86,153,0.2)", color: "#a5b4fc", border: "1px solid rgba(86,86,153,0.3)" }}
            >
              <span className="material-symbols-outlined text-sm">bolt</span> AI Feature
            </div>
            <h2 className="serif-sharp text-4xl font-bold leading-tight text-white md:text-5xl">
              Experience the Future of College Discovery
            </h2>
            <p className="text-lg text-slate-300">
              Our AI engine doesn't just look at rankings. It considers your budget, preferred city, course of study, and career goals to find your perfect match.
            </p>
            <button
              onClick={() => navigate("/recommend")}
              className="rounded-xl px-8 py-4 font-bold transition-all hover:opacity-90 hover:scale-105"
              style={{ background: "#F4C542", color: "#1a1a3a" }}
            >
              Try AI Matching Now
            </button>
          </div>
          <div className="absolute right-20 top-1/2 hidden -translate-y-1/2 lg:block">
            <div className="relative h-64 w-64">
              <div className="absolute inset-0 rounded-full blur-3xl" style={{ background: "rgba(86,86,153,0.3)" }} />
              <div className="relative flex h-full w-full items-center justify-center rounded-full border" style={{ borderColor: "rgba(86,86,153,0.2)" }}>
                <span className="material-symbols-outlined opacity-40" style={{ fontSize: "120px", color: "#565699" }}>data_object</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t py-12" style={{ borderColor: "rgba(86,86,153,0.1)" }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-12 md:grid-cols-4 lg:grid-cols-5">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded text-white" style={{ background: "#565699" }}>
                  <span className="material-symbols-outlined text-sm">school</span>
                </div>
                <span className="text-lg font-extrabold tracking-tight" style={{ color: "#565699" }}>CollegeMatch</span>
              </div>
              <p className="max-w-xs text-sm text-slate-500 leading-relaxed">
                Helping Indian students find their perfect college through smart data, AI matching, and an intuitive discovery experience.
              </p>
            </div>
            <div>
              <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-slate-900">Platform</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><button onClick={() => navigate("/colleges")} className="hover:text-[#565699] transition-colors">Search Colleges</button></li>
                <li><button onClick={() => navigate("/recommend")} className="hover:text-[#565699] transition-colors">AI Matchmaker</button></li>
                <li><button onClick={() => navigate("/profile")} className="hover:text-[#565699] transition-colors">My Profile</button></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-slate-900">Resources</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li>Application Guides</li>
                <li>Scholarship Hub</li>
                <li>Success Stories</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-slate-900">Company</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li>Our Vision</li>
                <li>Partnerships</li>
                <li>Contact Us</li>
              </ul>
            </div>
          </div>
          <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t pt-8 sm:flex-row" style={{ borderColor: "rgba(86,86,153,0.1)" }}>
            <p className="text-xs text-slate-400">© 2025 CollegeMatch. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="text-slate-400 hover:text-[#565699] cursor-pointer transition-colors material-symbols-outlined">social_leaderboard</span>
              <span className="text-slate-400 hover:text-[#565699] cursor-pointer transition-colors material-symbols-outlined">camera_indoor</span>
              <span className="text-slate-400 hover:text-[#565699] cursor-pointer transition-colors material-symbols-outlined">share</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}