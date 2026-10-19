'use client';

import { useEffect, useRef, useState } from 'react';

type CountUpProps = {
  value: number;
  /** Texte ajouté après le nombre, par exemple ' %'. */
  suffix?: string;
  /** Les années s'affichent sans séparateur de milliers et sans animation depuis zéro. */
  plain?: boolean;
  locale: string;
};

/**
 * Compteur qui s'anime quand il entre à l'écran. Le nombre final est rendu côté
 * serveur : sans JavaScript, ou si l'appareil demande moins d'animations, il s'affiche tel quel.
 */
export function CountUp({ value, suffix = '', plain = false, locale }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const node = ref.current;
    if (!node || plain) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const duration = 1200;
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setShown(Math.round(value * eased));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        setShown(0);
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, plain]);

  const text = plain ? String(shown) : new Intl.NumberFormat(locale).format(shown);
  return (
    <span ref={ref} className="tabular-nums">
      {text}
      {suffix}
    </span>
  );
}
