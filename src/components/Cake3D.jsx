
import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

useGLTF.preload("/models/strawberry_cake.glb");

/* ==========================
   Microphone blow detector
   ========================== */
function useBlowDetector(isActive, onBlow) {
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const blowDetectedRef = useRef(false);

  useEffect(() => {
    if (!isActive) return;
    let cancelled = false;

    const startMic = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();

        analyser.fftSize = 256;
        source.connect(analyser);
        audioContextRef.current = audioCtx;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const detect = () => {
          if (cancelled) return;

          analyser.getByteTimeDomainData(dataArray);
          let sum = 0;

          for (let i = 0; i < dataArray.length; i++) {
            const normalized = (dataArray[i] - 128) / 128;
            sum += normalized * normalized;
          }

          const rms = Math.sqrt(sum / dataArray.length);

          if (rms > 0.35 && !blowDetectedRef.current) {
            blowDetectedRef.current = true;
            onBlow();

            setTimeout(() => {
              blowDetectedRef.current = false;
            }, 800);
          }

          animationFrameRef.current = requestAnimationFrame(detect);
        };

        detect();
      } catch (err) {
        console.warn("Microphone access denied");
      }
    };

    startMic();

    return () => {
      cancelled = true;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isActive, onBlow]);
}

/* ==========================
   Bright custom flame
   ========================== */
function Flame({ position, lit }) {
  const meshRef = useRef();
  const lightRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current && lit) {
      const s =
        0.8 + Math.sin(clock.elapsedTime * 20 + position[0]) * 0.2;

      meshRef.current.scale.setScalar(s);

      if (lightRef.current) {
        lightRef.current.intensity = s * 0.7;
      }
    }
  });

  if (!lit) return null;

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color="#ff3300" />
      </mesh>

      <pointLight
        ref={lightRef}
        intensity={0.8}
        distance={2.5}
        color="#ff4400"
      />
    </group>
  );
}

/* ==========================
   3D cake scene
   ========================== */
function CakeScene({ candlesLit, setCandlesLit, micRequested, onBlow }) {
  const { scene } = useGLTF("/models/strawberry_cake.glb");

  const flameNames = [
    "pCone1_orange_fire_0",
    "pCone2_orange_fire_0",
    "pCone3_orange_fire_0",
    "pCone4_orange_fire_0",
    "pCone5_orange_fire_0",
    "pCone6_orange_fire_0",
    "pCone7_orange_fire_0",
    "pCone8_orange_fire_0",
  ];

  const [flamePositions, setFlamePositions] = useState([]);

  useEffect(() => {
    const positions = flameNames
      .map((name) => {
        const obj = scene.getObjectByName(name);

        if (obj) {
          obj.visible = false;
          const pos = new THREE.Vector3();
          obj.getWorldPosition(pos);
          return pos.toArray();
        }

        return null;
      })
      .filter(Boolean);

    setFlamePositions(positions);
  }, [scene]);

  const handleBlow = useCallback(() => {
    if (!candlesLit.some((lit) => lit)) return;

    onBlow();
    setCandlesLit(new Array(flamePositions.length).fill(false));
  }, [candlesLit, flamePositions.length, onBlow, setCandlesLit]);

  useBlowDetector(
    micRequested && candlesLit.some((lit) => lit),
    handleBlow
  );

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 5, 5]} intensity={1.0} castShadow />
      <pointLight position={[-3, 2, 2]} intensity={0.5} />

      <group
        scale={60}
        position={[0, -1.2, 0]}
        rotation={[0, Math.PI / 8, 0]}
      >
        <primitive object={scene} />
      </group>

      {flamePositions.map((pos, i) => (
        <Flame key={i} position={pos} lit={candlesLit[i]} />
      ))}
    </>
  );
}

/* ==========================
   Birthday celebration effects
   10-second celebration
   ========================== */
function useCelebration(containerRef, active, onComplete) {
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!active || hasStarted.current) return;

    hasStarted.current = true;

    const container = containerRef.current;
    if (!container) return;

    const animations = [];
    const addAnimation = (animation) => animations.push(animation);

    // Soft, bigger bokeh background
    for (let i = 0; i < 22; i++) {
      const bokeh = document.createElement("div");

      const size = 35 + Math.random() * 75;

      Object.assign(bokeh.style, {
        position: "absolute",
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        background: [
          "rgba(255, 182, 193, 0.32)",
          "rgba(255, 215, 0, 0.25)",
          "rgba(255, 255, 255, 0.45)",
          "rgba(255, 105, 180, 0.22)",
        ][i % 4],
        filter: "blur(9px)",
        pointerEvents: "none",
      });

      container.appendChild(bokeh);

      addAnimation(
        gsap.to(bokeh, {
          scale: 1.6,
          opacity: 0.35,
          duration: 2 + Math.random() * 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: Math.random() * 2,
        })
      );
    }

    // Floating birthday messages - continuously repeating
    const messages = [
      "Happy Birthday Sakshi ❤️",
      "You are my sunshine ☀️",
      "You are beautiful 🌸",
      "Keep smiling, princess 💗",
      "You make everything special ✨",
      "My favourite person ❤️",
      "Stay magical, baby 🦋",
      "You deserve all the happiness 💕",
      "Forever my favourite smile 🌷",
      "A little more beautiful every day 💖",
    ];

    for (let i = 0; i < 16; i++) {
      const message = document.createElement("div");

      message.textContent = messages[i % messages.length];

      Object.assign(message.style, {
        position: "absolute",
        whiteSpace: "nowrap",
        left: `${Math.random() * 85}%`,
        top: `${Math.random() * 100}%`,
        fontSize: `${14 + Math.random() * 10}px`,
        fontWeight: "700",
        color: i % 2 === 0 ? "#e75480" : "#b83280",
        textShadow: "0 2px 8px rgba(255,255,255,0.8)",
        opacity: "0",
        pointerEvents: "none",
      });

      container.appendChild(message);

      addAnimation(
        gsap.fromTo(
          message,
          {
            x: 100,
            opacity: 0,
          },
          {
            x: -window.innerWidth - 250,
            opacity: 0.75,
            duration: 9 + Math.random() * 5,
            repeat: -1,
            ease: "none",
            delay: Math.random() * 7,
          }
        )
      );
    }

    // Flowers floating upwards
    const flowers = ["🌸", "🌷", "🌺", "🌼", "💐", "🌻"];

    for (let i = 0; i < 35; i++) {
      const flower = document.createElement("div");

      flower.textContent = flowers[i % flowers.length];

      Object.assign(flower.style, {
        position: "absolute",
        left: `${Math.random() * 100}%`,
        bottom: "-10%",
        fontSize: `${1.5 + Math.random() * 2}rem`,
        opacity: "0",
        pointerEvents: "none",
      });

      container.appendChild(flower);

      addAnimation(
        gsap.fromTo(
          flower,
          {
            y: 0,
            x: 0,
            rotation: 0,
            opacity: 0,
          },
          {
            y: -window.innerHeight - 150,
            x: (Math.random() - 0.5) * 180,
            rotation: Math.random() * 360,
            opacity: 1,
            duration: 8 + Math.random() * 2,
            delay: Math.random() * 7,
            ease: "none",
          }
        )
      );
    }

    // Lots of balloons rising from bottom
    for (let i = 0; i < 65; i++) {
      const balloon = document.createElement("div");

      balloon.textContent = ["🎈", "🎈", "🎈", "💗"][i % 4];

      Object.assign(balloon.style, {
        position: "absolute",
        left: `${Math.random() * 100}%`,
        bottom: "-12%",
        fontSize: `${2.5 + Math.random() * 3.5}rem`,
        opacity: "0",
        pointerEvents: "none",
      });

      container.appendChild(balloon);

      addAnimation(
        gsap.fromTo(
          balloon,
          {
            y: 0,
            x: 0,
            opacity: 0,
            rotation: -15,
          },
          {
            y: -window.innerHeight - 250,
            x: (Math.random() - 0.5) * 220,
            opacity: 1,
            rotation: Math.random() * 45 - 20,
            duration: 8 + Math.random() * 2,
            delay: Math.random() * 7,
            ease: "none",
          }
        )
      );
    }

    // Floating hearts
    const hearts = ["❤️", "💕", "💗", "💖", "💘", "💝"];

    for (let i = 0; i < 45; i++) {
      const heart = document.createElement("div");

      heart.textContent = hearts[i % hearts.length];

      Object.assign(heart.style, {
        position: "absolute",
        left: `${Math.random() * 100}%`,
        bottom: "-8%",
        fontSize: `${1.5 + Math.random() * 2.5}rem`,
        opacity: "0",
        pointerEvents: "none",
      });

      container.appendChild(heart);

      addAnimation(
        gsap.fromTo(
          heart,
          {
            y: 0,
            opacity: 0,
            scale: 0.5,
          },
          {
            y: -window.innerHeight - 150,
            opacity: 1,
            scale: 1.4,
            rotation: Math.random() * 50 - 25,
            duration: 8 + Math.random() * 2,
            delay: Math.random() * 7,
            ease: "none",
          }
        )
      );
    }

    // Stars and sparkles
    const sparkles = ["✨", "🌟", "⭐", "💫"];

    for (let i = 0; i < 65; i++) {
      const star = document.createElement("div");

      star.textContent = sparkles[i % sparkles.length];

      Object.assign(star.style, {
        position: "absolute",
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        fontSize: `${1.2 + Math.random() * 2}rem`,
        opacity: "0",
        pointerEvents: "none",
      });

      container.appendChild(star);

      addAnimation(
        gsap.to(star, {
          opacity: 1,
          scale: 1.5,
          rotation: 180,
          duration: 1.5 + Math.random() * 2,
          delay: Math.random() * 7,
          repeat: 3,
          yoyo: true,
          ease: "sine.inOut",
        })
      );
    }

    // Falling confetti and particles
    const colors = [
      "#ff0000",
      "#ffdd00",
      "#ff00aa",
      "#ff8800",
      "#00ffcc",
      "#ff44aa",
      "#ffaa00",
      "#66ffcc",
      "#ff66cc",
    ];

    for (let i = 0; i < 180; i++) {
      const dot = document.createElement("div");

      const size = 5 + Math.random() * 12;

      Object.assign(dot.style, {
        position: "absolute",
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: colors[i % colors.length],
        borderRadius: Math.random() > 0.5 ? "50%" : "2px",
        left: `${Math.random() * 100}%`,
        top: "-3%",
        opacity: "0",
        pointerEvents: "none",
      });

      container.appendChild(dot);

      addAnimation(
        gsap.fromTo(
          dot,
          {
            y: 0,
            x: 0,
            opacity: 0,
            rotation: 0,
          },
          {
            y: window.innerHeight + 100,
            x: (Math.random() - 0.5) * 350,
            opacity: 1,
            rotation: Math.random() * 720 - 360,
            duration: 8 + Math.random() * 2,
            delay: Math.random() * 7,
            ease: "none",
          }
        )
      );
    }

    // Streamers
    for (let i = 0; i < 45; i++) {
      const streamer = document.createElement("div");

      Object.assign(streamer.style, {
        position: "absolute",
        width: `${5 + Math.random() * 10}px`,
        height: `${45 + Math.random() * 65}px`,
        background: `hsl(${Math.random() * 360}, 85%, 65%)`,
        borderRadius: "10px",
        left: `${Math.random() * 100}%`,
        top: "-12%",
        opacity: "0",
        pointerEvents: "none",
      });

      container.appendChild(streamer);

      addAnimation(
        gsap.fromTo(
          streamer,
          {
            y: -100,
            opacity: 0,
            rotation: 0,
          },
          {
            y: window.innerHeight + 200,
            opacity: 0.9,
            rotation: Math.random() * 500,
            duration: 8 + Math.random() * 2,
            delay: Math.random() * 7,
            ease: "none",
          }
        )
      );
    }

    // Finish celebration after exactly 10 seconds
    const timeout = setTimeout(() => {
      if (onComplete) onComplete();
    }, 10000);

    return () => {
      clearTimeout(timeout);
      animations.forEach((animation) => animation.kill());
      container.innerHTML = "";
    };
  }, [active, containerRef, onComplete]);
}

/* ==========================
   Main Cake3D component
   ========================== */
export default function Cake3D({ onNext }) {
  const [candlesLit, setCandlesLit] = useState(Array(8).fill(true));
  const [micRequested, setMicRequested] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [musicReady, setMusicReady] = useState(false);

  const allOut = !candlesLit.some((lit) => lit);

  const celebrationContainerRef = useRef(null);
  const popupRef = useRef(null);
  const musicRef = useRef(null);
  const handleCelebrationComplete = useCallback(() => {
  setShowPopup(true);
}, []);

  // Start music silently from the button click.
  // It becomes audible after candles are blown.
  const startMusic = () => {
    const audio = musicRef.current;

    if (!audio || musicReady) return;

    audio.volume = 0;
    audio.loop = true;

    audio.play()
      .then(() => setMusicReady(true))
      .catch((err) => {
        console.warn("Background music could not start:", err);
      });
  };

  // Candle blow sound + music
  const handleBlow = useCallback(() => {
    const audioContext = new (
      window.AudioContext || window.webkitAudioContext
    )();

    const playPop = (delay, frequency) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = "sine";

      oscillator.frequency.setValueAtTime(
        frequency,
        audioContext.currentTime + delay
      );

      oscillator.frequency.exponentialRampToValueAtTime(
        80,
        audioContext.currentTime + delay + 0.08
      );

      gain.gain.setValueAtTime(
        0.0001,
        audioContext.currentTime + delay
      );

      gain.gain.exponentialRampToValueAtTime(
        0.3,
        audioContext.currentTime + delay + 0.01
      );

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime + delay + 0.09
      );

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.start(audioContext.currentTime + delay);
      oscillator.stop(audioContext.currentTime + delay + 0.1);
    };

    playPop(0, 700);
    playPop(0.12, 950);
    playPop(0.24, 600);

    setTimeout(() => audioContext.close(), 1000);

    // Turn on the background song after the candles are blown.
    if (musicRef.current) {
      musicRef.current.volume = 0.65;

      if (!musicReady) {
        musicRef.current.play()
          .then(() => setMusicReady(true))
          .catch(() => {
            console.warn("Tap to enable background music.");
          });
      }
    }
  }, [musicReady]);

  // Celebration → show popup after 10 seconds
 useCelebration(
  celebrationContainerRef,
  allOut,
  handleCelebrationComplete
);

  // Popup entrance animation
  useEffect(() => {
    if (showPopup && popupRef.current) {
      gsap.fromTo(
        popupRef.current,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: "back.out(2.2)",
        }
      );
    }
  }, [showPopup]);

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-between overflow-hidden"
      style={{ backgroundColor: "#FFFDD0" }}
    >
      {/* Background song */}
      <audio
        ref={musicRef}
        src="/music/birthday-song.mp3"
        loop
        preload="auto"
      />

      {/* Header */}
      <div className="w-full text-center pt-6 pb-2 relative z-[1]">
        <h2
          className="font-bold mb-1"
          style={{
            fontFamily: "'Montserrat', sans-serif",
            color: "#ff0000",
            fontSize: "clamp(1.3rem, 5vw, 2.2rem)",
          }}
        >
          Here is my cake for you 🎂
        </h2>

        <p
          className="font-semibold"
          style={{
            fontFamily: "'Montserrat', sans-serif",
            color: "#db2777",
            fontSize: "clamp(0.9rem, 3.5vw, 1.3rem)",
          }}
        >
          Blow out the candles, baby! 🤩
        </p>
      </div>

      {/* 3D cake - original design preserved */}
      <div className="w-full h-[55vh] max-h-[500px] flex-shrink-0 relative z-[1]">
        <Suspense
          fallback={
            <div
              className="h-full flex items-center justify-center text-red-500"
              style={{ fontSize: "clamp(1rem, 4vw, 1.5rem)" }}
            >
              Loading cake...
            </div>
          }
        >
          <Canvas
            camera={{ position: [0, 1.8, 6.5], fov: 50 }}
            shadows
            gl={{ antialias: true }}
          >
            <CakeScene
              candlesLit={candlesLit}
              setCandlesLit={setCandlesLit}
              micRequested={micRequested}
              onBlow={handleBlow}
            />
          </Canvas>
        </Suspense>
      </div>

      {/* Button area */}
      <div className="w-full text-center pb-6 relative z-[2]">
        {!allOut ? (
          <button
            onClick={() => {
              startMusic();
              setMicRequested(true);
            }}
            disabled={micRequested}
            className="px-6 py-3 rounded-full font-bold text-white bg-red-500 hover:bg-red-600 shadow-xl transform transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "clamp(0.9rem, 3vw, 1.1rem)",
            }}
          >
            {micRequested ? "🔊 Listening... Blow now!" : "🎤 Tap to Blow"}
          </button>
        ) : (
          <p
            className="text-red-600 font-bold"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "clamp(1rem, 3.5vw, 1.4rem)",
            }}
          >
            🎉 Happy Birthday, baby girl!
          </p>
        )}
      </div>

      {/* Celebration overlay */}
      <div
        ref={celebrationContainerRef}
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 5 }}
      />

      {/* Final popup - original message and button preserved */}
      {showPopup && (
        <div
          ref={popupRef}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 px-6"
          style={{ backgroundColor: "#ff0000" }}
        >
          <p
            className="text-white text-center font-semibold leading-relaxed"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "clamp(1.3rem, 4vw, 2rem)",
            }}
          >
            Now let me show you something I’ve been keeping for you ❤️
          </p>

          <button
            onClick={() => {
              console.log("LET'S GO BUTTON CLICKED");
              if (musicRef.current) {
                musicRef.current.pause();
              }

              if (onNext) onNext();
            }}
            className="px-8 py-3 rounded-full font-bold bg-white text-red-600 shadow-xl transform transition-transform duration-300 hover:scale-105 active:scale-95"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "clamp(1rem, 3.5vw, 1.2rem)",
            }}
          >
            Let's go
          </button>
        </div>
      )}
    </div>
  );
}
