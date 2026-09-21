"use client";

import type { AppState } from "@/lib/types";
import { fmtBRL } from "@/lib/time";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function createTripCard(state: AppState, visited: number, total: number): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");

  const gradient = ctx.createLinearGradient(0, 0, 1080, 1350);
  gradient.addColorStop(0, "#170e2d");
  gradient.addColorStop(0.48, "#090711");
  gradient.addColorStop(1, "#07060c");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1350);

  const cover = state.couplePhoto || state.photos[state.photos.length - 1]?.src;
  if (cover) {
    try {
      const img = await loadImage(cover);
      const box = { x: 72, y: 74, w: 936, h: 650 };
      const scale = Math.max(box.w / img.width, box.h / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(box.x, box.y, box.w, box.h, 46);
      ctx.clip();
      ctx.drawImage(img, box.x + (box.w - w) / 2, box.y + (box.h - h) / 2, w, h);
      const fade = ctx.createLinearGradient(0, 400, 0, 730);
      fade.addColorStop(0, "rgba(7,6,12,0)");
      fade.addColorStop(1, "rgba(7,6,12,.75)");
      ctx.fillStyle = fade;
      ctx.fillRect(box.x, box.y, box.w, box.h);
      ctx.restore();
    } catch {
      /* cartão segue com o gradiente */
    }
  }

  ctx.fillStyle = "#c4b5fd";
  ctx.font = "700 28px system-ui";
  ctx.letterSpacing = "8px";
  ctx.fillText("NOSSA VIAGEM", 76, 810);

  ctx.fillStyle = "#f6f4fc";
  ctx.font = "700 78px system-ui";
  ctx.fillText("São Paulo", 72, 910);

  ctx.fillStyle = "#b3add6";
  ctx.font = "500 30px system-ui";
  ctx.fillText("20–21 de outubro de 2026", 76, 962);

  const spent = state.expenses.reduce((sum, e) => sum + e.amount, 0);
  const stats = [
    [`${visited}/${total}`, "LUGARES"],
    [String(state.photos.length), "FOTOS"],
    [String(state.memories.length), "MEMÓRIAS"],
    [fmtBRL(spent), "INVESTIDO"],
  ];
  const widths = [215, 190, 230, 300];
  let x = 70;
  stats.forEach(([value, label], i) => {
    ctx.fillStyle = "rgba(255,255,255,.075)";
    ctx.beginPath();
    ctx.roundRect(x, 1032, widths[i] - 14, 150, 25);
    ctx.fill();
    ctx.fillStyle = "#f6f4fc";
    ctx.font = `700 ${value.length > 8 ? 29 : 39}px system-ui`;
    ctx.fillText(value, x + 24, 1095);
    ctx.fillStyle = "#a6a0cc";
    ctx.font = "700 17px system-ui";
    ctx.fillText(label, x + 24, 1142);
    x += widths[i];
  });

  ctx.fillStyle = "#8b5cf6";
  ctx.beginPath();
  ctx.arc(82, 1264, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#8882ad";
  ctx.font = "500 21px system-ui";
  ctx.fillText("uma viagem para guardar", 104, 1272);

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("blob"))), "image/png", 0.95)
  );
}

export async function shareTripCard(state: AppState, visited: number, total: number): Promise<"shared" | "downloaded"> {
  const blob = await createTripCard(state, visited, total);
  const file = new File([blob], "nossa-viagem-sao-paulo.png", { type: "image/png" });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: "Nossa Viagem", text: "São Paulo · 20–21 de outubro de 2026" });
    return "shared";
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return "downloaded";
}
