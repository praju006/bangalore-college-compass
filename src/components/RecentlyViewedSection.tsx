import { Link } from "react-router-dom";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

export default function RecentlyViewedSection() {
  const { items, clear } = useRecentlyViewed();

  if (items.length === 0) return null;

  const typeColor: Record<string, string> = {
    Government: "bg-emerald-100 text-emerald-700",
    Private:    "bg-violet-100 text-violet-700",
    Deemed:     "bg-amber-100 text-amber-700",
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#565699]">Continue Exploring</p>
          <h2 className="text-2xl font-bold mt-1" style={{ fontFamily:"'Playfair Display', serif" }}>
            Recently Viewed
          </h2>
        </div>
        <button onClick={clear} className="text-xs text-gray-400 hover:text-red-400 transition-colors font-medium">
          Clear all
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2" style={{ scrollbarWidth:"none" }}>
        {items.map((item, i) => (
          <Link
            key={item.id}
            to={`/colleges/${item.id}`}
            className="shrink-0 w-52 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            style={{ textDecoration:"none", animationDelay:`${i*50}ms` }}
          >
            <div className="h-28 overflow-hidden relative">
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1562774053-701939374585?w=300&q=80"; }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <span className={`absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColor[item.type] || "bg-gray-100 text-gray-600"}`}>
                {item.type}
              </span>
            </div>
            <div className="p-3">
              <p className="font-bold text-xs text-slate-900 leading-snug">{item.shortName}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.city}</p>
              <div className="flex items-center gap-1 mt-1.5">
                <span className="text-amber-400 text-xs">★</span>
                <span className="text-xs font-semibold text-slate-600">{item.rating}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}