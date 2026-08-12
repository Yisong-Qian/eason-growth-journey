"use client";

import { lazy, Suspense, useEffect, useState } from "react";

const JourneyGlobe = lazy(() => import("./JourneyGlobe"));

type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout: number },
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
};

function GlobePlaceholder() {
  return (
    <div className="globe-shell globe-shell--placeholder" aria-label="三维地球正在启用">
      <div className="journey-globe">
        <div className="globe-poster" aria-hidden="true">
          {/* The file is already a 51 KB WebP; direct loading avoids an image-proxy round trip. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${import.meta.env.BASE_URL}earth-preview.webp`}
            alt=""
            width="720"
            height="720"
            decoding="async"
            fetchPriority="high"
          />
        </div>
        <div className="globe-status" role="status">
          正在启用交互地球
        </div>
      </div>

      <div className="globe-controls globe-controls--loading" aria-hidden="true">
        <p>
          <span>TRAJECTORY / TRAVEL POINTS</span>
          主轨迹 · 独立旅途坐标
        </p>
        <div>
          {["杭州", "汉诺威", "慕尼黑"].map((city, index) => (
            <button key={city} type="button" disabled>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {city}
            </button>
          ))}
        </div>
        <div className="globe-zoom">
          <button type="button" disabled>
            <span>−</span>
          </button>
          <button type="button" disabled>
            <span>+</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function JourneyGlobeLoader() {
  const [activate, setActivate] = useState(false);

  useEffect(() => {
    const idleWindow = window as IdleWindow;
    let timeoutId = 0;
    let idleId = 0;

    if (idleWindow.requestIdleCallback) {
      idleId = idleWindow.requestIdleCallback(() => setActivate(true), {
        timeout: 650,
      });
    } else {
      timeoutId = window.setTimeout(() => setActivate(true), 120);
    }

    return () => {
      if (idleId) idleWindow.cancelIdleCallback?.(idleId);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  if (!activate) return <GlobePlaceholder />;

  return (
    <Suspense fallback={<GlobePlaceholder />}>
      <JourneyGlobe />
    </Suspense>
  );
}
