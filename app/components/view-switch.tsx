"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { I } from "./insight-icons";
import "./view-switch.css";

type Perspective = "public" | "enterprise";
export function ViewSwitch({ active }: { active: Perspective }) {
  const router = useRouter();
  const [pending, setPending] = useState<Perspective | null>(null);
  const timer = useRef<number | null>(null);
  useEffect(() => {
    document.documentElement.classList.remove(
      "wi-switch-public",
      "wi-switch-enterprise",
    );
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [active]);
  function switchTo(event: MouseEvent<HTMLAnchorElement>, target: Perspective) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    if (target === active || pending) return;
    const destination = target === "public" ? "/" : "/console";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      router.push(destination);
      return;
    }
    setPending(target);
    document.documentElement.classList.add(`wi-switch-${target}`);
    timer.current = window.setTimeout(() => router.push(destination), 260);
  }
  const selected = pending || active;
  return (
    <nav
      className={`wi-view-switch ${active === "enterprise" ? "on-dark" : "on-light"} selected-${selected}`}
      aria-label="切换政策地图视角"
    >
      <span className="wi-view-thumb" aria-hidden="true" />
      <Link
        href="/"
        aria-current={active === "public" ? "page" : undefined}
        onClick={(event) => switchTo(event, "public")}
      >
        <I name="globe" size={18} />
        <span>
          <strong>全球政策监测</strong>
          <small>公开视角 · Public</small>
        </span>
      </Link>
      <Link
        href="/console"
        aria-current={active === "enterprise" ? "page" : undefined}
        onClick={(event) => switchTo(event, "enterprise")}
      >
        <I name="building" size={18} />
        <span>
          <strong>企业政策地图</strong>
          <small>企业视角 · Enterprise</small>
        </span>
      </Link>
    </nav>
  );
}
