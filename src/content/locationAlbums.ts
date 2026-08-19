import globeContentData from "./globe.json";

export type AlbumPhoto = {
  image: string;
  caption?: string;
  alt?: string;
};

export type GlobeStop = {
  city: string;
  english: string;
  slug: string;
  lat: number;
  lon: number;
  albumDescription?: string;
  photos: AlbumPhoto[];
};

export type GlobeTravelPoint = GlobeStop & {
  labelDx: number;
  labelDy: number;
  labelSide?: "left" | "right";
};

type GlobeContent = {
  earthTexture: string;
  previewImage: string;
  accessibilityLabel: string;
  fallbackMessage: string;
  loadingMessage: string;
  controlEyebrow: string;
  controlCaption: string;
  stops: GlobeStop[];
  travelPoints: GlobeTravelPoint[];
};

export type AlbumLocation = GlobeStop & {
  kind: "stop" | "travel";
};

export const globeContent = globeContentData as GlobeContent;

export const albumLocations: AlbumLocation[] = [
  ...globeContent.stops.map((location) => ({ ...location, kind: "stop" as const })),
  ...globeContent.travelPoints.map((location) => ({ ...location, kind: "travel" as const })),
];

export function findAlbumLocation(slug: string | null) {
  if (!slug) return null;
  return albumLocations.find((location) => location.slug === slug) ?? null;
}
