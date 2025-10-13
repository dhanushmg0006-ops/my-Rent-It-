interface StatusBadgeProps {
  status: string;
}

const colorFor = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes('delivered')) return 'bg-green-50 text-green-700 border-green-200';
  if (s.includes('out')) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (s.includes('dispatch')) return 'bg-blue-50 text-blue-700 border-blue-200';
  if (s.includes('pending')) return 'bg-gray-50 text-gray-700 border-gray-200';
  return 'bg-neutral-50 text-neutral-700 border-surface-200';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold border ${colorFor(status)} shadow-sm transition`}
      title={status}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-30" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
      </span>
      {status}
    </span>
  );
}

export default StatusBadge;



