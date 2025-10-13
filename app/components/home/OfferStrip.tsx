import { FaBolt, FaTshirt } from "react-icons/fa";
import { MdPhoneIphone, MdOutlineDevicesOther, MdKitchen } from "react-icons/md";
import { BiBook, BiCamera, BiCar } from "react-icons/bi";
import { GiWeightLiftingUp } from "react-icons/gi";

const offers = [
  { label: "🔥 Hot Deals", sub: "Up to 80% Off", Icon: FaBolt, color: "text-orange-500" },
  { label: "📱 Smartphones", sub: "From ₹3,999", Icon: MdPhoneIphone, color: "text-blue-500" },
  { label: "💻 Electronics", sub: "Up to 75% Off", Icon: MdOutlineDevicesOther, color: "text-purple-500" },
  { label: "👕 Fashion", sub: "Min 60% Off", Icon: FaTshirt, color: "text-pink-500" },
  { label: "🏠 Appliances", sub: "Up to 50% Off", Icon: MdKitchen, color: "text-green-500" },
  { label: "📚 Books & Study", sub: "From ₹49", Icon: BiBook, color: "text-indigo-500" },
  { label: "📷 Cameras", sub: "Up to 45% Off", Icon: BiCamera, color: "text-red-500" },
  { label: "🚗 Vehicles", sub: "Rent & Drive", Icon: BiCar, color: "text-teal-500" },
  { label: "💪 Fitness", sub: "Up to 40% Off", Icon: GiWeightLiftingUp, color: "text-emerald-500" },
  { label: "🎮 Gaming", sub: "From ₹299/day", Icon: FaBolt, color: "text-violet-500" },
];

const OfferStrip = () => {
  return (
    <div className="pt-3 pb-2">
      <div className="marquee no-scrollbar">
        {/* Duplicate the list to create a seamless loop */}
        <div className="marquee-track pr-4">
          {[...offers, ...offers].map(({ label, sub, Icon, color }, idx) => (
            <div
              key={`${label}-${idx}`}
              className="
                min-w-[200px]
                flex items-center gap-4
                bg-gradient-to-r from-white to-gray-50 border border-surface-200 rounded-2xl shadow-card
                px-5 py-4
                hover:shadow-xl hover:scale-105 transition-all duration-300
                cursor-pointer
              "
            >
              <div className={`
                inline-flex items-center justify-center
                h-12 w-12 rounded-full
                bg-gradient-to-br from-white to-gray-100 shadow-md
                ${color}
              `}>
                <Icon size={22} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-gray-900 mb-1">{label}</div>
                <div className="text-xs font-semibold text-gray-600 bg-yellow-100 px-2 py-1 rounded-full inline-block">
                  {sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OfferStrip;


