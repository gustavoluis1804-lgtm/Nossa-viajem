"use client";

import { Images, NotebookPen, Star } from "lucide-react";
import { useState } from "react";
import type { Route } from "@/lib/types";
import { useApp } from "@/services/store";
import { useSchedule } from "@/hooks/useSchedule";
import { itemDateLabel } from "@/lib/time";
import { AddPhotoButton, MemorySheet, PhotoViewer } from "../shared";
import { EmptyState, PageHeader, stagger } from "../ui";

export function MemoriasPage({ go }: { go: (r: Route) => void }) {
  const { state } = useApp();
  const sched = useSchedule(60000);
  const [memoryFor, setMemoryFor] = useState<{ id: string; title: string } | null>(null);
  const [viewer, setViewer] = useState<string | null>(null);

  const openMoments = sched.moments.filter((m) => !m.locked);
  const totalPhotos = state.photos.length;
  const totalMemories = state.memories.length;

  return (
    <div className="pb-32">
      <PageHeader
        title="Memórias"
        subtitle="um lugar para cada momento da viagem"
        right={
          <span className="chip chip-violet mt-1.5">
            <Images size={12} />
            {totalPhotos} {totalPhotos === 1 ? "foto" : "fotos"}
          </span>
        }
      />

      {totalPhotos === 0 && totalMemories === 0 && (
        <div className="animate-fade-up" style={stagger(1)}>
          <EmptyState
            icon={Images}
            title="O álbum da nossa viagem"
            body="Durante o dia, guarde fotos e escreva como foi cada momento. Depois da viagem, essa página vira a nossa memória permanente."
          />
        </div>
      )}

      <div className="mt-4 space-y-4 px-5">
        {openMoments.map((item, i) => {
          const photos = state.photos.filter((p) => p.itemId === item.id);
          const memories = state.memories.filter((m) => m.itemId === item.id);
          const cover = photos.length > 0 ? photos[photos.length - 1].src : item.image;
          const done = sched.completedSet.has(item.id);

          return (
            <article
              key={item.id}
              className="card animate-fade-up overflow-hidden"
              style={stagger(i + 2, 60)}
            >
              <button
                className="relative block h-28 w-full text-left"
                onClick={() => go({ name: "place", id: item.id })}
              >
                {cover ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={cover} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-[#221741] to-[#0d0a17]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0814] via-[#0b0814]/30 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <p className="font-display text-[17px] font-bold tracking-tight">{item.title}</p>
                  <p className="text-[11px] font-medium text-[#c4b5fd]">{itemDateLabel(item)}</p>
                </div>
                {done && (
                  <span className="chip chip-violet absolute top-3 right-3 !py-1 text-[10px]">
                    visitado
                  </span>
                )}
              </button>

              <div className="p-4">
                {photos.length > 0 && (
                  <div className="no-scrollbar -mx-1 mb-3 flex gap-2 overflow-x-auto px-1">
                    {photos.slice(-4).map((p) => (
                      <button
                        key={p.id}
                        className="h-16 w-14 flex-none overflow-hidden rounded-xl transition active:scale-95"
                        onClick={() => setViewer(p.src)}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.src} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                    {photos.length > 4 && (
                      <span className="grid h-16 w-14 flex-none place-items-center rounded-xl bg-white/5 text-[11px] font-bold text-[#b3add6]">
                        +{photos.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {memories.slice(0, 2).map((m) => (
                  <p
                    key={m.id}
                    className="mb-2 line-clamp-2 text-[12.5px] leading-relaxed text-[#c9c4e0] italic"
                  >
                    “{m.text}”
                  </p>
                ))}

                <div className="mt-1 flex items-center justify-between">
                  <div className="flex gap-1.5 text-[11px] text-[#a6a0cc]">
                    <span className="chip !py-1">
                      {photos.length} {photos.length === 1 ? "foto" : "fotos"}
                    </span>
                    <span className="chip !py-1">
                      {memories.length} {memories.length === 1 ? "memória" : "memórias"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <AddPhotoButton itemId={item.id} className="btn-soft !rounded-full !px-3 !py-2 text-[11.5px]">
                      Foto
                    </AddPhotoButton>
                    <button
                      className="btn btn-soft !rounded-full !px-3 !py-2 text-[11.5px]"
                      onClick={() => setMemoryFor({ id: item.id, title: item.title })}
                    >
                      <NotebookPen size={12} />
                      Memória
                    </button>
                  </div>
                </div>

                {memories.some((m) => m.favorite) && (
                  <p className="mt-2.5 flex items-center gap-1.5 text-[11px] text-[#a6a0cc]">
                    <Star size={11} className="text-[#c4b5fd]" />
                    {memories.find((m) => m.favorite)?.favorite}
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {memoryFor && (
        <MemorySheet
          open={Boolean(memoryFor)}
          onClose={() => setMemoryFor(null)}
          itemId={memoryFor.id}
          placeTitle={memoryFor.title}
        />
      )}
      <PhotoViewer src={viewer} onClose={() => setViewer(null)} />
    </div>
  );
}
