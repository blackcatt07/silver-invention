
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function BirthdayCelebration({ onNext = () => {} }) {
  const cakeRef = useRef(null);
  const confettiRef = useRef(null);
  const musicRef = useRef(null);
  const birthdayTuneRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const animationRef = useRef(null);
  const celebrationTimersRef = useRef([]);

  const [micStatus, setMicStatus] = useState("idle");
  const [candlesOut, setCandlesOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(
      ".birthday-heading",
      { y: -35, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "back.out(1.5)" }
    ).fromTo(
      cakeRef.current,
      { y: 70, scale: 0.85, opacity: 0 },
      { y: 0, scale: 1, opacity: 1, duration: 1.1, ease: "back.out(1.5)" },
      "-=0.3"
    );

    return () => {
  tl.kill();
  stopMicrophone();

  celebrationTimersRef.current.forEach((timer) => clearTimeout(timer));
  celebrationTimersRef.current = [];
};
  }, []);

  const stopMicrophone = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Party popper sound using Web Audio
  const playPopSound = () => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const duration = 0.35;
    const buffer = ctx.createBuffer(
      1,
      ctx.sampleRate * duration,
      ctx.sampleRate
    );
    const channel = buffer.getChannelData(0);

    for (let i = 0; i < channel.length; i++) {
      channel[i] = (Math.random() * 2 - 1) * (1 - i / channel.length);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 900;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.7, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();

    const oscillator = ctx.createOscillator();
    const popGain = ctx.createGain();

    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(700, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      120,
      ctx.currentTime + 0.16
    );

    popGain.gain.setValueAtTime(0.35, ctx.currentTime);
    popGain.gain.exponentialRampToValueAtTime(
      0.01,
      ctx.currentTime + 0.18
    );

    oscillator.connect(popGain);
    popGain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.2);
  };
   const launchConfetti = () => {
  if (!confettiRef.current) return;

  const container = confettiRef.current;

  const colors = [
    "#ff4f87",
    "#ffd166",
    "#c77dff",
    "#80ffdb",
    "#ff9f1c",
    "#ffffff",
  ];

  // Balloons rising from the bottom
  for (let i = 0; i < 34; i++) {
    const timer = setTimeout(() => {
      if (!container.isConnected) return;

      const balloon = document.createElement("div");
      balloon.textContent = "🎈";

      Object.assign(balloon.style, {
        position: "absolute",
        left: `${4 + Math.random() * 92}%`,
        bottom: "-75px",
        fontSize: `${34 + Math.random() * 30}px`,
        opacity: "0",
      });

      container.appendChild(balloon);

      gsap.to(balloon, {
        y: -(window.innerHeight + 180),
        x: (Math.random() - 0.5) * 150,
        rotation: Math.random() * 35 - 17,
        opacity: 0.95,
        duration: 7.5 + Math.random() * 2,
        ease: "none",
        onComplete: () => balloon.remove(),
      });
    }, i * 260);

    celebrationTimersRef.current.push(timer);
  }

  // Five waves of falling confetti
  for (let wave = 0; wave < 5; wave++) {
    const timer = setTimeout(() => {
      if (!container.isConnected) return;

      for (let i = 0; i < 42; i++) {
        const piece = document.createElement("div");
        const size = 4 + Math.random() * 9;

        Object.assign(piece.style, {
          position: "absolute",
          width: `${size}px`,
          height: `${size * 1.5}px`,
          backgroundColor:
            colors[Math.floor(Math.random() * colors.length)],
          left: `${Math.random() * 100}%`,
          top: "-18px",
          borderRadius: Math.random() > 0.5 ? "50%" : "2px",
        });

        container.appendChild(piece);

        gsap.to(piece, {
          y: window.innerHeight + 100,
          x: (Math.random() - 0.5) * 320,
          rotation: Math.random() * 720 - 360,
          opacity: 0.95,
          duration: 4.8 + Math.random() * 2.2,
          ease: "none",
          onComplete: () => piece.remove(),
        });
      }
    }, wave * 1900);

    celebrationTimersRef.current.push(timer);
  }

  // Multiple party pop sounds
  for (let i = 1; i < 6; i++) {
    const timer = setTimeout(() => playPopSound(), i * 1600);
    celebrationTimersRef.current.push(timer);
  }

  // End celebration after 10 seconds
  const finishTimer = setTimeout(() => {
    gsap.to(Array.from(container.children), {
      opacity: 0,
      duration: 0.35,
      onComplete: () => {
        container.innerHTML = "";
      },
    });

    celebrationTimersRef.current = [];
  }, 10000);

  celebrationTimersRef.current.push(finishTimer);
};
  
    

  const celebrate = () => {
    setCandlesOut(true);
    setMicStatus("done");
    stopMicrophone();
    if (birthdayTuneRef.current) {
  birthdayTuneRef.current.currentTime = 0;
  birthdayTuneRef.current.play().catch(console.warn);
}

    // Two party popper sounds
    // Start the 10-second celebration sequence
    playPopSound();
    launchConfetti(); 
  };

  const startMicrophone = async () => {
    setError("");

    try {
      // Start audio context after the user's click
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;
      await audioContext.resume();

      // Start romantic background music
      if (musicRef.current) {
        musicRef.current.volume = 0.4;
        musicRef.current.play().catch(console.warn);
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Microphone requires HTTPS or localhost.");
      }

      // Browser asks permission here, only after button click
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      streamRef.current = stream;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 2048;
      source.connect(analyser);

      const data = new Uint8Array(analyser.fftSize);
      setMicStatus("listening");

      let loudStart = null;

      const detectBlow = () => {
        analyser.getByteTimeDomainData(data);

        let sum = 0;

        for (let i = 0; i < data.length; i++) {
          const value = (data[i] - 128) / 128;
          sum += value * value;
        }

        const volume = Math.sqrt(sum / data.length);

        if (volume > 0.12) {
          if (!loudStart) loudStart = Date.now();

          if (Date.now() - loudStart > 300) {
            celebrate();
            return;
          }
        } else {
          loudStart = null;
        }

        animationRef.current = requestAnimationFrame(detectBlow);
      };

      detectBlow();
    } catch (err) {
      console.error(err);
      setMicStatus("idle");

      setError(
        err.name === "NotAllowedError"
          ? "Microphone permission denied. Please allow microphone access."
          : err.message || "Could not access microphone."
      );

      stopMicrophone();
    }
  };

  return (
    <div
      className="absolute inset-0 z-50 overflow-y-auto overflow-x-hidden flex flex-col items-center px-4 py-6 text-center"
      style={{
        background:
          "radial-gradient(ellipse at 50% 25%, #754054 0%, #3a2035 55%, #170e1d 100%)",
      }}
    >
      <style>{`
        @keyframes twinkle {
          0%,100% { opacity: .35; }
          50% { opacity: 1; }
        }
        @keyframes flicker {
          0%,100% { transform: scale(1) rotate(-4deg); }
          50% { transform: scale(1.15) rotate(4deg); }
        }
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
          @keyframes wishDrift {
           0% {
           transform: translateX(105vw);
           opacity: 0;
          }
  12%, 82% {
    opacity: .22;
  }
  100% {
    transform: translateX(-120%);
    opacity: 0;
  }
}

@keyframes bokehPulse {
  0%,100% {
    transform: scale(.82);
    opacity: .12;
  }
  50% {
    transform: scale(1.18);
    opacity: .28;
  }
}

.birthday-wish {
  position: absolute;
  white-space: nowrap;
  color: rgba(255, 226, 239, .58);
  font-family: 'Playfair Display', serif;
  font-size: clamp(12px, 1.8vw, 17px);
  letter-spacing: .04em;
  text-shadow: 0 0 12px rgba(255, 180, 215, .22);
  pointer-events: none;
  animation: wishDrift 30s linear infinite;
}

.birthday-bokeh {
  position: absolute;
  width: var(--size);
  height: var(--size);
  left: var(--x);
  top: var(--y);
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255,220,239,.48) 0%,
    rgba(255,170,215,.16) 42%,
    transparent 72%
  );
  filter: blur(3px);
  animation: bokehPulse var(--duration) ease-in-out infinite;
  animation-delay: var(--delay);
  pointer-events: none;
}
        @keyframes popLeft {
          0% { transform: translate(0,0) rotate(0); opacity: 0; }
          15% { opacity: 1; }
          100% { transform: translate(170px,-130px) rotate(55deg); opacity: 0; }
        }
        @keyframes popRight {
          0% { transform: translate(0,0) rotate(0); opacity: 0; }
          15% { opacity: 1; }
          100% { transform: translate(-170px,-130px) rotate(-55deg); opacity: 0; }
        }
        .twinkle { animation: twinkle 2s infinite; }
        .floating { animation: float 3s ease-in-out infinite; }
        .flame { animation: flicker .18s infinite alternate; }
        .party-left { animation: popLeft 1.3s ease-out forwards; }
        .party-right { animation: popRight 1.3s ease-out forwards; }
      `}</style>
      {/* Subtle birthday wishes and bokeh background */}
<div
  className="absolute inset-0 overflow-hidden pointer-events-none z-0"
  aria-hidden="true"
>
  {[
    "Happy Birthday, Sakshi ❤️",
    "You are my sunshine ✨",
    "Keep smiling, beautiful 🌸",
    "You make life sweeter 💗",
    "Stay magical, my love 🦋",
    "You deserve all the happiness 🌷",
  ].map((wish, i) => (
    <span
      key={wish}
      className="birthday-wish"
      style={{
        top: `${13 + i * 13}%`,
        animationDelay: `${i * -5.2}s`,
        animationDuration: `${29 + (i % 3) * 5}s`,
      }}
    >
      {wish}
    </span>
  ))}

  {Array.from({ length: 18 }).map((_, i) => (
    <span
      key={`bokeh-${i}`}
      className="birthday-bokeh"
      style={{
        "--size": `${38 + (i % 5) * 17}px`,
        "--x": `${(i * 17 + 6) % 96}%`,
        "--y": `${(i * 23 + 8) % 94}%`,
        "--duration": `${5 + (i % 4)}s`,
        "--delay": `${-(i % 6)}s`,
      }}
    />
  ))}
</div>

      <audio ref={musicRef} src="/romantic-song.mp3" loop />
      <audio
  ref={birthdayTuneRef}
  src="/happy-birthday.mp3"
  loop={false}
  preload="auto"
/>
      <div
        ref={confettiRef}
        className="absolute inset-0 pointer-events-none z-40 overflow-hidden"
      />

      {/* Background fairy lights */}
      <div className="absolute top-0 left-0 right-0 flex justify-around">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="twinkle text-yellow-200"
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            ✦
          </span>
        ))}
      </div>

      {/* Birthday wall banner */}
      <div className="relative z-10 w-full max-w-2xl mt-7 mb-5">
        <div className="flex justify-center gap-2 text-yellow-200 text-xl mb-2">
          <span>✦</span><span>🎀</span><span>✦</span>
        </div>

        <div
          className="mx-auto px-4 py-4 sm:px-8 rounded-xl border-2"
          style={{
            background: "linear-gradient(120deg, #9b456c, #d47b9c, #9b456c)",
            borderColor: "#f7d99c",
            boxShadow: "0 0 25px #f6a8c655",
          }}
        >
          <p className="text-yellow-100 text-xs sm:text-sm tracking-[0.35em]">
            ✨ TODAY IS ALL ABOUT YOU ✨
          </p>

          <h1
            className="text-3xl sm:text-5xl font-bold mt-2"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#fff1dc",
              textShadow: "0 3px 12px #702a4d",
            }}
          >
            HAPPY BIRTHDAY
          </h1>

          <p className="text-3xl sm:text-4xl italic text-white mt-1"
             style={{ fontFamily: "'Playfair Display', serif" }}>
            Sakshi ❤️
          </p>
        </div>
      </div>

      {/* Small side balloons */}
      <div className="absolute top-32 left-3 sm:left-12 text-5xl floating">
        🎈
      </div>
      <div className="absolute top-40 right-3 sm:right-12 text-5xl floating">
        🎈
      </div>

      {/* Birthday message */}
      <div className="birthday-heading relative z-10 mb-3">
        <p className="text-pink-100 text-sm sm:text-base">
          A little celebration for my favourite person
        </p>
      </div>

      {/* Birthday table */}
      <div
        ref={cakeRef}
        className="relative z-10 w-full max-w-xl mt-5"
      >
        <div className="flex justify-center items-end gap-3 sm:gap-7 px-2">

          {/* Sunflower bouquet */}
          <div className="flex flex-col items-center floating">
            {/* Mixed flower bouquet */}
             <div className="relative w-32 h-28">

  {/* Back greenery */}
  <span className="absolute bottom-0 left-3 text-3xl rotate-[-35deg]">🌿</span>
  <span className="absolute bottom-0 right-2 text-3xl rotate-45">🌿</span>

  {/* Dense flower arrangement */}
  <span className="absolute top-2 left-5 text-4xl z-10">🌷</span>
  <span className="absolute top-0 left-10 text-5xl z-20">🌻</span>
  <span className="absolute top-2 right-1 text-4xl z-10">🌹</span>

  <span className="absolute top-8 left-0 text-4xl z-20">🌼</span>
  <span className="absolute top-9 left-9 text-5xl z-30">🌻</span>
  <span className="absolute top-9 right-0 text-4xl z-20">🌸</span>

  {/* Small filler flowers */}
  <span className="absolute top-16 left-5 text-2xl z-30">🌸</span>
  <span className="absolute top-16 right-5 text-2xl z-30">🌼</span>

</div>
            <div
              className="w-14 sm:w-16 h-14 rounded-b-xl rounded-t-sm flex items-center justify-center text-2xl"
              style={{
                background: "linear-gradient(90deg,#d9a1b1,#f1c3ce)",
                border: "2px solid #ffe1e8",
              }}
            >
              🎀
            </div>
            <p className="text-yellow-100 text-xs mt-1">For you 🌻</p>
          </div>

          {/* Cake */}
          <div className="flex flex-col items-center flex-1 max-w-xs">
            {/* Candles */}
            <div className="flex justify-center gap-5 mb-1 relative z-10">
              {[0, 1, 2].map((candle) => (
                <div key={candle} className="relative">
                  {!candlesOut && (
                    <span
                      className="flame absolute -top-7 left-1/2 -translate-x-1/2 text-2xl"
                      style={{ filter: "drop-shadow(0 0 8px #ffb347)" }}
                    >
                      🔥
                    </span>
                  )}
                  <div
                    className="w-3 h-11 rounded-t-sm"
                    style={{
                      background:
                        candle % 2 === 0
                          ? "repeating-linear-gradient(45deg,#f59bb9,#f59bb9 5px,#fff0f5 5px,#fff0f5 9px)"
                          : "repeating-linear-gradient(45deg,#f5d17c,#f5d17c 5px,#fff7dd 5px,#fff7dd 9px)",
                    }}
                  />
                </div>
              ))}
            </div>

            <div
              className="w-full h-14 rounded-t-[45%] relative"
              style={{
                background: "linear-gradient(#fff0f4,#ffc4d6)",
                boxShadow: "0 0 22px #ffb3d0",
              }}
            >
              <div className="flex justify-around mt-4 text-pink-500 text-xl">
                <span>♥</span><span>♡</span><span>♥</span><span>♡</span>
              </div>
            </div>

            <div
              className="w-full h-16 rounded-b-xl text-white flex items-center justify-center"
              style={{
                background: "linear-gradient(#f3a0bd,#c75e8c)",
                borderTop: "5px solid #ffe0e9",
              }}
            >
              <span className="text-sm sm:text-base"
                    style={{ fontFamily: "'Playfair Display', serif" }}>
                Made with love ❤️
              </span>
            </div>
          </div>

          {/* Gifts */}
          <div className="flex flex-col items-center gap-1 floating">
            <div className="text-4xl sm:text-5xl">🎁</div>
            <div
              className="w-14 h-12 rounded-sm flex items-center justify-center text-2xl"
              style={{
                background: "linear-gradient(90deg,#b64d75,#f08bb0)",
                border: "2px solid #ffd7e4",
              }}
            >
              🎀
            </div>
            <div className="w-12 h-9 rounded-sm flex items-center justify-center text-xl"
                 style={{ background: "#e6bb77" }}>
              🎁
            </div>
          </div>
        </div>

        {/* Table top */}
        <div
          className="w-full h-5 rounded-full mt-1"
          style={{
            background: "linear-gradient(#f5d4d1,#a95f71)",
            boxShadow: "0 5px 18px #09040b80",
          }}
        />

        {/* Table cloth */}
        <div
          className="mx-auto w-[94%] h-12 rounded-b-2xl relative"
          style={{
            background: "linear-gradient(90deg,#a94f72,#e5a0b7,#a94f72)",
            borderBottom: "3px solid #f5c5d4",
          }}
        >
          <div className="text-center text-pink-100 text-sm pt-2 tracking-widest">
            ✧ A DAY TO REMEMBER ✧
          </div>
        </div>
      </div>

      {/* Candle interaction */}
      <div className="relative z-20 mt-7 mb-5 max-w-md">
        {!candlesOut ? (
          <>
            <p className="text-pink-100 text-sm sm:text-base mb-4">
              Make a wish, close your eyes and blow the candles 🥹
            </p>

            <button
              onClick={startMicrophone}
              disabled={micStatus === "listening"}
              className="px-8 py-3 rounded-full text-white font-semibold"
              style={{
                background: "linear-gradient(90deg,#e85d91,#a64d88)",
                boxShadow: "0 0 22px #ff69a5a0",
              }}
            >
              {micStatus === "listening"
                ? "🎤 Listening... Blow now!"
                : "💨 Blow the Candle"}
            </button>

            {micStatus === "listening" && (
              <p className="text-pink-200 text-xs mt-3 animate-pulse">
                Blow towards your microphone 💨
              </p>
            )}

            {error && (
              <p className="text-red-200 text-xs mt-3">{error}</p>
            )}
          </>
        ) : (
          <div>
            <h2
              className="text-3xl sm:text-4xl font-bold text-pink-100"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Yayyy! 🥳
            </h2>

            <p className="text-pink-100 mt-2 text-sm sm:text-base">
              May all your wishes come true, my love! ❤️
            </p>

            <button
              onClick={onNext}
              className="mt-6 px-10 py-3 rounded-full text-white font-semibold"
              style={{
                background: "linear-gradient(90deg,#e85d91,#a64d88)",
                boxShadow: "0 0 22px #ff69a5a0",
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Side party poppers */}
      {candlesOut && (
        <>
          <div className="absolute left-2 sm:left-10 bottom-24 z-40 text-6xl party-left pointer-events-none">
            🎉
          </div>
          <div className="absolute right-2 sm:right-10 bottom-24 z-40 text-6xl party-right pointer-events-none">
            🎉
          </div>
        </>
      )}

      <p className="relative z-10 text-pink-200/60 text-xs tracking-widest mt-auto pt-4">
        MADE WITH LOVE ❤️ JUST FOR YOU
      </p>
    </div>

  );

}

