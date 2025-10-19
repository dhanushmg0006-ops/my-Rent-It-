'use client';

import { useEffect, useState } from 'react';
import { FaQuoteLeft } from 'react-icons/fa';

const QUOTES = [
  '🎯 "Own less. Experience more — rent what you need, when you need it."',
  '✨ "Make memories, not clutter. Rent and return with ease."',
  '💰 "Turn idle items into income — list it and let it earn."',
  '🚀 "From cameras to consoles — everything you need, just a rental away."',
  '🌱 "Smart living starts with renting — flexible, affordable, sustainable."',
  '🎉 "Rent once, enjoy forever — the future of consumption."',
  '💡 "Access over ownership — rent premium items affordably."',
  '🌟 "Share more, waste less — join the rental revolution."',
];

const QuoteStrip = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % QUOTES.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mb-8 md:mb-12">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-purple-200/50 shadow-xl p-6 md:p-8">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent"></div>
        <div className="relative flex items-start gap-4 md:gap-6">
          <div className="shrink-0 text-2xl md:text-3xl text-purple-600 animate-pulse">
            <FaQuoteLeft />
          </div>
          <div className="w-full">
            <div key={index} className="text-lg md:text-xl lg:text-2xl text-gray-800 font-medium italic leading-relaxed transition-all duration-700 ease-out opacity-100 transform translate-y-0">
              {QUOTES[index]}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="h-1 w-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
              <span className="text-sm text-gray-600 font-medium">RentPal Philosophy</span>
            </div>
          </div>
        </div>

        {/* Floating quote marks */}
        <div className="absolute top-4 right-4 text-6xl text-purple-200 opacity-30 font-serif">&ldquo;</div>
        <div className="absolute bottom-4 left-4 text-4xl text-pink-200 opacity-20 font-serif">&rdquo;</div>
      </div>
    </div>
  );
};

export default QuoteStrip;



