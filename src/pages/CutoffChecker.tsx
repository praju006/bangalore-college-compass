import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import colleges from "@/data/colleges";
import type { College } from "@/data/colleges";

type Filter = "all" | "Government" | "Private" | "Deemed";

interface EligibleResult {
  college: College;
  eligibleCourses: { name: string; cutoff: number; fees: number }[];
  bestCutoff: number;
}

export default function CutoffChecker() {
  const [marks, setMarks]           = useState(75);
  const [city, setCity]             = useState("All");
  const [typeFilter, setTypeFilter] = useState<Filter>("all");
  const [checked, setChecked]       = useState(false);

  const cities = ["All", ...Array.from(new Set(colleges.map(c => c.city))).sort()];

  const results: EligibleResult[] = colleges
    .map(c => {
      const eligible = c.courses.filter(co => marks >= co.cutoffMarks);
      if (!eligible.length) return null;
      return {
        college: c,
        eligibleCourses: eligible.map(co => ({ name: co.name, cutoff: co.cutoffMarks, fees: co.fees })),
        bestCutoff: Math.max(...eligible.map(co => co.cutoffMarks)),
      };
    })
    .filter(Boolean)
    .filter(r => city === "All" || r!.college.city === city)
    .filter(r => typeFilter === "all" || r!.college.type === typeFilter)
    .sort((a, b) => b!.college.rating - a!.college.rating) as EligibleResult[];

  const notEligible = colleges.filter(c =>
    c.courses.every(co => marks < co.cutoffMarks) &&
    (city === "All" || c.city === city) &&
    (typeFilter === "all" || c.type === typeFilter)
  );

  const typeColor: Record<string, string> = {
    Government: "bg-emerald-100 text-emerald-700",
    Private:    "bg-violet-100 text-violet-700",
    Deemed:     "bg-amber-100 text-amber-700",
  };

  return (
    <div className="min-h-screen bg-[#f6f7f8]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined { font-family:'Material Symbols Outlined'; font-weight:normal; font-style:normal; line-height:1; display:inline-block; white-space:nowrap; direction:ltr; }
        input[type='range']::-webkit-slider-thumb { -webkit-appearance:none; width:22px; height:22px; background:#565699; border:3px solid #fff; border-radius:50%; cursor:pointer; box-shadow:0 2px 8px rgba(86,86,153,0.4); }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .card-in { animation: fadeUp 0.3s ease both; }
      `}</style>

      <Header />

      {/* hero */}
      <div className="bg-gradient-to-br from-[#1a1a3a] to-[#565699] px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/70 text-xs font-bold uppercase tracking-widest mb-4">
          <span className="material-symbols-outlined text-sm">grade</span>
          Cutoff Checker
        </div>
        <h1 className="text-white font-extrabold mb-3" style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(1.6rem,4vw,2.6rem)" }}>
          Which Colleges Can You Get?
        </h1>
        <p className="text-indigo-200 text-sm max-w-lg mx-auto">
          Enter your marks percentage and instantly see every college and course you're eligible for.
        </p>
      </div>

      {/* form */}
      <div className="max-w-3xl mx-auto px-4 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">

          {/* marks slider */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-bold text-slate-700">Your Marks Percentage</label>
              <span className="text-2xl font-extrabold text-[#565699]" style={{ fontFamily:"'Syne',sans-serif" }}>
                {marks}%
              </span>
            </div>
            <input
              type="range" min={40} max={100} value={marks}
              onChange={e => setMarks(+e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#565699]"
            />
            <div className="flex justify-between mt-1.5 text-xs text-gray-400 font-medium">
              <span>40%</span><span>70%</span><span>100%</span>
            </div>
          </div>

          {/* city + type filters */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Preferred City</label>
              <select value={city} onChange={e => setCity(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#565699] bg-white">
                {cities.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">College Type</label>
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as Filter)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#565699] bg-white">
                <option value="all">All Types</option>
                <option value="Government">Government</option>
                <option value="Private">Private</option>
                <option value="Deemed">Deemed</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => setChecked(true)}
            className="w-full py-3.5 rounded-xl font-extrabold text-sm uppercase tracking-widest text-white transition hover:opacity-90 hover:scale-[1.01] active:scale-[0.99]"
            style={{ background:"linear-gradient(135deg,#565699,#7b7bd4)", boxShadow:"0 6px 24px rgba(86,86,153,0.35)" }}
          >
            Check Eligibility →
          </button>
        </div>
      </div>

      {/* results */}
      {checked && (
        <div className="max-w-5xl mx-auto px-4 py-10">

          {/* summary bar */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-600">check_circle</span>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-emerald-600" style={{ fontFamily:"'Syne',sans-serif" }}>{results.length}</p>
                <p className="text-xs text-gray-500 font-medium">Eligible Colleges</p>
              </div>
            </div>
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-400">cancel</span>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-red-400" style={{ fontFamily:"'Syne',sans-serif" }}>{notEligible.length}</p>
                <p className="text-xs text-gray-500 font-medium">Not Eligible</p>
              </div>
            </div>
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#565699]">menu_book</span>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-[#565699]" style={{ fontFamily:"'Syne',sans-serif" }}>
                  {results.reduce((s, r) => s + r.eligibleCourses.length, 0)}
                </p>
                <p className="text-xs text-gray-500 font-medium">Eligible Courses</p>
              </div>
            </div>
          </div>

          {/* eligible colleges */}
          {results.length > 0 && (
            <>
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                Colleges You're Eligible For
              </h2>
              <div className="space-y-4 mb-10">
                {results.map((r, i) => (
                  <div key={r.college.id} className="card-in bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                    style={{ animationDelay: `${i * 40}ms` }}>
                    <div className="flex flex-col sm:flex-row">
                      {/* left: image */}
                      <div className="w-full sm:w-32 h-28 sm:h-auto shrink-0 overflow-hidden">
                        <img src={r.college.imageUrl} alt={r.college.name} className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1562774053-701939374585?w=200&q=80"; }} />
                      </div>
                      {/* right: info */}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <Link to={`/colleges/${r.college.id}`}
                              className="font-bold text-slate-900 hover:text-[#565699] transition-colors text-sm" style={{ fontFamily:"'Syne',sans-serif" }}>
                              {r.college.name}
                            </Link>
                            <p className="text-xs text-gray-400 mt-0.5">{r.college.city} · Rank #{r.college.ranking}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${typeColor[r.college.type]}`}>
                            {r.college.type}
                          </span>
                        </div>
                        {/* eligible courses */}
                        <div className="flex flex-wrap gap-2">
                          {r.eligibleCourses.map(co => (
                            <div key={co.name} className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1">
                              <span className="material-symbols-outlined text-emerald-500 text-xs">check</span>
                              <span className="text-xs font-medium text-emerald-700">
                                {co.name.replace("B.Tech ","").replace("B.E. ","")}
                              </span>
                              <span className="text-[10px] text-emerald-500">({co.cutoff}% cutoff)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* not eligible */}
          {notEligible.length > 0 && (
            <>
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                Not Yet Eligible — Need Higher Marks
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {notEligible.map(c => {
                  const minCutoff = Math.min(...c.courses.map(co => co.cutoffMarks));
                  const gap       = minCutoff - marks;
                  return (
                    <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-4 opacity-60">
                      <p className="font-semibold text-xs text-slate-700 leading-snug">{c.shortName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{c.city}</p>
                      <div className="mt-2 flex items-center gap-1.5 text-red-400">
                        <span className="material-symbols-outlined text-sm">arrow_upward</span>
                        <span className="text-xs font-medium">Need {gap}% more (min cutoff: {minCutoff}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}