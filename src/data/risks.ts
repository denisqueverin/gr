export type RiskSeverity = "high" | "medium" | "low";

export interface RiskItem {
  id: string;
  title: string;
  severity: RiskSeverity;
  description: string;
  mitigation?: string;
}

export interface MemberRisks {
  member: string;
  risks: RiskItem[];
}

export const TEAM_RISKS: RiskItem[] = [
  {
    id: "parallel-initiatives",
    title: "Три крупные инициативы параллельно",
    severity: "high",
    description:
      "Страховки, редизайн ЛК и SmartMICE идут одновременно — риск размывания фокуса и просадок velocity (спр. 56: Σ=35 SP).",
    mitigation: "Жёсткая приоритизация PI, не брать ниже ключа 67.5 SP без BUG.",
  },
  {
    id: "departures",
    title: "Потеря 3 senior-специалистов",
    severity: "high",
    description:
      "Уход Озёрского, Панина, Чекалдина — потеря экспертизы по страховкам, БД и общему BE-контексту.",
    mitigation: "Фиксация знаний, распределение зон между оставшимися BE.",
  },
  {
    id: "fe-concentration",
    title: "Концентрация FE-нагрузки",
    severity: "medium",
    description:
      "Федорова + Князев дают ~45% SP команды — bus factor на фронтенд и редизайн.",
    mitigation: "Кросс-обучение, документация компонентов, подключение Верина к FE-задачам.",
  },
  {
    id: "tl-sp-blind",
    title: "TL не виден в метриках SP",
    severity: "medium",
    description:
      "Верин: ~0.3 SP/спр в P4 при полной лидерской загрузке — риск недооценки вклада в ревью.",
    mitigation: "Отдельный учёт лидерства, автотестов и координации вне SP.",
  },
  {
    id: "cost-key",
    title: "Себестоимость vs ключ 15.1",
    severity: "medium",
    description:
      "В PI 10 были спринты с себестоимостью выше ключа (до 19.1 в спр. 57). Цель — снижение к 10.4.",
    mitigation: "Контроль доли BUG/ошибок, меньше переделок, стабильные требования.",
  },
  {
    id: "sp-key-nobug",
    title: "Просадки ниже ключа 67.5 SP (без BUG)",
    severity: "high",
    description:
      "Ключевой порог — 67.5 SP на задачи без категории BUG. Любой спринт ниже — нарушение траектории к PI 12–13.",
    mitigation: "Мониторинг факта «задачи + короткие» vs ключ, не компенсировать объёмом багфиксов.",
  },
  {
    id: "qa-bandwidth",
    title: "Один ручной QA на весь контур",
    severity: "medium",
    description:
      "Куличкина закрывает страховки, редизайн и SmartMICE — риск узкого горлышка перед релизами.",
    mitigation: "Автотесты (Верин), раннее вовлечение QA в планирование.",
  },
];

export const MEMBER_RISKS: MemberRisks[] = [
  {
    member: "Кальницкий",
    risks: [
      {
        id: "k-volatility",
        title: "Волатильность SP",
        severity: "medium",
        description: "Просадка −44% P2→P3 при разгоне команды, восстановление в P4.",
        mitigation: "Стабильный scope на BE-ядро, меньше переключений контекста.",
      },
      {
        id: "k-bus",
        title: "Bus factor по миграциям",
        severity: "medium",
        description: "Ключевой носитель контекста БД и миграций после ухода Панина.",
      },
    ],
  },
  {
    member: "Шуликина",
    risks: [
      {
        id: "sh-smartmice-ins",
        title: "Два домена параллельно",
        severity: "medium",
        description: "Страховки + SmartMICE BE — риск конфликта приоритетов.",
      },
    ],
  },
  {
    member: "Данков",
    risks: [
      {
        id: "d-ramp",
        title: "Относительно короткий tenure",
        severity: "low",
        description: "В команде с спр. 42 — ещё наращивает доменный контекст.",
        mitigation: "Парное программирование с Кальницким/Шуликиной.",
      },
    ],
  },
  {
    member: "Федорова",
    risks: [
      {
        id: "f-overload",
        title: "Перегрузка",
        severity: "high",
        description: "Стабильно 15+ SP/спр — риск выгорания и падения качества.",
        mitigation: "Балансировка с Князевым, защита от внеплановых задач.",
      },
      {
        id: "f-bus",
        title: "Bus factor редизайна ЛК",
        severity: "high",
        description: "Основной носитель контекста редизайна на FE.",
      },
    ],
  },
  {
    member: "Князев",
    risks: [
      {
        id: "kn-dual",
        title: "ЖД + ЛК одновременно",
        severity: "medium",
        description: "Два крупных UX-контура — риск задержек на одном из направлений.",
      },
    ],
  },
  {
    member: "Куличкина",
    risks: [
      {
        id: "ku-single-qa",
        title: "Единственный manual QA",
        severity: "high",
        description: "Весь регрессионный контур на одном человеке.",
        mitigation: "Чек-листы, автотесты, приоритизация регресса.",
      },
      {
        id: "ku-spike",
        title: "Скачки нагрузки",
        severity: "medium",
        description: "Спр. 62: 17 SP — пики перед релизами.",
      },
    ],
  },
  {
    member: "Верин",
    risks: [
      {
        id: "v-metrics",
        title: "Невидимость в SP-метриках",
        severity: "high",
        description: "0.3 SP/спр при роли TL + автотесты — искажение перформанс-ревью.",
      },
      {
        id: "v-triple-role",
        title: "Три роли в одном FTE",
        severity: "medium",
        description: "TL + FE + автотестер — риск нехватки времени на каждое направление.",
      },
    ],
  },
];

export const SEVERITY_LABELS: Record<RiskSeverity, string> = {
  high: "Высокий",
  medium: "Средний",
  low: "Низкий",
};
