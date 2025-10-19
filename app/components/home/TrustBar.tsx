const badges = [
  { title: 'Verified Users', desc: 'KYC-verified community' },
  { title: 'Secure Payments', desc: 'Protected transactions' },
  { title: 'Fast Support', desc: 'We’re here 24/7' },
  { title: 'Top Rated', desc: 'Thousands of 5★ reviews' },
];

const TrustBar = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
      {badges.map((b) => (
        <div key={b.title} className="bg-white border border-surface-200 rounded-xl shadow-card p-4 text-center hover:shadow-lg transition">
          <div className="text-ink-900 font-semibold">{b.title}</div>
          <div className="text-ink-500 text-xs mt-1">{b.desc}</div>
        </div>
      ))}
    </div>
  );
};

export default TrustBar;







