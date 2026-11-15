
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const photos = [
  { src: "/sakshi1.jpeg", caption: "A little sunshine in human form", rotate: "-8deg" },
  { src: "/sakshi2.jpeg", caption: "Cutest troublemaker ever 😂", rotate: "6deg" },
  { src: "/sakshi3.jpeg", caption: "My favourite notification", rotate: "-5deg" },
  { src: "/sakshi4.jpeg", caption: "Pretty, but a little dramatic", rotate: "8deg" },
  { src: "/sakshi5.jpeg", caption: "Born to spread happiness", rotate: "-7deg" },
  { src: "/sakshi6.jpeg", caption: "100% cute, 200% nakhre", rotate: "5deg" },
];

const secondPagePhotos = [
  { src: "/sakshi7.jpeg", caption: "Sunshine with a little attitude", rotate: "-7deg" },
  { src: "/sakshi8.jpeg", caption: "Professional cutie, full-time drama", rotate: "6deg" },
  { src: "/sakshi9.jpeg", caption: "Too pretty to be normal", rotate: "-5deg" },
  { src: "/sakshi10.jpeg", caption: "My favourite human, always", rotate: "7deg" },
];

function playTearSound() {
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    const ctx = new Audio();

    if (ctx.state === "suspended") ctx.resume();

    // Multiple short noise bursts create a paper-ripping texture.
    [0, 0.13, 0.24].forEach((delay, index) => {
      const duration = index === 0 ? 0.28 : 0.19;
      const buffer = ctx.createBuffer(
        1,
        Math.floor(ctx.sampleRate * duration),
        ctx.sampleRate
      );

      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        const fade = Math.pow(1 - i / data.length, 1.5);
        data[i] = (Math.random() * 2 - 1) * fade;
      }

      const source = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      source.buffer = buffer;
      filter.type = "bandpass";
      filter.frequency.value = index === 0 ? 1700 : 2800;
      filter.Q.value = 0.7;
      gain.gain.value = index === 0 ? 0.24 : 0.13;

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      source.start(ctx.currentTime + delay);
      source.onended = () => {
        if (index === 2) ctx.close();
      };
    });
  } catch (error) {
    console.log("Paper sound unavailable", error);
  }
}

function PhotoCard({ photo, index, small = false }) {
  return (
    <div
      className={`relative bg-[#fffdf7] shadow-lg ${
        small ? "p-2 pb-7" : "p-3 pb-9"
      }`}
      style={{ transform: `rotate(${photo.rotate})` }}
    >
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-pink-100 via-rose-50 to-amber-100 ${
          small ? "h-24 text-4xl" : "h-32 text-6xl"
        }`}
      >
      <img
  src={photo.src}
  alt={photo.caption}
  className="h-full w-full object-cover"
  style={index === 0 ? { transform: "scale(0.92)" } : {}}
/>
      </div>

      <p
        className={`mt-2 text-center font-serif text-[#805b55] ${
          small ? "text-[10px]" : "text-xs"
        }`}
      >
        {photo.caption}
      </p>

      <div
        className="absolute -top-2 left-1/2 h-5 w-12 -translate-x-1/2 rotate-[-5deg] opacity-80"
        style={{
          background:
            index % 2 === 0
              ? "rgba(255,177,190,0.75)"
              : "rgba(246,211,151,0.8)",
        }}
      />
    </div>
  );
}

export default function ProudMessage({ onNext = () => {}, onBack = () => {} }) {
  const [page, setPage] = useState(1);
  const [tearing, setTearing] = useState(false);
  const [letterOpen, setLetterOpen] = useState(false);

  const bookRef = useRef(null);
  const tearTopRef = useRef(null);
  const tearBottomRef = useRef(null);
  const envelopeFlapRef = useRef(null);
  const letterRef = useRef(null);
  const tearTimeline = useRef(null);

  useEffect(() => {
    if (!bookRef.current) return;

    gsap.fromTo(
      bookRef.current,
      { opacity: 0, y: 30, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" }
    );

    return () => {
      tearTimeline.current?.kill();
    };
  }, [page]);

  const tearPage = () => {
    if (tearing || page !== 1) return;

    setTearing(true);
    playTearSound();

    tearTimeline.current = gsap.timeline({
      onComplete: () => {
        setPage(2);
        setTearing(false);
      },
    });

    tearTimeline.current
      .to(
        tearTopRef.current,
        {
          y: -310,
          x: 45,
          rotation: -13,
          scale: 0.94,
          opacity: 0,
          duration: 1.25,
          ease: "power3.in",
        },
        0
      )
      .to(
        tearBottomRef.current,
        {
          y: 320,
          x: -40,
          rotation: 10,
          scale: 0.96,
          opacity: 0,
          duration: 1.35,
          ease: "power3.in",
        },
        0.05
      );
  };

  
const openLetter = () => {
  if (letterOpen) return;
  setLetterOpen(true);
};
useEffect(() => {
  if (!letterOpen) return;

  const tl = gsap.timeline();

  gsap.set(letterRef.current, {
    y: 120,
    opacity: 0,
    scale: 0.9,
  });

  tl.to(envelopeFlapRef.current, {
    rotateX: -180,
    duration: 0.7,
    ease: "power2.inOut",
  });

  tl.to(
    letterRef.current,
    {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 1.2,
      ease: "power3.out",
    },
    "-=0.2"
  );

  return () => tl.kill();
}, [letterOpen]);
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden overflow-y-auto bg-[#f5dce3] px-3 py-8">

      <style>{`
        @keyframes petalFall {
          0% { transform: translate3d(0,-12vh,0) rotate(0deg); opacity: 0; }
          15% { opacity: .75; }
          85% { opacity: .65; }
          100% { transform: translate3d(90px,110vh,0) rotate(500deg); opacity: 0; }
        }

        @keyframes heartFloat {
          0% { transform: translateY(110vh) scale(.7); opacity: 0; }
          20% { opacity: .5; }
          100% { transform: translateY(-15vh) scale(1.2); opacity: 0; }
        }

        @keyframes lightPulse {
          0%,100% { opacity: .2; transform: scale(.8); }
          50% { opacity: .8; transform: scale(1.3); }
        }

        .petal {
          position: absolute;
          top: -30px;
          animation: petalFall linear infinite;
        }

        .floating-heart {
          position: absolute;
          bottom: -30px;
          animation: heartFloat linear infinite;
        }

        .soft-light {
          position: absolute;
          border-radius: 50%;
          background: #fff8d9;
          filter: blur(18px);
          animation: lightPulse 4s ease-in-out infinite;
        }

        .paper-edge {
          filter: drop-shadow(0 5px 4px rgba(92,57,54,.25));
          backface-visibility: hidden;
        }

        .envelope-flap {
          transform-origin: top center;
          transform-style: preserve-3d;
          backface-visibility: hidden;
        }

        .envelope-button {
          box-shadow: 0 8px 22px rgba(147,82,92,.22);
        }
      `}</style>

      {/* Moving romantic background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {Array.from({ length: 16 }).map((_, i) => (
          <span
            key={`petal-${i}`}
            className="petal"
            style={{
              left: `${(i * 23) % 100}%`,
              animationDuration: `${9 + (i % 6) * 2}s`,
              animationDelay: `${-i * 1.5}s`,
              fontSize: `${13 + (i % 3) * 7}px`,
            }}
          >
            {["🌸", "🌷", "🌹", "✿"][i % 4]}
          </span>
        ))}

        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={`heart-${i}`}
            className="floating-heart"
            style={{
              left: `${(i * 31) % 100}%`,
              animationDuration: `${10 + (i % 5) * 2}s`,
              animationDelay: `${-i * 2}s`,
              fontSize: `${14 + (i % 3) * 8}px`,
              color: "#d887a0",
            }}
          >
            ♡
          </span>
        ))}

        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="soft-light"
            style={{
              left: `${10 + i * 20}%`,
              top: `${15 + (i % 3) * 25}%`,
              width: `${30 + i * 8}px`,
              height: `${30 + i * 8}px`,
              animationDelay: `${i * 0.7}s`,
            }}
          />
        ))}
      </div>

      {/* Scrapbook paper */}
      <div
        ref={bookRef}
        className="relative z-10 mx-auto w-full max-w-2xl overflow-hidden rounded-sm border border-[#ead4bd] bg-[#fff9ec] px-4 py-7 shadow-2xl sm:px-8"
        style={{
          backgroundImage:
            "repeating-linear-gradient(transparent, transparent 31px, rgba(214,178,156,0.18) 32px)",
        }}
      >

        {/* FIRST PAGE */}
        {page === 1 && (
          <div className="relative">
            <div className="mb-7 text-center">
              <p className="font-serif text-xs tracking-[0.35em] text-[#b67c78]">
                A LITTLE BOOK OF
              </p>
              <h1 className="mt-2 font-serif text-3xl font-bold text-[#995e65] sm:text-4xl">
                Sakshi's Little World
              </h1>
              <p className="mt-2 text-sm italic text-[#a77a70]">
                Some memories, some madness & lots of love ♡
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-7 gap-y-8 sm:grid-cols-3">
              {photos.map((photo, index) => (
                <PhotoCard key={index} photo={photo} index={index} />
              ))}
            </div>

            <div className="my-7 text-center">
              <span className="text-2xl">🌼 ✨ 🧸 ✨ 🌼</span>
              <p className="mt-2 font-serif text-sm italic text-[#a16f69]">
                Every little thing about you deserves a page.
              </p>
            </div>

            {/* Realistic torn paper overlays */}
            {tearing && (
              <>
                <div
                  ref={tearTopRef}
                  className="paper-edge absolute inset-0 z-30 border border-[#ead4bd] bg-[#fff9ec]"
                  style={{
                    clipPath:
                      "polygon(0 0,100% 0,100% 47%,96% 46%,91% 49%,86% 45%,81% 49%,75% 44%,69% 49%,63% 45%,57% 50%,51% 44%,45% 49%,39% 45%,33% 50%,27% 45%,21% 49%,15% 44%,9% 49%,4% 45%,0 48%)",
                    backgroundImage:
                      "repeating-linear-gradient(transparent,transparent 31px,rgba(214,178,156,.18) 32px)",
                  }}
                >
                  <div className="absolute bottom-0 left-0 right-0 h-2 bg-white/60 blur-sm" />
                </div>

                <div
                  ref={tearBottomRef}
                  className="paper-edge absolute inset-0 z-30 border border-[#ead4bd] bg-[#fff9ec]"
                  style={{
                    clipPath:
                      "polygon(0 48%,4% 45%,9% 49%,15% 44%,21% 49%,27% 45%,33% 50%,39% 45%,45% 49%,51% 44%,57% 50%,63% 45%,69% 49%,75% 44%,81% 49%,86% 45%,91% 49%,96% 46%,100% 47%,100% 100%,0 100%)",
                    backgroundImage:
                      "repeating-linear-gradient(transparent,transparent 31px,rgba(214,178,156,.18) 32px)",
                  }}
                >
                  <div className="absolute top-0 left-0 right-0 h-2 bg-white/60 blur-sm" />
                </div>
              </>
            )}

            <div className="mt-5 flex justify-center">
              <button
  onClick={onBack}
  className="mr-3 rounded-full border border-[#d79a9d] bg-[#fff6ed] px-7 py-3 font-serif text-sm font-semibold text-[#a76570] shadow-md transition hover:scale-105"
>
  ← Return
</button>
              <button
                onClick={tearPage}
                disabled={tearing}
                className="rounded-full bg-[#c77f88] px-8 py-3 font-serif text-sm tracking-wide text-white shadow-lg transition hover:scale-105 hover:bg-[#b96e7a] disabled:opacity-50"
              >
                {tearing ? "Turning the page..." : "Tear this page ✂️"}
              </button>
            </div>
          </div>
        )}

        {/* SECOND PAGE */}
        {page === 2 && (
          <div className="relative">
            <div className="text-center">
              <p className="font-serif text-xs tracking-[0.35em] text-[#b67c78]">
                PAGE TWO
              </p>
              <h1 className="mt-2 font-serif text-3xl font-bold text-[#995e65]">
                Things That Make You...
              </h1>
              <p className="mt-2 font-serif text-sm italic text-[#a77a70]">
                Unforgettable, obviously! 💗
              </p>
            </div>

            <span className="absolute -left-1 top-20 rotate-[-15deg] text-3xl">🎀</span>
            <span className="absolute -right-1 top-24 rotate-[15deg] text-3xl">🦋</span>

            <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-8 px-2 sm:grid-cols-4">
              {secondPagePhotos.map((photo, index) => (
                <PhotoCard key={index} photo={photo} index={index} small />
              ))}
            </div>

            <div className="my-6 rounded-xl border border-dashed border-[#dca6a1] bg-[#fff0ee]/80 p-4 text-center">
              <p className="font-serif text-lg font-semibold text-[#a76570]">
                Official Sakshi Appreciation List 🏆
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs text-[#8f625e]">
                {[
                  "100% adorable",
                  "Unlimited nakhre",
                  "Heart stealer",
                  "One of a kind",
                ].map((item) => (
                  <span key={item} className="rounded-full bg-white px-3 py-2 shadow-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-6 text-center">
              <p className="font-serif text-sm italic text-[#a16f69]">
                And now... something I wrote just for you.
              </p>
              <span className="text-2xl">🌷 ♡ 🌷</span>
            </div>

            {/* Realistic envelope */}
            <div className="relative mx-auto mt-8 flex w-full max-w-sm flex-col items-center">
              <div className="relative h-44 w-full max-w-[290px]">

                
                {/* Envelope body */}
                <div className="absolute bottom-0 z-20 h-32 w-full overflow-hidden rounded-md border border-[#dba6a3] bg-[#edb9b5] shadow-xl">
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(145deg,#f4ceca,#e9aaa9 60%,#d88e98)",
                      clipPath: "polygon(0 0,50% 62%,100% 0,100% 100%,0 100%)",
                    }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(35deg,#f6d5cd,#e5a4a5)",
                      clipPath: "polygon(0 100%,50% 43%,100% 100%)",
                    }}
                  />
                </div>

                {/* Envelope flap */}
                <div
                  ref={envelopeFlapRef}
                  className="envelope-flap absolute left-0 top-0 z-30 h-24 w-full"
                  style={{
                    background: "linear-gradient(135deg,#e9a7a9,#d98998)",
                    clipPath: "polygon(0 0,100% 0,50% 100%)",
                    filter: "drop-shadow(0 4px 3px rgba(90,40,50,.18))",
                  }}
                />

                {/* Wax seal */}
                {!letterOpen && (
                  <div className="absolute left-1/2 top-[58%] z-40 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#b96a72] bg-gradient-to-br from-[#c96b78] to-[#963e58] text-xl text-[#ffe3d9] shadow-lg">
                    ♥
                  </div>
                )}
              </div>
              <div className="mt-5 flex items-center justify-center gap-3">
                <button
  onClick={() => setPage(1)}
  className=" rounded-full border border-[#d79a9d] bg-[#fff6ed] px-7 py-3 font-serif text-sm font-semibold text-[#a76570] shadow-md transition hover:scale-105"
>
  ← Return
</button>
              <button
                onClick={openLetter}
                disabled={letterOpen}
                className="envelope-button rounded-full border border-[#d79a9d] bg-[#fff6ed] px-9 py-3 font-serif text-sm font-semibold tracking-wide text-[#a76570] transition hover:scale-105 disabled:opacity-60"
              >
                {letterOpen ? "Letter opened ♡" : "Open Letter ✉"}
              </button>
              </div>

              <p className="mt-3 font-serif text-xs italic text-[#a16f69]">
                Sealed with love, just for you.
              </p>
            </div>

            {/* Full birthday letter */}
            
{letterOpen && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#321c2b]/55 p-4">

    <div
      ref={letterRef}
      className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border-2 border-[#ead4bd] bg-[#fffdf6] p-6 shadow-2xl sm:p-9"
      style={{ opacity: 0 }}
    >
      {/* Close button */}
      <button
        onClick={() => {
          gsap.to(envelopeFlapRef.current, {
            rotateX: 0,
            duration: 0.5,
            ease: "power2.out",
          });
          setLetterOpen(false);
        }}
        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#f7e4df] text-xl text-[#a76570] shadow transition hover:scale-110"
        aria-label="Close letter"
      >
        ×
      </button>

      <div className="text-center">
        <span className="text-4xl">🌷</span>
        <h2 className="mt-3 font-serif text-3xl font-bold text-[#a76570]">
          Dear Sakshi,
        </h2>
      </div>

      <div className="mt-6 space-y-4 font-serif text-base leading-8 text-[#755b56]">
        <p>
          Happy Birthday to the girl who makes ordinary moments
          feel a little more special.
        </p>

        <p>
          I hope you never forget how wonderful you are. Your smile,
          your little habits, your endless nakhre and even your
          dramatic moments make you uniquely you.
        </p>

        <p>
          May this year bring you beautiful memories, endless
          happiness, courage for every dream and countless reasons
          to smile.
        </p>

        <p>
          Keep being your lovely, crazy and beautiful self.
          The world is a little brighter with you in it. ❤️
        </p>
      </div>

      <p className="mt-7 text-right font-serif italic text-[#a76570]">
        With lots of love ♡
      </p>

      <div className="mt-7 text-center">
        <button
          onClick={onNext}
          className="rounded-full bg-[#c77f88] px-10 py-3 font-serif text-white shadow-lg transition hover:scale-105"
        >
          Next Surprise →
        </button>
      </div>
    </div>
  </div>
)}

          </div>
        )}
      </div>
    </div>
  );
}
