const points = [
  {
    title: "Why Rent with Us?",
    desc: "Access thousands of items across categories at a fraction of the cost."
  },
  {
    title: "Safe & Verified",
    desc: "Secure payments, verified users, and protected transactions."
  },
  {
    title: "List & Earn",
    desc: "Turn idle items into income with zero hassle and full control."
  },
];

const InfoSection = () => {
  return (
    <section className="my-8 md:my-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {points.map((p) => (
          <div key={p.title} className="bg-white border border-surface-200 rounded-2xl shadow-card p-6">
            <div className="text-ink-900 font-bold text-lg">{p.title}</div>
            <div className="text-ink-500 mt-2 text-sm">{p.desc}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 md:mt-8 text-ink-700 text-sm leading-relaxed">
        Discover a smarter way to own less and experience more. From weekend parties to professional shoots and fitness goals, our marketplace brings the best of everything to your doorstep—on your terms.
      </div>
    </section>
  );
};

export default InfoSection;








