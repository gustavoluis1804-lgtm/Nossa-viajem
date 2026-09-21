import { TRIP_START } from "@/lib/time";

const PHRASES = [
  "Cada dia a menos é uma memória a mais chegando.",
  "A melhor parte do roteiro é viver tudo ao seu lado.",
  "São Paulo está esperando por nós dois.",
  "Nossa primeira viagem já começou na expectativa.",
  "Não é só um destino. É uma história nossa.",
  "Levar pouca bagagem e voltar cheio de memórias.",
  "Tem uma surpresa guardada no fim desse caminho.",
  "Dois dias, muitos momentos e nós dois.",
  "O tempo passa. A vontade de viajar com você só aumenta.",
  "Um roteiro bonito fica melhor quando é nosso.",
  "Falta pouco para transformar planos em lembranças.",
  "A estrada também faz parte da nossa história.",
];

export function phraseOfDay(now: Date): string {
  const remaining = Math.max(0, Math.floor((TRIP_START.getTime() - now.getTime()) / 86_400_000));
  return PHRASES[remaining % PHRASES.length];
}
