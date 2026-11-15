
import { useRef, useState } from "react";
import gsap from "gsap";

export default function useTypewriterTimeline() {
  const mainRef = useRef(null);
  const heading1ContainerRef = useRef(null);
  const heading1Ref = useRef(null);
  const heading2ContainerRef = useRef(null);
  const heading2Ref = useRef(null);
  const heading3ContainerRef = useRef(null);
  const heading3Ref = useRef(null);
  const heading4ContainerRef = useRef(null);
  const heading4Ref = useRef(null);
  const overlayRef = useRef(null);
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);
  const keypadRef = useRef(null);
  const leftContentRef = useRef(null);

  const activeIndex = useRef(0);
  const typingTimeline = useRef(null);
  const transitionOngoing = useRef(false);
  const mainRevealed = useRef(false);
  const [showArrow, setShowArrow] = useState(true);

  const texts = [
    "Some might find their way here…",
    "But this wasn’t made for everyone.",
    "Only one person can open this gift…",
    "And she knows who she is......",
  ];

  const getContainers = () => [
    heading1ContainerRef.current,
    heading2ContainerRef.current,
    heading3ContainerRef.current,
    heading4ContainerRef.current,
  ];

  const getHeadings = () => [
    heading1Ref.current,
    heading2Ref.current,
    heading3Ref.current,
    heading4Ref.current,
  ];

  const animateTyping = (index) => {
    const heading = getHeadings()[index];
    if (!heading) return;

    typingTimeline.current?.kill();

    typingTimeline.current = gsap.timeline();

    typingTimeline.current.to(heading.children, {
      opacity: 1,
      duration: 0.2,
      stagger: 0.15,
      ease: "power2.out",
    });
  };

  const showPanels = () => {
    const tl = gsap.timeline();

    tl.set(overlayRef.current, {
      opacity: 1,
      pointerEvents: "auto",
    });

    tl.set(leftPanelRef.current, {
      scaleY: 0,
      transformOrigin: "bottom",
    });

    tl.set(rightPanelRef.current, {
      scaleY: 0,
      transformOrigin: "top",
    });

    tl.to(leftPanelRef.current, {
      scaleY: 1,
      duration: 1.8,
      ease: "power3.inOut",
    });

    tl.to(
      rightPanelRef.current,
      {
        scaleY: 1,
        duration: 1.8,
        ease: "power3.inOut",
      },
      "<",
    );

    tl.to({}, { duration: 0.2 });

    tl.fromTo(
      leftContentRef.current,
      { opacity: 0, scale: 0 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.9,
        ease: "back.out(1.7)",
      },
    );

    tl.fromTo(
      keypadRef.current,
      { opacity: 0, scale: 0 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.9,
        ease: "back.out(1.7)",
      },
      "<",
    );
  };

  const revealMainContent = () => {
    if (mainRevealed.current || !mainRef.current) return;

    mainRevealed.current = true;

    const headings = getHeadings();
    const containers = getContainers();

    texts.forEach((text, i) => {
      const heading = headings[i];
      if (!heading) return;

      heading.innerHTML = "";

      text.split("").forEach((char) => {
        const span = document.createElement("span");
        span.textContent = char;

        if (char === " ") span.style.whiteSpace = "pre";

        span.style.opacity = 0;
        heading.appendChild(span);
      });
    });

    gsap.set(mainRef.current, { opacity: 1, y: 0 });

    containers.forEach((container, i) => {
      gsap.set(container, { opacity: i === 0 ? 1 : 0 });
    });

    activeIndex.current = 0;
    transitionOngoing.current = false;
    setShowArrow(true);

    animateTyping(0);
  };

  const goNext = () => {
    if (transitionOngoing.current) return;

    transitionOngoing.current = true;
    typingTimeline.current?.kill();

    const current = activeIndex.current;
    const containers = getContainers();

    if (current === 3) {
      setShowArrow(false);

      gsap.to(containers[3], {
        y: -60,
        opacity: 0,
        duration: 3.8,
        ease: "power2.out",
        onComplete: showPanels,
      });

      return;
    }

    const next = current + 1;

    gsap.to(containers[current], {
      opacity: 0,
      duration: 2,
      ease: "power2.inOut",
      onComplete: () => {
        gsap.set(containers[next], { opacity: 1 });

        activeIndex.current = next;
        transitionOngoing.current = false;

        animateTyping(next);
      },
    });
  };

  return {
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
    revealMainContent,
    goNext,
    showArrow,
  };
}
