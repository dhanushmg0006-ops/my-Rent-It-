import Image from "next/image";
import StatusBadge from "@/app/components/StatusBadge";
import DeliveryStepper from "@/app/components/delivery/DeliveryStepper";

interface DeliveryCardProps {
  id: string;
  title: string;
  imageSrc: string;
  status: string;
  address: string;
  phone?: string;
}

const DeliveryCard: React.FC<DeliveryCardProps> = ({ id, title, imageSrc, status, address, phone }) => {
  return (
    <div className="bg-white border border-surface-200 rounded-2xl shadow-card hover:shadow-2xl hover:-translate-y-0.5 transition p-4">
      <div className="flex gap-4">
        <div className="relative h-24 w-24 sm:h-28 sm:w-28 flex-shrink-0 rounded-xl overflow-hidden border">
          <Image src={imageSrc} alt={title} fill className="object-cover" />
          <div className="absolute inset-0 pointer-events-none sheen" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="font-semibold text-ink-900 truncate">{title}</div>
              <div className="mt-1"><StatusBadge status={status} /></div>
            </div>
            <div className="text-xs text-ink-500">#{id.slice(0,6)}</div>
          </div>
          <div className="mt-2 text-sm text-ink-700 line-clamp-2">{address}{phone ? ` | 📞 ${phone}` : ''}</div>
          <div className="mt-3">
            <DeliveryStepper status={status} />
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-ink-500">Updated just now</div>
        <div className="flex items-center gap-2">
          <button className="btn-primary px-3 py-2 text-sm">Track</button>
          <button className="border border-surface-200 rounded-lg px-3 py-2 text-sm hover:bg-surface-100">Help</button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryCard;



