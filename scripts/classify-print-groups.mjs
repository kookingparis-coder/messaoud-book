import fs from "fs";

const store = JSON.parse(fs.readFileSync("data/media.json", "utf8"));

const TROMPE = new Set([
  "WhatsApp Image 2026-07-26 at 15.27.17 (1).jpeg",
  "WhatsApp Image 2026-07-26 at 15.27.17 (11).jpeg",
  "WhatsApp Image 2026-07-26 at 15.27.17 (13).jpeg",
  "WhatsApp Image 2026-07-26 at 15.27.17 (3).jpeg",
  "WhatsApp Image 2026-07-26 at 15.27.17 (6).jpeg",
  "WhatsApp Image 2026-07-26 at 15.27.17 (7).jpeg",
  "WhatsApp Image 2026-07-26 at 15.29.18 (2).jpeg",
  "WhatsApp Image 2026-07-26 at 15.29.18 (3).jpeg",
  "WhatsApp Image 2026-07-26 at 15.29.18 (5).jpeg",
  "WhatsApp Image 2026-07-26 at 15.34.29 (1).jpeg",
  "WhatsApp Image 2026-07-26 at 15.34.29 (12).jpeg",
  "WhatsApp Image 2026-07-26 at 15.34.29 (19).jpeg",
  "WhatsApp Image 2026-07-26 at 15.34.29 (2).jpeg",
  "WhatsApp Image 2026-07-26 at 15.34.29 (3).jpeg",
  "WhatsApp Image 2026-07-26 at 15.34.29 (4).jpeg",
  "WhatsApp Image 2026-07-26 at 15.34.29 (6).jpeg",
  "WhatsApp Image 2026-07-26 at 15.34.29 (7).jpeg",
  "WhatsApp Image 2026-07-26 at 15.34.29 (9).jpeg",
]);

const EXTRA_EXCLUDE = new Set([
  "WhatsApp Image 2026-07-26 at 15.39.27 (1).jpeg",
  "WhatsApp Image 2026-07-26 at 15.39.27 (2).jpeg",
  "WhatsApp Image 2026-07-26 at 15.39.27 (3).jpeg",
  "WhatsApp Image 2026-07-26 at 15.39.27 (4).jpeg",
  "WhatsApp Image 2026-07-26 at 15.39.27 (5).jpeg",
  "WhatsApp Image 2026-07-26 at 15.39.27 (6).jpeg",
]);

function classify(item) {
  if (item.kind !== "photo") return item.printGroup;
  if (item.role === "portrait") return "exclude";

  const f = item.filename || "";

  if (/15\.39\.27 \((23|24|25)\)/.test(f)) return "exclude";
  if (/15\.41\.24 \((1|2)\)/.test(f)) return "exclude";
  if (EXTRA_EXCLUDE.has(f)) return "exclude";

  if (TROMPE.has(f)) return "trompe";
  return "gateaux";
}

const counts = { trompe: 0, gateaux: 0, exclude: 0 };
for (const item of store.items) {
  if (item.kind === "photo") {
    item.printGroup = classify(item);
    counts[item.printGroup] += 1;
  }
}

fs.writeFileSync("data/media.json", JSON.stringify(store, null, 2));
console.log(counts);
