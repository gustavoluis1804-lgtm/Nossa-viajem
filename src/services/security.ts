"use client";

import type { SecretInfo } from "@/lib/types";

export interface EncryptedEnvelope {
  v: 1;
  kdf: "PBKDF2-SHA256";
  iterations: number;
  salt: string;
  iv: string;
  data: string;
}

/**
 * O destino completo está cifrado: não existe nome, endereço, rota ou fotografia
 * legíveis no bundle. A chave é derivada somente da palavra digitada.
 */
export const DEFAULT_SECRET_ENVELOPE =
  '{"v":1,"kdf":"PBKDF2-SHA256","iterations":210000,"salt":"5xJcZZnMajRh9Vf0nhIZMw==","iv":"2eRxPSuWkbHZO1fR","data":"oivXLRpMovNGdwYvEvDphfc2N81KQQFzFN7zDpXISjoC5Ir1y1Qx1m0k0JH/qXj/Wed8fFVFSgl4rQJZAoA/RZh1FYyMBgEOy7Sds/uG7dA5QKQZbu5ea+3gUM+TzAtAr7CfxbgrfjD5z1QxrugQhyHsANC46LMGw8mFpFk4e6HKF5rLxth9i0W3UfgOgigdDn75VjMM+D8J/nqzHP6aQtFMx+pa71k41gz9B/MUkP2eHntMsvP5U5u1q6Ob4E5z0Xi4kyG4q2aMFE4AqDvky5qtrLunHfOrHM/A8KlbNZvcoxrYGt2z3OlwhMDh8MgnslgjGjgkB2DiYBem2vHhv/aOv0qNGHd3/9DUa9J0Iw8Z+EGxQg6ghnC4+Hh0Z11hfF43EXf1hquwpiRAsOf/eiio7yQ7pd8CsWlD5h9g4IJLB8cr58cwfradyaGKbMjplHeZj4C1t81rBuwfXbuyZSzeQY9Moclu4ZXPuxFk8htTGxAjmmFLNqxmiu0Q+FAfdD/48Fc/rMti/I3ZvYt7BOOGAJfYfbSskUtI+NA5gpTpChKdQZsGh4ZNsb9wnkrhxFyqOtj7Y2hqedOfUga6kuWJdIB8pDFWoofnBm/HwP+7ZMt7092ZMoszya3ywPbq/JrbZ/1V4EzNW26UXdY8NQx/3ZRzehgcQDaAh3/rrr9s6W+HbJpbwITHltfgBeWDmAEsRClBOKLoaYE81bn+hBfljFKNmVYysA=="}';

function bytesToB64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function b64ToBytes(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
}

async function derive(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password.trim().toLowerCase()),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function decryptSecret(rawEnvelope: string, password: string): Promise<SecretInfo | null> {
  try {
    const env = JSON.parse(rawEnvelope) as EncryptedEnvelope;
    if (env.v !== 1 || env.kdf !== "PBKDF2-SHA256" || env.iterations < 100_000) return null;
    const salt = b64ToBytes(env.salt);
    const iv = b64ToBytes(env.iv);
    const data = b64ToBytes(env.data);
    const key = await derive(password, salt, env.iterations);
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
    const parsed = JSON.parse(new TextDecoder().decode(plain)) as SecretInfo;
    if (!parsed.name || !parsed.address || !parsed.mapQuery || !parsed.description) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function encryptSecret(payload: SecretInfo, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const iterations = 210_000;
  const key = await derive(password, salt, iterations);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(JSON.stringify(payload))
  );
  const env: EncryptedEnvelope = {
    v: 1,
    kdf: "PBKDF2-SHA256",
    iterations,
    salt: bytesToB64(salt),
    iv: bytesToB64(iv),
    data: bytesToB64(new Uint8Array(encrypted)),
  };
  return JSON.stringify(env);
}

export function randomDeviceKey(): string {
  return bytesToB64(crypto.getRandomValues(new Uint8Array(32)));
}
