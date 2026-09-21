export type Category =
  | "transport"
  | "place"
  | "meal"
  | "rest"
  | "prepare"
  | "lodging"
  | "secret";

export interface TripItem {
  id: string;
  group: "20" | "21";
  dayOffset: 0 | 1 | 2;
  endOffset?: 0 | 1 | 2;
  start: string;
  end?: string;
  title: string;
  description?: string;
  category: Category;
  moment?: boolean;
  address?: string;
  mapQuery?: string;
  image?: string;
  wikiTitle?: string;
  imageSearch?: string;
  tips?: string[];
  secret?: boolean;
  locked?: boolean;
}

export interface SecretInfo {
  name: string;
  address: string;
  mapQuery: string;
  image: string;
  description: string;
  tips: string[];
}

export interface Expense {
  id: string;
  name: string;
  category: string;
  amount: number;
  payer: string;
  time: string;
  note?: string;
  createdAt: number;
}

export interface CheckItem {
  id: string;
  label: string;
  done: boolean;
  custom?: boolean;
}

export interface Memory {
  id: string;
  itemId: string;
  text: string;
  favorite?: string;
  createdAt: number;
}

export interface PhotoItem {
  id: string;
  itemId: string;
  src: string;
  createdAt: number;
}

export interface AttachmentItem {
  id: string;
  itemId: string;
  name: string;
  kind: "ticket" | "reservation" | "document";
  src: string;
  createdAt: number;
}

export interface Settings {
  budget: number;
  /** payload AES-GCM; destino e senha não ficam legíveis no bundle */
  secretEnvelope: string;
  revealPhrase: string;
  restaurant: string;
  restaurantAddress: string;
  lodging: string;
  lodgingAddress: string;
  originCity: string;
  notifications: boolean;
  previewFinal: boolean;
  secretTimeGate: boolean;
  secretUnlockAt: string;
}

export interface AppState {
  completed: string[];
  delay: number;
  notes: Record<string, string>;
  hiddenNotes: Record<string, string>;
  expenses: Expense[];
  checklist: CheckItem[];
  memories: Memory[];
  photos: PhotoItem[];
  attachments: AttachmentItem[];
  couplePhoto?: string;
  unlocked: boolean;
  unlockedEver: boolean;
  keepUnlocked: boolean;
  notified: string[];
  settings: Settings;
  overrides: Record<string, Partial<TripItem>>;
}

export type TabId = "home" | "roteiro" | "mapa" | "memorias" | "mais";
export type SubPage = "gastos" | "checklist" | "nos" | "config";

export type Route =
  | { name: "tab"; tab: TabId }
  | { name: "place"; id: string }
  | { name: "sub"; page: SubPage }
  | { name: "unlock" }
  | { name: "recap" }
  | { name: "stories" };

export interface Toast {
  id: string;
  title: string;
  body?: string;
  kind?: "default" | "celebrate";
}

export interface WeatherDay {
  date: string;
  code: number;
  min: number;
  max: number;
  rain: number;
}

export type TripPhase = "before" | "today" | "during" | "after";
