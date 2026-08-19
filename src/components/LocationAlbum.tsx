import { useCallback, useEffect, useRef, useState, type TouchEvent } from "react";
import { contentAssetUrl } from "../content/assets";
import type { AlbumLocation } from "../content/locationAlbums";

type LocationAlbumProps = {
  location: AlbumLocation | null;
  onBack: () => void;
};

export default function LocationAlbum({ location, onBack }: LocationAlbumProps) {
  const [activePhoto, setActivePhoto] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const touchStartXRef = useRef<number | null>(null);
  const photoCount = location?.photos.length ?? 0;

  const closeViewer = useCallback(() => setActivePhoto(null), []);
  const showPrevious = useCallback(() => {
    setActivePhoto((current) => {
      if (current === null || photoCount < 2) return current;
      return (current - 1 + photoCount) % photoCount;
    });
  }, [photoCount]);
  const showNext = useCallback(() => {
    setActivePhoto((current) => {
      if (current === null || photoCount < 2) return current;
      return (current + 1) % photoCount;
    });
  }, [photoCount]);

  useEffect(() => {
    setActivePhoto(null);
  }, [location?.slug]);

  useEffect(() => {
    if (activePhoto === null) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeViewer();
      else if (event.key === "ArrowLeft") showPrevious();
      else if (event.key === "ArrowRight") showNext();
      else return;
      event.preventDefault();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [activePhoto, closeViewer, showNext, showPrevious]);

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const startX = touchStartXRef.current;
    const endX = event.changedTouches[0]?.clientX;
    touchStartXRef.current = null;
    if (startX === null || endX === undefined || Math.abs(endX - startX) < 44) return;
    if (endX < startX) showNext();
    else showPrevious();
  };

  if (!location) {
    return (
      <main className="album-page album-page--missing">
        <header className="album-header">
          <button className="album-back" onClick={onBack} type="button">
            <span aria-hidden="true">←</span>
            返回地球
          </button>
        </header>
        <section className="album-empty" aria-labelledby="album-missing-title">
          <p>LOCATION NOT FOUND</p>
          <h1 id="album-missing-title">相册不存在</h1>
          <span>这个地点可能已更名，或链接地址不完整。</span>
          <button onClick={onBack} type="button">回到首页</button>
        </section>
      </main>
    );
  }

  const activePhotoItem = activePhoto === null ? null : location.photos[activePhoto];
  const albumDescription = location.albumDescription?.trim();

  return (
    <main className={`album-page album-page--${location.kind}`}>
      <header className="album-header">
        <button className="album-back" onClick={onBack} type="button">
          <span aria-hidden="true">←</span>
          返回地球
        </button>
        <p>经纬之间 <span aria-hidden="true">/</span> 地点相册</p>
      </header>

      <section className="album-hero" aria-labelledby="album-title">
        <div>
          <p className="album-kicker">
            <span aria-hidden="true" />
            {location.kind === "stop" ? "TRAJECTORY ALBUM" : "TRAVEL ALBUM"}
          </p>
          <h1 id="album-title">{location.city}</h1>
          <p className="album-english">{location.english}</p>
        </div>
        <div className="album-summary">
          <span>{String(photoCount).padStart(2, "0")}</span>
          <p>{albumDescription || "这个地点的旅行与生活片段，正在慢慢收集中。"}</p>
        </div>
      </section>

      {photoCount > 0 ? (
        <section className="album-grid" aria-label={`${location.city}相册，共${photoCount}张照片`}>
          {location.photos.map((photo, index) => (
            <button
              className="album-photo"
              key={`${photo.image}-${index}`}
              onClick={() => setActivePhoto(index)}
              type="button"
              aria-label={`查看${photo.caption || `${location.city}照片 ${index + 1}`}`}
            >
              <img
                src={contentAssetUrl(photo.image)}
                alt={photo.alt || photo.caption || `${location.city}旅行照片 ${index + 1}`}
                loading="lazy"
                decoding="async"
              />
              <span><i>{String(index + 1).padStart(2, "0")}</i>{photo.caption || "旅途片段"}</span>
            </button>
          ))}
        </section>
      ) : (
        <section className="album-empty" aria-labelledby="album-empty-title">
          <p>ALBUM IN PROGRESS</p>
          <h2 id="album-empty-title">相册正在整理中</h2>
          <span>照片上传后会在这里按旅途顺序展开。</span>
        </section>
      )}

      <footer className="album-footer">
        <button onClick={onBack} type="button"><span aria-hidden="true">←</span> 继续浏览地球</button>
        <p>{location.city} <span aria-hidden="true">/</span> {location.english}</p>
      </footer>

      {activePhotoItem && activePhoto !== null && (
        <div
          className="album-viewer"
          role="dialog"
          aria-modal="true"
          aria-label={`${location.city}照片全屏浏览`}
          onClick={(event) => {
            if (event.currentTarget === event.target) closeViewer();
          }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button
            className="album-viewer-close"
            onClick={closeViewer}
            ref={closeButtonRef}
            type="button"
            aria-label="关闭全屏照片"
          >×</button>
          {photoCount > 1 && (
            <button className="album-viewer-nav is-previous" onClick={showPrevious} type="button" aria-label="上一张">
              ←
            </button>
          )}
          <figure>
            <img
              src={contentAssetUrl(activePhotoItem.image)}
              alt={activePhotoItem.alt || activePhotoItem.caption || `${location.city}旅行照片 ${activePhoto + 1}`}
              decoding="async"
            />
            <figcaption>
              <span>{String(activePhoto + 1).padStart(2, "0")} / {String(photoCount).padStart(2, "0")}</span>
              {activePhotoItem.caption && <p>{activePhotoItem.caption}</p>}
            </figcaption>
          </figure>
          {photoCount > 1 && (
            <button className="album-viewer-nav is-next" onClick={showNext} type="button" aria-label="下一张">
              →
            </button>
          )}
        </div>
      )}
    </main>
  );
}
