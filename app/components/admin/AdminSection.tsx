import { ReactNode } from "react";

interface AdminSectionProps {
  title: string;
  children: ReactNode;
}

const AdminSection: React.FC<AdminSectionProps> = ({ title, children }) => {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-ink-900">{title}</h2>
      <div className="mt-3 bg-white border border-surface-200 rounded-2xl shadow-card p-4">
        {children}
      </div>
    </section>
  );
};

export default AdminSection;




