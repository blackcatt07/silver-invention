import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function LockScreen({ active, onBack }) {
  const containerRef = useRef(null);
  const hasAnimated = useRef(false);

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

  if (!active) return null;

  return (
    <div
  ref={containerRef}
  className="absolute inset-0 z-50 overflow-y-auto flex items-center justify-center px-4 py-6"
  style={{
    background: `
      radial-gradient(ellipse at 50% 25%, rgba(255, 218, 224, 0.65), transparent 48%),
      radial-gradient(circle at 10% 75%, rgba(255, 226, 218, 0.55), transparent 35%),
      radial-gradient(circle at 90% 70%, rgba(250, 215, 225, 0.5), transparent 35%),
      linear-gradient(135deg, #fffaf4 0%, #fff1ed 50%, #fff8f0 100%)
    `,
  }}
>
      <div className="w-full max-w-2xl flex flex-col items-center">
        {/* 1. Header */}
        <p
          className="text-center font-medium text-red-600 mb-4 sm:mb-6"
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: "clamp(0.9rem, 3vw, 1.4rem)",
          }}
        >
          This song reminds me of you (˶˃ ᵕ ˂˶)
        </p>

        {/* 2. YouTube video – already responsive */}
        
<div
  className="w-full max-w-[560px] mb-4"
  style={{ aspectRatio: "16/9" }}
>
  <video
    src="/song.mp4"
    controls
    playsInline
    preload="metadata"
    className="w-full h-full rounded-xl shadow-lg object-contain"
  />
</div>


        {/* 3. Song title */}
        <p
          className="text-center font-semibold text-red-600 mb-4 sm:mb-6"
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: "clamp(0.85rem, 2.5vw, 1.2rem)",
          }}
        >
          
        </p>

        {/* 4. Dotted line */}
        <div className="w-full h-0 border-t-4 border-dotted border-red-600 mb-4 sm:mb-6 opacity-80" />

        {/* 5. Biggest header */}
        <h1
          className="text-center font-bold mb-6 sm:mb-8"
          style={{
            fontFamily: "'Playfair Display', serif",
            color: "#FF0000",
            fontSize: "clamp(2rem, 8vw, 4rem)",
            lineHeight: 1.2,
          }}
        >
          Song about you
        </h1>

        {/* 6. Return button */}
        <button
          onClick={handleReturn}
          className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold border-2 border-red-600 text-red-600 bg-white
                   hover:bg-red-50 transition-all duration-300 hover:scale-105 active:scale-95 shadow-md"
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: "clamp(0.9rem, 3vw, 1.3rem)",
          }}
        >
          Return
        </button>
      </div>
    </div>
  );
}
