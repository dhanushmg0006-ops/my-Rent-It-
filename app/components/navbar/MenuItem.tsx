'use client';

interface MenuItemProps {
  onClick: () => void;
  label: string;
  className?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({
  onClick,
  label,
  className = ""
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        px-6 py-4
        hover:bg-gradient-to-r hover:from-brand/5 hover:to-brand-dark/5
        transition-all duration-200
        font-medium
        cursor-pointer
        group
        ${className}
      `}
    >
      <div className="flex items-center justify-between">
        <span className="text-gray-700 group-hover:text-brand transition-colors">
          {label}
        </span>
        <span className="text-gray-400 group-hover:text-brand group-hover:translate-x-1 transition-all duration-200">
          →
        </span>
      </div>
    </div>
   );
}

export default MenuItem;