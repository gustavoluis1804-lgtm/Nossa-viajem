"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  AppState,
  AttachmentItem,
  CheckItem,
  Expense,
  Memory,
  PhotoItem,
  SecretInfo,
  Settings,
  Toast,
  TripItem,
} from "@/lib/types";
import { DEFAULT_CHECKLIST, DEFAULT_REVEAL_PHRASE } from "@/data/trip";
import {
  DEFAULT_SECRET_ENVELOPE,
  decryptSecret,
  encryptSecret,
  randomDeviceKey,
} from "@/services/security";
import { haptic } from "@/services/haptics";
import { supabase } from "@/services/supabase";

const STORAGE_KEY = "nossa-viagem:v1";
const DEVICE_KEY = "nossa-viagem:device-key";
const DEVICE_CACHE = "nossa-viagem:secret-cache";

const defaultSettings: Settings = {
  budget: 1300,
  secretEnvelope: DEFAULT_SECRET_ENVELOPE,
  revealPhrase: DEFAULT_REVEAL_PHRASE,
  restaurant: "",
  restaurantAddress: "",
  lodging: "",
  lodgingAddress: "",
  originCity: "Sorocaba",
  notifications: true,
  previewFinal: false,
  secretTimeGate: false,
  secretUnlockAt: "2026-10-21T17:00",
};

const defaultHiddenNotes: Record<string, string> = {
  "d2-ibirapuera": "Começar o dia caminhando ao seu lado já faz qualquer lugar ficar especial.",
  "d2-zoologico": "Uma hora passa rápido quando cada pedacinho do passeio vira uma lembrança nossa.",
  "d2-afro": "Quero guardar não só o que vimos aqui, mas também o jeito que vivemos esse momento juntos.",
  "d2-liberdade": "Guarda um pedacinho desse dia. Eu vou guardar o jeito que você sorriu aqui.",
  "d2-aclimacao": "A melhor parte da pausa é não precisar ir a lugar nenhum para estar bem com você.",
  "d2-secreto": "Essa vista fecha o nosso dia lá no alto. Mesmo assim, o meu lugar favorito continua sendo ao seu lado.",
  "d2-jantar": "Nossa primeira viagem está terminando, mas essa é só a primeira de muitas.",
};

const defaultState: AppState = {
  completed: [],
  delay: 0,
  notes: {},
  hiddenNotes: defaultHiddenNotes,
  expenses: [],
  checklist: DEFAULT_CHECKLIST,
  memories: [],
  photos: [],
  attachments: [],
  couplePhoto: undefined,
  unlocked: false,
  unlockedEver: false,
  keepUnlocked: true,
  notified: [],
  settings: defaultSettings,
  overrides: {},
};

function normalizeState(input: unknown): AppState {
  const parsed = input && typeof input === "object" ? (input as Partial<AppState>) : {};
  return {
    ...defaultState,
    ...parsed,
    completed: Array.isArray(parsed.completed) ? parsed.completed : [],
    expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
    checklist: Array.isArray(parsed.checklist) ? parsed.checklist : DEFAULT_CHECKLIST,
    memories: Array.isArray(parsed.memories) ? parsed.memories : [],
    photos: Array.isArray(parsed.photos) ? parsed.photos : [],
    attachments: Array.isArray(parsed.attachments) ? parsed.attachments : [],
    notified: Array.isArray(parsed.notified) ? parsed.notified : [],
    notes: parsed.notes ?? {},
    hiddenNotes: parsed.hiddenNotes ?? defaultHiddenNotes,
    overrides: parsed.overrides ?? {},
    settings: {
      ...defaultSettings,
      ...(parsed.settings ?? {}),
      // migração: versões anteriores guardavam somente um hash Base64 inseguro
      secretEnvelope: parsed.settings?.secretEnvelope || DEFAULT_SECRET_ENVELOPE,
    },
    // nunca confiar no booleano persistido; é necessário restaurar o payload cifrado
    unlocked: false,
  };
}

function loadState(): AppState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeState(JSON.parse(raw)) : defaultState;
  } catch {
    return defaultState;
  }
}

function persist(state: AppState): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

function clearDeviceSecret(): void {
  try {
    localStorage.removeItem(DEVICE_KEY);
    localStorage.removeItem(DEVICE_CACHE);
  } catch {
    /* ignore */
  }
}

async function cacheDeviceSecret(payload: SecretInfo): Promise<void> {
  try {
    const key = randomDeviceKey();
    const envelope = await encryptSecret(payload, key);
    localStorage.setItem(DEVICE_KEY, key);
    localStorage.setItem(DEVICE_CACHE, envelope);
  } catch {
    /* manter desbloqueado é uma conveniência; falha não bloqueia a sessão */
  }
}

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface SyncInfo {
  status: "offline" | "connecting" | "online" | "error";
  signedIn: boolean;
  email?: string;
  spaceId?: string;
  inviteCode?: string;
  lastSync?: number;
  error?: string;
}

interface StoreCtx {
  state: AppState;
  secret: SecretInfo | null;
  hydrated: boolean;
  toasts: Toast[];
  pendingNote: { itemId: string; text: string } | null;
  sync: SyncInfo;
  signUpSync: (email: string, password: string) => Promise<{ ok: boolean; message: string }>;
  signInSync: (email: string, password: string) => Promise<{ ok: boolean; message: string }>;
  signOutSync: () => Promise<void>;
  createSharedTrip: () => Promise<{ ok: boolean; code?: string; message: string }>;
  joinSharedTrip: (code: string) => Promise<{ ok: boolean; message: string }>;
  pushToast: (title: string, body?: string, kind?: Toast["kind"]) => void;
  dismissToast: (id: string) => void;
  dismissHiddenNote: () => void;
  toggleComplete: (id: string) => void;
  addDelay: (minutes: number) => void;
  resetDelay: () => void;
  setNote: (id: string, text: string) => void;
  setHiddenNote: (id: string, text: string) => void;
  addExpense: (e: Omit<Expense, "id" | "createdAt">) => void;
  removeExpense: (id: string) => void;
  toggleCheck: (id: string) => void;
  addCheck: (label: string) => void;
  removeCheck: (id: string) => void;
  addMemory: (m: Omit<Memory, "id" | "createdAt">) => void;
  removeMemory: (id: string) => void;
  addPhoto: (p: Omit<PhotoItem, "id" | "createdAt">) => boolean;
  removePhoto: (id: string) => void;
  addAttachment: (p: Omit<AttachmentItem, "id" | "createdAt">) => boolean;
  removeAttachment: (id: string) => void;
  setCouplePhoto: (src: string) => void;
  unlockWithPassword: (password: string) => Promise<boolean>;
  changeSecretPassword: (password: string) => Promise<boolean>;
  updateSecretInfo: (partial: Partial<SecretInfo>, currentPassword: string) => Promise<boolean>;
  lockAgain: () => void;
  setKeepUnlocked: (v: boolean) => void;
  updateSettings: (partial: Partial<Settings>) => void;
  setOverride: (id: string, partial: Partial<TripItem>) => void;
  markNotified: (key: string) => void;
  resetProgress: () => void;
  importState: (input: unknown) => boolean;
  resetAll: () => void;
}

const Ctx = createContext<StoreCtx | null>(null);
let toastSeq = 0;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [secret, setSecret] = useState<SecretInfo | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pendingNote, setPendingNote] = useState<{ itemId: string; text: string } | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncRevision = useRef(0);
  const applyingRemote = useRef(false);
  const [sync, setSync] = useState<SyncInfo>({ status: "offline", signedIn: false });

  useEffect(() => {
    const loaded = loadState();
    setState(loaded);
    setHydrated(true);

    if (loaded.keepUnlocked) {
      const key = localStorage.getItem(DEVICE_KEY);
      const envelope = localStorage.getItem(DEVICE_CACHE);
      if (key && envelope) {
        void decryptSecret(envelope, key).then((payload) => {
          if (!payload) {
            clearDeviceSecret();
            return;
          }
          setSecret(payload);
          setState((s) => ({ ...s, unlocked: true, unlockedEver: true }));
        });
      }
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persist(state), 180);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, hydrated]);

  const loadSharedSpace = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) {
      setSync({ status: "offline", signedIn: false });
      return;
    }

    setSync((v) => ({ ...v, status: "connecting", signedIn: true, email: user.email ?? undefined, error: undefined }));
    const { data: membership, error: memberError } = await supabase
      .from("trip_members")
      .select("space_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (memberError) {
      setSync((v) => ({ ...v, status: "error", error: memberError.message }));
      return;
    }
    if (!membership?.space_id) {
      setSync({ status: "offline", signedIn: true, email: user.email ?? undefined });
      return;
    }

    const spaceId = membership.space_id as string;
    const [{ data: space }, { data: shared, error: sharedError }] = await Promise.all([
      supabase.from("trip_spaces").select("invite_code").eq("id", spaceId).single(),
      supabase.from("shared_trip_state").select("data,revision,updated_at").eq("space_id", spaceId).single(),
    ]);
    if (sharedError) {
      setSync((v) => ({ ...v, status: "error", error: sharedError.message }));
      return;
    }

    syncRevision.current = Number(shared?.revision ?? 0);
    const remote = shared?.data && typeof shared.data === "object" ? shared.data : {};
    if (Object.keys(remote as object).length > 0) {
      applyingRemote.current = true;
      setState(normalizeState(remote));
      queueMicrotask(() => { applyingRemote.current = false; });
    } else {
      const local = loadState();
      const { data: nextRevision, error: saveError } = await supabase.rpc("save_shared_trip", {
        p_space_id: spaceId,
        p_data: local,
        p_revision: syncRevision.current,
      });
      if (!saveError) syncRevision.current = Number(nextRevision ?? 1);
    }
    setSync({
      status: "online",
      signedIn: true,
      email: user.email ?? undefined,
      spaceId,
      inviteCode: space?.invite_code ?? undefined,
      lastSync: Date.now(),
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void loadSharedSpace();
    const { data: authSub } = supabase.auth.onAuthStateChange(() => {
      void loadSharedSpace();
    });
    return () => authSub.subscription.unsubscribe();
  }, [hydrated, loadSharedSpace]);

  useEffect(() => {
    if (!sync.spaceId || !sync.signedIn) return;
    const channel = supabase
      .channel(`shared-trip-${sync.spaceId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "shared_trip_state", filter: `space_id=eq.${sync.spaceId}` },
        (payload) => {
          const row = payload.new as { data?: unknown; revision?: number };
          const revision = Number(row.revision ?? 0);
          if (revision <= syncRevision.current) return;
          syncRevision.current = revision;
          applyingRemote.current = true;
          setState(normalizeState(row.data));
          setSync((v) => ({ ...v, status: "online", lastSync: Date.now(), error: undefined }));
          queueMicrotask(() => { applyingRemote.current = false; });
        }
      )
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [sync.spaceId, sync.signedIn]);

  useEffect(() => {
    if (!hydrated || !sync.spaceId || !sync.signedIn || applyingRemote.current) return;
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(async () => {
      const { data: nextRevision, error } = await supabase.rpc("save_shared_trip", {
        p_space_id: sync.spaceId,
        p_data: state,
        p_revision: syncRevision.current,
      });
      if (!error) {
        syncRevision.current = Number(nextRevision ?? syncRevision.current + 1);
        setSync((v) => ({ ...v, status: "online", lastSync: Date.now(), error: undefined }));
        return;
      }
      if (error.message.includes("CONFLICT")) {
        const { data: latest } = await supabase
          .from("shared_trip_state")
          .select("data,revision")
          .eq("space_id", sync.spaceId)
          .single();
        if (latest) {
          syncRevision.current = Number(latest.revision ?? 0);
          applyingRemote.current = true;
          setState(normalizeState(latest.data));
          queueMicrotask(() => { applyingRemote.current = false; });
        }
      } else {
        setSync((v) => ({ ...v, status: "error", error: error.message }));
      }
    }, 650);
    return () => { if (syncTimer.current) clearTimeout(syncTimer.current); };
  }, [state, hydrated, sync.spaceId, sync.signedIn]);

  const dismissToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const pushToast = useCallback(
    (title: string, body?: string, kind: Toast["kind"] = "default") => {
      const id = `t-${++toastSeq}`;
      setToasts((t) => [...t, { id, title, body, kind }]);
      setTimeout(() => dismissToast(id), kind === "celebrate" ? 5200 : 3400);
    },
    [dismissToast]
  );

  const update = useCallback((fn: (s: AppState) => AppState) => setState((s) => fn(s)), []);

  const value = useMemo<StoreCtx>(
    () => ({
      state,
      secret,
      sync,
      signUpSync: async (email, password) => {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) return { ok: false, message: error.message };
        if (!data.session) return { ok: true, message: "Conta criada. Confirme o e-mail e depois entre no app." };
        await loadSharedSpace();
        return { ok: true, message: "Conta criada e conectada." };
      },
      signInSync: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) return { ok: false, message: error.message };
        await loadSharedSpace();
        return { ok: true, message: "Conta conectada." };
      },
      signOutSync: async () => {
        await supabase.auth.signOut();
        syncRevision.current = 0;
        setSync({ status: "offline", signedIn: false });
      },
      createSharedTrip: async () => {
        const { data, error } = await supabase.rpc("create_trip_space");
        if (error) return { ok: false, message: error.message };
        const row = Array.isArray(data) ? data[0] : data;
        await loadSharedSpace();
        return { ok: true, code: row?.invite_code, message: "Viagem compartilhada criada." };
      },
      joinSharedTrip: async (code) => {
        const { error } = await supabase.rpc("join_trip_space", { code: code.trim().toLowerCase() });
        if (error) return { ok: false, message: error.message };
        await loadSharedSpace();
        return { ok: true, message: "Este celular entrou na viagem compartilhada." };
      },
      hydrated,
      toasts,
      pendingNote,
      pushToast,
      dismissToast,
      dismissHiddenNote: () => setPendingNote(null),
      toggleComplete: (id) => {
        const adding = !state.completed.includes(id);
        update((s) => ({
          ...s,
          completed: s.completed.includes(id)
            ? s.completed.filter((x) => x !== id)
            : [...s.completed, id],
        }));
        haptic(adding ? "success" : "light");
        if (adding && state.hiddenNotes[id]?.trim()) {
          window.setTimeout(() => setPendingNote({ itemId: id, text: state.hiddenNotes[id] }), 480);
        }
      },
      addDelay: (minutes) => update((s) => ({ ...s, delay: s.delay + minutes })),
      resetDelay: () => update((s) => ({ ...s, delay: 0 })),
      setNote: (id, text) => update((s) => ({ ...s, notes: { ...s.notes, [id]: text } })),
      setHiddenNote: (id, text) =>
        update((s) => ({ ...s, hiddenNotes: { ...s.hiddenNotes, [id]: text } })),
      addExpense: (e) =>
        update((s) => ({
          ...s,
          expenses: [{ ...e, id: uid(), createdAt: Date.now() }, ...s.expenses],
        })),
      removeExpense: (id) =>
        update((s) => ({ ...s, expenses: s.expenses.filter((e) => e.id !== id) })),
      toggleCheck: (id) => {
        haptic("light");
        update((s) => ({
          ...s,
          checklist: s.checklist.map((c) => (c.id === id ? { ...c, done: !c.done } : c)),
        }));
      },
      addCheck: (label) =>
        update((s) => ({
          ...s,
          checklist: [...s.checklist, { id: uid(), label, done: false, custom: true }],
        })),
      removeCheck: (id) =>
        update((s) => ({ ...s, checklist: s.checklist.filter((c) => c.id !== id) })),
      addMemory: (m) =>
        update((s) => ({
          ...s,
          memories: [{ ...m, id: uid(), createdAt: Date.now() }, ...s.memories],
        })),
      removeMemory: (id) =>
        update((s) => ({ ...s, memories: s.memories.filter((m) => m.id !== id) })),
      addPhoto: (p) => {
        const next = { ...state, photos: [...state.photos, { ...p, id: uid(), createdAt: Date.now() }] };
        if (!persist(next)) {
          pushToast("Sem espaço no armazenamento", "Remova algumas fotos e tente de novo.");
          return false;
        }
        setState(next);
        return true;
      },
      removePhoto: (id) => update((s) => ({ ...s, photos: s.photos.filter((p) => p.id !== id) })),
      addAttachment: (p) => {
        const next = {
          ...state,
          attachments: [...state.attachments, { ...p, id: uid(), createdAt: Date.now() }],
        };
        if (!persist(next)) {
          pushToast("Sem espaço no armazenamento", "Remova um anexo e tente novamente.");
          return false;
        }
        setState(next);
        return true;
      },
      removeAttachment: (id) =>
        update((s) => ({ ...s, attachments: s.attachments.filter((p) => p.id !== id) })),
      setCouplePhoto: (src) => update((s) => ({ ...s, couplePhoto: src })),
      unlockWithPassword: async (password) => {
        const payload = await decryptSecret(state.settings.secretEnvelope, password);
        if (!payload) return false;
        setSecret(payload);
        setState((s) => ({ ...s, unlocked: true, unlockedEver: true }));
        if (state.keepUnlocked) await cacheDeviceSecret(payload);
        haptic("success");
        return true;
      },
      changeSecretPassword: async (password) => {
        if (!secret || password.trim().length < 4) return false;
        const envelope = await encryptSecret(secret, password);
        setState((s) => ({ ...s, settings: { ...s.settings, secretEnvelope: envelope } }));
        if (state.keepUnlocked) await cacheDeviceSecret(secret);
        return true;
      },
      updateSecretInfo: async (partial, currentPassword) => {
        if (!secret) return false;
        const verified = await decryptSecret(state.settings.secretEnvelope, currentPassword);
        if (!verified) return false;
        const next = { ...secret, ...partial };
        const envelope = await encryptSecret(next, currentPassword);
        setSecret(next);
        setState((s) => ({ ...s, settings: { ...s.settings, secretEnvelope: envelope } }));
        if (state.keepUnlocked) await cacheDeviceSecret(next);
        return true;
      },
      lockAgain: () => {
        clearDeviceSecret();
        setSecret(null);
        update((s) => ({ ...s, unlocked: false }));
      },
      setKeepUnlocked: (v) => {
        update((s) => ({ ...s, keepUnlocked: v }));
        if (!v) clearDeviceSecret();
        else if (secret) void cacheDeviceSecret(secret);
      },
      updateSettings: (partial) =>
        update((s) => ({ ...s, settings: { ...s.settings, ...partial } })),
      setOverride: (id, partial) =>
        update((s) => ({
          ...s,
          overrides: { ...s.overrides, [id]: { ...s.overrides[id], ...partial } },
        })),
      markNotified: (key) =>
        update((s) => (s.notified.includes(key) ? s : { ...s, notified: [...s.notified, key] })),
      resetProgress: () => update((s) => ({ ...s, completed: [], delay: 0, notified: [] })),
      importState: (input) => {
        try {
          const next = normalizeState(input);
          if (!Array.isArray(next.checklist) || !next.settings) return false;
          clearDeviceSecret();
          setSecret(null);
          setState(next);
          persist(next);
          return true;
        } catch {
          return false;
        }
      },
      resetAll: () => {
        clearDeviceSecret();
        setSecret(null);
        setState({
          ...defaultState,
          checklist: DEFAULT_CHECKLIST.map((c: CheckItem) => ({ ...c })),
          hiddenNotes: { ...defaultHiddenNotes },
        });
        try {
          window.localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* ignore */
        }
      },
    }),
    [state, secret, hydrated, toasts, pendingNote, pushToast, dismissToast, update, sync, loadSharedSpace]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): StoreCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp fora do StoreProvider");
  return ctx;
}
