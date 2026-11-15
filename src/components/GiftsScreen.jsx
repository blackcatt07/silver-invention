
import { useEffect, useRef } from "react";
import gsap from "gsap";

import flowerIcon from "../assets/icons/flower.svg";
import lockIcon from "../assets/icons/lock.svg";
import messageIcon from "../assets/icons/message.svg";

const icons = [
  { src: flowerIcon, alt: "Bouquet" },
  { src: lockIcon, alt: "Music" },
  { src: messageIcon, alt: "Message" },
];

export default function GiftsScreen({
  active,
  onBack,
  onFlowerClick,
  onLockClick,
  onMessageClick,
}) {
  const headingRef = useRef(null);
  const subtextRef = useRef(null);
  const cardRefs = useRef([]);
  const heartRefs = useRef([]);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const hearts = heartRefs.current.filter(Boolean);

    hearts.forEach((heart, i) => {
      gsap.set(heart, {
        x: 0,
        y: 0,
        opacity: 0,
      });

      gsap.to(heart, {
        y: -window.innerHeight - 100,
        x: i % 2 === 0 ? 45 : -45,
        opacity: 0.45,
        duration: 7 + (i % 5) * 2,
        repeat: -1,
        delay: i * 0.8,
        ease: "none",
      });
    });

    return () => gsap.killTweensOf(hearts);
  }, []);

  useEffect(() => {
    if (!active || hasAnimated.current) return;

    const heading = headingRef.current;
    const subtext = subtextRef.current;
    const cards = cardRefs.current.filter(Boolean);

    if (!heading || !subtext || cards.length !== 3) return;

    hasAnimated.current = true;

    const tl = gsap.timeline({
      defaults: { ease: "back.out(1.7)" },
    });

    tl.fromTo(
      heading,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.8 },
    );

    tl.fromTo(
      subtext,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6 },
      "-=0.4",
    );

    cards.forEach((card, i) => {
      tl.fromTo(
        card,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5 },
        i === 0 ? "-=0.2" : "-=0.3",
      );
    });

    return () => tl.kill();
  }, [active]);

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center px-4 overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 50% 35%, #743653 0%, #421d36 55%, #210f22 100%)",
      }}
    >
      {/* Floating romantic hearts */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            ref={(el) => (heartRefs.current[i] = el)}
            className="absolute bottom-[-40px] text-pink-200"
            style={{
              left: `${(i * 37 + 8) % 100}%`,
              fontSize: `${16 + (i % 4) * 9}px`,
              opacity: 0,
            }}
          >
            {i % 3 === 0 ? "♡" : "♥"}
          </span>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-sm">

        <h1
          ref={headingRef}
          className="font-bold text-center mb-2"
          style={{
            fontFamily: "'Playfair Display', serif",
            color: "#fff0f5",
            fontSize: "clamp(1.6rem, 6vw, 2.2rem)",
            textShadow: "0 3px 15px #e66b9b66",
          }}
        >
          THESE ARE FOR YOU!
        </h1>

        <p
          ref={subtextRef}
          className="text-center font-medium mb-5"
          style={{
            fontFamily: "'Montserrat', sans-serif",
            color: "#f6c6d8",
            fontSize: "clamp(0.75rem, 2.8vw, 1rem)",
          }}
        >
          I hope you like it.❤️ &gt;&lt;
        </p>

        {/* Three gift cards */}
        <div className="grid grid-cols-2 gap-3 w-full overflow-visible">

          {icons.map((icon, i) => (
            <div
              key={icon.alt}
              ref={(el) => (cardRefs.current[i] = el)}
              onClick={() => {
                if (i === 0 && onFlowerClick) onFlowerClick();
                else if (i === 1 && onLockClick) onLockClick();
                else if (i === 2 && onMessageClick) onMessageClick();
              }}
              className={`aspect-square rounded-2xl border-2 flex items-center justify-center p-2
                bg-white/10 backdrop-blur-sm cursor-pointer
                active:scale-95 transition-transform
                ${i === 2 ? "col-span-2 mx-auto w-1/2 aspect-square" : ""}`}
              style={{
                borderColor: "#f3a6c3",
                boxShadow: "0 4px 20px #e879a533",
              }}
            >
              <img
                src={icon.src}
                alt={icon.alt}
                className="w-2/5 h-2/5 object-contain"
                style={{
                  filter: "brightness(0) invert(1)",
                }}
              />
            </div>
          ))}
<button
  onClick={onBack}
  className="mt-10 block mx-auto px-35 py-2.5 rounded-full border-2 font-semibold
           text-pink-100 border-pink-300 bg-white/10
           hover:bg-white/20 hover:scale-105
           active:scale-90 transition-all duration-300 shadow-md"
  style={{
  fontFamily: "'Montserrat', sans-serif",
  position: "relative",
  right: "-10px",
}}
>
  Return
</button>
        </div>
      </div>
    </div>
  );
}
