import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import colleges from "@/data/colleges";
import type { College } from "@/data/colleges";
import { Header } from "@/components/layout/Header";

// ─── helpers ────────────────────────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const ITEMS_PER_PAGE = 9;

const getMinFee = (c: College) =>
  c.courses.length ? Math.min(...c.courses.map(x => x.fees)) : 0;

// ── smart match: checks name, shortName, city, type, affiliation,
//    every course name + specialization, facilities, recruiters, description ──
const matchesQuery = (c: College, q: string): boolean => {
  if (!q) return true;
  const s = q.toLowerCase();
  return (
    c.name.toLowerCase().includes(s) ||
    c.shortName.toLowerCase().includes(s) ||
    c.city.toLowerCase().includes(s) ||
    c.type.toLowerCase().includes(s) ||
    c.affiliation.toLowerCase().includes(s) ||
    c.description.toLowerCase().includes(s) ||
    c.courses.some(co =>
      co.name.toLowerCase().includes(s) ||
      (co.specializations || []).some(sp => sp.toLowerCase().includes(s))
    ) ||
    c.facilities.some(f => f.toLowerCase().includes(s)) ||
    c.placement.topRecruiters.some(r => r.toLowerCase().includes(s)) ||
    c.approvedBy.some(a => a.toLowerCase().includes(s))
  );
};

type SortKey = "rating" | "fees_asc" | "fees_desc" | "placement" | "name";

interface Toast { id: number; msg: string; type: "success" | "error"; }

// ─── quick-search suggestions ────────────────────────────────────────────────
const SUGGESTIONS = [
  "MBA", "BBA", "BCA", "B.Com", "B.Sc",
  "Computer Science", "Artificial Intelligence", "Data Science",
  "Electronics", "Mechanical", "Civil", "Electrical",
  "MCA", "M.Tech", "Law",
  "Mumbai", "Pune", "Delhi", "Bangalore", "Hyderabad", "Chennai",
  "Kolkata", "Manipal", "Vellore", "Jaipur", "Chandigarh", "Kochi",
  "IIT", "NIT", "BITS", "IIM", "IIIT",
  "Government", "Private", "Deemed",
  "NAAC A++", "NBA",
];

// ─── component ──────────────────────────────────────────────────────────────
export default function Colleges() {
  const [search, setSearch]           = useState("");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedType, setSelectedType] = useState("All Types");
  const [sortBy, setSortBy]           = useState<SortKey>("rating");
  const [savedNames, setSavedNames]   = useState<Set<string>>(new Set());
  const [toasts, setToasts]           = useState<Toast[]>([]);
  const [page, setPage]               = useState(1);
  const [cityOpen, setCityOpen]       = useState(false);
  const [citySearch, setCitySearch]   = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const cityRef    = useRef<HTMLDivElement>(null);
  const searchRef  = useRef<HTMLDivElement>(null);
  const toastId    = useRef(0);

  const cities = ["All Cities", ...Array.from(new Set(colleges.map(c => c.city))).sort()];
  const types  = ["All Types", "Government", "Private", "Deemed"];

  // load saved
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const token  = localStorage.getItem("token");
    if (!userId || !token) return;
    fetch(`${API}/api/profile/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        const names: string[] = (data.savedColleges || []).map((c: any) =>
          typeof c === "string" ? c : c.name
        );
        setSavedNames(new Set(names));
      })
      .catch(() => {});
  }, []);

  // close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node))
        setCityOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const showToast = useCallback((msg: string, type: "success" | "error") => {
    const id = ++toastId.current;
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const toggleSave = async (e: React.MouseEvent, college: College) => {
    e.preventDefault();
    e.stopPropagation();
    const userId = localStorage.getItem("userId");
    const token  = localStorage.getItem("token");
    if (!userId || !token) { showToast("Please login to save colleges", "error"); return; }
    const isSaved = savedNames.has(college.name);
    const endpoint = isSaved ? `${API}/api/profile/unsave` : `${API}/api/profile/save`;
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, collegeName: college.name }),
      });
      if (res.ok) {
        setSavedNames(prev => {
          const next = new Set(prev);
          isSaved ? next.delete(college.name) : next.add(college.name);
          return next;
        });
        showToast(isSaved ? `Removed ${college.shortName}` : `Saved ${college.shortName}!`, "success");
      } else {
        showToast("Failed to update. Try again.", "error");
      }
    } catch {
      showToast("Network error. Backend offline?", "error");
    }
  };

  // ── filter + sort ──
  const filtered = colleges
    .filter(c => {
      const matchSearch = matchesQuery(c, search);
      const matchCity   = selectedCity === "All Cities" || c.city === selectedCity;
      const matchType   = selectedType === "All Types"  || c.type === selectedType;
      return matchSearch && matchCity && matchType;
    })
    .sort((a, b) => {
      if (sortBy === "rating")    return b.rating - a.rating;
      if (sortBy === "fees_asc")  return getMinFee(a) - getMinFee(b);
      if (sortBy === "fees_desc") return getMinFee(b) - getMinFee(a);
      if (sortBy === "placement") return b.placement.averagePackage - a.placement.averagePackage;
      return a.name.localeCompare(b.name);
    });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleCity   = (c: string) => { setSelectedCity(c); setCityOpen(false); setCitySearch(""); setPage(1); };
  const handleType   = (t: string) => { setSelectedType(t); setPage(1); };
  const handleSort   = (s: SortKey) => { setSortBy(s); setPage(1); };

  const filteredCities = cities.filter(c =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  );

  // suggestions filtered by current query
  const activeSuggestions = search.length >= 1
    ? SUGGESTIONS.filter(s => s.toLowerCase().includes(search.toLowerCase()) && s.toLowerCase() !== search.toLowerCase()).slice(0, 6)
    : SUGGESTIONS.slice(0, 8);

  const typeColor: Record<string, string> = {
    Government: "bg-emerald-100 text-emerald-700",
    Private:    "bg-violet-100 text-violet-700",
    Deemed:     "bg-amber-100 text-amber-700",
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined { font-family:'Material Symbols Outlined'; font-weight:normal; font-style:normal; line-height:1; display:inline-block; white-space:nowrap; direction:ltr; }
        .card-hover { transition: transform 0.22s ease, box-shadow 0.22s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(86,86,153,0.13); }
        .save-btn { transition: transform 0.15s; }
        .save-btn:hover { transform: scale(1.2); }
        .img-zoom img { transition: transform 0.4s ease; }
        .img-zoom:hover img { transform: scale(1.06); }
        .pill-active   { background: #565699; color: #fff; }
        .pill-inactive { background: #fff; color: #555; border: 1px solid #e2e4f0; }
        .pill-inactive:hover { background: #f0f0f8; }
      `}</style>

      <Header />

      {/* ── HERO ── */}
      <div className="bg-gradient-to-br from-[#1a1a3a] via-[#2a2a5a] to-[#565699] px-6 pt-20 pb-16">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-[#F4C542] text-sm font-semibold tracking-widest uppercase mb-3">
            Discover · Compare · Apply
          </p>
          <h1
            className="text-white mb-3"
            style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 800 }}
          >
            Find Your Perfect College
          </h1>
          <p className="text-indigo-200 text-sm mb-8 max-w-xl mx-auto">
            Search by <span className="text-white font-semibold">college name</span>,{" "}
            <span className="text-white font-semibold">city</span>,{" "}
            <span className="text-white font-semibold">course</span> (MBA, BCA, CSE…),{" "}
            or <span className="text-white font-semibold">institute type</span> (IIT, NIT, BITS…)
          </p>

          {/* ── SMART SEARCH BOX ── */}
          <div className="relative max-w-2xl mx-auto" ref={searchRef}>
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl select-none z-10">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={e => { handleSearch(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="e.g. MBA in Mumbai, IIT, Computer Science, BCA…"
              className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-800 bg-white shadow-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#565699]"
            />
            {search && (
              <button
                onClick={() => { handleSearch(""); setShowSuggestions(false); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            )}

            {/* suggestion dropdown */}
            {showSuggestions && activeSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {search ? "Suggestions" : "Popular searches"}
                </p>
                <div className="p-2">
                  {activeSuggestions.map(s => (
                    <button
                      key={s}
                      onClick={() => { handleSearch(s); setShowSuggestions(false); }}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-indigo-50 hover:text-[#565699] flex items-center gap-2 transition"
                    >
                      <span className="material-symbols-outlined text-base text-gray-400">search</span>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* quick-pick chips below search */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {["MBA", "Computer Science", "IIT", "Government", "Mumbai", "BCA"].map(chip => (
              <button
                key={chip}
                onClick={() => { handleSearch(chip); setShowSuggestions(false); }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                  search === chip
                    ? "bg-[#F4C542] text-[#1a1a3a] border-[#F4C542]"
                    : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── FILTERS ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap gap-3 items-center">

          {/* city dropdown */}
          <div className="relative" ref={cityRef}>
            <button
              onClick={() => setCityOpen(o => !o)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 hover:bg-gray-50 transition"
            >
              <span className="material-symbols-outlined text-base text-[#565699]">location_on</span>
              <span>{selectedCity}</span>
              <span className="material-symbols-outlined text-sm text-gray-400">
                {cityOpen ? "expand_less" : "expand_more"}
              </span>
            </button>
            {cityOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                <div className="p-2 border-b border-gray-100">
                  <input
                    autoFocus
                    type="text"
                    value={citySearch}
                    onChange={e => setCitySearch(e.target.value)}
                    placeholder="Search city…"
                    className="w-full px-3 py-2 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#565699]"
                  />
                </div>
                <div className="max-h-56 overflow-y-auto py-1">
                  {filteredCities.map(city => (
                    <button
                      key={city}
                      onClick={() => handleCity(city)}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 transition ${
                        selectedCity === city ? "text-[#565699] font-semibold bg-indigo-50" : "text-gray-700"
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                  {filteredCities.length === 0 && (
                    <p className="px-4 py-3 text-sm text-gray-400">No city found</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* type pills */}
          <div className="flex gap-2 flex-wrap">
            {types.map(t => (
              <button
                key={t}
                onClick={() => handleType(t)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  selectedType === t ? "pill-active" : "pill-inactive"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* sort */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort:</span>
            <select
              value={sortBy}
              onChange={e => handleSort(e.target.value as SortKey)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#565699]"
            >
              <option value="rating">Top Rated</option>
              <option value="fees_asc">Fees: Low → High</option>
              <option value="fees_desc">Fees: High → Low</option>
              <option value="placement">Avg Package</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>

          {/* active search badge */}
          {search && (
            <div className="flex items-center gap-1.5 bg-indigo-50 text-[#565699] px-3 py-1.5 rounded-full text-xs font-semibold">
              <span className="material-symbols-outlined text-sm">filter_alt</span>
              "{search}"
              <button onClick={() => handleSearch("")} className="ml-1 hover:opacity-70">✕</button>
            </div>
          )}

          <span className="text-xs text-gray-400 whitespace-nowrap">
            {filtered.length} college{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ── GRID ── */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {paginated.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-lg font-medium text-gray-600">
              No colleges found for "<span className="text-[#565699]">{search}</span>"
            </p>
            <p className="text-sm mt-1">Try searching a city, course name, or college type</p>
            <button
              onClick={() => { setSearch(""); setSelectedCity("All Cities"); setSelectedType("All Types"); }}
              className="mt-5 px-5 py-2.5 bg-[#565699] text-white rounded-xl text-sm font-semibold hover:bg-[#4a4a88] transition"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map(college => {
              const isSaved    = savedNames.has(college.name);
              const minFee     = getMinFee(college);
              const courseNames = college.courses
                .slice(0, 3)
                .map(c => c.name.replace("B.Tech ", "").replace("B.E. ", "").replace("M.Tech ", "M."));

              return (
                <Link
                  key={college.id}
                  to={`/colleges/${college.id}`}
                  className="card-hover bg-white rounded-2xl overflow-hidden border border-gray-100 flex flex-col"
                  style={{ textDecoration: "none" }}
                >
                  {/* image */}
                  <div className="img-zoom relative h-44 overflow-hidden bg-gray-100">
                    <img
                      src={college.imageUrl}
                      alt={college.name}
                      className="w-full h-full object-cover"
                      onError={e => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1562774053-701939374585?w=600&q=80";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                    {/* rating */}
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-amber-500 shadow">
                      ★ {college.rating.toFixed(1)}
                    </div>

                    {/* save */}
                    <button
                      onClick={e => toggleSave(e, college)}
                      className="save-btn absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow"
                      title={isSaved ? "Remove from saved" : "Save college"}
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill={isSaved ? "#ef4444" : "none"} stroke={isSaved ? "#ef4444" : "#888"} strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>

                    {/* type */}
                    <div className="absolute bottom-3 left-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeColor[college.type] || "bg-gray-100 text-gray-600"}`}>
                        {college.type}
                      </span>
                    </div>
                  </div>

                  {/* body */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="mb-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className="font-bold text-gray-900 text-sm leading-snug"
                          style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                          {college.name}
                        </h3>
                        <span className="text-xs font-bold text-[#565699] bg-indigo-50 px-2 py-0.5 rounded-md whitespace-nowrap shrink-0">
                          #{college.ranking}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-gray-400">location_on</span>
                        {college.city} · Est. {college.established}
                      </p>
                    </div>

                    {/* course tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {courseNames.map((name, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                          {name}
                        </span>
                      ))}
                      {college.courses.length > 3 && (
                        <span className="text-xs bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-md font-medium">
                          +{college.courses.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4 mt-auto">
                      <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                        <p className="text-xs text-gray-400 mb-0.5">Avg Pkg</p>
                        <p className="text-sm font-bold text-gray-800">{college.placement.averagePackage} LPA</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                        <p className="text-xs text-gray-400 mb-0.5">Placed</p>
                        <p className="text-sm font-bold text-gray-800">{college.placement.placementRate}%</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                        <p className="text-xs text-gray-400 mb-0.5">Min Fees</p>
                        <p className="text-sm font-bold text-gray-800">
                          {minFee >= 100000
                            ? `₹${(minFee / 100000).toFixed(1)}L`
                            : `₹${(minFee / 1000).toFixed(0)}K`}
                        </p>
                      </div>
                    </div>

                    <div
                      className="w-full text-center py-2.5 rounded-xl text-sm font-semibold text-white"
                      style={{ background: "linear-gradient(135deg, #565699, #7b7bd4)" }}
                    >
                      View Details →
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* ── PAGINATION ── */}
        {totalPages > 1 && (
          <div className="mt-10 flex justify-center gap-2 flex-wrap">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
              .reduce<(number | "...")[]>((acc, n, i, arr) => {
                if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push("...");
                acc.push(n);
                return acc;
              }, [])
              .map((n, i) =>
                n === "..." ? (
                  <span key={`e${i}`} className="px-3 py-2 text-gray-400 text-sm">…</span>
                ) : (
                  <button
                    key={n}
                    onClick={() => setPage(n as number)}
                    className={`w-10 h-10 rounded-xl text-sm font-semibold transition ${
                      page === n ? "text-white shadow" : "border border-gray-200 hover:bg-gray-50 text-gray-700"
                    }`}
                    style={page === n ? { background: "linear-gradient(135deg,#565699,#7b7bd4)" } : {}}
                  >
                    {n}
                  </button>
                )
              )}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* ── TOASTS ── */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`px-5 py-3 rounded-xl text-sm font-medium text-white shadow-lg pointer-events-auto transition-all ${
              t.type === "success" ? "bg-emerald-500" : "bg-red-500"
            }`}
          >
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}