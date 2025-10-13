import React from 'react';

export default function FooterNew() {
  return (
    <footer className="bg-white border-t border-surface-200 mt-10">
      {/* Gradient Newsletter CTA */}
      <div className="bg-gradient-to-r from-brand to-brand-dark text-white">
        <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 py-8 md:py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <div className="text-2xl md:text-3xl font-extrabold">Stay in the loop</div>
            <div className="text-white/90 mt-1">Get exclusive deals, new arrivals, and tips—straight to your inbox.</div>
          </div>
          <form className="w-full md:w-auto">
            <div className="flex items-center bg-white rounded-xl overflow-hidden shadow-card">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-3 text-ink-900 w-full md:w-80 outline-none"
                aria-label="Email address"
              />
              <button type="button" className="btn-primary px-5 py-3">Subscribe</button>
            </div>
          </form>
        </div>
      </div>

      {/* Links and Info */}
      <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
          <div>
            <div className="font-bold text-ink-900 mb-3">Marketplace</div>
            <ul className="space-y-2 text-ink-500 text-sm">
              <li><a href="#">How it works</a></li>
              <li><a href="#">Safety & trust</a></li>
              <li><a href="#">Fees & charges</a></li>
              <li><a href="#">List your item</a></li>
            </ul>
          </div>
          <div>
            <div className="font-bold text-ink-900 mb-3">Categories</div>
            <ul className="space-y-2 text-ink-500 text-sm">
              <li><a href="#">Cameras</a></li>
              <li><a href="#">Gaming</a></li>
              <li><a href="#">Electronics</a></li>
              <li><a href="#">Fitness</a></li>
            </ul>
          </div>
          <div>
            <div className="font-bold text-ink-900 mb-3">Support</div>
            <ul className="space-y-2 text-ink-500 text-sm">
              <li><a href="#">Help center</a></li>
              <li><a href="#">Cancellations</a></li>
              <li><a href="#">Refunds</a></li>
              <li><a href="#">Contact us</a></li>
            </ul>
          </div>
          <div>
            <div className="font-bold text-ink-900 mb-3">Company</div>
            <ul className="space-y-2 text-ink-500 text-sm">
              <li><a href="#">About</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Press</a></li>
              <li><a href="#">Terms & privacy</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-surface-200">
        <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-ink-500 text-sm">© {new Date().getFullYear()} RENT-IT. All rights reserved.</div>
          <div className="flex items-center gap-4 text-ink-500 text-sm">
            <a href="#">Twitter</a>
            <a href="#">Instagram</a>
            <a href="#">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
}


