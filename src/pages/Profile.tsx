import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Heart, Star, FileText, User, MapPin, Trash2, ChevronDown, Pencil, Check } from "lucide-react";

// ── import local colleges data so we can look up details by name ──
import allColleges from "@/data/colleges";
import type { College } from "@/data/colleges";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const INDIA_CITIES = [
  "Bangalore", "Mysore", "Mumbai", "Pune", "Nagpur",
  "New Delhi", "Noida", "Gurgaon",
  "Chennai", "Coimbatore", "Trichy",
  "Hyderabad", "Visakhapatnam",
  "Kochi", "Thiruvananthapuram",
  "Kolkata", "Ahmedabad", "Surat",
  "Jaipur", "Jodhpur", "Chandigarh",
  "Lucknow", "Kanpur", "Patna", "Bhopal", "Indore",
  "Manipal", "Vellore", "Roorkee", "Kanpur",
];

// resolve a saved college entry (string name OR object) → full College from local data
const resolveCollege = (entry: any): College | null => {
  const name = typeof entry === "string" ? entry : entry?.name;
  if (!name) return null;
  return allColleges.find(
    c => c.name.toLowerCase() === name.toLowerCase()
  ) ?? null;
};

export default function Profile() {
  const [user, setUser]               = useState<any>(null);
  const [recommended, setRecommended] = useState<College[]>([]);
  const [activeTab, setActiveTab]     = useState("saved");
  const [loading, setLoading]         = useState(true);
  const [removing, setRemoving]       = useState<string | null>(null);

  const [editingPrefs, setEditingPrefs]   = useState(false);
  const [prefCity, setPrefCity]           = useState("");
  const [prefCourse, setPrefCourse]       = useState("");
  const [prefBudget, setPrefBudget]       = useState("");
  const [citySearch, setCitySearch]       = useState("");
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [savingPrefs, setSavingPrefs]     = useState(false);
  const [toast, setToast]                 = useState<string | null>(null);

  const userStr    = localStorage.getItem("user");
  const parsedLocal = userStr ? JSON.parse(userStr) : null;
  const userId     = localStorage.getItem("userId") ?? parsedLocal?.id ?? parsedLocal?._id ?? null;
  const token      = localStorage.getItem("token");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const fetchProfile = useCallback(async () => {
    if (!userId || !token) {
      if (parsedLocal) setUser(parsedLocal);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API}/api/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setUser(data);
      setPrefCity(data.preferredCity || "");
      setPrefCourse(data.preferredCourse || "");
      setPrefBudget(data.budgetRange ? String(data.budgetRange) : "");
    } catch {
      if (parsedLocal) setUser(parsedLocal);
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // build recommended from local data using user preferences
  useEffect(() => {
    if (!user) return;
    const city   = user.preferredCity;
    const course = user.preferredCourse;
    const budget = user.budgetRange;

    let recs = allColleges;
    if (city)   recs = recs.filter(c => c.city.toLowerCase().includes(city.toLowerCase()));
    if (course) recs = recs.filter(c => c.courses.some(co => co.name.toLowerCase().includes(course.toLowerCase())));
    if (budget) recs = recs.filter(c => c.courses.some(co => co.fees <= budget));
    setRecommended(recs.slice(0, 6));
  }, [user]);

  const savePreferences = async () => {
    if (!userId) return;
    setSavingPrefs(true);
    try {
      await fetch(`${API}/api/profile/preferences`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          userId,
          preferredCity:   prefCity,
          preferredCourse: prefCourse,
          budgetRange:     Number(prefBudget) || 0,
        }),
      });
      await fetchProfile();
      setEditingPrefs(false);
      showToast("Preferences saved!");
    } catch {
      showToast("Failed to save preferences");
    } finally {
      setSavingPrefs(false);
    }
  };

  const removeCollege = async (collegeName: string) => {
    if (!userId || removing) return;
    setRemoving(collegeName);
    try {
      // try both endpoint names for compatibility
      const res = await fetch(`${API}/api/profile/unsave`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, collegeName }),
      });
      // fallback to /remove if /unsave returns 404
      if (res.status === 404) {
        await fetch(`${API}/api/profile/remove`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ userId, collegeName }),
        });
      }
      // optimistic UI — remove from local state immediately
      setUser((prev: any) => ({
        ...prev,
        savedColleges: (prev.savedColleges || []).filter((c: any) => {
          const name = typeof c === "string" ? c : c?.name;
          return name !== collegeName;
        }),
      }));
      showToast(`Removed ${collegeName}`);
    } catch {
      showToast("Failed to remove college");
    } finally {
      setRemoving(null);
    }
  };

  const filteredCities = INDIA_CITIES.filter(c =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  );

  // ── resolve saved colleges to full objects ──
  const savedColleges: College[] = (user?.savedColleges || [])
    .map(resolveCollege)
    .filter(Boolean) as College[];

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm">Loading profile…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1 items-center justify-center flex-col gap-4">
          <User className="w-12 h-12 text-gray-300" />
          <p className="text-gray-500">Please login to view your profile.</p>
          <Link to="/login" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition">
            Login
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "saved",       label: `Saved (${savedColleges.length})`, icon: <Heart className="w-4 h-4" /> },
    { id: "recommended", label: "Recommended",                      icon: <Star className="w-4 h-4" /> },
    { id: "applied",     label: "Applied",                          icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        <div className="container py-8 max-w-4xl mx-auto px-4">

          {/* ── PROFILE CARD ── */}
          <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
            <div className="flex items-center gap-5 mb-4">
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                {user.name?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              {userId && (
                <button
                  onClick={() => setEditingPrefs(!editingPrefs)}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-200 rounded-full px-3 py-1.5 transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                  {editingPrefs ? "Cancel" : "Edit Preferences"}
                </button>
              )}
            </div>

            {!editingPrefs ? (
              <div className="flex flex-wrap gap-3 mt-2">
                <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
                  <MapPin className="w-3 h-3" />
                  {user.preferredCity || "City not set"}
                </span>
                <span className="flex items-center gap-1.5 bg-purple-50 text-purple-700 text-xs font-medium px-3 py-1.5 rounded-full">
                  🎓 {user.preferredCourse || "Course not set"}
                </span>
                <span className="flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full">
                  💰 {user.budgetRange
                    ? `₹${(user.budgetRange / 100000).toFixed(1)}L budget`
                    : "Budget not set"}
                </span>
              </div>
            ) : (
              <div className="mt-3 grid gap-3 sm:grid-cols-3 border-t pt-4">
                {/* city */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Preferred City</label>
                  <div className="relative">
                    <button
                      onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                      className="w-full flex items-center justify-between border rounded-lg px-3 py-2 text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      <span className={prefCity ? "text-gray-800" : "text-gray-400"}>
                        {prefCity || "Select city"}
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                    {cityDropdownOpen && (
                      <div className="absolute top-full mt-1 left-0 z-50 bg-white border rounded-xl shadow-xl w-full overflow-hidden">
                        <div className="p-2 border-b">
                          <input
                            autoFocus
                            type="text"
                            placeholder="Search city..."
                            value={citySearch}
                            onChange={e => setCitySearch(e.target.value)}
                            className="w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none"
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {filteredCities.map(city => (
                            <button key={city}
                              onClick={() => { setPrefCity(city); setCityDropdownOpen(false); setCitySearch(""); }}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 ${prefCity === city ? "text-blue-600 font-medium" : "text-gray-700"}`}
                            >
                              {city}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* course */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Preferred Course</label>
                  <input
                    type="text"
                    value={prefCourse}
                    onChange={e => setPrefCourse(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>

                {/* budget */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Budget (₹)</label>
                  <input
                    type="number"
                    value={prefBudget}
                    onChange={e => setPrefBudget(e.target.value)}
                    placeholder="e.g. 500000"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>

                <div className="sm:col-span-3 flex gap-2 justify-end">
                  <button onClick={() => setEditingPrefs(false)}
                    className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
                    Cancel
                  </button>
                  <button onClick={savePreferences} disabled={savingPrefs}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    <Check className="w-4 h-4" />
                    {savingPrefs ? "Saving…" : "Save Preferences"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── TABS ── */}
          <div className="flex gap-2 mb-6">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow"
                    : "bg-white text-gray-600 border hover:bg-gray-50"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── SAVED ── */}
          {activeTab === "saved" && (
            <div>
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Saved Colleges</h2>
              {savedColleges.length === 0 ? (
                <div className="bg-white rounded-2xl border p-10 text-center text-gray-400">
                  <Heart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium mb-1">No saved colleges yet</p>
                  <p className="text-sm">Click the ♥ on any college card to save it here.</p>
                  <Link to="/colleges"
                    className="inline-block mt-4 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                    Browse Colleges
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {savedColleges.map(college => (
                    <Link
                      key={college.id}
                      to={`/colleges/${college.id}`}
                      className="bg-white rounded-2xl border p-4 flex gap-4 hover:shadow-md transition-shadow group"
                      style={{ textDecoration: "none" }}
                    >
                      {/* thumbnail */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                        <img
                          src={college.imageUrl}
                          alt={college.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={e => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1562774053-701939374585?w=200&q=80";
                          }}
                        />
                      </div>

                      {/* info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm leading-snug group-hover:text-blue-600 transition-colors">
                          {college.name}
                        </h3>
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          {college.city}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-400">
                          <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-medium">
                            ★ {college.rating}
                          </span>
                          <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">
                            ₹{college.placement.averagePackage}L avg pkg
                          </span>
                          <span className={`px-2 py-0.5 rounded-full font-medium ${
                            college.type === "Government" ? "bg-emerald-50 text-emerald-600" :
                            college.type === "Private"    ? "bg-violet-50 text-violet-600" :
                                                           "bg-amber-50 text-amber-600"
                          }`}>
                            {college.type}
                          </span>
                        </div>
                      </div>

                      {/* remove button */}
                      <button
                        onClick={e => { e.preventDefault(); e.stopPropagation(); removeCollege(college.name); }}
                        disabled={removing === college.name}
                        className="text-red-300 hover:text-red-500 transition-colors p-1 mt-1 shrink-0 disabled:opacity-50"
                        title="Remove from saved"
                      >
                        {removing === college.name
                          ? <div className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                          : <Trash2 className="w-4 h-4" />
                        }
                      </button>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── RECOMMENDED ── */}
          {activeTab === "recommended" && (
            <div>
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Recommended For You</h2>
              {recommended.length === 0 ? (
                <div className="bg-white rounded-2xl border p-10 text-center text-gray-400">
                  <Star className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium mb-1">No recommendations yet</p>
                  <p className="text-sm">Set your preferred city and course above to get recommendations.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {recommended.map(college => (
                    <Link key={college.id} to={`/colleges/${college.id}`}
                      className="bg-white rounded-2xl border p-4 flex gap-4 hover:shadow-md transition-shadow group"
                      style={{ textDecoration: "none" }}
                    >
                      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                        <img
                          src={college.imageUrl}
                          alt={college.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={e => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1562774053-701939374585?w=200&q=80";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm leading-snug group-hover:text-blue-600 transition-colors">
                          {college.name}
                        </h3>
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          {college.city}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-medium">★ {college.rating}</span>
                          <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">₹{college.placement.averagePackage}L avg</span>
                          <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">#{college.ranking} rank</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── APPLIED ── */}
          {activeTab === "applied" && (
            <div className="bg-white rounded-2xl border p-10 text-center text-gray-400">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium mb-1">Coming Soon</p>
              <p className="text-sm">Track your college applications here.</p>
            </div>
          )}

        </div>
      </main>

      <Footer />

      {/* ── TOAST ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl text-sm font-medium shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}