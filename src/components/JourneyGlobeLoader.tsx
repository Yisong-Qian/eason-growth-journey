"use client";

import { lazy, Suspense, useEffect, useState } from "react";
import { contentAssetUrl } from "../content/assets";
import { globeContent } from "../content/locationAlbums";

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
            src={contentAssetUrl(globeContent.previewImage)}
            alt=""
            width="720"
            height="720"
            decoding="async"
            fetchPriority="high"
          />
        </div>
        <div className="globe-status" role="status">
          {globeContent.loadingMessage}
        </div>
      </div>

      <div className="globe-controls globe-controls--loading" aria-hidden="true">
        <p>
          <span>{globeContent.controlEyebrow}</span>
          {globeContent.controlCaption}
        </p>
        <div>
          {globeContent.stops.map((stop, index) => (
            <button key={stop.city} type="button" disabled>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {stop.city}
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

export default function JourneyGlobeLoader({ onOpenAlbum }: { onOpenAlbum: (slug: string) => void }) {
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
      <JourneyGlobe onOpenAlbum={onOpenAlbum} />
    </Suspense>
  );
}
