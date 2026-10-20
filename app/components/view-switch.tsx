"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Building2, Globe, Wind } from "lucide-react";
import "./view-switch.css";

type Perspective = "public" | "enterprise";

const OPTIONS = [
  { key: "public", href: "/", label: "全球", title: "全球风向", Icon: Globe },
  {
    key: "enterprise",
    href: "/console",
    label: "企业",
    title: "企业视角",
    Icon: Building2,
  },
] as const;

const NAV_DELAY_MS = 360;

/**
 * Two-stop perspective switch. The pill springs to the destination
 * (motion layoutId) while a lucide Wind glyph gusts across the track,
 * then the route changes.
 */
export function ViewSwitch({ active }: { active: Perspective }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [current, setCurrent] = useState<Perspective>(active);
  const timer = useRef<number | null>(null);
  const moving = current !== active;
  const direction = active === "public" ? 1 : -1;

  useEffect(() => {
    for (const option of OPTIONS)
      if (option.key !== active) router.prefetch(option.href);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [active, router]);

  function go(event: MouseEvent<HTMLAnchorElement>, key: Perspective, href: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    if (key === current) return;
    setCurrent(key);
    timer.current = window.setTimeout(
      () => router.push(href),
      reduce ? 0 : NAV_DELAY_MS,
    );
  }

  return (
    <nav className="ws-switch" aria-label="切换视角">
      {OPTIONS.map(({ key, href, label, title, Icon }) => {
        const on = key === current;
        return (
          <Link
            key={key}
            href={href}
            className={`ws-switch-option ${on ? "is-on" : ""}`}
            aria-current={key === active ? "page" : undefined}
            title={key === active ? `当前：${title}` : `切换到${title}`}
            onClick={(event) => go(event, key, href)}
          >
            {on ? (
              <motion.span
                layoutId="ws-switch-pill"
                className="ws-switch-pill"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                aria-hidden
              />
            ) : null}
            <Icon size={15} strokeWidth={1.8} aria-hidden />
            <span>{label}</span>
          </Link>
        );
      })}
      <AnimatePresence>
        {moving && !reduce ? (
          <motion.span
            key="gust"
            className="ws-switch-gust"
            style={{ scaleX: direction }}
            initial={{ x: direction * -36, opacity: 0 }}
            animate={{ x: direction * 44, opacity: [0, 1, 0] }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            aria-hidden
          >
            <Wind size={16} strokeWidth={2} />
          </motion.span>
        ) : null}
      </AnimatePresence>
    </nav>
  );
}
