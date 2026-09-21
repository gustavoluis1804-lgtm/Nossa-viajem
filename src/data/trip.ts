import type { AppState, CheckItem, SecretInfo, TripItem } from "@/lib/types";

export const IMG = {
  planetario:
    "https://images.pexels.com/photos/20465952/pexels-photo-20465952.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  pavilhao:
    "https://images.pexels.com/photos/37889994/pexels-photo-37889994.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  liberdade:
    "https://images.pexels.com/photos/30539380/pexels-photo-30539380.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  aclimacao:
    "https://images.pexels.com/photos/39495283/pexels-photo-39495283.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  skylineSunset:
    "https://images.pexels.com/photos/14917406/pexels-photo-14917406.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
};

export const ITINERARY: TripItem[] = [
  // ——— DIA 20 DE OUTUBRO ———
  {
    id: "d1-saida",
    group: "20",
    dayOffset: 0,
    start: "22:00",
    end: "23:40",
    title: "Saída de Sorocaba para São Paulo",
    description: "Pegar a estrada com calma. O começo da nossa primeira viagem.",
    category: "transport",
  },
  {
    id: "d1-chegada",
    group: "20",
    dayOffset: 0,
    endOffset: 1,
    start: "23:40",
    end: "00:30",
    title: "Chegada e hospedagem",
    description: "Check-in na hospedagem e descanso para o grande dia.",
    category: "lodging",
  },
  // ——— DIA 21 DE OUTUBRO ———
  {
    id: "d2-acordar",
    group: "21",
    dayOffset: 1,
    start: "06:00",
    title: "Acordar",
    description: "Começar o dia devagar, sem pressa.",
    category: "prepare",
  },
  {
    id: "d2-arrumar",
    group: "21",
    dayOffset: 1,
    start: "06:00",
    end: "06:30",
    title: "Banho e se arrumar",
    category: "prepare",
  },
  {
    id: "d2-cafe",
    group: "21",
    dayOffset: 1,
    start: "06:30",
    end: "06:50",
    title: "Café da manhã",
    description: "Reforçar antes de sair e começar o dia com calma.",
    category: "meal",
  },
  {
    id: "d2-transp-ibirapuera",
    group: "21",
    dayOffset: 1,
    start: "06:50",
    end: "07:15",
    title: "Deslocamento até o Parque Ibirapuera",
    description: "Saída cedo para aproveitar os três primeiros passeios sem mexer no horário da Liberdade.",
    category: "transport",
  },
  {
    id: "d2-ibirapuera",
    group: "21",
    dayOffset: 1,
    start: "07:15",
    end: "08:15",
    title: "Parque Ibirapuera — lagos e jardins",
    description:
      "Primeira parada do dia: caminhar pelos lagos e jardins, conversar e tirar fotos com calma.",
    category: "place",
    moment: true,
    address: "Parque Ibirapuera — São Paulo",
    mapQuery: "Parque Ibirapuera, São Paulo",
    image: IMG.pavilhao,
    wikiTitle: "Parque Ibirapuera",
    imageSearch: "Parque Ibirapuera São Paulo lago jardins",
    tips: ["Caminhar sem pressa", "Aproveitar os lagos e jardins", "Tirar algumas fotos juntos"],
  },
  {
    id: "d2-transp-afro",
    group: "21",
    dayOffset: 1,
    start: "08:15",
    end: "09:00",
    title: "Deslocamento até o Museu Afro Brasil",
    category: "transport",
  },
  {
    id: "d2-afro",
    group: "21",
    dayOffset: 1,
    start: "09:00",
    end: "10:00",
    title: "Museu Afro Brasil Emanoel Araujo",
    description:
      "Cerca de uma hora para conhecer as áreas que mais chamarem atenção, sem transformar a visita em uma corrida.",
    category: "place",
    moment: true,
    address: "Parque Ibirapuera — São Paulo",
    mapQuery: "Museu Afro Brasil Emanoel Araujo",
    wikiTitle: "Museu Afro Brasil",
    imageSearch: "Museu Afro Brasil Emanoel Araujo São Paulo",
    tips: ["Escolher algumas salas para ver com calma", "Guardar um pouco de tempo para a saída", "Registrar o momento sem pressa"],
  },
  {
    id: "d2-transp-zoo",
    group: "21",
    dayOffset: 1,
    start: "10:00",
    end: "10:40",
    title: "Deslocamento até o Zoológico",
    category: "transport",
  },
  {
    id: "d2-zoologico",
    group: "21",
    dayOffset: 1,
    start: "10:40",
    end: "11:40",
    title: "Zoológico de São Paulo",
    description:
      "Uma visita mais enxuta, escolhendo os espaços que vocês mais querem ver para manter o restante do roteiro no horário.",
    category: "place",
    moment: true,
    address: "Zoológico de São Paulo — São Paulo",
    mapQuery: "Zoológico de São Paulo",
    wikiTitle: "Zoológico de São Paulo",
    imageSearch: "Zoológico de São Paulo parque zoológico",
    tips: ["Escolher os animais que mais querem ver", "Evitar tentar conhecer o zoológico inteiro", "Separar alguns minutos para fotos"],
  },
  {
    id: "d2-transp-liberdade",
    group: "21",
    dayOffset: 1,
    start: "11:40",
    end: "12:00",
    title: "Deslocamento até a Liberdade",
    category: "transport",
  },
  {
    id: "d2-liberdade",
    group: "21",
    dayOffset: 1,
    start: "12:00",
    end: "15:00",
    title: "Liberdade",
    description: "Almoço, lojinhas, doces e aquele vai-e-vem gostoso do bairro mais oriental da cidade.",
    category: "place",
    moment: true,
    address: "Bairro da Liberdade — São Paulo",
    mapQuery: "Liberdade, São Paulo",
    image: IMG.liberdade,
    wikiTitle: "Liberdade (bairro de São Paulo)",
    imageSearch: "Liberdade São Paulo bairro lanternas",
    tips: [
      "Almoçar sem pressa",
      "Visitar as lojinhas da Rua Galvão Bueno",
      "Experimentar doces (mochi!)",
      "Passear pelo bairro",
      "Tirar fotos nas lanternas",
      "Escolher lembrancinhas",
    ],
  },
  {
    id: "d2-transp-aclimacao",
    group: "21",
    dayOffset: 1,
    start: "15:00",
    end: "15:20",
    title: "Deslocamento",
    category: "transport",
  },
  {
    id: "d2-aclimacao",
    group: "21",
    dayOffset: 1,
    start: "15:20",
    end: "17:00",
    title: "Parque da Aclimação",
    description:
      "A parte mais calma do dia. Descansar, conversar, andar pelo parque e ficar perto do lago para recuperar as energias.",
    category: "place",
    moment: true,
    address: "Rua Muniz de Sousa, 1119 — Aclimação, São Paulo",
    mapQuery: "Parque da Aclimação",
    image: IMG.aclimacao,
    wikiTitle: "Parque da Aclimação",
    imageSearch: "Parque da Aclimação São Paulo lago",
    tips: ["Sentar perto do lago", "Caminhar sem destino", "Recuperar energia para o resto do dia"],
  },
  {
    id: "d2-transp-secreto",
    group: "21",
    dayOffset: 1,
    start: "17:00",
    end: "17:40",
    title: "Deslocamento para o próximo lugar",
    description: "A caminho da última parada.",
    category: "transport",
  },
  {
    id: "d2-secreto",
    group: "21",
    dayOffset: 1,
    start: "17:40",
    end: "19:00",
    title: "Sampa Sky",
    description: "Um mirante de vidro a 150 metros do chão, no alto do Mirante do Vale. A ideia é chegar no fim da tarde e ver São Paulo acender lá embaixo.",
    category: "place",
    moment: true,
    address: "Edifício Mirante do Vale · Praça Pedro Lessa, 110 — Centro, São Paulo",
    mapQuery: "Sampa Sky, São Paulo",
    image: "https://images.pexels.com/photos/17007760/pexels-photo-17007760.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    wikiTitle: "Sampa Sky",
    imageSearch: "Sampa Sky São Paulo Mirante do Vale",
    tips: ["Chegar com a luz do fim de tarde", "Fotos no deck de vidro", "Ver a cidade acender lá embaixo"],
  },
  {
    id: "d2-transp-restaurante",
    group: "21",
    dayOffset: 1,
    start: "19:00",
    end: "19:30",
    title: "Ir para o restaurante",
    category: "transport",
  },
  {
    id: "d2-jantar",
    group: "21",
    dayOffset: 1,
    start: "19:30",
    end: "21:00",
    title: "Jantar juntos",
    description: "Terminar o dia com calma, boa comida e boa companhia.",
    category: "meal",
    moment: true,
  },
  {
    id: "d2-volta",
    group: "21",
    dayOffset: 1,
    start: "21:00",
    end: "21:40",
    title: "Voltar para a hospedagem",
    category: "transport",
  },
  {
    id: "d2-livre",
    group: "21",
    dayOffset: 1,
    start: "21:40",
    end: "23:15",
    title: "Tempo livre na hospedagem",
    description: "Descansar, conversar e aproveitar o final do dia juntos.",
    category: "rest",
  },
  {
    id: "d2-organizar",
    group: "21",
    dayOffset: 1,
    start: "23:15",
    end: "23:30",
    title: "Organizar as coisas",
    category: "prepare",
  },
  {
    id: "d2-checkout",
    group: "21",
    dayOffset: 1,
    start: "23:30",
    title: "Saída da hospedagem",
    category: "lodging",
  },
  {
    id: "d2-retorno",
    group: "21",
    dayOffset: 2,
    start: "00:00",
    title: "Saída de São Paulo para Sorocaba",
    description: "Volta para casa com o coração cheio.",
    category: "transport",
  },
];

/** Mescla os dados padrão com hospedagem, restaurante e edições feitas no app. */
export function resolveItems(state: AppState, _secret: SecretInfo | null = null): TripItem[] {
  const s = state.settings;
  return ITINERARY.map((base) => {
    const item: TripItem = { ...base, tips: base.tips ? [...base.tips] : undefined };

    if (item.id === "d1-chegada" && s.lodging) {
      item.title = `Hospedagem · ${s.lodging}`;
      item.address = s.lodgingAddress || item.address;
      if (s.lodgingAddress) item.mapQuery = s.lodgingAddress;
      item.description = "Check-in na hospedagem e descanso para o grande dia.";
    }
    if (item.id === "d2-transp-restaurante" && s.restaurant) {
      item.title = `Ir para ${s.restaurant}`;
    }
    if (item.id === "d2-jantar" && s.restaurant) {
      item.description = `${s.restaurant}. Terminar o dia com calma, boa comida e boa companhia.`;
      if (s.restaurantAddress) {
        item.address = s.restaurantAddress;
        item.mapQuery = s.restaurantAddress;
      }
    }
    if (item.id === "d2-volta" && s.lodging) {
      item.title = `Voltar para ${s.lodging}`;
    }

    const ov = state.overrides[item.id];
    if (ov) Object.assign(item, ov);
    return item;
  });
}

export function momentsOf(items: TripItem[]): TripItem[] {
  return items.filter((i) => i.moment);
}

export const DEFAULT_CHECKLIST: CheckItem[] = [
  { id: "c-docs", label: "Documentos (RG / CNH)", done: false },
  { id: "c-celular", label: "Celular", done: false },
  { id: "c-carregador", label: "Carregador", done: false },
  { id: "c-powerbank", label: "Power bank", done: false },
  { id: "c-dinheiro", label: "Dinheiro", done: false },
  { id: "c-cartao", label: "Cartão", done: false },
  { id: "c-agua", label: "Garrafa de água", done: false },
  { id: "c-roupa", label: "Roupas para os dois dias", done: false },
  { id: "c-pessoais", label: "Itens pessoais", done: false },
  { id: "c-chuva", label: "Guarda-chuva", done: false },
  { id: "c-reserva", label: "Reserva da hospedagem", done: false },
  { id: "c-ingressos", label: "Ingressos", done: false },
  { id: "c-transporte", label: "Confirmação de transporte", done: false },
];

export const EXPENSE_CATEGORIES = [
  "transporte",
  "hospedagem",
  "café da manhã",
  "almoço",
  "jantar",
  "lanches",
  "ingressos",
  "compras",
  "lembranças",
  "emergência",
  "outros",
];

export const DEFAULT_REVEAL_PHRASE = "Guardei uma vista especial para o final do nosso dia.";
