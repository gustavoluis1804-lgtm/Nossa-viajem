"use client";

import {
  BedDouble,
  Bell,
  CalendarClock,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  MessageSquareHeart,
  RotateCcw,
  Trash2,
  Upload,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Route, TripItem } from "@/lib/types";
import { useApp } from "@/services/store";
import { useSchedule } from "@/hooks/useSchedule";
import { fmtBRL } from "@/lib/time";
import { ensurePermission, notificationPermission } from "@/services/notify";
import { BackHeader, ConfirmSheet, Sheet, cn, stagger } from "../ui";

type Editing =
  | { kind: "budget" }
  | { kind: "place-info"; which: "lodging" | "restaurant" }
  | { kind: "phrase" }
  | { kind: "password" }
  | { kind: "item"; id: string }
  | null;

export function ConfigPage({ go, onBack }: { go: (r: Route) => void; onBack: () => void }) {
  const {
    state,
    updateSettings,
    setKeepUnlocked,
    lockAgain,
    setOverride,
    setHiddenNote,
    changeSecretPassword,
    importState,
    resetProgress,
    resetAll,
    pushToast,
  } = useApp();
  const sched = useSchedule(60000);

  const [editing, setEditing] = useState<Editing>(null);
  const [confirmKind, setConfirmKind] = useState<"progress" | "all" | "relock" | null>(null);
  const [perm, setPerm] = useState<string>("…");
  const backupRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPerm(notificationPermission());
  }, []);

  const s = state.settings;

  return (
    <div className="pb-32">
      <BackHeader title="Configurações" subtitle="ajustes e administração" onBack={onBack} />

      {/* preferências */}
      <section className="animate-fade-up px-5" style={stagger(1)}>
        <p className="label">Preferências</p>
        <div className="card divide-y divide-white/[0.05] !shadow-none">
          <div className="flex items-center gap-3.5 p-4">
            <RowIcon icon={Bell} />
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-bold">Notificações discretas</p>
              <p className="mt-0.5 text-[11.5px] text-[#a6a0cc]">
                30 e 20 minutos antes de cada momento
                {perm === "granted" ? " · permitidas" : perm === "denied" ? " · bloqueadas no navegador" : ""}
              </p>
            </div>
            {perm === "default" && (
              <button
                className="btn btn-soft flex-none !rounded-full !px-3 !py-1.5 text-[11px]"
                onClick={async () => {
                  await ensurePermission();
                  setPerm(notificationPermission());
                }}
              >
                Ativar
              </button>
            )}
            <button
              className={cn("switch", s.notifications && "on")}
              onClick={() => updateSettings({ notifications: !s.notifications })}
              aria-label="Alternar notificações"
            />
          </div>

          <div className="flex items-center gap-3.5 p-4">
            <RowIcon icon={Lock} />
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-bold">Manter destino desbloqueado</p>
              <p className="mt-0.5 text-[11.5px] text-[#a6a0cc]">
                não pedir a palavra de novo neste aparelho
              </p>
            </div>
            <button
              className={cn("switch", state.keepUnlocked && "on")}
              onClick={() => setKeepUnlocked(!state.keepUnlocked)}
              aria-label="Alternar manter desbloqueado"
            />
          </div>

          {state.unlocked && (
            <button
              className="flex w-full items-center gap-3.5 p-4 text-left transition active:bg-white/[0.03]"
              onClick={() => setConfirmKind("relock")}
            >
              <RowIcon icon={RotateCcw} />
              <div className="flex-1">
                <p className="text-[13.5px] font-bold">Esconder a surpresa de novo</p>
                <p className="mt-0.5 text-[11.5px] text-[#a6a0cc]">
                  o destino volta a ficar bloqueado até a palavra ser digitada
                </p>
              </div>
              <ChevronRight size={16} className="text-[#8882ad]" />
            </button>
          )}

          <div className="p-4">
            <div className="flex items-center gap-3.5">
              <RowIcon icon={CalendarClock} />
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-bold">Liberar surpresa só na hora</p>
                <p className="mt-0.5 text-[11.5px] text-[#a6a0cc]">impede tentativas antes do horário escolhido</p>
              </div>
              <button className={cn("switch", s.secretTimeGate && "on")} onClick={() => updateSettings({ secretTimeGate: !s.secretTimeGate })} aria-label="Alternar bloqueio por horário" />
            </div>
            {s.secretTimeGate && (
              <div className="mt-3 pl-[54px]">
                <input className="input !py-2.5" type="datetime-local" value={s.secretUnlockAt} onChange={(e) => updateSettings({ secretUnlockAt: e.target.value })} />
                <p className="mt-1.5 text-[10.5px] text-[#8882ad]">horário de São Paulo</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3.5 p-4">
            <RowIcon icon={CalendarClock} />
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-bold">Prévia da tela final</p>
              <p className="mt-0.5 text-[11.5px] text-[#a6a0cc]">
                ver como a Home fica depois da viagem
              </p>
            </div>
            <button
              className={cn("switch", s.previewFinal && "on")}
              onClick={() => updateSettings({ previewFinal: !s.previewFinal })}
              aria-label="Alternar prévia da tela final"
            />
          </div>
        </div>
      </section>

      {/* administração */}
      <section className="animate-fade-up mt-7 px-5" style={stagger(2)}>
        <p className="label">Administração</p>
        <div className="card divide-y divide-white/[0.05] !shadow-none">
          <Row
            icon={Wallet}
            title="Orçamento total"
            subtitle={fmtBRL(s.budget)}
            onClick={() => setEditing({ kind: "budget" })}
          />
          <Row
            icon={BedDouble}
            title="Hospedagem"
            subtitle={s.lodging || "definir nome e endereço"}
            onClick={() => setEditing({ kind: "place-info", which: "lodging" })}
          />
          <Row
            icon={UtensilsCrossed}
            title="Restaurante do jantar"
            subtitle={s.restaurant || "definir nome e endereço"}
            onClick={() => setEditing({ kind: "place-info", which: "restaurant" })}
          />
          <Row
            icon={MessageSquareHeart}
            title="Frase da revelação"
            subtitle={`“${s.revealPhrase}”`}
            onClick={() => setEditing({ kind: "phrase" })}
          />
          <Row
            icon={KeyRound}
            title="Palavra secreta"
            subtitle={state.unlocked ? "recriptografar com uma nova palavra" : "desbloqueie a surpresa primeiro"}
            onClick={() => {
              if (state.unlocked) setEditing({ kind: "password" });
              else pushToast("Desbloqueie a surpresa primeiro", "Assim o conteúdo pode ser recriptografado com segurança.");
            }}
          />
        </div>
      </section>

      {/* editar roteiro */}
      <section className="animate-fade-up mt-7 px-5" style={stagger(3)}>
        <p className="label">Editar o roteiro</p>
        <div className="card divide-y divide-white/[0.05] !shadow-none">
          {sched.items.map((item) => (
            <button
              key={item.id}
              className="flex w-full items-center gap-3.5 p-3.5 text-left transition active:bg-white/[0.03]"
              onClick={() => {
                if (item.secret && !state.unlocked) {
                  pushToast("Destino protegido", "Desbloqueie a surpresa antes de editar os dados cifrados.");
                  return;
                }
                setEditing({ kind: "item", id: item.id });
              }}
            >
              <span className="w-[44px] flex-none text-[11.5px] font-bold text-[#a6a0cc] tabular-nums">
                {item.start}
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">
                {item.secret && !state.unlocked ? (
                  <span className="flex items-center gap-1.5 text-[#b3add6]">
                    <Lock size={11} /> Parada secreta
                  </span>
                ) : (
                  item.title
                )}
              </span>
              <ChevronRight size={14} className="flex-none text-[#6f6a92]" />
            </button>
          ))}
        </div>
      </section>

      {/* dados */}
      <section className="animate-fade-up mt-7 px-5" style={stagger(4)}>
        <p className="label">Dados</p>
        <div className="card divide-y divide-white/[0.05] !shadow-none">
          <button
            className="flex w-full items-center gap-3.5 p-4 text-left transition active:bg-white/[0.03]"
            onClick={() => {
              const payload = { app: "Nossa Viagem", version: 2, exportedAt: new Date().toISOString(), state };
              const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `nossa-viagem-backup-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
              pushToast("Backup criado", "Guarde o arquivo em um lugar seguro.");
            }}
          >
            <RowIcon icon={Download} />
            <div className="flex-1">
              <p className="text-[13.5px] font-bold">Exportar backup</p>
              <p className="mt-0.5 text-[11.5px] text-[#a6a0cc]">inclui roteiro, fotos, gastos e memórias</p>
            </div>
          </button>
          <button className="flex w-full items-center gap-3.5 p-4 text-left transition active:bg-white/[0.03]" onClick={() => backupRef.current?.click()}>
            <RowIcon icon={Upload} />
            <div className="flex-1">
              <p className="text-[13.5px] font-bold">Restaurar backup</p>
              <p className="mt-0.5 text-[11.5px] text-[#a6a0cc]">abrir um arquivo exportado anteriormente</p>
            </div>
          </button>
          <input
            ref={backupRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              try {
                const parsed = JSON.parse(await file.text()) as { state?: unknown };
                if (!importState(parsed.state ?? parsed)) throw new Error("invalid");
                pushToast("Backup restaurado", "Os dados voltaram para este aparelho.");
              } catch {
                pushToast("Backup inválido", "Escolha um arquivo criado pelo Nossa Viagem.");
              }
            }}
          />
          <button
            className="flex w-full items-center gap-3.5 p-4 text-left transition active:bg-white/[0.03]"
            onClick={() => setConfirmKind("progress")}
          >
            <RowIcon icon={RotateCcw} />
            <div className="flex-1">
              <p className="text-[13.5px] font-bold">Redefinir progresso</p>
              <p className="mt-0.5 text-[11.5px] text-[#a6a0cc]">
                desmarca todos os momentos e remove o ajuste de atraso
              </p>
            </div>
          </button>
          <button
            className="flex w-full items-center gap-3.5 p-4 text-left transition active:bg-white/[0.03]"
            onClick={() => setConfirmKind("all")}
          >
            <RowIcon icon={Trash2} danger />
            <div className="flex-1">
              <p className="text-[13.5px] font-bold text-rose-300">Apagar todos os dados</p>
              <p className="mt-0.5 text-[11.5px] text-[#a6a0cc]">
                checklist, gastos, memórias, fotos e configurações
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* sheets de edição */}
      <BudgetEditor
        editing={editing?.kind === "budget"}
        current={s.budget}
        onClose={() => setEditing(null)}
        onSave={(v) => {
          updateSettings({ budget: v });
          pushToast("Orçamento atualizado", fmtBRL(v));
        }}
      />
      <PlaceInfoEditor
        editing={editing?.kind === "place-info" ? editing.which : null}
        onClose={() => setEditing(null)}
      />
      <PhraseEditor
        editing={editing?.kind === "phrase"}
        current={s.revealPhrase}
        onClose={() => setEditing(null)}
        onSave={(v) => {
          updateSettings({ revealPhrase: v });
          pushToast("Frase atualizada");
        }}
      />
      <PasswordEditor
        editing={editing?.kind === "password"}
        onClose={() => setEditing(null)}
        onSave={async (v) => {
          const ok = await changeSecretPassword(v);
          if (ok) pushToast("Palavra secreta atualizada", "O destino foi recriptografado com AES-256.");
          return ok;
        }}
      />
      <ItemEditor
        itemId={editing?.kind === "item" ? editing.id : null}
        onClose={() => setEditing(null)}
        onSave={(id, fields) => {
          setOverride(id, fields);
          pushToast("Roteiro atualizado");
        }}
      />

      {/* confirmações */}
      <ConfirmSheet
        open={confirmKind === "progress"}
        onClose={() => setConfirmKind(null)}
        onConfirm={() => {
          resetProgress();
          pushToast("Progresso redefinido");
        }}
        title="Redefinir progresso"
        body="Todos os momentos voltam a ficar pendentes e o ajuste de atraso some. Fotos, memórias e gastos continuam salvos."
        confirmLabel="Redefinir"
      />
      <ConfirmSheet
        open={confirmKind === "all"}
        onClose={() => setConfirmKind(null)}
        onConfirm={() => {
          resetAll();
          pushToast("Aplicativo restaurado", "Todos os dados locais foram apagados.");
        }}
        title="Apagar todos os dados"
        body="Isso apaga checklist, gastos, memórias, fotos, estado da surpresa e configurações deste aparelho. Não dá para desfazer."
        confirmLabel="Apagar tudo"
        danger
      />
      <ConfirmSheet
        open={confirmKind === "relock"}
        onClose={() => setConfirmKind(null)}
        onConfirm={() => {
          lockAgain();
          pushToast("Surpresa escondida", "A última parada voltou a ser um mistério.");
        }}
        title="Esconder a surpresa"
        body="O destino secreto volta a pedir a palavra secreta para ser revelado."
        confirmLabel="Esconder"
      />
    </div>
  );
}

/* ————— linhas ————— */

function RowIcon({ icon: Icon, danger }: { icon: LucideIcon; danger?: boolean }) {
  return (
    <div
      className={cn(
        "glass grid h-10 w-10 flex-none place-items-center rounded-2xl",
        danger ? "text-rose-300" : "text-[#c4b5fd]"
      )}
    >
      <Icon size={16} />
    </div>
  );
}

function Row({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      className="flex w-full items-center gap-3.5 p-4 text-left transition active:bg-white/[0.03]"
      onClick={onClick}
    >
      <RowIcon icon={icon} />
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-bold">{title}</p>
        <p className="mt-0.5 truncate text-[11.5px] text-[#a6a0cc]">{subtitle}</p>
      </div>
      <ChevronRight size={16} className="flex-none text-[#8882ad]" />
    </button>
  );
}

/* ————— editores ————— */

function BudgetEditor({
  editing,
  current,
  onClose,
  onSave,
}: {
  editing: boolean;
  current: number;
  onClose: () => void;
  onSave: (v: number) => void;
}) {
  const [value, setValue] = useState(String(current));
  useEffect(() => {
    if (editing) setValue(String(current));
  }, [editing, current]);
  const parsed = Number(value.replace(/\./g, "").replace(",", "."));
  return (
    <Sheet open={editing} onClose={onClose} title="Orçamento total">
      <p className="label">Valor disponível (R$)</p>
      <input
        className="input mb-6"
        inputMode="decimal"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
      />
      <button
        className="btn btn-primary w-full"
        disabled={!Number.isFinite(parsed) || parsed <= 0}
        onClick={() => {
          onSave(parsed);
          onClose();
        }}
      >
        Salvar
      </button>
    </Sheet>
  );
}

function PlaceInfoEditor({
  editing,
  onClose,
}: {
  editing: "lodging" | "restaurant" | null;
  onClose: () => void;
}) {
  const { state, updateSettings, pushToast } = useApp();
  const isLodging = editing === "lodging";
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!editing) return;
    setName(isLodging ? state.settings.lodging : state.settings.restaurant);
    setAddress(isLodging ? state.settings.lodgingAddress : state.settings.restaurantAddress);
  }, [editing, isLodging, state.settings]);

  return (
    <Sheet open={editing !== null} onClose={onClose} title={isLodging ? "Hospedagem" : "Restaurante do jantar"}>
      <p className="label">Nome</p>
      <input
        className="input mb-4"
        placeholder={isLodging ? "Ex.: Hotel no centro" : "Ex.: Cantina da Praça"}
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />
      <p className="label">Endereço</p>
      <input
        className="input mb-6"
        placeholder="Rua, número — bairro, São Paulo"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <button
        className="btn btn-primary w-full"
        onClick={() => {
          if (isLodging) updateSettings({ lodging: name.trim(), lodgingAddress: address.trim() });
          else updateSettings({ restaurant: name.trim(), restaurantAddress: address.trim() });
          pushToast("Salvo", name.trim() || undefined);
          onClose();
        }}
      >
        Salvar
      </button>
    </Sheet>
  );
}

function PhraseEditor({
  editing,
  current,
  onClose,
  onSave,
}: {
  editing: boolean;
  current: string;
  onClose: () => void;
  onSave: (v: string) => void;
}) {
  const [value, setValue] = useState(current);
  useEffect(() => {
    if (editing) setValue(current);
  }, [editing, current]);
  return (
    <Sheet open={editing} onClose={onClose} title="Frase da revelação">
      <p className="label">Mostrada quando a surpresa abre</p>
      <textarea
        className="input mb-6 min-h-[90px] resize-none"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
      />
      <button
        className="btn btn-primary w-full"
        disabled={!value.trim()}
        onClick={() => {
          onSave(value.trim());
          onClose();
        }}
      >
        Salvar
      </button>
    </Sheet>
  );
}

function PasswordEditor({
  editing,
  onClose,
  onSave,
}: {
  editing: boolean;
  onClose: () => void;
  onSave: (v: string) => Promise<boolean>;
}) {
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (editing) {
      setValue("");
      setShow(false);
    }
  }, [editing]);
  return (
    <Sheet open={editing} onClose={onClose} title="Palavra secreta">
      <p className="label">Nova palavra (ela nunca aparece no app)</p>
      <div className="relative mb-6">
        <input
          className="input !pr-12"
          type={show ? "text" : "password"}
          placeholder="nova palavra secreta"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
        <button
          className="absolute top-1/2 right-3 -translate-y-1/2 text-[#a6a0cc]"
          onClick={() => setShow(!show)}
          aria-label={show ? "Ocultar" : "Mostrar"}
        >
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      <button
        className="btn btn-primary w-full"
        disabled={value.trim().length < 4 || busy}
        onClick={async () => {
          setBusy(true);
          const ok = await onSave(value);
          setBusy(false);
          if (ok) onClose();
        }}
      >
        {busy ? "Recriptografando…" : "Salvar nova palavra"}
      </button>
    </Sheet>
  );
}

function ItemEditor({
  itemId,
  onClose,
  onSave,
}: {
  itemId: string | null;
  onClose: () => void;
  onSave: (id: string, fields: Partial<TripItem>) => void;
}) {
  const sched = useSchedule(60000);
  const { state, setHiddenNote, updateSecretInfo, pushToast } = useApp();
  const item = sched.items.find((i) => i.id === itemId);
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [hiddenNote, setHiddenNoteValue] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [secretError, setSecretError] = useState(false);

  useEffect(() => {
    if (!item) return;
    const ov = state.overrides[item.id] ?? {};
    setTitle(ov.title ?? (item.id === "d2-secreto" ? "" : item.title));
    setStart(ov.start ?? item.start);
    setEnd(ov.end ?? item.end ?? "");
    setAddress(ov.address ?? item.address ?? "");
    setDescription(ov.description ?? item.description ?? "");
    setHiddenNoteValue(state.hiddenNotes[item.id] ?? "");
    setCurrentPassword("");
    setSecretError(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  if (!item) return null;
  const isSecret = Boolean(item.secret);

  return (
    <Sheet open={itemId !== null} onClose={onClose} title={isSecret ? "Editar parada secreta" : "Editar momento"}>
      {isSecret && (
        <p className="mb-4 flex items-center gap-2 text-[11.5px] text-[#a6a0cc]">
          <Lock size={12} className="text-[#c4b5fd]" />
          nome e endereço só aparecem depois do desbloqueio
        </p>
      )}
      <p className="label">{isSecret ? "Nome real (secreto)" : "Nome"}</p>
      <input
        className="input mb-4"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={isSecret ? "nome revelado após a senha" : "Nome do momento"}
      />
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <p className="label">Início</p>
          <input className="input" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div>
          <p className="label">Fim</p>
          <input className="input" type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
      </div>
      <p className="label">Endereço</p>
      <input
        className="input mb-4"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Rua, número — bairro"
      />
      <p className="label">Descrição</p>
      <textarea
        className="input mb-4 min-h-[90px] resize-none"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <p className="label">Bilhete revelado ao concluir</p>
      <textarea
        className="input mb-6 min-h-[92px] resize-none"
        value={hiddenNote}
        onChange={(e) => setHiddenNoteValue(e.target.value)}
        placeholder="Uma mensagem especial para este momento…"
      />
      {isSecret && (
        <div className="mb-6">
          <p className="label">Confirme a palavra atual para recriptografar</p>
          <input
            className={cn("input", secretError && "!border-rose-400")}
            type="password"
            value={currentPassword}
            onChange={(e) => { setCurrentPassword(e.target.value); setSecretError(false); }}
            placeholder="palavra secreta atual"
          />
          {secretError && <p className="mt-2 text-[11.5px] text-rose-300">A palavra não confere.</p>}
        </div>
      )}
      <button
        className="btn btn-primary w-full"
        disabled={!start || saving || (isSecret && currentPassword.length < 2)}
        onClick={async () => {
          setSaving(true);
          if (isSecret) {
            const ok = await updateSecretInfo(
              {
                name: title.trim() || item.title,
                address: address.trim() || item.address || "",
                mapQuery: address.trim() || item.mapQuery || "",
                description: description.trim() || item.description || "",
              },
              currentPassword
            );
            if (!ok) {
              setSaving(false);
              setSecretError(true);
              return;
            }
            onSave(item.id, { start, ...(end ? { end } : {}) });
            pushToast("Destino recriptografado", "Os dados secretos continuam protegidos por AES-256.");
          } else {
            onSave(item.id, {
              ...(title.trim() ? { title: title.trim() } : {}),
              start,
              ...(end ? { end } : {}),
              ...(address.trim() ? { address: address.trim(), mapQuery: address.trim() } : {}),
              ...(description.trim() ? { description: description.trim() } : {}),
            });
          }
          setHiddenNote(item.id, hiddenNote.trim());
          setSaving(false);
          onClose();
        }}
      >
        {saving ? "Protegendo…" : "Salvar alterações"}
      </button>
    </Sheet>
  );
}
