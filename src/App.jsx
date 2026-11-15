import { useState , useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import useTypewriterTimeline from "./hooks/useTypewriterTimeline";
import Background from "./components/Background";
import TypewriterSequence from "./components/TypewriterSequence";
import RotationHint from "./components/RotationHint";
import BirthdayCelebration from "./components/BirthdayCelebration";
import ProudMessage from "./components/ProudMessage";

import GiftsScreen from "./components/GiftsScreen";
import GiftRevealScreen from "./components/GiftRevealScreen";
import MemoriesScreen from "./components/MemoriesScreen";
import MessageScreen from "./components/MessageScreen";
import FlowerScreen from "./components/FlowerScreen"; // ← new
import LockScreen from "./components/LockScreen"; // ← new

export default function App() {
  const [isPhone, setIsPhone] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [backgroundGone, setBackgroundGone] = useState(false);
  const [finalCream, setFinalCream] = useState(false);
  const isDevMode =
  new URLSearchParams(window.location.search).get("dev") === "true";
  const [screenIndex, setScreenIndex] = useState(0);
  const screen1Ref = useRef(null); // 0 Birthday
  const screen2Ref = useRef(null); // 1 Proud
  const screen3Ref = useRef(null); // 2 Cake
const screen4Ref = useRef(null); // 3 Gift Reveal
const screen5Ref = useRef(null); // 4 Gifts
const screen6Ref = useRef(null); // 5 Memories (Album)
const screen7Ref = useRef(null); // 6 Message
const screen8Ref = useRef(null); // 7 Flower
const screen9Ref = useRef(null); // 8 Lock
  const transitionOngoing = useRef(false);

  const hintRef = useRef(null);
  const refs = useTypewriterTimeline();
  const { revealMainContent } = refs;

  // ---- Phone detection & hint (unchanged) ----
  useEffect(() => {
    const checkWidth = () => setIsPhone(window.innerWidth < 640);
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  useEffect(() => {
    setShowHint(isPhone === true);
  }, [isPhone]);

  useEffect(() => {
    if (isPhone === false) revealMainContent();
  }, [isPhone, revealMainContent]);

  useEffect(() => {
    if (!showHint || !hintRef.current) return;
    const el = hintRef.current;
    gsap.set(el, { willChange: "transform, opacity" });
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(el, { clearProps: "willChange" });
        setShowHint(false);
        revealMainContent();
      },
    });
    tl.fromTo(
      el,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 2.5, ease: "power2.out" },
    )
      .to(el, { opacity: 1, duration: 1.0 })
      .to(el, { opacity: 0, y: -5, duration: 2.0, ease: "power2.in" });
    return () => {
      tl.kill();
      gsap.set(el, { clearProps: "willChange" });
    };
  }, [showHint, revealMainContent]);

  const handleSuccess = () => setBackgroundGone(true);
  const handleVideoEnd = () => setFinalCream(true);

  // ---- Transition (now 0‑7) ----
  
const transition = useCallback(
  (targetIndex) => {
    if (transitionOngoing.current) return;
    if (targetIndex < 0 || targetIndex > 8) return;
    if (targetIndex === screenIndex) return;

    const allRefs = [
      screen1Ref.current,
      screen2Ref.current,
      screen3Ref.current,
      screen4Ref.current,
      screen5Ref.current,
      screen6Ref.current,
      screen7Ref.current,
      screen8Ref.current,
      screen9Ref.current,
    ];

    const currentRef = allRefs[screenIndex];
    const nextRef = allRefs[targetIndex];

    if (!currentRef || !nextRef) {
      console.error("Screen reference missing:", screenIndex, targetIndex);
      return;
    }

    transitionOngoing.current = true;

    const goingForward = targetIndex > screenIndex;

    gsap.set(nextRef, {
      xPercent: goingForward ? 100 : -100,
      display: "block",
    });

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(currentRef, {
          display: "none",
          xPercent: 0,
        });

        gsap.set(nextRef, {
          clearProps: "transform",
        });

        setScreenIndex(targetIndex);
        transitionOngoing.current = false;
      },
      onInterrupt: () => {
        transitionOngoing.current = false;
      },
    });

    tl.to(
      currentRef,
      {
        xPercent: goingForward ? -100 : 100,
        duration: 0.8,
        ease: "power2.inOut",
      },
      0
    ).to(
      nextRef,
      {
        xPercent: 0,
        duration: 0.8,
        ease: "power2.inOut",
      },
      0
    );
  },
  [screenIndex]
);

  // ---- Scroll / touch navigation (locked on screens 2‑7) ----
  useEffect(() => {
    if (!finalCream) return;

    let touchStartX = 0,
      touchStartY = 0;

    const handleWheel = (e) => {
     if (screenIndex <= 1 || screenIndex >= 2) return; // allow internal scroll
      e.preventDefault();
      if (e.deltaY > 30 || e.deltaX > 30) transition(screenIndex + 1);
      else if (e.deltaY < -30 || e.deltaX < -30) transition(screenIndex - 1);
    };

    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      if (screenIndex >= 2 && screenIndex <= 8) return;
      const dx = touchStartX - e.changedTouches[0].clientX;
      const dy = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 50) transition(screenIndex + 1);
        else if (dx < -50) transition(screenIndex - 1);
      } else {
        if (dy > 50) transition(screenIndex + 1);
        else if (dy < -50) transition(screenIndex - 1);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [finalCream, screenIndex, transition]);

  const bgColor = finalCream
    ? "#FFFDD0"
    : backgroundGone
      ? "#000000"
      : "#FFFDD0";

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      {!backgroundGone && <Background />}

      {!finalCream && !isDevMode && (
  <TypewriterSequence
    refs={refs}
    onSuccess={handleSuccess}
    onVideoEnd={handleVideoEnd}
  />
)}

      {(finalCream || isDevMode) && (
        <>
          {/* 0 – Birthday */}
          <div
            ref={screen1Ref}
            className="absolute inset-0"
            style={{ display: screenIndex === 0 ? "block" : "none" }}
          >
            <BirthdayCelebration onNext={() => transition(1)} />
          </div>

          {/* 1 – Proud */}
          <div
            ref={screen2Ref}
            className="absolute inset-0"
            style={{ display: screenIndex === 1 ? "block" : "none" }}
          >
            <ProudMessage
  onNext={() => transition(3)}
  onBack={() => transition(0)}
/>
          </div>

          
          {/* 3 – Gift Reveal */}
<div
  ref={screen4Ref}
  className="absolute inset-0"
  style={{ display: screenIndex === 3 ? "block" : "none" }}
>
  <GiftRevealScreen
  onNext={() => transition(4)}
  onBack={() => transition(1)}
/>
</div>

          {/* 3 – Gifts (all four clickable) */}
          <div
            ref={screen5Ref}
            className="absolute inset-0"
            style={{ display: screenIndex === 4 ? "block" : "none" }}
          >
            <GiftsScreen
  active={screenIndex === 4}
  onBack={() => transition(3)}
  onAlbumClick={() => transition(5)}
  onFlowerClick={() => transition(7)}
  onLockClick={() => transition(8)}
  onMessageClick={() => transition(6)}
/>
          </div>

          
{/* 5 – Memories (Album) */}
<div
  ref={screen6Ref}
  className="absolute inset-0"
  style={{ display: screenIndex === 5 ? "block" : "none" }}
>
  <MemoriesScreen
    active={screenIndex === 5}
    onBack={() => transition(4)}
  />
</div>


          {/* 5 – Message */}
          <div
            ref={screen7Ref}
            className="absolute inset-0"
            style={{ display: screenIndex === 6 ? "block" : "none" }}
          >
            <MessageScreen
              active={screenIndex === 6}
              onBack={() => transition(4)}
            />
          </div>

          {/* 6 – Flower */}
          <div
            ref={screen8Ref}
            className="absolute inset-0"
            style={{ display: screenIndex === 7 ? "block" : "none" }}
          >
            <FlowerScreen
              active={screenIndex === 7}
              onBack={() => transition(4)}
            />
          </div>

          {/* 7 – Lock */}
          <div
            ref={screen9Ref}
            className="absolute inset-0"
            style={{ display: screenIndex === 8 ? "block" : "none" }}
          >
            <LockScreen
              active={screenIndex === 8}
              onBack={() => transition(4)}
            />
          </div>
        </>
      )}

      {isPhone === true && showHint && <RotationHint hintRef={hintRef} />}
    </div>
  );
}
