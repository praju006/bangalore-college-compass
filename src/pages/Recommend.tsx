import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import colleges from "@/data/colleges";
import type { College } from "@/data/colleges";

// ─── types ──────────────────────────────────────────────────────────────────
type CollegeType = "Any" | "Government" | "Private" | "Deemed";
type Priority = "placement" | "rating";

interface FormState {
  marks: number;
  course: string;
  budget: number;        // in lakhs
  collegeType: CollegeType;
  priorities: Priority[];
}

// ─── constants ──────────────────────────────────────────────────────────────
const COURSES = [
  "Computer Science",
  "Artificial Intelligence",
  "Data Science",
  "Information Science",
  "Electronics & Communication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "MBA",
  "BBA",
  "BCA",
  "B.Com",
  "MCA",
];

// ─── recommendation engine ───────────────────────────────────────────────────
function getRecommendations(form: FormState): College[] {
  const budgetInRupees = form.budget * 100000;

  const scored = colleges
    .filter((c) => {
      // type filter
      if (form.collegeType !== "Any" && c.type !== form.collegeType) return false;

      // has a matching course
      const hasCourse = c.courses.some((co) =>
        co.name.toLowerCase().includes(form.course.toLowerCase().split(" ")[0])
      );
      if (!hasCourse) return false;

      // budget: at least one course within budget
      const affordable = c.courses.some((co) => co.fees <= budgetInRupees);
      if (!affordable) return false;

      // cutoff: student's marks must meet at least one course cutoff
      const eligible = c.courses.some((co) => form.marks >= co.cutoffMarks);
      if (!eligible) return false;

      return true;
    })
    .map((c) => {
      let score = 0;
      if (form.priorities.includes("placement")) {
        score += c.placement.averagePackage * 3;
        score += c.placement.placementRate * 0.5;
      }
      if (form.priorities.includes("rating")) {
        score += c.rating * 10;
        score += (200 - c.ranking) * 0.1;
      }
      // base score if no priority selected
      if (form.priorities.length === 0) {
        score += c.rating * 10 + c.placement.averagePackage * 2;
      }
      return { college: c, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((x) => x.college);

  return scored;
}

// ─── component ──────────────────────────────────────────────────────────────
export default function Recommend() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    marks: 85,
    course: "Computer Science",
    budget: 4.5,
    collegeType: "Any",
    priorities: ["placement"],
  });

  const [results, setResults] = useState<College[] | null>(null);
  const [loading, setLoading] = useState(false);

  const togglePriority = (p: Priority) => {
    setForm((prev) => ({
      ...prev,
      priorities: prev.priorities.includes(p)
        ? prev.priorities.filter((x) => x !== p)
        : [...prev.priorities, p],
    }));
  };

  const handleSubmit = () => {
    setLoading(true);
    // slight delay for UX
    setTimeout(() => {
      const recs = getRecommendations(form);
      setResults(recs);
      setLoading(false);
      // scroll to results
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }, 800);
  };

  const typeColor: Record<string, string> = {
    Government: "bg-emerald-100 text-emerald-700",
    Private: "bg-violet-100 text-violet-700",
    Deemed: "bg-amber-100 text-amber-700",
  };

  return (
    <div
      className="relative flex min-h-screen flex-col bg-[#f6f7f8] text-slate-900 antialiased"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined { font-family:'Material Symbols Outlined'; font-weight:normal; font-style:normal; line-height:1; letter-spacing:normal; text-transform:none; display:inline-block; white-space:nowrap; direction:ltr; }
        input[type='range']::-webkit-slider-thumb { -webkit-appearance:none; width:24px; height:24px; background:#0b2647; border:4px solid #fff; border-radius:50%; cursor:pointer; box-shadow:0 4px 6px -1px rgb(0 0 0/.1); }
        input[type='range']::-moz-range-thumb { width:24px; height:24px; background:#0b2647; border:4px solid #fff; border-radius:50%; cursor:pointer; }
        .card-in { animation: fadeUp 0.4s ease both; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .result-card { transition: transform 0.2s, box-shadow 0.2s; }
        .result-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(11,38,71,0.12); }
      `}</style>

      <Header />

      <main className="flex-1 flex flex-col items-center">

        {/* ── HERO ── */}
        <section className="w-full max-w-5xl px-6 pt-12 pb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0b2647]/10 text-[#0b2647] text-xs font-bold uppercase tracking-wider mb-4">
            <span className="material-symbols-outlined text-sm">magic_button</span>
            AI-Powered Discovery
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-4">
            Find Your Perfect{" "}
            <span className="text-[#0b2647]">College Match</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Tell us about your profile and preferences. Our algorithm scans{" "}
            <span className="font-bold text-slate-700">{colleges.length}+ institutions</span>{" "}
            to find the one where you'll thrive.
          </p>
        </section>

        {/* ── FORM ── */}
        <div className="w-full max-w-3xl px-6 pb-16 space-y-6">

          {/* Section 1: Academic */}
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#0b2647]">
                <span className="material-symbols-outlined">analytics</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">Academic Performance</h3>
                <p className="text-sm text-slate-500">Your current scores and target field</p>
              </div>
            </div>
            <div className="space-y-8">

              {/* Marks slider */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-semibold text-slate-700">Marks Percentage (%)</label>
                  <span className="font-mono text-xl font-bold text-[#0b2647] bg-slate-100 px-3 py-1 rounded-lg">
                    {form.marks}%
                  </span>
                </div>
                <input
                  type="range" min={40} max={100}
                  value={form.marks}
                  onChange={(e) => setForm((f) => ({ ...f, marks: +e.target.value }))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0b2647]"
                />
                <div className="flex justify-between mt-2 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                  <span>40%</span><span>70%</span><span>100%</span>
                </div>
              </div>

              {/* Course */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Preferred Course</label>
                <select
                  value={form.course}
                  onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#0b2647] focus:border-transparent outline-none transition-all text-sm"
                >
                  {COURSES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Budget */}
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">Budget &amp; Preferences</h3>
                <p className="text-sm text-slate-500">Financial boundaries and institution type</p>
              </div>
            </div>
            <div className="space-y-8">

              {/* Budget slider */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-semibold text-slate-700">Max Annual Budget</label>
                  <span className="font-mono text-xl font-bold text-[#0b2647] bg-slate-100 px-3 py-1 rounded-lg">
                    ₹ {form.budget}L
                  </span>
                </div>
                <input
                  type="range" min={0.5} max={40} step={0.5}
                  value={form.budget}
                  onChange={(e) => setForm((f) => ({ ...f, budget: +e.target.value }))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0b2647]"
                />
                <div className="flex justify-between mt-2 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                  <span>₹0.5L</span><span>₹20L</span><span>₹40L+</span>
                </div>
              </div>

              {/* College Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">College Type</label>
                <div className="grid grid-cols-4 gap-3">
                  {(["Any", "Government", "Private", "Deemed"] as CollegeType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setForm((f) => ({ ...f, collegeType: t }))}
                      className={`px-3 py-3 rounded-lg border-2 font-bold text-sm transition-all ${
                        form.collegeType === t
                          ? "border-[#0b2647] bg-[#0b2647]/5 text-[#0b2647]"
                          : "border-slate-100 text-slate-500 hover:border-[#0b2647]/30"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Priorities */}
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <span className="material-symbols-outlined">star</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">What matters most?</h3>
                <p className="text-sm text-slate-500">Pick your top decision drivers (can select both)</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Placement */}
              <label
                onClick={() => togglePriority("placement")}
                className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  form.priorities.includes("placement")
                    ? "border-[#0b2647] bg-[#0b2647]/5"
                    : "border-slate-100 hover:border-[#0b2647]/30"
                }`}
              >
                <div className={`absolute top-4 right-4 size-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  form.priorities.includes("placement")
                    ? "bg-[#0b2647] border-[#0b2647]"
                    : "border-slate-300"
                }`}>
                  {form.priorities.includes("placement") && (
                    <span className="material-symbols-outlined text-white" style={{ fontSize: 13 }}>check</span>
                  )}
                </div>
                <span className={`font-bold mb-1 ${form.priorities.includes("placement") ? "text-[#0b2647]" : "text-slate-800"}`}>
                  Prioritize Placement
                </span>
                <span className="text-xs text-slate-500">Focus on ROI, avg package, and industry tie-ups.</span>
              </label>

              {/* Rating */}
              <label
                onClick={() => togglePriority("rating")}
                className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  form.priorities.includes("rating")
                    ? "border-[#0b2647] bg-[#0b2647]/5"
                    : "border-slate-100 hover:border-[#0b2647]/30"
                }`}
              >
                <div className={`absolute top-4 right-4 size-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  form.priorities.includes("rating")
                    ? "bg-[#0b2647] border-[#0b2647]"
                    : "border-slate-300"
                }`}>
                  {form.priorities.includes("rating") && (
                    <span className="material-symbols-outlined text-white" style={{ fontSize: 13 }}>check</span>
                  )}
                </div>
                <span className={`font-bold mb-1 ${form.priorities.includes("rating") ? "text-[#0b2647]" : "text-slate-800"}`}>
                  Prioritize Ratings
                </span>
                <span className="text-xs text-slate-500">Focus on NIRF rankings, faculty quality, and infrastructure.</span>
              </label>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-2">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-5 bg-[#0b2647] hover:bg-slate-800 text-[#ffbf00] rounded-xl text-lg font-extrabold shadow-xl shadow-[#0b2647]/20 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-[#ffbf00]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Analyzing…
                </>
              ) : (
                <>
                  GET MY RECOMMENDATIONS
                  <span className="material-symbols-outlined font-bold">arrow_forward</span>
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-400 mt-4 font-medium uppercase tracking-widest">
              {colleges.length}+ Colleges Analyzed Instantly
            </p>
          </div>
        </div>

        {/* ── RESULTS ── */}
        {results !== null && (
          <div id="results" className="w-full max-w-5xl px-6 pb-20">
            <div className="mb-8 text-center">
              {results.length > 0 ? (
                <>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    {results.length} matches found
                  </div>
                  <h2 className="text-3xl font-extrabold text-slate-900">
                    Your Top College Matches
                  </h2>
                  <p className="text-slate-500 mt-1">
                    Based on your {form.marks}% marks, ₹{form.budget}L budget, and {form.course} preference.
                  </p>
                </>
              ) : (
                <div className="py-16 text-center">
                  <div className="text-5xl mb-4">😕</div>
                  <h3 className="text-xl font-bold text-slate-700 mb-2">No colleges found</h3>
                  <p className="text-slate-500">Try increasing your budget or adjusting marks.</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {results.map((college, i) => {
                const minFee = Math.min(...college.courses.map(c => c.fees));
                const topCourses = college.courses.slice(0, 2).map(c => c.name.replace("B.Tech ", "").replace("B.E. ", ""));

                return (
                  <div
                    key={college.id}
                    className="result-card card-in bg-white rounded-xl border border-slate-100 overflow-hidden flex flex-col"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    {/* image */}
                    <div className="relative h-36 overflow-hidden bg-slate-100">
                      <img
                        src={college.imageUrl}
                        alt={college.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1562774053-701939374585?w=600&q=80";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      {/* rank badge */}
                      <div className="absolute top-3 left-3 bg-[#ffbf00] text-[#0b2647] text-xs font-extrabold px-2.5 py-1 rounded-full shadow">
                        #{i + 1} Match
                      </div>
                      {/* type */}
                      <div className="absolute bottom-3 left-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeColor[college.type]}`}>
                          {college.type}
                        </span>
                      </div>
                      {/* rating */}
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-amber-500">
                        ★ {college.rating}
                      </div>
                    </div>

                    {/* body */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-extrabold text-slate-900 text-sm leading-snug mb-0.5"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {college.name}
                      </h3>
                      <p className="text-xs text-slate-400 mb-3 flex items-center gap-1">
                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>location_on</span>
                        {college.city}
                      </p>

                      {/* course chips */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {topCourses.map((name, idx) => (
                          <span key={idx} className="text-xs bg-[#0b2647]/5 text-[#0b2647] px-2 py-0.5 rounded-md font-semibold">
                            {name}
                          </span>
                        ))}
                      </div>

                      {/* stats */}
                      <div className="grid grid-cols-3 gap-2 mb-4 mt-auto">
                        <div className="bg-slate-50 rounded-lg p-2 text-center">
                          <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wide mb-0.5">Avg Pkg</p>
                          <p className="text-xs font-extrabold text-slate-800">{college.placement.averagePackage} LPA</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-2 text-center">
                          <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wide mb-0.5">Placed</p>
                          <p className="text-xs font-extrabold text-slate-800">{college.placement.placementRate}%</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-2 text-center">
                          <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wide mb-0.5">Min Fee</p>
                          <p className="text-xs font-extrabold text-slate-800">
                            {minFee >= 100000 ? `₹${(minFee / 100000).toFixed(1)}L` : `₹${(minFee / 1000).toFixed(0)}K`}
                          </p>
                        </div>
                      </div>

                      {/* CTA */}
                      <a
                        href={college.applicationLink || college.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-center py-2.5 rounded-xl text-xs font-extrabold text-[#ffbf00] transition-all hover:opacity-90"
                        style={{ background: "#0b2647" }}
                      >
                        VIEW &amp; APPLY →
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* retry */}
            {results.length > 0 && (
              <div className="text-center mt-10">
                <button
                  onClick={() => { setResults(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-[#0b2647] text-[#0b2647] font-bold text-sm hover:bg-[#0b2647]/5 transition-all"
                >
                  <span className="material-symbols-outlined text-base">tune</span>
                  Refine Preferences
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* footer */}
      <Footer />
    </div>
  );
}