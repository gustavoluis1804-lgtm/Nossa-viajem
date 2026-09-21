"use client";

import { useRef, useState, type ReactNode } from "react";
import { Camera, FileText, Hourglass, Paperclip, Star, Ticket, Trash2, X } from "lucide-react";
import { useApp } from "@/services/store";
import { fileToDataUrl } from "@/services/images";
import { Sheet, cn } from "./ui";

/* ————— Estamos atrasados ————— */

const DELAY_OPTIONS = [10, 20, 30, 45, 60];

export function DelaySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, addDelay, resetDelay, pushToast } = useApp();

  return (
    <Sheet open={open} onClose={onClose} title="Estamos atrasados">
      <div className="mb-5 flex items-start gap-3">
        <div className="glass grid h-11 w-11 flex-none place-items-center rounded-2xl text-[#c4b5fd]">
          <Hourglass size={19} />
        </div>
        <p className="text-[13px] leading-relaxed text-[#b3add6]">
          Sem problema. O restante do cronograma é ajustado visualmente
          — os horários planejados continuam salvos.
        </p>
      </div>

      <p className="label">Quantos minutos de atraso?</p>
      <div className="mb-5 grid grid-cols-5 gap-2">
        {DELAY_OPTIONS.map((m) => (
          <button
            key={m}
            className="btn btn-soft !rounded-xl !px-0 text-[15px] font-bold"
            onClick={() => {
              addDelay(m);
              pushToast("Cronograma ajustado", `+${m} min aplicados aos próximos horários.`);
              onClose();
            }}
          >
            {m}
          </button>
        ))}
      </div>

      {state.delay > 0 && (
        <>
          <div className="divider mb-4" />
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-[#b3add6]">
              Ajuste atual:{" "}
              <span className="font-semibold text-[#c4b5fd]">+{state.delay} min</span>
            </p>
            <button
              className="btn btn-ghost !px-4 !py-2 text-[12.5px]"
              onClick={() => {
                resetDelay();
                pushToast("Voltamos ao planejado");
              }}
            >
              Remover ajuste
            </button>
          </div>
        </>
      )}
    </Sheet>
  );
}

/* ————— adicionar foto ————— */

export function AddPhotoButton({
  itemId,
  className,
  children,
}: {
  itemId: string;
  className?: string;
  children?: ReactNode;
}) {
  const { addPhoto, pushToast } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  return (
    <>
      <button
        className={cn("btn", className)}
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        <Camera size={16} />
        {children ?? (busy ? "Salvando…" : "Adicionar foto")}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setBusy(true);
          try {
            const src = await fileToDataUrl(file);
            if (addPhoto({ itemId, src })) pushToast("Foto guardada", "Mais uma memória dessa viagem.");
          } catch {
            pushToast("Não consegui salvar a foto", "Tente outra imagem.");
          } finally {
            setBusy(false);
          }
        }}
      />
    </>
  );
}

/* ————— ingressos e reservas locais ————— */

export function AttachmentButton({ itemId }: { itemId: string }) {
  const { addAttachment, pushToast } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<"ticket" | "reservation" | "document">("ticket");
  const [busy, setBusy] = useState(false);

  const choose = (value: "ticket" | "reservation" | "document") => {
    setKind(value);
    inputRef.current?.click();
  };

  return (
    <>
      <button className="btn btn-soft" onClick={() => setOpen(true)} disabled={busy}>
        <Paperclip size={16} /> {busy ? "Salvando…" : "Ingresso / reserva"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setBusy(true);
          try {
            let src: string;
            if (file.type.startsWith("image/")) src = await fileToDataUrl(file, 1400, 0.86);
            else {
              src = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result));
                reader.onerror = () => reject(new Error("arquivo"));
                reader.readAsDataURL(file);
              });
            }
            if (addAttachment({ itemId, name: file.name, kind, src })) {
              pushToast("Documento guardado", "Disponível mesmo sem internet.");
            }
          } catch {
            pushToast("Não consegui salvar", "Tente uma imagem ou PDF menor.");
          } finally {
            setBusy(false);
            setOpen(false);
          }
        }}
      />
      <Sheet open={open} onClose={() => setOpen(false)} title="O que deseja guardar?">
        <div className="grid grid-cols-3 gap-2.5">
          <button className="card flex flex-col items-center gap-2 p-4 text-[11.5px] font-semibold" onClick={() => choose("ticket")}>
            <Ticket size={20} className="text-[#c4b5fd]" /> Ingresso
          </button>
          <button className="card flex flex-col items-center gap-2 p-4 text-[11.5px] font-semibold" onClick={() => choose("reservation")}>
            <Star size={20} className="text-[#c4b5fd]" /> Reserva
          </button>
          <button className="card flex flex-col items-center gap-2 p-4 text-[11.5px] font-semibold" onClick={() => choose("document")}>
            <FileText size={20} className="text-[#c4b5fd]" /> Outro
          </button>
        </div>
      </Sheet>
    </>
  );
}

/* ————— adicionar memória ————— */

export function MemorySheet({
  open,
  onClose,
  itemId,
  placeTitle,
}: {
  open: boolean;
  onClose: () => void;
  itemId: string;
  placeTitle: string;
}) {
  const { addMemory, pushToast } = useApp();
  const [text, setText] = useState("");
  const [favorite, setFavorite] = useState("");

  const save = () => {
    if (!text.trim()) return;
    addMemory({ itemId, text: text.trim(), favorite: favorite.trim() || undefined });
    pushToast("Memória guardada", placeTitle);
    setText("");
    setFavorite("");
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Guardar memória">
      <p className="mb-4 text-[12.5px] text-[#b3add6]">{placeTitle}</p>
      <p className="label">Como foi esse momento</p>
      <textarea
        className="input mb-4 min-h-[110px] resize-none"
        placeholder="Essa foi uma das minhas partes favoritas do dia."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <p className="label">Momento favorito (opcional)</p>
      <input
        className="input mb-6"
        placeholder="Ex.: o pôr do sol no lago"
        value={favorite}
        onChange={(e) => setFavorite(e.target.value)}
      />
      <button className="btn btn-primary w-full" onClick={save} disabled={!text.trim()}>
        <Star size={15} />
        Guardar memória
      </button>
    </Sheet>
  );
}

/* ————— visualizar foto ————— */

export function PhotoViewer({
  src,
  onClose,
  onDelete,
}: {
  src: string | null;
  onClose: () => void;
  onDelete?: () => void;
}) {
  if (!src) return null;
  return (
    <div
      className="animate-overlay fixed inset-0 z-[92] mx-auto flex w-full max-w-[432px] flex-col bg-black/95"
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <span className="text-[12px] font-semibold tracking-[0.16em] text-[#b3add6] uppercase">
          Nossa memória
        </span>
        <div className="flex gap-2">
          {onDelete && (
            <button
              className="glass grid h-9 w-9 place-items-center rounded-full text-rose-300"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              aria-label="Apagar foto"
            >
              <Trash2 size={15} />
            </button>
          )}
          <button
            className="glass grid h-9 w-9 place-items-center rounded-full text-white"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="grid flex-1 place-items-center overflow-hidden px-3 pb-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Memória da viagem"
          className="animate-scale-in max-h-full w-full rounded-2xl object-contain"
        />
      </div>
    </div>
  );
}
