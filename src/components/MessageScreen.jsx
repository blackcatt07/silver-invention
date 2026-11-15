import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function MessageScreen({ active, onBack }) {
  const containerRef = useRef(null);
  const heartContainerRef = useRef(null);
  const hasAnimated = useRef(false);

  // Slide in/out animations (unchanged)
  useEffect(() => {
    if (!active || hasAnimated.current || !containerRef.current) return;
    hasAnimated.current = true;

    gsap.fromTo(
      containerRef.current,
      { x: "100%", opacity: 0 },
      { x: "0%", opacity: 1, duration: 0.8, ease: "power3.out" },
    );
  }, [active]);

  const handleReturn = () => {
    if (!containerRef.current) return;

    gsap.to(containerRef.current, {
      x: "100%",
      opacity: 0,
      duration: 0.6,
      ease: "power3.in",
      onComplete: () => {
        if (onBack) onBack();
      },
    });
  };

  // Hearts creation (unchanged)
  const createHearts = () => {
    if (!heartContainerRef.current) return;
    const hearts = ["❤️", "💕", "💘", "🥰", "💗", "💓", "💞"];
    for (let i = 0; i < 12; i++) {
      const heart = document.createElement("span");
      heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      heart.className = "heart-float text-3xl sm:text-4xl";
      heart.style.left = Math.random() * 80 + 10 + "%";
      heart.style.bottom = "60px";
      heart.style.animationDelay = Math.random() * 0.6 + "s";
      heartContainerRef.current.appendChild(heart);
      setTimeout(() => heart.remove(), 4200);
    }
  };

  if (!active) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-50 overflow-y-auto"
      style={{
  background: `
    radial-gradient(ellipse at 50% 25%, rgba(255, 218, 224, 0.65), transparent 48%),
    radial-gradient(circle at 10% 75%, rgba(255, 226, 218, 0.55), transparent 35%),
    radial-gradient(circle at 90% 70%, rgba(250, 215, 225, 0.5), transparent 35%),
    linear-gradient(135deg, #fffaf4 0%, #fff1ed 50%, #fff8f0 100%)
  `,
  fontFamily: "'Cormorant Garamond', serif",
}}
    >
      <style>{`
        .font-display { font-family: 'Playfair Display', serif; letter-spacing: 0.02em; }
        .font-body { font-family: 'Cormorant Garamond', serif; }
        
        @keyframes fadeUpDelayed { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes glowPulse { 0%, 100% { opacity: 0.35; filter: blur(60px); } 50% { opacity: 0.65; filter: blur(70px); } }
        @keyframes floatHeart { 0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; } 100% { transform: translateY(-140px) scale(0.3) rotate(360deg); opacity: 0; } }
        @keyframes shimmer { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        
        .animate-fade-up { animation: fadeUpDelayed 1s ease-out forwards; opacity: 0; }
        .delay-1 { animation-delay: 0.3s; }
        .delay-2 { animation-delay: 0.6s; }
        .delay-3 { animation-delay: 0.9s; }
        .delay-4 { animation-delay: 1.2s; }
        .delay-5 { animation-delay: 1.5s; }
        .delay-6 { animation-delay: 1.8s; }
        .delay-7 { animation-delay: 2.1s; }
        
        .glow-orb { animation: glowPulse 6s ease-in-out infinite; }
        .heart-float { animation: floatHeart 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; position: absolute; pointer-events: none; }
        
        .section-divider { 
          width: 80px; 
          height: 2px; 
          background: linear-gradient(90deg, transparent, #d4a574, #d4a574, transparent);
          box-shadow: 0 0 20px rgba(212, 165, 116, 0.3);
        }
        
        .letter-section { 
          border-left: 3px solid #d4a574;
          padding-left: 1.5rem;
          position: relative;
        }
        
        .letter-section::before {
          content: '';
          position: absolute;
          left: -7px;
          top: 0;
          width: 11px;
          height: 11px;
          background: #d4a574;
          border-radius: 50%;
          box-shadow: 0 0 15px rgba(212, 165, 116, 0.5);
        }
        
        .quote-box {
          border: 2px solid #d4a574;
          border-radius: 0;
          padding: 2rem;
          background: linear-gradient(135deg, rgba(255,251,235,0.5) 0%, rgba(255,245,230,0.3) 100%);
          position: relative;
          box-shadow: inset 0 0 30px rgba(212, 165, 116, 0.1);
        }
        
        .quote-box::before {
          content: '"';
          position: absolute;
          top: -10px;
          left: 20px;
          font-size: 3rem;
          color: #d4a574;
          opacity: 0.3;
          font-family: 'Playfair Display', serif;
        }
        
        .section-title {
          position: relative;
          display: inline-block;
          padding-bottom: 0.5rem;
        }
        
        .section-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 40%;
          height: 2px;
          background: linear-gradient(90deg, #d4a574, transparent);
        }
        
        .romantic-glow {
          text-shadow: 0 0 40px rgba(212, 165, 116, 0.3), 0 0 20px rgba(217, 119, 6, 0.1);
        }
        
        .love-button {
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .love-button:hover {
          transform: scale(1.05);
          letter-spacing: 0.15em;
        }
        
        .love-button::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: rgba(212, 165, 116, 0.1);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }
        
        .love-button:active::after {
          width: 300px;
          height: 300px;
        }

        .hero-accent {
          animation: slideInLeft 1s ease-out 0.7s forwards;
          opacity: 0;
        }

        /* New consistent return button */
        .return-btn {
          border-color: #d4a574;
          color: #5b3a29;
          background-color: transparent;
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(0.9rem, 2.5vw, 1.1rem);
          letter-spacing: 0.05em;
        }
      `}</style>

      {/* Ambient glow orbs (unchanged) */}
      <div className="fixed top-10 left-5 w-80 h-80 rounded-full bg-amber-200 blur-3xl glow-orb opacity-25 pointer-events-none"></div>
      <div
        className="fixed top-1/3 right-0 w-96 h-96 rounded-full bg-rose-100 blur-3xl glow-orb opacity-20 pointer-events-none"
        style={{ animationDelay: "2.5s" }}
      ></div>
      <div
        className="fixed bottom-10 left-1/4 w-72 h-72 rounded-full bg-amber-100 blur-3xl glow-orb opacity-15 pointer-events-none"
        style={{ animationDelay: "1s" }}
      ></div>

      {/* Hero Section (unchanged) */}
      <header className="w-full px-4 sm:px-6 pt-16 sm:pt-24 md:pt-32 lg:pt-40 pb-2 sm:pb-4 flex flex-col items-center text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <p className="font-body text-amber-700 text-base sm:text-lg md:text-xl tracking-widest uppercase animate-fade-up delay-1 font-light">
            To my dearest love
          </p>
          <div className="mt-8 animate-fade-up delay-2">
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-stone-800 leading-tight romantic-glow">
              Happy 22th Birthday
            </h1>
          </div>
          <div className="flex justify-center mt-10 animate-fade-up delay-2">
            <div className="section-divider"></div>
          </div>
          <p className="font-body text-stone-600 text-lg sm:text-xl md:text-2xl italic mt-8 animate-fade-up delay-3 leading-relaxed">
           
          </p>
          <div className="mt-12 hero-accent">
            <svg
              width="60"
              height="60"
              viewBox="0 0 60 60"
              fill="none"
              className="mx-auto opacity-30"
            >
              <path
                d="M30 45C22.8 45 15 40 15 30C15 20 22 15 30 15C38 15 45 20 45 30C45 40 38 45 30 45Z"
                stroke="#d4a574"
                strokeWidth="1.5"
                opacity="0.5"
              />
              <circle cx="30" cy="30" r="2" fill="#d4a574" opacity="0.5" />
            </svg>
          </div>
        </div>
      </header>

      
<main className="w-full max-w-4xl mx-auto px-4 sm:px-6 pb-24 lg:pb-32 relative z-10">
  <section className="text-center py-12 sm:py-16 animate-fade-up">
    <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-stone-800 mb-12">
       चाँद सितारे फूल परिंदे शाम सवेरा एक तरफ़ 🥰
    </h2>

    <div className="font-body text-stone-700 text-lg sm:text-xl md:text-2xl leading-relaxed space-y-8">
      <p>
        चाँद सितारे फूल परिंदे शाम सवेरा एक तरफ़,
        <br />
        सारी दुनिया उस का चेहरा एक तरफ़।
      </p>

      <p>
        वो लड़ कर भी सो जाए तो उस का माथा चूमूँ मैं,
        <br />
        उस से मोहब्बत एक तरफ़ है उस से झगड़ा एक तरफ़।
      </p>

      <p>
        जिस शय पर वो उँगली रख दे उस को वो दिलवानी है,
        <br />
        उस की ख़ुशियाँ सब से अव्वल सस्ता महँगा एक तरफ़।
      </p>

      <p>
        सारी दुनिया जो भी बोले सब कुछ शोर-शराबा है,
        <br />
        सब का कहना एक तरफ़ है उस का कहना एक तरफ़।
      </p>

      <p>
        ज़ख़्मों पर मरहम लगवाओ लेकिन उस के हाथों से,
        <br />
        चारा-साज़ी एक तरफ़ है उस का छूना एक तरफ़।
      </p>

      <p>
        उस ने सारी दुनिया माँगी मैं ने उस को माँगा है,
        <br />
        उस के सपने एक तरफ़ हैं मेरा सपना एक तरफ़।
      </p>
    </div>

    <div className="flex justify-center mt-12">
      <div className="section-divider"></div>
    </div>
  </section>

  {/* Footer with hearts */}
  <footer
    className="text-center py-16 sm:py-20 md:py-24 relative"
    ref={heartContainerRef}
  >
    <p className="font-display text-4xl sm:text-5xl md:text-6xl text-amber-800 romantic-glow">
      Forever Yours 💘
    </p>

    <button
      onClick={createHearts}
      className="love-button mt-8 sm:mt-10 font-body text-stone-500 text-xs sm:text-sm tracking-widest uppercase hover:text-amber-700 transition-colors cursor-pointer px-6 py-2 rounded-full border border-stone-300 hover:border-amber-700"
    >
      ✨ tap for love ♡ ✨
    </button>
  </footer>

  {/* Return button */}
  <div className="text-center pb-12">
    <button
      onClick={handleReturn}
      className="px-8 py-3 rounded-full font-semibold border-2 transition-all duration-300 hover:scale-105 active:scale-95 shadow-md return-btn"
    >
      Return
    </button>
  </div>
</main>

    </div>
  );
}
