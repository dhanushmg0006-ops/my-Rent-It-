import { ReactNode, useRef } from 'react';

interface ScrollRailProps {
  children: ReactNode;
}

const ScrollRail: React.FC<ScrollRailProps> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const scrollBy = (dx: number) => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dx, behavior: 'smooth' });
  };
  return (
    <div className="relative">
      <button
        aria-label="Scroll left"
        onClick={() => scrollBy(-300)}
        className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 h-9 w-9 items-center justify-center rounded-full bg-white border border-surface-200 shadow-card hover:shadow-md"
      >
        ‹
      </button>
      <div ref={ref} className="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-1">
        {children}
      </div>
      <button
        aria-label="Scroll right"
        onClick={() => scrollBy(300)}
        className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 h-9 w-9 items-center justify-center rounded-full bg-white border border-surface-200 shadow-card hover:shadow-md"
      >
        ›
      </button>
    </div>
  );
};

export default ScrollRail;




