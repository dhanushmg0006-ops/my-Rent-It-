import Image from "next/image";
import { SafeListing } from "@/app/types";

type Deal = {
  title: string;
  subtitle: string;
  tag: string;
  image: string;
};

const fallbackDeals: Deal[] = [
  { title: "📷 DSLR Cameras", subtitle: "From ₹499/day", tag: "🔥 Hot", image: "/images/placeholder.jpg" },
  { title: "🎮 Gaming Consoles", subtitle: "Save up to 50%", tag: "⚡ Trending", image: "/images/placeholder.jpg" },
  { title: "🏃‍♂️ Treadmills", subtitle: "From ₹399/day", tag: "💪 Fitness", image: "/images/placeholder.jpg" },
  { title: "🎉 Party Lights", subtitle: "Up to 70% Off", tag: "✨ Special", image: "/images/placeholder.jpg" },
  { title: "🔊 Sound Systems", subtitle: "From ₹299/day", tag: "🎵 Premium", image: "/images/placeholder.jpg" },
  { title: "💻 Laptops", subtitle: "Up to 45% Off", tag: "🚀 Latest", image: "/images/placeholder.jpg" },
  { title: "📱 Smartphones", subtitle: "From ₹199/day", tag: "📱 New", image: "/images/placeholder.jpg" },
  { title: "🏠 Home Appliances", subtitle: "Up to 60% Off", tag: "🏡 Essential", image: "/images/placeholder.jpg" },
];

function computeDiscountTag(title: string): string {
  const seed = Array.from(title).reduce((a, c) => a + c.charCodeAt(0), 0);
  const pct = 10 + (seed % 60); // 10% - 69%
  return `${pct}% Off`;
}

interface DealsRailProps {
  items?: SafeListing[];
}

const DealsRail = ({ items = [] }: DealsRailProps) => {
  const deals: Deal[] = (items.length
    ? items.slice(0, 12).map((it) => ({
        title: it.title,
        subtitle: `From ₹${it.price}/day`,
        tag: computeDiscountTag(it.title),
        image: it.imageSrc || "/images/placeholder.jpg",
      }))
    : fallbackDeals);
  return (
    <section id="deals" className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">🔥 Deals of the Day</h3>
          <p className="text-gray-600 text-sm">Limited time offers on premium rentals</p>
        </div>
        <a href="#all-deals" className="btn-primary px-6 py-3 text-sm font-semibold hover:scale-105 transition-transform">
          View All Deals →
        </a>
      </div>
      <div className="marquee no-scrollbar">
        <div className="marquee-track pr-4">
          {[...deals, ...deals].map((d, idx) => (
            <div key={`${d.title}-${idx}`} className="min-w-[240px] max-w-[240px] bg-white border border-gray-200 rounded-3xl shadow-lg p-4 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group">
              <div className="relative w-full aspect-square overflow-hidden rounded-2xl mb-3">
                <Image src={d.image} alt={d.title} fill className="object-cover group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="absolute top-3 left-3 chip bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold shadow-lg">
                  {d.tag}
                </span>
                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-gray-900 font-bold text-base leading-tight group-hover:text-brand transition-colors">
                  {d.title}
                </h4>
                <p className="text-gray-600 text-sm font-medium">{d.subtitle}</p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    🔥 Trending
                  </span>
                  <span className="text-xs font-semibold text-green-600">
                    ⭐ 4.8
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DealsRail;


