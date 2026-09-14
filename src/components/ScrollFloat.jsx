import React, { useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ScrollFloat.css';

gsap.registerPlugin(ScrollTrigger);

export default function ScrollFloat({
  children,
  scrollContainerRef,
  containerClassName = '',
  textClassName = '',
  animationDuration = 1,
  ease = 'back.inOut(2)',
  scrollStart = 'center bottom+=50%',
  scrollEnd = 'bottom bottom-=40%',
  stagger = 0.03,
  ...headingProps
}) {
  const containerRef = useRef(null);
  const text = typeof children === 'string' ? children : '';

  const splitText = useMemo(
    () => text.split('').map((char, index) => {
      if (char === '\n') return <br key={`break-${index}`} />;
      return (
        <span className="scroll-float-char" key={`${char}-${index}`}>
          {char === ' ' ? '\u00a0' : char}
        </span>
      );
    }),
    [text],
  );

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;

    const characters = element.querySelectorAll('.scroll-float-char');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      gsap.set(characters, { clearProps: 'all' });
      return undefined;
    }

    const scroller = scrollContainerRef?.current || window;
    const context = gsap.context(() => {
      gsap.fromTo(
        characters,
        {
          willChange: 'opacity, transform',
          opacity: 0,
          yPercent: 120,
          scaleY: 2.3,
          scaleX: 0.7,
          transformOrigin: '50% 0%',
        },
        {
          duration: animationDuration,
          ease,
          opacity: 1,
          yPercent: 0,
          scaleY: 1,
          scaleX: 1,
          stagger,
          scrollTrigger: {
            trigger: element,
            scroller,
            start: scrollStart,
            end: scrollEnd,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        },
      );
    }, containerRef);

    return () => context.revert();
  }, [scrollContainerRef, animationDuration, ease, scrollStart, scrollEnd, stagger]);

  return (
    <h2
      ref={containerRef}
      className={`scroll-float ${containerClassName}`.trim()}
      aria-label={text.replace(/\n/g, ' ')}
      {...headingProps}
    >
      <span className={`scroll-float-text ${textClassName}`.trim()} aria-hidden="true">
        {splitText}
      </span>
    </h2>
  );
}
