import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { report } from "./content/report";

gsap.registerPlugin(ScrollTrigger);

/** One motion owner. Reverting restores readable content and removes every trigger. */
export function useReportMotion(enabled: boolean, menu: boolean) {
  useLayoutEffect(() => {
    if (!enabled) return;
    const context = gsap.context(() => {
      const duration = 0.9 / Math.max(0.1, report.animationIntensity);
      const cover = gsap.timeline({
        defaults: { ease: "power3.out", duration },
      });
      cover
        .from(".title-line > span", { yPercent: 105, stagger: 0.1 })
        .from(
          ".hero-aside",
          { clipPath: "inset(0 0 100% 0)", duration: duration * 1.2 },
          0.15,
        )
        .from(
          ".hero-footer > *, .hero-meta",
          { opacity: 0, y: 12, stagger: 0.08 },
          0.5,
        )
        .from(
          ".stamp",
          { scale: 1.6, opacity: 0, rotation: 10, duration: 0.35 },
          0.95,
        );
      gsap.utils
        .toArray<SVGPathElement>(".hero-surface path")
        .forEach((path, index) => {
          const length = path.getTotalLength();
          gsap.fromTo(
            path,
            { strokeDasharray: length, strokeDashoffset: length },
            {
              strokeDashoffset: 0,
              delay: 0.35 + index * 0.012,
              duration: duration * 1.7,
              ease: "power2.inOut",
            },
          );
        });
      gsap.utils.toArray<HTMLElement>(".chapter-heading").forEach((heading) => {
        gsap.from(heading.querySelector(".chapter-number"), {
          y: 28,
          rotation: -8,
          opacity: 0,
          duration,
          scrollTrigger: { trigger: heading, start: "top 92%", once: true },
        });
        gsap.from(heading.querySelector("h2"), {
          clipPath: "inset(0 100% 0 0)",
          duration,
          scrollTrigger: { trigger: heading, start: "top 92%", once: true },
        });
      });
      gsap.utils.toArray<SVGPathElement>(".plot .draw").forEach((path) => {
        const length = path.getTotalLength();
        gsap.fromTo(
          path,
          { strokeDasharray: length, strokeDashoffset: length },
          {
            strokeDashoffset: 0,
            duration: duration * 1.7,
            ease: "power2.inOut",
            scrollTrigger: {
              trigger: path.closest(".plot"),
              start: "top 88%",
              once: true,
            },
          },
        );
      });
      gsap.utils.toArray<HTMLElement>(".impact-bars i").forEach((bar) => {
        gsap.from(bar, {
          scaleX: 0,
          transformOrigin: "left",
          duration,
          scrollTrigger: { trigger: bar, start: "top 90%", once: true },
        });
      });
      gsap.from(".stats-strip > div", {
        y: 25,
        opacity: 0,
        stagger: 0.12,
        duration,
        scrollTrigger: {
          trigger: ".stats-strip",
          start: "top 90%",
          once: true,
        },
      });
      gsap.from(".verdict h2", {
        scale: 0.9,
        opacity: 0,
        duration,
        scrollTrigger: { trigger: ".verdict", start: "top 80%", once: true },
      });
    });
    let disposed = false;
    void document.fonts.ready.then(() => {
      if (!disposed) ScrollTrigger.refresh();
    });
    return () => {
      disposed = true;
      context.revert();
    };
  }, [enabled]);

  useLayoutEffect(() => {
    if (!enabled || !menu) return;
    const context = gsap.context(() => {
      gsap.from("#contents", { y: -12, opacity: 0, duration: 0.25 });
      gsap.from("#contents a", {
        x: 18,
        opacity: 0,
        stagger: 0.025,
        duration: 0.3,
      });
    });
    return () => context.revert();
  }, [enabled, menu]);
}
