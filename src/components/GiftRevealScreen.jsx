
import { useState, useRef, useEffect } from "react";
import gsap from "gsap";

const albumPhotos = Array.from({ length: 110 }, (_, i) => ({
  id: i + 11,
  src: `/sakshi${i + 11}.jpeg`,
}));
export default function GiftRevealScreen({ onNext = () => {}, onBack = () => {} }) {
  const [stage, setStage] = useState("gift");
  const [pageIndex, setPageIndex] = useState(0);
  const [now, setNow] = useState(() => new Date());

const relationshipStart = new Date(2026, 2, 25, 1, 14, 0);

useEffect(() => {
  const timer = setInterval(() => {
    setNow(new Date());
  }, 1000);

  return () => clearInterval(timer);
}, []);

const totalSeconds = Math.max(
  0,
  Math.floor((now.getTime() - relationshipStart.getTime()) / 1000)
);

const days = Math.floor(totalSeconds / 86400);
const hours = Math.floor((totalSeconds % 86400) / 3600);
const minutes = Math.floor((totalSeconds % 3600) / 60);
const seconds = totalSeconds % 60;

  const boxRef = useRef(null);
  const lidRef = useRef(null);
  const ribbonRef = useRef(null);
  const albumRef = useRef(null);
  const photoRef = useRef(null);

  const openGift = () => {
    if (stage !== "gift") return;

    const tl = gsap.timeline({
      onComplete: () => setStage("album"),
    });

    tl.to(ribbonRef.current, {
      scale: 1.8,
      rotation: 40,
      opacity: 0,
      duration: 0.4,
    })
      .to(
        lidRef.current,
        {
          y: -180,
          rotation: -28,
          x: 35,
          opacity: 0,
          duration: 1.1,
          ease: "power3.in",
        },
        0.15
      )
      .to(
        boxRef.current,
        {
          scale: 1.12,
          duration: 0.4,
          yoyo: true,
          repeat: 1,
          ease: "power1.inOut",
        },
        0.3
      );

    // Magical particles
    for (let i = 0; i < 35; i++) {
      const particle = document.createElement("span");
      particle.textContent = ["✨", "💗", "🌸", "⭐"][i % 4];

      Object.assign(particle.style, {
        position: "fixed",
        left: `${40 + Math.random() * 20}%`,
        top: `${45 + Math.random() * 15}%`,
        zIndex: "50",
        pointerEvents: "none",
        fontSize: `${14 + Math.random() * 24}px`,
      });

      document.body.appendChild(particle);

      gsap.to(particle, {
        x: (Math.random() - 0.5) * 600,
        y: -200 - Math.random() * 400,
        rotation: Math.random() * 180,
        opacity: 0,
        duration: 1.5 + Math.random() * 1.5,
        onComplete: () => particle.remove(),
      });
    }
  };

  // Animate album entry and every page flip
  useEffect(() => {
    if (stage !== "album" || !photoRef.current) return;

    gsap.fromTo(
      photoRef.current,
      {
        opacity: 0,
        rotationY: -35,
        x: 35,
        scale: 0.94,
      },
      {
        opacity: 1,
        rotationY: 0,
        x: 0,
        scale: 1,
        duration: 0.65,
        ease: "power3.out",
      }
    );
  }, [stage, pageIndex]);

  const changePage = (direction) => {
  setPageIndex((current) =>
    Math.max(0, Math.min(109, current + direction))
  );
};

  const currentPhoto = albumPhotos[pageIndex];

  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-8"
      style={{
        background:
          "radial-gradient(ellipse at 50% 20%, #79435f 0%, #35182e 60%, #170c1a 100%)",
      }}
    >
      <style>{`
        @keyframes floatHeart {
          0% { transform: translateY(110vh) rotate(0deg); opacity: 0; }
          20% { opacity: .55; }
          100% { transform: translateY(-15vh) rotate(35deg); opacity: 0; }
        }
        @keyframes softGlow {
          0%,100% { box-shadow: 0 0 20px #ff9fc655; }
          50% { box-shadow: 0 0 45px #ff9fc6bb; }
        }
        .gift-glow { animation: softGlow 2.5s infinite; }
        .album-paper {
          background:
            repeating-linear-gradient(
              transparent,
              transparent 31px,
              rgba(190,145,130,.12) 32px
            ),
            #fff8ed;
        }
      `}</style>

      {/* Romantic animated background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 22 }).map((_, i) => (
          <span
            key={i}
            className="absolute text-pink-200/30"
            style={{
              left: `${(i * 17) % 100}%`,
              fontSize: `${14 + (i % 4) * 8}px`,
              animation: `floatHeart ${8 + (i % 5)}s linear infinite`,
              animationDelay: `${-i * 1.2}s`,
            }}
          >
            {i % 2 ? "♡" : "♥"}
          </span>
        ))}
      </div>

      {/* GIFT BOX */}
      {stage === "gift" && (
        <div className="relative z-10 flex w-full max-w-lg flex-col items-center text-center">
          <p className="mb-3 text-xs tracking-[0.4em] text-pink-200">
            A SPECIAL SURPRISE
          </p>

          <h1
            className="text-3xl font-bold text-pink-50 sm:text-5xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Just for you, Sakshi
          </h1>

          <p className="mt-4 text-sm text-pink-100/80">
            There are  little memories waiting inside...
          </p>

          <div
            ref={boxRef}
            className="relative mt-14 flex h-72 w-72 items-end justify-center"
          >
            {/* Box body */}
            <div
              className="absolute bottom-5 h-44 w-56 rounded-b-2xl"
              style={{
                background:
                  "linear-gradient(110deg,#a93468,#ed79a8 48%,#b43c75)",
                boxShadow: "0 25px 50px #0008",
              }}
            >
              <div
                className="absolute left-1/2 h-full w-10 -translate-x-1/2"
                style={{
                  background:
                    "linear-gradient(90deg,#e9b966,#fff0c5,#d49b47)",
                }}
              />
              <div className="absolute inset-x-0 bottom-5 text-center text-3xl">
                ♥
              </div>
            </div>

            {/* Box lid */}
            <div
              ref={lidRef}
              className="absolute top-16 z-20 h-14 w-64 rounded-xl"
              style={{
                background:
                  "linear-gradient(110deg,#f6a4c5,#d84d89,#f6a4c5)",
                boxShadow: "0 10px 22px #0006",
              }}
            >
              <div
                className="absolute left-1/2 h-full w-10 -translate-x-1/2"
                style={{
                  background:
                    "linear-gradient(90deg,#e9b966,#fff0c5,#d49b47)",
                }}
              />
            </div>

            {/* Ribbon */}
            <div
              ref={ribbonRef}
              className="absolute top-2 z-30 text-7xl"
            >
              🎀
            </div>
          </div>

          <button
            onClick={openGift}
            className="gift-glow mt-6 rounded-full px-10 py-4 font-semibold text-white transition hover:scale-105"
            style={{
              background: "linear-gradient(90deg,#ec679d,#ad477c)",
            }}
          >
            Open Your Gift 🎁
          </button>

          <p className="mt-5 text-xs tracking-wider text-pink-200/60">
            MADE WITH LOVE, JUST FOR YOU
          </p>
        </div>
      )}

      {/* PHOTO ALBUM */}
      {stage === "album" && (
        <div
          ref={albumRef}
          className="relative z-10 flex w-full max-w-xl flex-col items-center"
        >
          <p className="text-xs tracking-[0.35em] text-pink-200">
            OUR LITTLE COLLECTION
          </p>

          <h1
            className="mb-6 mt-3 text-center text-3xl font-bold text-pink-50 sm:text-4xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
             Little Memories ❤️
          </h1>
<div className="mt-2 w-full text-center">
  <p className="font-serif text-base text-pink-100">
   Duration of This Chapter ❤️
  </p>

  <p className="mt-1 text-[10px] tracking-wider text-pink-200/70">
  Counting Every Moment With You
  </p>

  <div className="mt-3 grid grid-cols-4 gap-1.5">
    {[
      { value: days, label: "DAYS" },
      { value: hours, label: "HOURS" },
      { value: minutes, label: "MINUTES" },
      { value: seconds, label: "SECONDS" },
    ].map((item) => (
      <div key={item.label} className="rounded-lg bg-[#35182e]/70 p-2">
        <div className="text-xl font-bold text-pink-100 sm:text-2xl">
          {item.value}
        </div>
        <div className="mt-1 text-[8px] tracking-wider text-pink-200/70">
          {item.label}
        </div>
      </div>
    ))}
  </div>

  <p className="mt-2 font-serif text-xs italic text-pink-100/80">
    And counting... ♡
  </p>
</div>
          {/* Album book */}
          <div className="w-full rounded-xl border-4 border-[#c28c70] bg-[#e9c8a6] p-2 shadow-2xl sm:p-4">
            <div className="album-paper relative min-h-[390px] overflow-hidden rounded-lg p-4 sm:p-7">
              <div className="absolute left-1/2 top-0 h-full w-px bg-[#d8b6a0]/40" />

              <div
                ref={photoRef}
                key={currentPhoto.id}
                className="relative mx-auto w-full max-w-sm"
                style={{ perspective: "1000px" }}
              >
                <div className="relative rotate-[-2deg] bg-white p-3 pb-5 shadow-xl sm:p-4 sm:pb-6">
                  <div
                    className="relative flex h-56 items-center justify-center overflow-hidden sm:h-64"
                    style={{
                      background:
                        "linear-gradient(140deg,#f9d5df,#f9e6d2,#e9d8ed)",
                    }}
                  >
                    <img
  src={currentPhoto.src}
  alt={`Sakshi memory ${currentPhoto.id}`}
  className="h-full w-full object-cover"
/>

                    <span className="absolute right-3 top-3 text-xl">
                      ✨
                    </span>
                    <span className="absolute bottom-3 left-3 text-xl">
                      ♡
                    </span>
                  </div>

                  <p className="mt-4 text-center font-serif text-lg italic text-[#885b61]">
                    {currentPhoto.caption}
                  </p>
                </div>

              
              </div>

              <div className="mt-5 flex items-center justify-center gap-3 text-2xl">
                🌷 <span className="text-sm text-[#a47770]">♡</span> 🌸
              </div>
            </div>
          </div>

          
{/* Page navigation */}
<div className="mt-4 flex w-full items-center justify-center gap-4">
    <button
  onClick={onBack}
  className="rounded-full border border-pink-200/50 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
>
  ← Return
</button>

  <button
    onClick={() => changePage(-1)}
    disabled={pageIndex === 0}
    className="rounded-full border border-pink-200/50 px-5 py-3 text-lg text-white transition hover:bg-white/10 disabled:opacity-30"
  >
    ←
  </button>

  <button
    onClick={() => changePage(1)}
    disabled={pageIndex === 109
    }
    className="rounded-full border border-pink-200/50 px-5 py-3 text-lg text-white transition hover:bg-white/10 disabled:opacity-30"
  >
    →
  </button>

  <button
    onClick={onNext}
    className="rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:scale-105"
    style={{
      background: "linear-gradient(90deg,#ec679d,#ad477c)",
    }}
  >
    Next Surprise →
  </button>

</div>


          <p className="mt-4 text-center text-xs text-pink-100/60">
            Every picture holds a little piece of happiness ♡
          </p>
          
        </div>
      )}
    </div>
  );
}
