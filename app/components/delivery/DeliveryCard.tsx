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
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative aspect-[4/3] w-full sm:h-28 sm:w-28 flex-shrink-0 rounded-xl overflow-hidden border">
          <Image src={imageSrc} alt={title} fill className="object-cover" />
          <div className="absolute inset-0 pointer-events-none sheen" />
        </div>
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="min-w-0">
              <div className="font-semibold text-ink-900 truncate">{title}</div>
              <div className="mt-1"><StatusBadge status={status} /></div>
            </div>
            <div className="text-xs text-ink-500">#{id.slice(0,6)}</div>
          </div>
          <div className="text-sm text-ink-700 leading-relaxed">
            {address}
            {phone ? (
              <span className="block sm:inline sm:ml-1 text-ink-500">📞 {phone}</span>
            ) : null}
          </div>
          <div className="pt-2 border-t border-surface-200 sm:border-t-0 sm:pt-0">
            <DeliveryStepper status={status} />
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-xs text-ink-500">Updated just now</div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="btn-primary px-3 py-2 text-sm w-full sm:w-auto">Track</button>
          <button className="border border-surface-200 rounded-lg px-3 py-2 text-sm hover:bg-surface-100 w-full sm:w-auto">Help</button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryCard;



