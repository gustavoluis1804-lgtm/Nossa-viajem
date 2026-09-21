"use client";

/** Camada de notificações: sistema (quando permitido) — discreta e opcional. */

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationPermission(): NotificationPermission | "unsupported" {
  if (!notificationsSupported()) return "unsupported";
  return Notification.permission;
}

export async function ensurePermission(): Promise<boolean> {
  if (!notificationsSupported()) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  try {
    const res = await Notification.requestPermission();
    return res === "granted";
  } catch {
    return false;
  }
}

export function systemNotify(title: string, body: string): void {
  if (!notificationsSupported() || Notification.permission !== "granted") return;
  try {
    new Notification(title, {
      body,
      icon: "/icons/icon-512.png",
      badge: "/icons/icon-512.png",
      silent: true,
    });
  } catch {
    /* alguns navegadores mobile exigem service worker — o app segue com o aviso interno */
  }
}
