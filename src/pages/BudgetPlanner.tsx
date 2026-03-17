import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import colleges from "@/data/colleges";

const fmtINR = (n: number) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(2)}L` : `₹${n.toLocaleString("en-IN")}`;

const CITY_LIVING: Record<string, { hostel: number; food: number; transport: number; misc: number }> = {
  Bangalore:   { hostel: 96000,  food: 60000,  transport: 18000, misc: 24000 },
  Mumbai:      { hostel: 120000, food: 72000,  transport: 24000, misc: 30000 },
  Pune:        { hostel: 84000,  food: 54000,  transport: 15000, misc: 20000 },
  "New Delhi": { hostel: 90000,  food: 60000,  transport: 18000, misc: 24000 },
  Hyderabad:   { hostel: 78000,  food: 54000,  transport: 15000, misc: 18000 },
  Chennai:     { hostel: 72000,  food: 48000,  transport: 12000, misc: 18000 },
  Kolkata:     { hostel: 60000,  food: 42000,  transport: 12000, misc: 15000 },
  Manipal:     { hostel: 90000,  food: 60000,  transport: 10000, misc: 20000 },
  Vellore:     { hostel: 66000,  food: 42000,  transport: 10000, misc: 15000 },
  Jaipur:      { hostel: 54000,  food: 42000,  transport: 12000, misc: 15000 },
  default:     { hostel: 72000,  food: 48000,  transport: 12000, misc: 18000 },
};

const COLORS = ["#565699", "#7b7bd4", "#f4c542", "#22c55e", "#f87171"];

export default function BudgetPlanner() {
  const [collegeId, setCollegeId]     = useState(colleges[0].id);
  const [courseIdx, setCourseIdx]     = useState(0);
  const [scholarship, setScholarship] = useState(0);
  const [hostelOverride, setHostelOverride] = useState<number | null>(null);

  const college  = colleges.find(c => c.id === collegeId)!;
  const course   = college.courses[courseIdx] || college.courses[0];
  const duration = parseInt(course.duration) || 4;
  const living   = CITY_LIVING[college.city] || CITY_LIVING.default;

  const hostelAnnual    = hostelOverride ?? living.hostel;
  const tuitionTotal    = course.fees * duration;
  const hostelTotal     = hostelAnnual * duration;
  const foodTotal       = living.food * duration;
  const transportTotal  = living.transport * duration;
  const miscTotal       = living.misc * duration;
  const scholarshipTotal = scholarship * duration;

  const grandTotal = tuitionTotal + hostelTotal + foodTotal + transportTotal + miscTotal - scholarshipTotal;
  const annualCost = grandTotal / duration;

  const breakdown = [
    { name: "Tuition",   value: tuitionTotal,   annual: course.fees },
    { name: "Hostel",    value: hostelTotal,    annual: hostelAnnual },
    { name: "Food",      value: foodTotal,      annual: living.food },
    { name: "Transport", value: transportTotal, annual: living.transport },
    { name: "Misc",      value: miscTotal,      annual: living.misc },
  ];

  const pieData = breakdown.map(b => ({ name: b.name, value: b.value }));

  return (
    <div className="min-h-screen bg-[#f6f7f8]" style={{ fontFamily:"'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined { font-family:'Material Symbols Outlined'; font-weight:normal; font-style:normal; line-height:1; display:inline-block; white-space:nowrap; direction:ltr; }
        input[type='range']::-webkit-slider-thumb { -webkit-appearance:none; width:20px; height:20px; background:#565699; border:3px solid #fff; border-radius:50%; cursor:pointer; }
      `}</style>

      <Header />

      <div className="bg-gradient-to-br from-[#1a1a3a] to-[#565699] px-6 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/70 text-xs font-bold uppercase tracking-widest mb-4">
          <span className="material-symbols-outlined text-sm">wallet</span>
          Budget Planner
        </div>
        <h1 className="text-white font-extrabold mb-2" style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(1.6rem,4vw,2.4rem)" }}>
          Plan Your College Budget
        </h1>
        <p className="text-indigo-200 text-sm max-w-md mx-auto">
          Get a full cost-of-attendance breakdown including living expenses for every city.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* controls */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 text-sm">Select College & Course</h3>

            <div className="mb-4">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">College</label>
              <select value={collegeId} onChange={e => { setCollegeId(e.target.value); setCourseIdx(0); setHostelOverride(null); }}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#565699]">
                {colleges.map(c => <option key={c.id} value={c.id}>{c.shortName} — {c.city}</option>)}
              </select>
            </div>

            <div className="mb-4">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Course</label>
              <select value={courseIdx} onChange={e => setCourseIdx(+e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#565699]">
                {college.courses.map((co, i) => <option key={co.id} value={i}>{co.name} ({co.duration})</option>)}
              </select>
            </div>

            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Annual Scholarship (₹)</label>
                <span className="text-xs font-bold text-[#565699]">{fmtINR(scholarship)}</span>
              </div>
              <input type="range" min={0} max={200000} step={5000} value={scholarship}
                onChange={e => setScholarship(+e.target.value)}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#565699]" />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Custom Hostel/yr (₹)</label>
                <button onClick={() => setHostelOverride(null)} className="text-[10px] text-[#565699] font-bold hover:underline">Reset</button>
              </div>
              <input type="range" min={30000} max={300000} step={6000}
                value={hostelOverride ?? living.hostel}
                onChange={e => setHostelOverride(+e.target.value)}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#565699]" />
              <p className="text-xs text-gray-400 mt-1">{fmtINR(hostelOverride ?? living.hostel)}/yr (city estimate: {fmtINR(living.hostel)})</p>
            </div>
          </div>

          {/* total */}
          <div className="bg-[#0b2647] rounded-2xl p-5 text-white shadow-lg">
            <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-1">Total Cost of Attendance</p>
            <p className="text-4xl font-extrabold" style={{ fontFamily:"'Syne',sans-serif", color:"#f4c542" }}>
              {fmtINR(grandTotal)}
            </p>
            <p className="text-white/50 text-xs mt-1">over {course.duration} · {fmtINR(annualCost)}/year</p>
            {scholarship > 0 && (
              <p className="mt-2 text-emerald-400 text-xs font-semibold">
                ✓ Saving {fmtINR(scholarshipTotal)} via scholarship
              </p>
            )}
          </div>
        </div>

        {/* breakdown */}
        <div className="lg:col-span-3 space-y-5">

          {/* pie chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-700 mb-4">Cost Breakdown</p>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => fmtINR(v)} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2 w-full">
                {breakdown.map((b, i) => (
                  <div key={b.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="flex items-center gap-2 font-medium text-slate-600">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: COLORS[i] }} />
                        {b.name}
                      </span>
                      <span className="font-bold text-slate-800">{fmtINR(b.value)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(b.value / grandTotal * 100).toFixed(0)}%`, background: COLORS[i] }} />
                    </div>
                  </div>
                ))}
                {scholarship > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between text-xs">
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">savings</span>
                      Scholarship savings
                    </span>
                    <span className="font-bold text-emerald-600">-{fmtINR(scholarshipTotal)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* annual breakdown table */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-700 mb-4">Annual vs Total</p>
            <div className="space-y-2">
              {breakdown.map((b, i) => (
                <div key={b.name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                    <span className="text-sm text-slate-600">{b.name}</span>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <span className="text-gray-400">{fmtINR(b.annual)}/yr</span>
                    <span className="font-bold text-slate-800 w-20 text-right">{fmtINR(b.value)}</span>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between py-2 pt-3">
                <span className="text-sm font-extrabold text-slate-900" style={{ fontFamily:"'Syne',sans-serif" }}>Total</span>
                <span className="text-sm font-extrabold text-[#565699]">{fmtINR(grandTotal)}</span>
              </div>
            </div>
          </div>

          <Link to={`/colleges/${college.id}`}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
            style={{ background:"linear-gradient(135deg,#0b2647,#1a4a8a)" }}>
            View {college.shortName} Details
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </div>
    </div>
  );
}