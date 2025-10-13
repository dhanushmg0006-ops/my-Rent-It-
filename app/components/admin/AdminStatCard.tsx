interface AdminStatCardProps {
  title: string;
  value: string | number;
  caption?: string;
}

const AdminStatCard: React.FC<AdminStatCardProps> = ({ title, value, caption }) => {
  return (
    <div className="bg-white border border-surface-200 rounded-2xl shadow-card p-5">
      <div className="text-sm text-ink-500">{title}</div>
      <div className="text-2xl font-extrabold text-ink-900 mt-1">{value}</div>
      {caption && <div className="text-xs text-ink-500 mt-1">{caption}</div>}
    </div>
  );
};

export default AdminStatCard;




