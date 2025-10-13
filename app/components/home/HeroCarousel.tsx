'use client';

import { useEffect, useState } from 'react';

type Slide = {
  title: string;
  desc: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
  bg: string; // tailwind gradient or bg classes
};

const slides: Slide[] = [
  {
    title: '🎉 Festival Mega Sale',
    desc: 'Up to 70% off on cameras, consoles, laptops & more! Limited time offer.',
    ctaPrimary: { label: 'Shop Now', href: '#deals' },
    ctaSecondary: { label: 'List & Earn', href: '#lend-cta' },
    bg: 'bg-gradient-to-br from-orange-400 via-red-500 to-pink-500',
  },
  {
    title: '💳 Zero Deposit Rentals',
    desc: 'Rent premium items without security deposits. Hassle-free bookings!',
    ctaPrimary: { label: 'Browse Items', href: '#deals' },
    ctaSecondary: { label: 'List Now', href: '#lend-cta' },
    bg: 'bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600',
  },
  {
    title: '✨ New Arrivals Daily',
    desc: 'Fresh listings added every day. Be the first to rent the latest gadgets!',
    ctaPrimary: { label: 'Discover', href: '#deals' },
    ctaSecondary: { label: 'Start Listing', href: '#lend-cta' },
    bg: 'bg-gradient-to-br from-green-400 via-teal-500 to-blue-500',
  },
  {
    title: '🚚 Same Day Delivery',
    desc: 'Get your rented items delivered today! Fast & reliable service.',
    ctaPrimary: { label: 'Order Now', href: '#deals' },
    ctaSecondary: { label: 'List Items', href: '#lend-cta' },
    bg: 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500',
  },
];

const HeroCarousel = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl text-white mb-12 shadow-2xl">
      <div className="relative h-[280px] md:h-[400px]">
        {slides.map((s, i) => (
          <div
            key={s.title}
            className={`absolute inset-0 ${s.bg} transition-all duration-1000 ease-out ${i === index ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} flex items-center`}
          >
            <div className="p-8 md:p-12 max-w-4xl relative z-10">
              <div className="animate-in slide-in-from-left-4 duration-700">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight drop-shadow-lg mb-4">
                  {s.title}
                </h1>
                <p className="mt-4 md:mt-6 text-lg md:text-xl text-white/95 leading-relaxed max-w-2xl">
                  {s.desc}
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <a href={s.ctaPrimary.href} className="btn-primary text-center py-4 px-8 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                    {s.ctaPrimary.label}
                  </a>
                  {s.ctaSecondary && (
                    <a href={s.ctaSecondary.href} className="btn-secondary text-center py-4 px-8 text-lg font-semibold border-2 border-white/30 hover:border-white hover:bg-white/10 transition-all">
                      {s.ctaSecondary.label}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Animated background elements */}
            <div className="absolute -right-32 -top-32 w-96 h-96 rounded-full bg-white/5 blur-3xl animate-pulse" />
            <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-white/10 blur-2xl animate-pulse delay-1000" />

            {/* Floating elements */}
            <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-white/30 rounded-full animate-bounce" />
            <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-white/40 rounded-full animate-bounce delay-300" />
            <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-white/20 rounded-full animate-bounce delay-700" />
          </div>
        ))}
      </div>

      {/* Enhanced Dots */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-3 w-3 rounded-full transition-all duration-300 ${i === index ? 'bg-white scale-125 shadow-lg' : 'bg-white/40 hover:bg-white/60'} hover:scale-110`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;



