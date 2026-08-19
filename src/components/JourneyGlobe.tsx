"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { contentAssetUrl } from "../content/assets";
import { globeContent, type GlobeStop, type GlobeTravelPoint } from "../content/locationAlbums";

const STOPS: GlobeStop[] = globeContent.stops;
const TRAVEL_POINTS: GlobeTravelPoint[] = globeContent.travelPoints;

const GLOBE_RADIUS = 2.42;

function coordinateToVector(lat: number, lon: number, radius = GLOBE_RADIUS) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon);

  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    -radius * Math.sin(phi) * Math.sin(theta),
  );
}

function buildArc(start: THREE.Vector3, end: THREE.Vector3, lift: number) {
  const middle = start
    .clone()
    .add(end)
    .normalize()
    .multiplyScalar(GLOBE_RADIUS + lift);
  return new THREE.QuadraticBezierCurve3(start, middle, end);
}

function seededRandom(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function makeCloudTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.filter = "blur(9px)";
  for (let index = 0; index < 230; index += 1) {
    const latitudeBias = Math.sin(index * 1.72) * 0.2;
    const x = seededRandom(index + 83) * canvas.width;
    const y =
      canvas.height *
      (0.18 + seededRandom(index + 503) * 0.64 + latitudeBias);
    const width = 18 + seededRandom(index + 931) * 90;
    const height = 3 + seededRandom(index + 1249) * 12;
    context.beginPath();
    context.ellipse(x, y, width, height, index * 0.23, 0, Math.PI * 2);
    context.fillStyle = `rgba(225, 240, 246, ${
      0.035 + seededRandom(index + 1613) * 0.1
    })`;
    context.fill();
  }
  context.filter = "none";

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export default function JourneyGlobe({ onOpenAlbum }: { onOpenAlbum: (slug: string) => void }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const interactiveRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const travelLabelRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const labelInteractionRef = useRef(false);
  const focusHandlersRef = useRef<Array<() => void>>([]);
  const zoomHandlersRef = useRef<{ in: () => void; out: () => void }>({
    in: () => undefined,
    out: () => undefined,
  });
  const [activeStop, setActiveStop] = useState(0);
  const [textureReady, setTextureReady] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    const interactive = interactiveRef.current;
    if (!mount || !interactive) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.15, 8.4);
    camera.lookAt(0, 0, 0);
    const minimumCameraDistance = 5.35;
    const maximumCameraDistance = 11.4;
    let targetCameraDistance = camera.position.length();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      const fallback = document.createElement("div");
      const fallbackMessage = document.createElement("p");
      fallback.className = "globe-webgl-fallback";
      fallback.setAttribute("role", "status");
      fallbackMessage.textContent = globeContent.fallbackMessage;
      fallback.append(fallbackMessage);
      mount.appendChild(fallback);
      return () => fallback.remove();
    }
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.25 : 1.5),
    );
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = "journey-globe-canvas";
    renderer.domElement.setAttribute("aria-hidden", "true");
    mount.appendChild(renderer.domElement);

    const globe = new THREE.Group();
    globe.rotation.set(-0.11, -2.12, -0.045);
    scene.add(globe);

    scene.add(new THREE.AmbientLight(0x7099c9, 0.52));
    const keyLight = new THREE.DirectionalLight(0xf2f7ff, 3.15);
    keyLight.position.set(-3.5, 3.2, 6.5);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0x2c73ff, 31, 19);
    rimLight.position.set(4.5, -1.5, 3.2);
    scene.add(rimLight);

    let disposed = false;
    let earthTexture: THREE.Texture | null = null;
    const earthMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x123750,
      roughness: 0.82,
      metalness: 0.02,
      clearcoat: 0.16,
      clearcoatRoughness: 0.62,
    });
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_RADIUS, 72, 72),
      earthMaterial,
    );
    earth.visible = false;
    globe.add(earth);

    const cloudTexture = makeCloudTexture();
    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_RADIUS * 1.012, 72, 72),
      new THREE.MeshPhongMaterial({
        color: 0xd9efff,
        map: cloudTexture,
        alphaMap: cloudTexture,
        transparent: true,
        opacity: 0.28,
        depthWrite: false,
      }),
    );
    clouds.visible = false;
    globe.add(clouds);

    new THREE.TextureLoader().load(
      contentAssetUrl(globeContent.earthTexture),
      (texture) => {
        if (disposed) {
          texture.dispose();
          return;
        }

        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(
          renderer.capabilities.getMaxAnisotropy(),
          4,
        );
        earthTexture = texture;
        earthMaterial.color.set(0xffffff);
        earthMaterial.map = texture;
        earthMaterial.needsUpdate = true;
        earth.visible = true;
        clouds.visible = true;
        setTextureReady(true);
      },
      undefined,
      () => {
        if (disposed) return;
        earth.visible = true;
        clouds.visible = true;
        setTextureReady(true);
      },
    );

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_RADIUS * 1.055, 72, 72),
      new THREE.MeshBasicMaterial({
        color: 0x438dff,
        transparent: true,
        opacity: 0.13,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    globe.add(atmosphere);

    const starPositions: number[] = [];
    for (let index = 0; index < 520; index += 1) {
      const angle = seededRandom(index + 11) * Math.PI * 2;
      const elevation = (seededRandom(index + 307) - 0.5) * Math.PI;
      const radius = 5.6 + seededRandom(index + 727) * 5.2;
      starPositions.push(
        Math.cos(elevation) * Math.cos(angle) * radius,
        Math.sin(elevation) * radius,
        Math.cos(elevation) * Math.sin(angle) * radius,
      );
    }
    const stars = new THREE.Points(
      new THREE.BufferGeometry().setAttribute(
        "position",
        new THREE.Float32BufferAttribute(starPositions, 3),
      ),
      new THREE.PointsMaterial({
        color: 0x78b9ff,
        size: 0.018,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    scene.add(stars);

    const stopVectors = STOPS.map((stop) =>
      coordinateToVector(stop.lat, stop.lon, GLOBE_RADIUS * 1.018),
    );
    const travelVectors = TRAVEL_POINTS.map((point) =>
      coordinateToVector(point.lat, point.lon, GLOBE_RADIUS * 1.019),
    );
    const curves = [
      buildArc(stopVectors[0], stopVectors[1], 0.92),
      buildArc(stopVectors[1], stopVectors[2], 0.36),
    ];

    const routeMaterial = new THREE.MeshBasicMaterial({
      color: 0x70b7ff,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const movingLights: Array<{
      mesh: THREE.Mesh;
      curve: THREE.QuadraticBezierCurve3;
      offset: number;
    }> = [];

    curves.forEach((curve, curveIndex) => {
      globe.add(
        new THREE.Mesh(
          new THREE.TubeGeometry(curve, 112, 0.014, 8, false),
          routeMaterial,
        ),
      );

      for (let dot = 0; dot < 5; dot += 1) {
        const light = new THREE.Mesh(
          new THREE.SphereGeometry(0.037, 12, 12),
          new THREE.MeshBasicMaterial({
            color: 0xd8edff,
            transparent: true,
            opacity: 0.98,
            blending: THREE.AdditiveBlending,
          }),
        );
        globe.add(light);
        movingLights.push({
          mesh: light,
          curve,
          offset: curveIndex * 0.22 + dot / 5,
        });
      }
    });

    stopVectors.forEach((position, index) => {
      const marker = new THREE.Group();
      marker.position.copy(position);

      const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.0375, 24, 24),
        new THREE.MeshBasicMaterial({ color: 0xffbd65 }),
      );
      core.scale.setScalar(index === 0 ? 1.12 : 1);
      marker.add(core);

      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(0.056, 20, 20),
        new THREE.MeshBasicMaterial({
          color: 0xff9f3e,
          transparent: true,
          opacity: 0.25,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      marker.add(halo);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.064, 0.004, 8, 48),
        new THREE.MeshBasicMaterial({
          color: 0xffb454,
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      ring.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        position.clone().normalize(),
      );
      marker.add(ring);
      globe.add(marker);
    });

    travelVectors.forEach((position, index) => {
      const marker = new THREE.Group();
      marker.position.copy(position);

      const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.026, 20, 20),
        new THREE.MeshBasicMaterial({ color: 0x73d8ff }),
      );
      marker.add(core);

      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(0.042, 18, 18),
        new THREE.MeshBasicMaterial({
          color: 0x3d8bff,
          transparent: true,
          opacity: 0.3,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      marker.add(halo);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.046, 0.003, 8, 40),
        new THREE.MeshBasicMaterial({
          color: 0x73d8ff,
          transparent: true,
          opacity: 0.82,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      ring.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        position.clone().normalize(),
      );
      ring.scale.setScalar(index === 0 ? 1.08 : 1);
      marker.add(ring);
      globe.add(marker);
    });

    const targetQuaternion = new THREE.Quaternion();
    let hasTarget = false;
    let pointerDown = false;
    let previousPointer = { x: 0, y: 0 };
    let velocity = { x: 0, y: 0 };
    let pinchDistance: number | null = null;
    const activePointers = new Map<number, { x: number; y: number }>();
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const adjustZoom = (amount: number) => {
      targetCameraDistance = THREE.MathUtils.clamp(
        targetCameraDistance + amount,
        minimumCameraDistance,
        maximumCameraDistance,
      );
    };

    const focusStop = (index: number) => {
      setActiveStop(index);
      const direction = stopVectors[index].clone().normalize();
      const desired = new THREE.Vector3(0.56, 0.18, 1).normalize();
      targetQuaternion.setFromUnitVectors(direction, desired);
      hasTarget = true;
    };

    focusHandlersRef.current = STOPS.map((_, index) => () => focusStop(index));
    zoomHandlersRef.current = {
      in: () => adjustZoom(-0.85),
      out: () => adjustZoom(0.85),
    };

    const onPointerDown = (event: PointerEvent) => {
      pointerDown = true;
      hasTarget = false;
      activePointers.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });
      previousPointer = { x: event.clientX, y: event.clientY };

      if (activePointers.size === 2) {
        const [first, second] = Array.from(activePointers.values());
        pinchDistance = Math.hypot(second.x - first.x, second.y - first.y);
        velocity = { x: 0, y: 0 };
      }

      renderer.domElement.setPointerCapture(event.pointerId);
      renderer.domElement.classList.add("is-dragging");
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!activePointers.has(event.pointerId)) return;

      activePointers.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });

      if (activePointers.size >= 2) {
        const [first, second] = Array.from(activePointers.values());
        const nextPinchDistance = Math.hypot(
          second.x - first.x,
          second.y - first.y,
        );

        if (pinchDistance !== null) {
          adjustZoom((pinchDistance - nextPinchDistance) * 0.013);
        }

        pinchDistance = nextPinchDistance;
        velocity = { x: 0, y: 0 };
        event.preventDefault();
        return;
      }

      const deltaX = event.clientX - previousPointer.x;
      const deltaY = event.clientY - previousPointer.y;
      velocity = { x: deltaX * 0.004, y: deltaY * 0.0032 };
      globe.rotation.y += velocity.x;
      globe.rotation.x += velocity.y;
      globe.rotation.x = THREE.MathUtils.clamp(globe.rotation.x, -0.8, 0.8);
      previousPointer = { x: event.clientX, y: event.clientY };
    };

    const onPointerUp = (event: PointerEvent) => {
      activePointers.delete(event.pointerId);
      pointerDown = activePointers.size > 0;
      pinchDistance = null;

      const remainingPointer = activePointers.values().next().value;
      if (remainingPointer) {
        previousPointer = remainingPointer;
      }

      if (renderer.domElement.hasPointerCapture(event.pointerId)) {
        renderer.domElement.releasePointerCapture(event.pointerId);
      }
      if (!pointerDown) {
        renderer.domElement.classList.remove("is-dragging");
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement).closest(".globe-label")) return;
      const amount = 0.09;
      if (event.key === "ArrowLeft") globe.rotation.y -= amount;
      else if (event.key === "ArrowRight") globe.rotation.y += amount;
      else if (event.key === "ArrowUp") globe.rotation.x -= amount;
      else if (event.key === "ArrowDown") globe.rotation.x += amount;
      else if (event.key === "+" || event.key === "=") adjustZoom(-0.65);
      else if (event.key === "-" || event.key === "_") adjustZoom(0.65);
      else return;
      hasTarget = false;
      event.preventDefault();
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointercancel", onPointerUp);
    interactive.addEventListener("keydown", onKeyDown);

    const resize = () => {
      const width = Math.max(mount.clientWidth, 1);
      const height = Math.max(mount.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    const clock = new THREE.Clock();
    let frameId = 0;
    let isInView = true;
    let pageVisible = !document.hidden;
    const worldPosition = new THREE.Vector3();
    const globeCenter = new THREE.Vector3();
    const surfaceNormal = new THREE.Vector3();
    const toCamera = new THREE.Vector3();
    const projected = new THREE.Vector3();

    const render = () => {
      frameId = 0;
      const elapsed = clock.getElapsedTime();

      if (hasTarget) {
        globe.quaternion.slerp(targetQuaternion, 0.055);
        if (globe.quaternion.angleTo(targetQuaternion) < 0.008) {
          hasTarget = false;
        }
      } else if (
        !pointerDown &&
        !labelInteractionRef.current &&
        !prefersReducedMotion
      ) {
        globe.rotation.y += 0.00055;
        globe.rotation.y += velocity.x;
        globe.rotation.x += velocity.y;
        velocity.x *= 0.93;
        velocity.y *= 0.93;
      }

      if (!prefersReducedMotion) {
        clouds.rotation.y += 0.00012;
        stars.rotation.y -= 0.000035;
        movingLights.forEach(({ mesh, curve, offset }) => {
          const progress = (elapsed * 0.13 + offset) % 1;
          mesh.position.copy(curve.getPointAt(progress));
          const pulse =
            0.68 + Math.sin((progress + offset) * Math.PI * 2) * 0.22;
          mesh.scale.setScalar(pulse);
        });
      }

      const cameraDistance = THREE.MathUtils.lerp(
        camera.position.length(),
        targetCameraDistance,
        0.12,
      );
      camera.position.setLength(cameraDistance);

      scene.updateMatrixWorld(true);
      globe.getWorldPosition(globeCenter);

      stopVectors.forEach((position, index) => {
        const label = labelRefs.current[index];
        if (!label) return;

        worldPosition.copy(position).applyMatrix4(globe.matrixWorld);
        surfaceNormal.copy(worldPosition).sub(globeCenter).normalize();
        toCamera.copy(camera.position).sub(worldPosition).normalize();
        const isFrontFacing = surfaceNormal.dot(toCamera) > -0.08;
        projected.copy(worldPosition).project(camera);

        label.style.left = `${(projected.x * 0.5 + 0.5) * mount.clientWidth}px`;
        label.style.top = `${(-projected.y * 0.5 + 0.5) * mount.clientHeight}px`;
        label.style.opacity = isFrontFacing ? "1" : "0";
        label.style.pointerEvents = isFrontFacing ? "auto" : "none";
        label.tabIndex = isFrontFacing ? 0 : -1;
        label.setAttribute("aria-hidden", isFrontFacing ? "false" : "true");
      });

      travelVectors.forEach((position, index) => {
        const label = travelLabelRefs.current[index];
        if (!label) return;

        worldPosition.copy(position).applyMatrix4(globe.matrixWorld);
        surfaceNormal.copy(worldPosition).sub(globeCenter).normalize();
        toCamera.copy(camera.position).sub(worldPosition).normalize();
        const isFrontFacing = surfaceNormal.dot(toCamera) > -0.04;
        projected.copy(worldPosition).project(camera);

        const point = TRAVEL_POINTS[index];
        label.style.left = `${
          (projected.x * 0.5 + 0.5) * mount.clientWidth + point.labelDx
        }px`;
        label.style.top = `${
          (-projected.y * 0.5 + 0.5) * mount.clientHeight + point.labelDy
        }px`;
        label.style.opacity = isFrontFacing ? "1" : "0";
        label.style.pointerEvents = isFrontFacing ? "auto" : "none";
        label.tabIndex = isFrontFacing ? 0 : -1;
        label.setAttribute("aria-hidden", isFrontFacing ? "false" : "true");
      });

      renderer.render(scene, camera);
      if (isInView && pageVisible) {
        frameId = window.requestAnimationFrame(render);
      }
    };

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isInView = entry.isIntersecting;
        if (isInView && pageVisible && frameId === 0) {
          clock.start();
          frameId = window.requestAnimationFrame(render);
        }
      },
      { threshold: 0.02 },
    );
    visibilityObserver.observe(interactive);

    const onVisibilityChange = () => {
      pageVisible = !document.hidden;
      if (pageVisible && isInView && frameId === 0) {
        clock.start();
        frameId = window.requestAnimationFrame(render);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    render();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointercancel", onPointerUp);
      interactive.removeEventListener("keydown", onKeyDown);
      renderer.dispose();
      scene.traverse((object) => {
        if (
          object instanceof THREE.Mesh ||
          object instanceof THREE.Line ||
          object instanceof THREE.Points
        ) {
          object.geometry?.dispose();
          const material = object.material;
          if (Array.isArray(material)) material.forEach((item) => item.dispose());
          else material?.dispose();
        }
      });
      earthTexture?.dispose();
      cloudTexture?.dispose();
      renderer.domElement.remove();
      focusHandlersRef.current = [];
      zoomHandlersRef.current = {
        in: () => undefined,
        out: () => undefined,
      };
    };
  }, []);

  return (
    <div className="globe-shell">
      <div
        className={`journey-globe${textureReady ? " is-ready" : ""}`}
        ref={interactiveRef}
        role="region"
        aria-label={globeContent.accessibilityLabel}
        tabIndex={0}
      >
        <div className="globe-poster" aria-hidden="true">
          {/* The file is already a 51 KB WebP; direct loading avoids an image-proxy round trip. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={contentAssetUrl(globeContent.previewImage)}
            alt=""
            width="720"
            height="720"
          />
        </div>
        <div className="journey-globe-canvas-host" ref={mountRef} />
        <div className="globe-scanline" aria-hidden="true" />
        <div className="globe-labels" aria-label="可浏览相册的地点">
          {STOPS.map((stop, index) => (
            <button
              className={`globe-label${activeStop === index ? " is-active" : ""}`}
              key={stop.city}
              type="button"
              tabIndex={-1}
              aria-label={`打开${stop.city}相册`}
              onClick={() => onOpenAlbum(stop.slug)}
              onPointerEnter={() => {
                labelInteractionRef.current = true;
              }}
              onPointerLeave={() => {
                labelInteractionRef.current = false;
              }}
              onFocus={() => {
                labelInteractionRef.current = true;
              }}
              onBlur={() => {
                labelInteractionRef.current = false;
              }}
              ref={(element) => {
                labelRefs.current[index] = element;
              }}
            >
              <i />
              <strong>{stop.city}</strong>
              <small>{stop.english}</small>
            </button>
          ))}
          {TRAVEL_POINTS.map((point, index) => (
            <button
              className={`globe-label globe-label--travel${point.labelSide === "left" ? " is-left" : ""}`}
              key={point.city}
              type="button"
              tabIndex={-1}
              aria-label={`打开${point.city}相册`}
              onClick={() => onOpenAlbum(point.slug)}
              onPointerEnter={() => {
                labelInteractionRef.current = true;
              }}
              onPointerLeave={() => {
                labelInteractionRef.current = false;
              }}
              onFocus={() => {
                labelInteractionRef.current = true;
              }}
              onBlur={() => {
                labelInteractionRef.current = false;
              }}
              ref={(element) => {
                travelLabelRefs.current[index] = element;
              }}
            >
              <i />
              <strong>{point.city}</strong>
              <small>{point.english}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="globe-controls" aria-label="聚焦人生轨迹地点">
        <p>
          <span>{globeContent.controlEyebrow}</span>
          {globeContent.controlCaption}
        </p>
        <div aria-label="聚焦城市">
          {STOPS.map((stop, index) => (
            <button
              className={activeStop === index ? "is-active" : ""}
              key={stop.city}
              onClick={() => focusHandlersRef.current[index]?.()}
              type="button"
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {stop.city}
            </button>
          ))}
        </div>
        <div className="globe-zoom" aria-label="缩放地球">
          <button
            aria-label="缩小地球"
            onClick={() => zoomHandlersRef.current.out()}
            type="button"
          >
            <span aria-hidden="true">−</span>
          </button>
          <button
            aria-label="放大地球"
            onClick={() => zoomHandlersRef.current.in()}
            type="button"
          >
            <span aria-hidden="true">+</span>
          </button>
        </div>
      </div>
    </div>
  );
}
