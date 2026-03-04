import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap, ArrowRight, ArrowLeft, Sparkles,
  TrendingUp, Star, IndianRupee, CheckCircle2, AlertTriangle, XCircle,
  ChevronDown, MapPin
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import colleges from '@/data/colleges';
import { getRecommendations, getRecommendationStats, StudentProfile, RecommendationResult } from '@/lib/recommendation';
import { cn } from '@/lib/utils';

const INDIA_CITIES = [
  "Any City",
  "Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum", "Dharwad",
  "Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad",
  "New Delhi", "Noida", "Gurgaon", "Faridabad",
  "Chennai", "Coimbatore", "Madurai", "Trichy",
  "Hyderabad", "Warangal", "Visakhapatnam", "Vijayawada",
  "Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur",
  "Kolkata", "Durgapur", "Siliguri",
  "Ahmedabad", "Surat", "Vadodara", "Rajkot",
  "Jaipur", "Jodhpur", "Udaipur", "Kota",
  "Bhopal", "Indore", "Jabalpur", "Gwalior",
  "Lucknow", "Kanpur", "Allahabad", "Varanasi", "Agra",
  "Chandigarh", "Amritsar", "Ludhiana",
  "Patna", "Ranchi", "Bhubaneswar", "Cuttack", "Guwahati",
];

// Custom pill dropdown component
function PillDropdown({
  value,
  options,
  onChange,
  icon,
  searchable = false,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  icon?: React.ReactNode;
  searchable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const filtered = searchable
    ? options.filter(o => o.toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:border-blue-400 hover:bg-blue-50/30 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
      >
        <span className="flex items-center gap-2">
          {icon}
          <span className="truncate">{value}</span>
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {searchable && (
            <div className="p-2 border-b">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                autoFocus
              />
            </div>
          )}
          <div className="max-h-52 overflow-y-auto">
            {filtered.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); setSearch(''); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-blue-50 ${value === opt ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700'}`}
              >
                {opt}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-4 py-3 text-sm text-gray-400">No results</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const Recommend = () => {
  const [step, setStep] = useState<'form' | 'results'>('form');
  const [profile, setProfile] = useState<StudentProfile>({
    marks: 75,
    preferredCourse: 'Computer Science',
    budgetMax: 250000,
    prioritizePlacement: false,
    prioritizeRating: false,
    preferredCollegeType: 'Any',
  });
  const [preferredCity, setPreferredCity] = useState('Any City');
  const [results, setResults] = useState<RecommendationResult[]>([]);

  const uniqueCourses = Array.from(
    new Set(colleges.flatMap((c: any) => (c.courses ?? []).map((course: any) => course.name)))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let filtered = colleges as any[];
    if (preferredCity !== 'Any City') {
      filtered = filtered.filter((c: any) =>
        c.city?.toLowerCase().includes(preferredCity.toLowerCase())
      );
    }
    const recommendations = getRecommendations(profile, filtered);
    setResults(recommendations);
    setStep('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => { setStep('form'); setResults([]); };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        {step === 'form' ? (
          <RecommendationForm
            profile={profile}
            setProfile={setProfile}
            onSubmit={handleSubmit}
            uniqueCourses={uniqueCourses}
            preferredCity={preferredCity}
            setPreferredCity={setPreferredCity}
          />
        ) : (
          <RecommendationResults results={results} profile={profile} onReset={handleReset} preferredCity={preferredCity} />
        )}
      </main>
      <Footer />
    </div>
  );
};

interface FormProps {
  profile: StudentProfile;
  setProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
  onSubmit: (e: React.FormEvent) => void;
  uniqueCourses: string[];
  preferredCity: string;
  setPreferredCity: (v: string) => void;
}

function RecommendationForm({ profile, setProfile, onSubmit, uniqueCourses, preferredCity, setPreferredCity }: FormProps) {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 py-14">
        <div className="container text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur">
            <Sparkles className="h-4 w-4" />
            AI-Powered Matching
          </div>
          <h1 className="text-3xl font-bold text-white lg:text-4xl">Find Your Perfect College Match</h1>
          <p className="mt-3 text-blue-100">Enter your details and get personalized college recommendations.</p>
        </div>
      </section>

      {/* Form */}
      <section className="py-10">
        <div className="container">
          <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-5">

            {/* Academic */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 space-y-6">
              <h3 className="flex items-center gap-2 text-base font-semibold text-gray-800">
                <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <GraduationCap className="h-4 w-4 text-yellow-600" />
                </div>
                Academic Performance
              </h3>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium text-gray-600">Your Marks / Percentage</Label>
                  <span className="text-2xl font-bold text-blue-600">{profile.marks}%</span>
                </div>
                <Slider
                  value={[profile.marks]}
                  onValueChange={(v) => setProfile(p => ({ ...p, marks: v[0] }))}
                  min={40} max={100} step={1}
                />
                <p className="mt-2 text-xs text-gray-400">12th percentage or CET/entrance exam percentile</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600 mb-2 block">Preferred Course / Stream</Label>
                <PillDropdown
                  value={profile.preferredCourse}
                  options={uniqueCourses}
                  onChange={(v) => setProfile(p => ({ ...p, preferredCourse: v }))}
                  icon={<GraduationCap className="w-4 h-4 text-blue-500" />}
                  searchable
                />
              </div>
            </div>

            {/* Location */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 space-y-4">
              <h3 className="flex items-center gap-2 text-base font-semibold text-gray-800">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-green-600" />
                </div>
                Preferred Location
              </h3>
              <PillDropdown
                value={preferredCity}
                options={INDIA_CITIES}
                onChange={setPreferredCity}
                icon={<MapPin className="w-4 h-4 text-green-500" />}
                searchable
              />
              {preferredCity !== 'Any City' && (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full border border-green-200">
                    <MapPin className="w-3 h-3" /> {preferredCity}
                  </span>
                  <button type="button" onClick={() => setPreferredCity('Any City')} className="text-xs text-gray-400 hover:text-gray-600">Clear</button>
                </div>
              )}
            </div>

            {/* Budget */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 space-y-6">
              <h3 className="flex items-center gap-2 text-base font-semibold text-gray-800">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <IndianRupee className="h-4 w-4 text-blue-600" />
                </div>
                Budget & Preferences
              </h3>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium text-gray-600">Maximum Annual Budget</Label>
                  <span className="text-2xl font-bold text-blue-600">₹{(profile.budgetMax / 100000).toFixed(1)}L</span>
                </div>
                <Slider
                  value={[profile.budgetMax]}
                  onValueChange={(v) => setProfile(p => ({ ...p, budgetMax: v[0] }))}
                  min={50000} max={500000} step={10000}
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600 mb-2 block">College Type Preference</Label>
                <PillDropdown
                  value={profile.preferredCollegeType ?? 'Any'}
                  options={['Any', 'Government', 'Private', 'Deemed']}
                  onChange={(v) => setProfile(p => ({ ...p, preferredCollegeType: v as StudentProfile['preferredCollegeType'] }))}
                />
              </div>
            </div>

            {/* Priorities */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 space-y-4">
              <h3 className="flex items-center gap-2 text-base font-semibold text-gray-800">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
                What Matters Most?
              </h3>

              <div className="space-y-3">
                {[
                  { key: 'prioritizePlacement', label: 'Prioritize Placement', desc: 'Give more weight to placement stats' },
                  { key: 'prioritizeRating', label: 'Prioritize Ratings & Rankings', desc: 'Focus on college reputation and NIRF rankings' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                    </div>
                    <Switch
                      checked={profile[key as keyof StudentProfile] as boolean}
                      onCheckedChange={(checked) => setProfile(p => ({
                        ...p,
                        [key]: checked,
                        ...(key === 'prioritizePlacement' && checked ? { prioritizeRating: false } : {}),
                        ...(key === 'prioritizeRating' && checked ? { prioritizePlacement: false } : {}),
                      }))}
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-base font-semibold text-white shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              Get Recommendations
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

interface ResultsProps {
  results: RecommendationResult[];
  profile: StudentProfile;
  onReset: () => void;
  preferredCity: string;
}

function RecommendationResults({ results, profile, onReset, preferredCity }: ResultsProps) {
  const stats = getRecommendationStats(results);

  return (
    <>
      <section className="bg-gradient-to-br from-blue-700 to-indigo-700 py-10">
        <div className="container">
          <button onClick={onReset} className="mb-5 flex items-center gap-2 text-sm text-blue-200 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Form
          </button>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white lg:text-3xl">Your Personalized Recommendations</h1>
              <p className="mt-1 text-blue-200 text-sm">
                {profile.marks}% marks · {profile.preferredCourse} · ₹{(profile.budgetMax / 100000).toFixed(1)}L budget
                {preferredCity !== 'Any City' && ` · ${preferredCity}`}
              </p>
            </div>

            <div className="flex gap-3">
              {[
                { value: stats.totalMatches, label: 'Matches', color: 'text-white' },
                { value: stats.eligibleCount, label: 'Eligible', color: 'text-green-300' },
                { value: `₹${stats.avgPlacement.toFixed(1)}L`, label: 'Avg Package', color: 'text-yellow-300' },
              ].map(({ value, label, color }) => (
                <div key={label} className="rounded-xl bg-white/10 backdrop-blur px-4 py-3 text-center">
                  <p className={`text-xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-blue-200">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container">
          {results.length === 0 ? (
            <div className="py-20 text-center">
              <GraduationCap className="mx-auto h-16 w-16 text-gray-300" />
              <h3 className="mt-4 text-xl font-semibold text-gray-700">No Matching Colleges</h3>
              <p className="mt-2 text-gray-400">Try adjusting your city, budget, or preferences.</p>
              <button onClick={onReset} className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700">
                Modify Preferences
              </button>
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
              {results.map((result, index) => (
                <RecommendationCard key={result.college.id} result={result} rank={index + 1} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function RecommendationCard({ result, rank }: { result: RecommendationResult; rank: number }) {
  const [isOpen, setIsOpen] = useState(rank <= 3);
  const { college, matchingCourses, totalScore, breakdown, explanation, eligibilityStatus } = result;

  const StatusIcon = eligibilityStatus === 'eligible' ? CheckCircle2 : eligibilityStatus === 'marginal' ? AlertTriangle : XCircle;
  const statusColor = eligibilityStatus === 'eligible' ? 'text-green-500' : eligibilityStatus === 'marginal' ? 'text-yellow-500' : 'text-red-500';

  return (
    <div className={cn("rounded-2xl border bg-white shadow-sm overflow-hidden transition-all", rank === 1 && "ring-2 ring-blue-500")}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-base font-bold",
            rank === 1 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
          )}>
            #{rank}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 truncate">{college.name}</h3>
              <StatusIcon className={cn("h-4 w-4 flex-shrink-0", statusColor)} />
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{matchingCourses[0]?.name} · {college.city}</p>
          </div>

          <div className="hidden sm:flex items-center gap-5 flex-shrink-0">
            <div className="text-center">
              <p className="text-xl font-bold text-blue-600">{totalScore.toFixed(0)}</p>
              <p className="text-xs text-gray-400">Score</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-sm">{college.rating}</span>
              </div>
              <p className="text-xs text-gray-400">Rating</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-sm text-gray-800">₹{college.placement.averagePackage}L</p>
              <p className="text-xs text-gray-400">Avg Pkg</p>
            </div>
          </div>

          <ChevronDown className={cn("h-5 w-5 text-gray-400 transition-transform flex-shrink-0", isOpen && "rotate-180")} />
        </div>
      </button>

      {isOpen && (
        <div className="border-t bg-gray-50 p-5">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-700">Score Breakdown</h4>
              <div className="space-y-2.5">
                <ScoreBar label="Eligibility" score={breakdown.eligibilityScore} />
                <ScoreBar label="Placement" score={breakdown.placementcore} />
                <ScoreBar label="Rating" score={breakdown.ratingScore} />
                <ScoreBar label="Affordability" score={breakdown.affordabilityScore} />
                <ScoreBar label="Course Match" score={breakdown.courseMatchScore} />
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-700">Why This College?</h4>
              <ul className="space-y-1.5">
                {explanation.map((exp, i) => (
                  <li key={i} className="text-sm text-gray-600">{exp}</li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                {matchingCourses.map(course => (
                  <span key={course.id} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-3 py-1">
                    {course.name} · ₹{(course.fees / 100000).toFixed(1)}L/yr
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <Link
              to={`/colleges/${college.id}`}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              View Details
            </Link>
            <a
              href={college.website}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Visit Website
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-gray-500">{label}</span>
        <span className="font-semibold text-gray-700">{score.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-200">
        <div
          className="h-1.5 rounded-full bg-blue-500 transition-all"
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default Recommend;