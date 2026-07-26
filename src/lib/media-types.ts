export type MediaKind = "photo" | "video";

export type MediaItem = {
  id: string;
  kind: MediaKind;
  url: string;
  pathname?: string;
  filename: string;
  caption: string;
  mimeType: string;
  size: number;
  createdAt: string;
  local?: boolean;
};

export type MediaStore = {
  items: MediaItem[];
};
