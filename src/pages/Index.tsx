import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";

const FEATURED_COLLEGES = [
  {
    name: "Indian Institute of Science",
    location: "Bangalore, Karnataka",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDV4YSpXuMXY_0D7-6w4x8_Rj_yOJy9wk83hUNQaj_gIm43JRTx5c5gvxRRBIrwKDnl2ad1f4MxbS4dm2RmPRfIj7jR8nr1Z80jEZDQpKQ7y4hqHSyZmrvHSBkQEqPU-4K7fzWXuO_z6FxT5A3io80vxWHN6CrB13h3vDBc5Mj0k8CgKi-aPU9N9As25hg5Funbl-qrTS4RvX3f1qhakRDWTcrN3_JapVgquk7CIW8CPwnpqsNBILmtkqe13C-gBvKb1SX3zyJE9E4",
  },
  {
    name: "IIT Bombay",
    location: "Mumbai, Maharashtra",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA4An_YwIqxyjV1h7XzkpQtUg1urCfEOWFN28Nj54ZhCxd__mCG0qmyxxejhncssSQ3DSJgWP7A5FfZG8oQNz5N71rfV6WUEywS17lkzcRH8aIcsDfBoCJD5Lvz4PPwnO2IF2prbQp46WBxMsgOvoqmLVsDjMH6rw3BoR3c5AvUBfr10zGqTxUQsAyqATW-eVCw-Wqsira0c9P5k9t3gfRpgt-ELCHkfxGBKJH-5dY9PqmzEb0d4Z6uYWQa-h46cFLWoYBam0p3uZ4",
  },
  {
    name: "IIT Delhi",
    location: "New Delhi, Delhi",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB4PiXMpQUnlJXPSBjl01xF9-c2ILi3MeaJ6QVhyvl1anMZCjmDLGtcuPqxap6qnlkSDnVt_Q7lOtY5ydDBxi6C7FyYAdyXxRFt6lIkC6lQUOsLOc1-RVlcqz_ZbL7uY4KRcIqP-yBXcpZn8zAp5U3J4YRfdMioROc7emKe4xI2SDxzB8XHhK2qMI8-RzOMIKhpZRrIraPs-XwLq00LfX9SSd8V_NgV-sacxU4vN1Kl5CH3e8qj5RbJYNb1Hyxmvi9yu_BmR-Sct-g",
  },
  {
    name: "IIM Ahmedabad",
    location: "Ahmedabad, Gujarat",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD2wH24xGlYmw86KKznPHcbUoa9q9eseyNtjVu1NyCC-o6TlxICxDSEUkh6Nnp2q5kWAW_zkGTZ0YSRNwF5ZBALWe97eFzl3heJb3D1NfxHA3vZm9gWIlSIC9Vep_J7yg4fv3mOLtgb2Qm1sPPBWIrrvygA-tjtUg-ReqXYaWlbuaUqckzS-ti6Q5fezKsSQcQm0cNw57QH9Xl6Kr5lMZ0grSON7G3-GnE7AK3KemSJIYuseAc7ERGIbVAS5a_94d0ehsDusGoD-aM",
  },
];

export default function Index() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-[#f6f6f7] text-slate-900"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');
        .serif-sharp { font-family: 'Playfair Display', serif; }
        .material-symbols-outlined { font-family: 'Material Symbols Outlined'; font-weight: normal; font-style: normal; font-size: 24px; line-height: 1; letter-spacing: normal; text-transform: none; display: inline-block; white-space: nowrap; word-wrap: normal; direction: ltr; }
      `}</style>

      <Header />

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[80vh] w-full flex-col items-center justify-center overflow-hidden px-6 py-24 text-center"
        style={{ background: "linear-gradient(135deg, #1a1a3a, #565699, #3b3b7a)" }}>
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)", backgroundSize: "40px 40px" }} />

        <div className="relative z-10 max-w-4xl space-y-8">
          <h1 className="serif-sharp text-5xl font-bold leading-tight text-white md:text-7xl">
            Your Curated Path to the Right College
          </h1>
          <p className="mx-auto max-w-2xl text-lg font-medium text-slate-200 md:text-xl">
            A smart, AI-driven discovery platform designed to help Indian students find their perfect college — based on course, city, budget, and career goals.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <button
              onClick={() => navigate("/colleges")}
              className="w-full rounded-full px-8 py-4 text-sm font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-transform sm:w-auto"
              style={{ background: "#F4C542", color: "#1a1a3a" }}
            >
              Explore Colleges
            </button>
            <button
              onClick={() => navigate("/recommend")}
              className="w-full rounded-full border border-white/30 bg-white/10 px-8 py-4 text-sm font-bold text-white backdrop-blur-sm hover:bg-white/20 transition-colors sm:w-auto"
            >
              Get AI Match
            </button>
          </div>
        </div>
      </section>

      {/* ── FEATURED INSTITUTIONS ──────────────────────────────────────── */}
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
            <div
              key={college.name}
              onClick={() => navigate("/colleges")}
              className="group cursor-pointer overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-xl"
              style={{ borderColor: "rgba(86,86,153,0.05)" }}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={college.image}
                  alt={college.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold">{college.name}</h3>
                <p className="text-sm text-slate-500">{college.location}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section className="py-24" style={{ background: "rgba(86,86,153,0.05)" }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="serif-sharp text-4xl font-bold">The CollegeMatch Process</h2>
            <div className="mx-auto mt-4 h-1 w-24 rounded-full" style={{ background: "#565699" }} />
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {/* Step 1 */}
            <div className="relative text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg" style={{ ring: "1px solid rgba(86,86,153,0.1)" }}>
                <span className="material-symbols-outlined text-3xl" style={{ color: "#565699" }}>person_search</span>
              </div>
              <h3 className="mb-3 text-xl font-bold">Profile Assessment</h3>
              <p className="leading-relaxed text-slate-600">Tell us your preferred city, course, and budget — we build your academic profile instantly.</p>
              <div className="absolute right-0 top-8 hidden text-slate-200 md:block">
                <span className="material-symbols-outlined text-4xl">trending_flat</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg">
                <span className="material-symbols-outlined text-3xl" style={{ color: "#565699" }}>auto_awesome</span>
              </div>
              <h3 className="mb-3 text-xl font-bold">Smart Matching</h3>
              <p className="leading-relaxed text-slate-600">We cross-reference college data to find institutions where you'll truly thrive — academically and financially.</p>
              <div className="absolute right-0 top-8 hidden text-slate-200 md:block">
                <span className="material-symbols-outlined text-4xl">trending_flat</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg">
                <span className="material-symbols-outlined text-3xl" style={{ color: "#565699" }}>verified</span>
              </div>
              <h3 className="mb-3 text-xl font-bold">Save & Apply</h3>
              <p className="leading-relaxed text-slate-600">Save your favourite colleges, compare options, and track your applications — all in one place.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI CALLOUT ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl px-8 py-16 md:px-16 md:py-20" style={{ background: "#1a1a3a" }}>
          {/* Right gradient glow */}
          <div className="absolute right-0 top-0 h-full w-1/2 opacity-20 hidden lg:block">
            <div className="h-full w-full" style={{ background: "linear-gradient(to left, #565699, transparent)" }} />
          </div>

          <div className="relative z-10 flex flex-col items-start gap-8 lg:max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider"
              style={{ background: "rgba(86,86,153,0.2)", color: "#a5b4fc", border: "1px solid rgba(86,86,153,0.3)" }}>
              <span className="material-symbols-outlined text-sm">bolt</span> New Feature
            </div>

            <h2 className="serif-sharp text-4xl font-bold leading-tight text-white md:text-5xl">
              Experience the Future of College Discovery
            </h2>

            <p className="text-lg text-slate-300">
              Our AI engine doesn't just look at rankings. It considers your budget, preferred city, course of study, and career goals to find your perfect college.
            </p>

            <button
              onClick={() => navigate("/recommend")}
              className="rounded-lg px-8 py-4 font-bold transition-all hover:opacity-90 hover:scale-105"
              style={{ background: "#F4C542", color: "#1a1a3a" }}
            >
              Try AI Matching Now
            </button>
          </div>

          {/* Abstract AI visual */}
          <div className="absolute right-20 top-1/2 hidden -translate-y-1/2 lg:block">
            <div className="relative h-64 w-64">
              <div className="absolute inset-0 rounded-full blur-3xl" style={{ background: "rgba(86,86,153,0.3)" }} />
              <div className="relative flex h-full w-full items-center justify-center rounded-full border" style={{ borderColor: "rgba(86,86,153,0.2)" }}>
                <span className="material-symbols-outlined opacity-50" style={{ fontSize: "120px", color: "#565699" }}>data_object</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer className="border-t py-12" style={{ borderColor: "rgba(86,86,153,0.1)" }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-12 md:grid-cols-4 lg:grid-cols-5">
            {/* Brand */}
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

            {/* Platform */}
            <div>
              <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-slate-900">Platform</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><button onClick={() => navigate("/colleges")} className="hover:text-[#565699] transition-colors">Search Colleges</button></li>
                <li><button onClick={() => navigate("/recommend")} className="hover:text-[#565699] transition-colors">AI Matchmaker</button></li>
                <li><button onClick={() => navigate("/profile")} className="hover:text-[#565699] transition-colors">My Profile</button></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-slate-900">Resources</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><span className="cursor-default">Application Guides</span></li>
                <li><span className="cursor-default">Scholarship Hub</span></li>
                <li><span className="cursor-default">Success Stories</span></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-slate-900">Company</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><span className="cursor-default">Our Vision</span></li>
                <li><span className="cursor-default">Partnerships</span></li>
                <li><span className="cursor-default">Contact Us</span></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t pt-8 sm:flex-row" style={{ borderColor: "rgba(86,86,153,0.1)" }}>
            <p className="text-xs text-slate-400">© 2024 CollegeMatch. All rights reserved.</p>
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