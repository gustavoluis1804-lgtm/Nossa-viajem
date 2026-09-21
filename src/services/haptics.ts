"use client";

/** Resposta tátil curta no Android; falha silenciosamente onde não há suporte. */
export function haptic(kind: "light" | "success" = "light"): void {
  try {
    if ("vibrate" in navigator) navigator.vibrate(kind === "success" ? [22, 35, 32] : 18);
  } catch {
    /* sem suporte */
  }
}
