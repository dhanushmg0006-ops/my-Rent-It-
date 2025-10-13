'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Logo = () => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={() => router.push('/')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative cursor-pointer group"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-brand to-brand-dark rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-300" />
      <div className="relative">
        <Image
          className="hidden md:block transition-transform duration-300 group-hover:scale-105"
          src="/images/logo.png"
          height="50"
          width="80"
          alt="RentPal Logo"
        />
        <div className="md:hidden text-2xl font-black bg-gradient-to-r from-brand to-brand-dark bg-clip-text text-transparent">
          RentPal
        </div>
      </div>

      {/* Subtle glow effect on hover */}
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-brand/20 to-brand-dark/20 opacity-0 transition-opacity duration-300 ${isHovered ? 'opacity-100' : ''}`} />

      {/* Sparkle effect */}
      <div className={`absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full opacity-0 transition-opacity duration-300 ${isHovered ? 'opacity-100 animate-pulse' : ''}`} />
    </div>
   );
}

export default Logo;
