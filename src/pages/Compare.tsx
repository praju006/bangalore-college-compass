import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import colleges from "@/data/colleges";
import type { College } from "@/data/colleges";

const fmtFee = (n: number) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}K`;

const typeColor: Record<string, string> = {
  Government: "bg-emerald-100 text-emerald-700",
  Private:    "bg-violet-100 text-violet-700",
  Deemed:     "bg-amber-100 text-amber-700",
};

interface Row {
  label: string;
  key: (c: College) => string | number | React.ReactNode;
  highlight?: "high" | "low"; // which is better
}

const ROWS: Row[] = [
  { label: "Type",        key: c => c.type },
  { label: "Established", key: c => c.established },
  { label: "Affiliation", key: c => c.affiliation },
  { label: "NIRF Rank",   key: c => `#${c.ranking}`, highlight: "low" },
  { label: "Rating",      key: c => `${c.rating}/5`,  highlight: "high" },
  { label: "Courses",     key: c => c.courses.length },
  { label: "Min Fees/yr", key: c => fmtFee(Math.min(...c.courses.map(x => x.fees))), highlight: "low" },
  { label: "Avg Package", key: c => `₹${c.placement.averagePackage} LPA`, highlight: "high" },
  { label: "Top Package", key: c => `₹${c.placement.highestPackage} LPA`, highlight: "high" },
  { label: "Placed %",    key: c => `${c.placement.placementRate}%`, highlight: "high" },
  { label: "Facilities",  key: c => c.facilities.length },
  { label: "Approved By", key: c => c.approvedBy.join(", ") },
];

export default function Compare() {
  const [params] = useSearchParams();
  const initIds  = (params.get("ids") || "").split(",").filter(Boolean).slice(0, 3);

  const [selectedIds, setSelectedIds] = useState<string[]>(initIds);
  const [search, setSearch]           = useState("");
  const [showPicker, setShowPicker]   = useState(false);

  const selected = selectedIds.map(id => colleges.find(c => c.id === id)).filter(Boolean) as College[];

  const suggestions = colleges.filter(c =>
    !selectedIds.includes(c.id) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) ||
     c.shortName.toLowerCase().includes(search.toLowerCase()) ||
     c.city.toLowerCase().includes(search.toLowerCase()))
  ).slice(0, 8);

  const add    = (id: string) => { if (selectedIds.length < 3) setSelectedIds(p => [...p, id]); setSearch(""); };
  const remove = (id: string) => setSelectedIds(p => p.filter(i => i !== id));

  // highlight best value per row
  const getBest = (row: Row): number => {
    if (!row.highlight || selected.length < 2) return -1;
    const nums = selected.map(c => {
      const val = row.key(c);
      return typeof val === "string" ? parseFloat(val.replace(/[^0-9.]/g, "")) : Number(val);
    });
    if (nums.some(isNaN)) return -1;
    return row.highlight === "high"
      ? nums.indexOf(Math.max(...nums))
      : nums.indexOf(Math.min(...nums));
  };

  return (
    <div className="min-h-screen bg-[#f6f7f8]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined { font-family:'Material Symbols Outlined'; font-weight:normal; font-style:normal; line-height:1; display:inline-block; white-space:nowrap; direction:ltr; }
        .best-cell { background: linear-gradient(135deg,rgba(86,86,153,0.08),rgba(86,86,153,0.04)); border-left: 3px solid #565699; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { animation: fadeUp 0.35s ease both; }
      `}</style>

      <Header />

      {/* hero */}
      <div className="bg-gradient-to-br from-[#1a1a3a] to-[#565699] px-6 pt-16 pb-10 text-center">
        <h1 className="text-white font-extrabold mb-2" style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(1.6rem,4vw,2.6rem)" }}>
          Compare Colleges
        </h1>
        <p className="text-indigo-200 text-sm mb-0">
          Select up to 3 colleges and compare side-by-side
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* college selector cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 3 }).map((_, i) => {
            const college = selected[i];
            return college ? (
              <div key={college.id} className="fade-in bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm relative">
                <div className="h-28 overflow-hidden">
                  <img src={college.imageUrl} alt={college.name} className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1562774053-701939374585?w=400&q=80"; }} />
                  <div className="absolute inset-0 h-28 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
                <div className="p-3">
                  <p className="font-bold text-xs text-slate-900 leading-snug" style={{ fontFamily:"'Syne',sans-serif" }}>{college.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{college.city}</p>
                  <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColor[college.type]}`}>{college.type}</span>
                </div>
                <button onClick={() => remove(college.id)}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors text-xs">
                  ✕
                </button>
              </div>
            ) : (
              <button key={i} onClick={() => setShowPicker(true)}
                className="h-full min-h-[140px] rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#565699] hover:text-[#565699] transition-all bg-white">
                <span className="material-symbols-outlined text-3xl">add_circle</span>
                <span className="text-xs font-semibold">Add College</span>
              </button>
            );
          })}
        </div>

        {/* search picker modal */}
        {showPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowPicker(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-4" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <p className="font-bold text-slate-800">Add a College</p>
                <button onClick={() => setShowPicker(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              <input
                autoFocus
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search college name or city…"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#565699] mb-3"
              />
              <div className="max-h-64 overflow-y-auto space-y-1">
                {suggestions.map(c => (
                  <button key={c.id} onClick={() => { add(c.id); setShowPicker(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-indigo-50 transition text-left">
                    <img src={c.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0"
                      onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1562774053-701939374585?w=80&q=80"; }} />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.city} · {c.type}</p>
                    </div>
                    <span className="material-symbols-outlined text-[#565699] ml-auto text-sm">add</span>
                  </button>
                ))}
                {suggestions.length === 0 && search && (
                  <p className="text-center py-6 text-sm text-gray-400">No colleges found</p>
                )}
                {!search && (
                  <p className="text-center py-4 text-xs text-gray-400">Start typing to search…</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* comparison table */}
        {selected.length >= 2 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest w-36">Metric</th>
                    {selected.map(c => (
                      <th key={c.id} className="px-5 py-4 text-center">
                        <Link to={`/colleges/${c.id}`} className="font-bold text-[#0b2647] hover:text-[#565699] text-sm leading-snug block" style={{ fontFamily:"'Syne',sans-serif" }}>
                          {c.shortName}
                        </Link>
                        <span className="text-xs text-gray-400 font-normal">{c.city}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row, ri) => {
                    const bestIdx = getBest(row);
                    return (
                      <tr key={row.label} className={ri % 2 === 0 ? "bg-gray-50/50" : ""}>
                        <td className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">{row.label}</td>
                        {selected.map((c, ci) => (
                          <td key={c.id} className={`px-5 py-3.5 text-center text-sm font-medium text-slate-700 ${bestIdx === ci ? "best-cell" : ""}`}>
                            {row.key(c)}
                            {bestIdx === ci && (
                              <span className="ml-1 text-[#565699] text-xs">✓</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}

                  {/* top recruiters row */}
                  <tr>
                    <td className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Top Recruiters</td>
                    {selected.map(c => (
                      <td key={c.id} className="px-5 py-3.5 text-center">
                        <div className="flex flex-wrap justify-center gap-1">
                          {c.placement.topRecruiters.slice(0, 3).map(r => (
                            <span key={r} className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md font-medium">{r}</span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* courses row */}
                  <tr className="bg-gray-50/50">
                    <td className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Key Courses</td>
                    {selected.map(c => (
                      <td key={c.id} className="px-5 py-3.5 text-center">
                        <div className="flex flex-wrap justify-center gap-1">
                          {c.courses.slice(0, 3).map(co => (
                            <span key={co.id} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md">
                              {co.name.replace("B.Tech ","").replace("B.E. ","")}
                            </span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* apply row */}
                  <tr>
                    <td className="px-5 py-4" />
                    {selected.map(c => (
                      <td key={c.id} className="px-5 py-4 text-center">
                        <a href={c.applicationLink || c.website} target="_blank" rel="noopener noreferrer"
                          className="inline-block px-5 py-2 rounded-xl text-xs font-bold text-white transition hover:opacity-90"
                          style={{ background:"linear-gradient(135deg,#0b2647,#1a4a8a)" }}>
                          Apply →
                        </a>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <span className="material-symbols-outlined text-5xl mb-3 block">compare_arrows</span>
            <p className="font-medium">Add at least 2 colleges to compare</p>
          </div>
        )}

        {/* winner summary */}
        {selected.length >= 2 && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Best Placement",  icon: "trending_up",  val: (c: College) => c.placement.averagePackage, suffix: " LPA avg", higher: true },
              { label: "Best Rating",     icon: "star",         val: (c: College) => c.rating,                   suffix: "/5",        higher: true },
              { label: "Most Affordable", icon: "payments",     val: (c: College) => Math.min(...c.courses.map(x=>x.fees)), suffix: " min fee", higher: false },
            ].map(metric => {
              const best = selected.reduce((a, b) =>
                metric.higher ? (metric.val(a) > metric.val(b) ? a : b) : (metric.val(a) < metric.val(b) ? a : b)
              );
              return (
                <div key={metric.label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background:"rgba(86,86,153,0.1)" }}>
                    <span className="material-symbols-outlined text-[#565699]">{metric.icon}</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{metric.label}</p>
                    <p className="font-extrabold text-[#0b2647] text-sm" style={{ fontFamily:"'Syne',sans-serif" }}>{best.shortName}</p>
                    <p className="text-xs text-gray-500">
                      {metric.val(best).toLocaleString()}{metric.suffix}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}