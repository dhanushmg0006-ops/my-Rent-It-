interface DeliveryStepperProps {
  status: string;
}

const STEPS = [
  { key: 'pending', label: 'Pending' },
  { key: 'dispatched', label: 'Dispatched' },
  { key: 'out-for-delivery', label: 'Out for delivery' },
  { key: 'delivered', label: 'Delivered' },
];

function stepIndex(status: string) {
  const idx = STEPS.findIndex(s => status.toLowerCase().includes(s.key));
  return idx === -1 ? 0 : idx;
}

const DeliveryStepper: React.FC<DeliveryStepperProps> = ({ status }) => {
  const current = stepIndex(status);
  return (
    <div className="flex items-center gap-3">
      {STEPS.map((s, i) => {
        const active = i <= current;
        return (
          <div key={s.key} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`h-2.5 w-2.5 rounded-full ring-2 ${active ? 'bg-brand ring-brand/20' : 'bg-surface-200 ring-transparent'}`}
                title={s.label}
              />
              <div className={`text-xs font-medium ${active ? 'text-ink-900' : 'text-ink-500'}`}>{s.label}</div>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-8 ${i < current ? 'bg-brand' : 'bg-surface-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DeliveryStepper;



