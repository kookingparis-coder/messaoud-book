export type MediaKind = "photo" | "video" | "certificate";

export type MediaRole = "portrait" | "identity";

/** Groupement utilisé uniquement pour le PDF imprimable */
export type PrintGroup =
  | "trompe"
  | "gateaux"
  | "exclude"
  | "highlight"
  | "evenementiels";

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
  role?: MediaRole;
  printGroup?: PrintGroup;
};

export type MediaStore = {
  items: MediaItem[];
};
