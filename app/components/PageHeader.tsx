import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, icon }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand to-brand-dark text-white p-6 md:p-8 mb-6 md:mb-8">
      <div className="flex items-start gap-4">
        {icon && (
          <div className="hidden sm:flex items-center justify-center h-12 w-12 rounded-xl bg-white/15">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold leading-tight">{title}</h1>
          {subtitle && <p className="text-white/90 mt-1">{subtitle}</p>}
        </div>
      </div>
      <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
    </div>
  );
};

export default PageHeader;







