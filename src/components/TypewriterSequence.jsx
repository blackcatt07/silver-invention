import { useState, useRef, useEffect, useMemo } from "react";
import gsap from "gsap";
import Keypad from "./Keypad";

// Stickers
import amazedSparkle from "../assets/stickers/amazed-sparkle.gif";
import thinking from "../assets/stickers/thinking.gif";
import sad from "../assets/stickers/sad.gif";
import cry from "../assets/stickers/cry.gif";
import mayaowl from "../assets/stickers/myaowl.gif";
const hugVideo = "/hug.mp4";

function HeadingContainer({
  containerRef,
  hRef,
  text,
  style,
  visible = false,
}) {
  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex items-center justify-center"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <h1
        ref={hRef}
        className="w-full text-center font-bold leading-tight"
        style={style}
      >
        {text}
      </h1>
    </div>
  );
}

const generateBlobs = (count) =>
  Array.from({ length: count }, (_, i) => ({
    size: 80 + Math.random() * 200,
    top: Math.random() * 100,
    left: Math.random() * 100,
    borderRadius: `
      ${30 + Math.random() * 40}% ${50 + Math.random() * 30}%
      ${40 + Math.random() * 40}% ${50 + Math.random() * 30}% /
      ${40 + Math.random() * 20}% ${30 + Math.random() * 40}%
      ${50 + Math.random() * 30}% ${40 + Math.random() * 40}%
    `,
    id: i,
  }));

export default function TypewriterSequence({ refs, onSuccess, onVideoEnd }) {
  const {
    mainRef,
    heading1ContainerRef,
    heading1Ref,
    heading2ContainerRef,
    heading2Ref,
    heading3ContainerRef,
    heading3Ref,
    heading4ContainerRef,
    heading4Ref,
    overlayRef,
    leftPanelRef,
    rightPanelRef,
    keypadRef,
    leftContentRef,
    goNext,
    showArrow,
  } = refs;

  // Refined, fully responsive heading style
  const headingStyle = {
    fontFamily: "'Playfair Display', serif",
    color: "#FF0000",
    fontSize: "clamp(2rem, 8vw, 6rem)", // softer scaling across all widths
    lineHeight: 1.2,
    fontFeatureSettings: '"liga" 0',
    fontVariantLigatures: "none",
  };

  // ---------- State ----------
  const [wrongPassword, setWrongPassword] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [keypadKey, setKeypadKey] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [blobsDone, setBlobsDone] = useState(false);
  const [videoVisible, setVideoVisible] = useState(false);
  const [showUnlockMessage, setShowUnlockMessage] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const failOverlayRef = useRef(null);
  const entranceCompleteRef = useRef(false);
  const blobContainerRef = useRef(null);
  const blobRefs = useRef([]);
  const videoRef = useRef(null);
  const blobs = useMemo(() => generateBlobs(20), []);

  const redPanelContent = useMemo(() => {
    if (failCount === 0)
      return {
        sticker: amazedSparkle,
        text: "Which date did we meet at V3S Mall?",
      };
    if (failCount === 1)
      return {
        sticker: thinking,
        text: "I think you mistyped the DATE.\nare ie kena bhuil genu😀!",
      };
    if (failCount === 2)
      return {
        sticker: sad,
        text: "Please try hard.\nnai yaad eai😔.",
      };
    return {
      sticker: cry,
      text: "I think the current user isn't Sakshi ❤️",
    };
  }, [failCount]);

  // --- Fail overlay entrance ---
  useEffect(() => {
    if (wrongPassword && failOverlayRef.current) {
      entranceCompleteRef.current = false;
      gsap.fromTo(
        failOverlayRef.current,
        { scaleY: 0, transformOrigin: "bottom" },
        {
          scaleY: 1,
          duration: 0.8,
          ease: "power2.inOut",
          onComplete: () => {
            entranceCompleteRef.current = true;
            setFailCount((prev) => prev + 1);
          },
        },
      );
    }
  }, [wrongPassword]);

  // --- Blob spread ---
  useEffect(() => {
    if (isSuccess && blobContainerRef.current) {
      const els = blobRefs.current.filter(Boolean);
      gsap.set(els, { scale: 0, opacity: 1 });
      gsap.to(els, {
        scale: 5,
        duration: 2.8,
        stagger: { each: 0.12, from: "random" },
        ease: "power3.inOut",
        onComplete: () => setBlobsDone(true),
      });
    }
  }, [isSuccess]);

  // --- Start video muted as soon as it’s mounted ---
  useEffect(() => {
    if (isSuccess && videoRef.current) {
      const video = videoRef.current;
      video.muted = true;
      video.playbackRate = 0.75;
      video.play().catch(console.warn);
    }
  }, [isSuccess]);

  // --- Crossfade: blobs out → video visible, then unmute ---
  useEffect(() => {
    if (blobsDone && videoRef.current) {
      setShowUnlockMessage(false);
      const video = videoRef.current;
      const tl = gsap.timeline({
        onComplete: () => {
          setVideoVisible(true);
          if (onSuccess) onSuccess(); // remove background, cream → black
          video.muted = false; // audio now on
        },
      });
      if (blobContainerRef.current) {
        tl.to(
          blobContainerRef.current,
          { opacity: 0, duration: 1.0, ease: "power2.out" },
          0,
        );
      }
      tl.to(video, { opacity: 1, duration: 1.0, ease: "power2.out" }, 0);
    }
  }, [blobsDone, onSuccess]);

  // --- Password submit ---
  const handlePasswordSubmit = (password) => {
    if (password === "0305") {
      setIsSuccess(true);
    } else {
      setWrongPassword(true);
    }
  };

  // --- Try again ---
  const handleTryAgain = () => {
    if (!failOverlayRef.current || !entranceCompleteRef.current) return;
    gsap.to(failOverlayRef.current, {
      scaleY: 0,
      transformOrigin: "bottom",
      duration: 0.8,
      ease: "power2.inOut",
      onComplete: () => {
        setWrongPassword(false);
        setKeypadKey((prev) => prev + 1);
        entranceCompleteRef.current = false;
      },
    });
  };

  // --- Video ended → cream ---
  const handleVideoEnded = () => {
    if (onVideoEnd) onVideoEnd();
  };

  return (
    <>
      {/* ---- Typewriter ---- */}
      <div ref={mainRef} className="min-h-screen relative opacity-0 px-4 z-10">
        <HeadingContainer
          containerRef={heading1ContainerRef}
          hRef={heading1Ref}
          text="Some might find their way here…"
          style={headingStyle}
          visible
        />
        <HeadingContainer
          containerRef={heading2ContainerRef}
          hRef={heading2Ref}
          text="But this wasn’t made for everyone."
          style={headingStyle}
        />
        <HeadingContainer
          containerRef={heading3ContainerRef}
          hRef={heading3Ref}
          text="Only one person can open this gift…"
          style={headingStyle}
        />
        <HeadingContainer
          containerRef={heading4ContainerRef}
          hRef={heading4Ref}
          text="And she knows who she is......"
          style={headingStyle}
        />
      </div>
      {/* ---- Next Arrow ---- */}
{showArrow && !isSuccess && (
  <button
    onClick={goNext}
    aria-label="Next message"
    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30
               w-12 h-12 rounded-full
               flex items-center justify-center
               text-white text-3xl
               bg-red-600/80 backdrop-blur-sm
               shadow-lg
               hover:scale-110 active:scale-95
               transition-transform duration-300"
  >
    →
  </button>
)}

      {/* ---- Panels ---- */}
      <div
        ref={overlayRef}
        className="absolute inset-0 z-20 opacity-0 pointer-events-none"
      >
        {/* Left panel – scrollable if content overflows */}
        <div
          ref={leftPanelRef}
          className="absolute left-0 top-0 h-full w-1/2 flex items-center justify-center overflow-y-auto min-h-0"
          style={{ backgroundColor: "#FF0000" }}
        >
          <div
            ref={leftContentRef}
            className="flex flex-col items-center gap-4 opacity-0 scale-0 px-4"
          >
            <img
              src={redPanelContent.sticker}
              alt=""
              className="w-56 h-56 sm:w-72 sm:h-72 object-contain drop-shadow-lg"
            />
            <p
              className="text-white text-center font-medium leading-relaxed whitespace-pre-line"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "clamp(0.9rem, 2.5vw, 1.2rem)",
                letterSpacing: "0.02em",
              }}
            >
              {redPanelContent.text}
            </p>
          </div>
        </div>

        {/* Right panel – scrollable if keypad overflows */}
        <div
          ref={rightPanelRef}
          className="absolute right-0 top-0 h-full w-1/2 flex items-center justify-center p-4 overflow-y-auto min-h-0"
          style={{ backgroundColor: "#FFFDD0" }}
        >
          <div ref={keypadRef} className="opacity-0 scale-0">
            <Keypad key={keypadKey} onSubmit={handlePasswordSubmit} />
          </div>
        </div>
      </div>

      {/* ---- Fail overlay ---- */}
      {wrongPassword && (
        <div
          ref={failOverlayRef}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-8 px-6"
          style={{
            backgroundColor: "#FFFDD0",
            fontFamily: "'Montserrat', sans-serif",
            transformOrigin: "bottom",
          }}
        >
          <img
            src={mayaowl}
            alt="Maya owl"
            className="w-64 h-64 sm:w-80 sm:h-80 object-contain"
          />
          <p
            className="text-center text-red-600 font-semibold leading-snug"
            style={{ fontSize: "clamp(1.2rem, 3vw, 1.8rem)" }}
          >
            If you are my baby, you will know it
          </p>
          <button
            onClick={handleTryAgain}
            className="px-8 py-3 rounded-full font-semibold text-white shadow-xl transition-transform duration-300 hover:scale-105 active:scale-95"
            style={{
              backgroundColor: "#FF0000",
              fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
            }}
          >
            Try again
          </button>
        </div>
      )}
      {/* ---- Romantic background behind portrait video ---- */}
{isSuccess && (
  <div
    className="absolute inset-0 z-40"
    style={{
      background: `
        radial-gradient(circle at 50% 40%, #71334f 0%, #301522 45%, #090609 100%)
      `,
    }}
  >
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="text-5xl opacity-20">♥</span>
    </div>
    {showUnlockMessage && (
    <p
  className="absolute top-[25%] left-1/2 -translate-x-1/2
             w-full px-4 text-center
             text-white text-xl sm:text-3xl
             font-semibold tracking-wide"
  style={{
    fontFamily: "'Playfair Display', serif",
    textShadow: "0 0 15px rgba(255,255,255,0.4)",
  }}
>
  You did it, Sakshi...
  <br />
  You unlocked something made just for you ❤️
</p>
)}
  </div>
)}

      {/* ---- Blobs (virus) ---- */}
      {isSuccess && !videoVisible && (
        <div
          ref={blobContainerRef}
          className="absolute inset-0 z-50 overflow-hidden"
          style={{ backgroundColor: "transparent" }}
        >
          {blobs.map((blob) => (
            <div
              key={blob.id}
              ref={(el) => (blobRefs.current[blob.id] = el)}
              className="absolute"
              style={{
                width: `${blob.size}px`,
                height: `${blob.size}px`,
                top: `${blob.top}%`,
                left: `${blob.left}%`,
                backgroundColor: "transparent",
                borderRadius: blob.borderRadius,
                transformOrigin: "center center",
                transform: "scale(0)",
                willChange: "transform",
              }}
            />
          ))}
        </div>
      )}

      {/* ---- Video ---- */}
      <button
  onClick={() => {
    setIsMuted((prev) => !prev);
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  }}
  className="absolute right-5 top-1/2 -translate-y-1/2 z-[70]
             bg-white/20 backdrop-blur-md
             text-white rounded-full w-12 h-12
             flex items-center justify-center
             text-xl shadow-lg hover:scale-110
             transition-transform"
  aria-label={isMuted ? "Unmute video" : "Mute video"}
>
  {isMuted ? "🔇" : "🔊"}
</button>
      {isSuccess && (
        <video
  ref={videoRef}
  src={hugVideo}
  className="absolute top-1/2 left-1/2
             -translate-x-1/2 -translate-y-1/2
             h-full w-auto max-w-none
             aspect-[9/16] object-cover"
  style={{ opacity: 0, zIndex: 60 }}
  playsInline
  muted={isMuted}
  playbackRate={0.75}
  onEnded={handleVideoEnded}
/>
      )}
    </>
  );
}
