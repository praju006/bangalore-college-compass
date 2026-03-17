import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from "recharts";
import colleges from "@/data/colleges";

const DISPLAY = "'Bricolage Grotesque', sans-serif";
const BODY    = "'DM Sans', sans-serif";
const MONO    = "'JetBrains Mono', monospace";

// ── realistic formatting ──
const fmtL = (n: number) => {
  if (Math.abs(n) >= 100) return `₹${n.toFixed(0)}L`;
  if (Math.abs(n) >= 10)  return `₹${n.toFixed(1)}L`;
  return `₹${n.toFixed(2)}L`;
};

// ── realistic salary model ──
// Year 0 = student (paying fees, no income)
// Year 1 onwards = working, salary grows each year
// Net = cumulative salary - cumulative fees paid
const buildChart = (
  annualFees: number,       // rupees per year
  durationYears: number,   // course duration
  startSalaryLPA: number,  // lakhs per annum
  growthPct: number,       // annual salary growth %
  projectionYears: number  // years AFTER graduation to show
) => {
  const totalFees = annualFees * durationYears;           // total paid
  const data: { year: string; salary: number; cumSalary: number; cumFees: number; net: number }[] = [];

  let cumSalary = 0;
  const totalPoints = durationYears + projectionYears;

  for (let i = 0; i <= totalPoints; i++) {
    const label = i === 0 ? "Start" : `Y${i}`;

    // fees: paid during course years only
    const cumFees = Math.min(i, durationYears) * annualFees;

    // salary: 0 during course, starts year after graduation
    let annualSalary = 0;
    if (i > durationYears) {
      const workYear = i - durationYears; // 1, 2, 3...
      annualSalary = startSalaryLPA * Math.pow(1 + growthPct / 100, workYear - 1);
      cumSalary += annualSalary;
    }

    const net = cumSalary - totalFees / 100000; // convert fees to lakhs for comparison

    data.push({
      year:      label,
      salary:    parseFloat(annualSalary.toFixed(2)),
      cumSalary: parseFloat((cumSalary).toFixed(2)),
      cumFees:   parseFloat((cumFees / 100000).toFixed(2)),
      net:       parseFloat(net.toFixed(2)),
    });
  }
  return data;
};

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-xl p-3 text-xs" style={{ fontFamily: BODY }}>
      <p className="font-bold text-slate-700 mb-2" style={{ fontFamily: DISPLAY }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          <span className="text-gray-500">{p.name}:</span>
          <span className="font-bold text-slate-800" style={{ fontFamily: MONO }}>
            {p.value >= 0 ? "" : "-"}₹{Math.abs(p.value).toFixed(1)}L
          </span>
        </div>
      ))}
    </div>
  );
};

export default function ROICalculator() {
  const [collegeId, setCollegeId]   = useState(colleges[0].id);
  const [courseIdx, setCourseIdx]   = useState(0);
  const [growthRate, setGrowthRate] = useState(10);
  const [projYears, setProjYears]   = useState(7);

  const college      = colleges.find(c => c.id === collegeId)!;
  const course       = college.courses[courseIdx] || college.courses[0];
  const duration     = parseInt(course.duration) || 4;
  const startSalary  = college.placement.averagePackage; // already in LPA
  const totalFeesL   = (course.fees * duration) / 100000; // in lakhs

  const chartData = useMemo(() =>
    buildChart(course.fees, duration, startSalary, growthRate, projYears),
    [course.fees, duration, startSalary, growthRate, projYears]
  );

  // find break-even point (first year net >= 0)
  const breakEvenIdx = chartData.findIndex(d => d.net >= 0);
  const breakEvenLabel = breakEvenIdx > 0 ? chartData[breakEvenIdx].year : "Never";
  const finalData    = chartData[chartData.length - 1];
  const finalNet     = finalData.net;
  const finalSalary  = chartData.find(d => d.salary > 0)
    ? startSalary * Math.pow(1 + growthRate / 100, projYears - 1)
    : 0;

  // realistic ROI = net gain / total invested * 100
  const roiPct = totalFeesL > 0
    ? Math.round((finalNet / totalFeesL) * 100)
    : 0;

  // salary at end of projection
  const finalAnnualSalary = startSalary * Math.pow(1 + growthRate / 100, projYears - 1);

  return (
    <div className="min-h-screen bg-[#f6f7f8]" style={{ fontFamily: BODY }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=DM+Sans:ital,opsz,wght@0,9..40,100..900;1,9..40,100..900&family=JetBrains+Mono:wght@400;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined{font-family:'Material Symbols Outlined';font-weight:normal;font-style:normal;line-height:1;display:inline-block;white-space:nowrap;direction:ltr;}
        input[type='range']::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;background:#565699;border:3px solid #fff;border-radius:50%;cursor:pointer;box-shadow:0 2px 6px rgba(86,86,153,0.35);}
        .mono{font-family:'JetBrains Mono',monospace;}
      `}</style>

      <Header />

      {/* HERO */}
      <div className="bg-gradient-to-br from-[#1a1a3a] to-[#565699] px-6 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/70 text-xs font-bold uppercase tracking-widest mb-4"
          style={{ fontFamily: DISPLAY }}>
          <span className="material-symbols-outlined text-sm">calculate</span>
          ROI Calculator
        </div>
        <h1 className="text-white font-extrabold mb-2"
          style={{ fontFamily: DISPLAY, fontSize: "clamp(1.8rem,4vw,2.6rem)", letterSpacing: "-0.02em" }}>
          Is Your Degree Worth It?
        </h1>
        <p className="text-indigo-200 text-sm max-w-md mx-auto">
          Realistic return-on-investment based on actual placement data — including study years with zero income.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── CONTROLS ── */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 text-sm" style={{ fontFamily: DISPLAY }}>Configure</h3>

            <div className="mb-4">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block" style={{ fontFamily: DISPLAY }}>College</label>
              <select value={collegeId} onChange={e => { setCollegeId(e.target.value); setCourseIdx(0); }}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#565699]"
                style={{ fontFamily: BODY }}>
                {colleges.map(c => <option key={c.id} value={c.id}>{c.shortName} — {c.city}</option>)}
              </select>
            </div>

            <div className="mb-4">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block" style={{ fontFamily: DISPLAY }}>Course</label>
              <select value={courseIdx} onChange={e => setCourseIdx(+e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#565699]"
                style={{ fontFamily: BODY }}>
                {college.courses.map((co, i) => <option key={co.id} value={i}>{co.name}</option>)}
              </select>
            </div>

            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider" style={{ fontFamily: DISPLAY }}>Annual Salary Growth</label>
                <span className="text-sm font-bold text-[#565699] mono">{growthRate}%</span>
              </div>
              <input type="range" min={3} max={25} value={growthRate} onChange={e => setGrowthRate(+e.target.value)}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#565699]" />
              <div className="flex justify-between mt-1 text-[10px] text-gray-400" style={{ fontFamily: MONO }}>
                <span>3% (slow)</span><span>15% (avg)</span><span>25% (fast)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider" style={{ fontFamily: DISPLAY }}>Years After Graduation</label>
                <span className="text-sm font-bold text-[#565699] mono">{projYears}y</span>
              </div>
              <input type="range" min={3} max={15} value={projYears} onChange={e => setProjYears(+e.target.value)}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#565699]" />
            </div>
          </div>

          {/* input summary */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 text-sm mb-3" style={{ fontFamily: DISPLAY }}>Your Numbers</h3>
            {[
              { label: "Total Fees",       value: fmtL(totalFeesL),                       icon: "payments" },
              { label: "Course Duration",  value: course.duration,                         icon: "schedule" },
              { label: "Starting Salary",  value: `₹${startSalary} LPA`,                  icon: "trending_up" },
              { label: `Salary at Y${projYears}`, value: `₹${finalAnnualSalary.toFixed(1)} LPA`, icon: "moving" },
              { label: "Break-even",       value: breakEvenLabel,                          icon: "flag" },
            ].map(({ label, value, icon }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="material-symbols-outlined text-sm text-[#565699]">{icon}</span>
                  <span style={{ fontFamily: BODY }}>{label}</span>
                </div>
                <span className="text-sm font-bold text-slate-800 mono">{value}</span>
              </div>
            ))}
          </div>

          {/* disclaimer */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-amber-700 leading-relaxed" style={{ fontFamily: BODY }}>
            <p className="font-bold mb-1" style={{ fontFamily: DISPLAY }}>⚠ Realistic Model</p>
            Assumes <strong>zero income during study years</strong> ({course.duration}), salary starting only after graduation. Growth at {growthRate}%/yr. Actual results vary.
          </div>
        </div>

        {/* ── CHARTS + STATS ── */}
        <div className="lg:col-span-3 space-y-5">

          {/* ROI stat cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: `${projYears}Y Net Gain`,
                value: `${finalNet >= 0 ? "+" : ""}${fmtL(finalNet)}`,
                color: finalNet >= 0 ? "text-emerald-600" : "text-red-500",
                bg:    finalNet >= 0 ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100",
              },
              {
                label: "Realistic ROI",
                value: `${roiPct > 0 ? "+" : ""}${roiPct}%`,
                color: roiPct >= 100 ? "text-[#565699]" : roiPct >= 0 ? "text-amber-600" : "text-red-500",
                bg:    "bg-indigo-50 border-indigo-100",
              },
              {
                label: "Break-even",
                value: breakEvenLabel,
                color: "text-amber-600",
                bg:    "bg-amber-50 border-amber-100",
              },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center border`}>
                <p className={`text-xl font-extrabold mono ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 font-medium mt-0.5" style={{ fontFamily: DISPLAY }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* cumulative chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-start justify-between mb-1">
              <p className="text-sm font-bold text-slate-700" style={{ fontFamily: DISPLAY }}>
                Cumulative Earnings vs Fees (₹ Lakhs)
              </p>
              <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full" style={{ fontFamily: DISPLAY }}>
                Study: {course.duration} · Work: {projYears}y
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-4" style={{ fontFamily: BODY }}>
              Grey zone = study period (paying fees, no salary)
            </p>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData} margin={{ top:5, right:5, left:0, bottom:5 }}>
                <defs>
                  <linearGradient id="salaryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#565699" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#565699" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                {/* shade study period */}
                {Array.from({length: duration}, (_, i) => (
                  <ReferenceLine key={i} x={i === 0 ? "Start" : `Y${i}`} stroke="#e5e7eb" strokeWidth={20} strokeOpacity={0.4} />
                ))}
                {/* break-even line */}
                {breakEvenIdx > 0 && (
                  <ReferenceLine x={chartData[breakEvenIdx].year} stroke="#22c55e" strokeDasharray="4 4" strokeWidth={1.5}
                    label={{ value:"Break-even", position:"insideTopRight", fontSize:10, fill:"#22c55e", fontFamily:DISPLAY }} />
                )}
                <XAxis dataKey="year" tick={{ fontSize:11, fill:"#9ca3af", fontFamily:MONO }} />
                <YAxis tick={{ fontSize:11, fill:"#9ca3af", fontFamily:MONO }} tickFormatter={v => `₹${v}L`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="cumSalary" stroke="#565699" strokeWidth={2.5} fill="url(#salaryGrad)" name="Cum. Salary" />
                <Area type="monotone" dataKey="cumFees"   stroke="#ef4444" strokeWidth={2}   fill="none" strokeDasharray="5 4" name="Total Fees" />
                <Area type="monotone" dataKey="net"       stroke="#22c55e" strokeWidth={2}   fill="url(#netGrad)"   name="Net Gain" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-5 mt-3 text-xs font-medium text-gray-500" style={{ fontFamily: BODY }}>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#565699] inline-block rounded"/><span style={{fontFamily:MONO}}>Cum. Salary</span></span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-red-400 inline-block rounded border-dashed"/><span style={{fontFamily:MONO}}>Total Fees Paid</span></span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-500 inline-block rounded"/><span style={{fontFamily:MONO}}>Net Gain</span></span>
            </div>
          </div>

          {/* annual salary growth chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-700 mb-4" style={{ fontFamily: DISPLAY }}>
              Annual Salary Projection (LPA)
            </p>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart
                data={chartData.filter(d => d.salary > 0)}
                margin={{ top:5, right:5, left:0, bottom:5 }}>
                <defs>
                  <linearGradient id="annualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f4c542" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f4c542" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" tick={{ fontSize:11, fill:"#9ca3af", fontFamily:MONO }} />
                <YAxis tick={{ fontSize:11, fill:"#9ca3af", fontFamily:MONO }} tickFormatter={v => `₹${v}L`} />
                <Tooltip
                  formatter={(v: number) => [`₹${v.toFixed(1)} LPA`, "Annual Salary"]}
                  contentStyle={{ borderRadius:10, border:"1px solid #e5e7eb", fontSize:12, fontFamily:BODY }}
                />
                <Area type="monotone" dataKey="salary" stroke="#f4c542" strokeWidth={2.5} fill="url(#annualGrad)" name="salary" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <Link to={`/colleges/${college.id}`}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
            style={{ background:"linear-gradient(135deg,#0b2647,#1a4a8a)", fontFamily:DISPLAY, textDecoration:"none" }}>
            View {college.shortName} Full Details
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </div>
    </div>
  );
}