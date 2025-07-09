import { useState, useEffect } from "react";

export default function CountdownTimer() {
  const [daysLeft, setDaysLeft] = useState<number>(0);

  useEffect(() => {
    const updateCountdown = () => {
      const neetDate = new Date('2026-05-07');
      const today = new Date();
      const diff = neetDate.getTime() - today.getTime();
      
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        setDaysLeft(days);
      }
    };

    updateCountdown();
  }, []);

  return (
    <section className="mb-12">
      <div className="bg-gradient-hero rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-black/10 rounded-3xl"></div>
        <div className="relative z-10">
          <div className="text-center">
            <h2 className="text-3xl md:text-5xl heading-primary mb-4">NEET 2026</h2>
            <p className="text-2xl md:text-3xl heading-secondary">
              {daysLeft} days left for NEET 2026
            </p>
          </div>
        </div>
        
        {/* Modern Decorative Elements */}
        <div className="absolute top-4 right-4 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-white/15 rounded-full blur-xl"></div>
        <div className="absolute top-20 left-20 w-16 h-16 bg-white/10 rounded-full blur-lg"></div>
      </div>
    </section>
  );
}
