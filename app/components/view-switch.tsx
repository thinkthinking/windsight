"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import "./view-switch.css";

type Perspective = "public" | "enterprise";
export function ViewSwitch({ active }: { active: Perspective }) {
  const router = useRouter();
  const [moving, setMoving] = useState(false);
  const timer = useRef<number | null>(null);
  const target = active === "public" ? "enterprise" : "public";
  const destination = target === "public" ? "/" : "/console";
  const label =
    target === "public" ? "切换到全球政策监测" : "切换到企业政策地图";
  useEffect(() => {
    document.documentElement.classList.remove("wi-portal-transition");
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [active]);
  function switchTo(event: MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    if (moving) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      router.push(destination);
      return;
    }
    setMoving(true);
    document.documentElement.classList.add("wi-portal-transition");
    timer.current = window.setTimeout(() => router.push(destination), 440);
  }
  return (
    <Link
      href={destination}
      className={`wi-view-switch wi-perspective-toggle ${moving ? "is-moving" : ""}`}
      onClick={switchTo}
      aria-label={label}
      title={label}
    >
      <span className="wi-portal-icon" aria-hidden="true">
        <i className="wi-portal-aura" />
        <i className="wi-portal-orbit orbit-a" />
        <i className="wi-portal-orbit orbit-b" />
        <i className="wi-portal-orbit orbit-c" />
        <i className="wi-portal-core" />
        <i className="wi-portal-star" />
      </span>
      <span className="wi-portal-tooltip">
        {target === "enterprise" ? "进入企业视角" : "回到全球视角"}
      </span>
    </Link>
  );
}
