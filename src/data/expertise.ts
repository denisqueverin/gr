import type { TeamMember } from "./spData";

export type ExpertiseLevel = "primary" | "secondary";

export interface ExpertiseZone {
  id: string;
  title: string;
  level: ExpertiseLevel;
  initiatives: string[];
  evidence: string[];
}

export interface MemberExpertise {
  member: TeamMember;
  role: string;
  zones: ExpertiseZone[];
}

/** Экспертные зоны по отчётам Jira / PI (спр. 42–62) */
export const MEMBER_EXPERTISE: MemberExpertise[] = [
  {
    member: "Кальницкий",
    role: "Backend",
    zones: [
      {
        id: "ins-analytics",
        title: "Страховки — аналитика и закрывающие",
        level: "primary",
        initiatives: ["Страховки авиа"],
        evidence: ["US-5.3 сводная аналитика в закрывающих", "спр. 46–47"],
      },
      {
        id: "migrations",
        title: "Миграции и техдолг БД",
        level: "primary",
        initiatives: ["Технический долг", "Календарь"],
        evidence: ["DB-миграции", "выгрузки календаря", "ядро команды с спр. 25"],
      },
      {
        id: "core-be",
        title: "Ядро бэкенда команды",
        level: "secondary",
        initiatives: ["Общий контур"],
        evidence: ["Стабильный участник всех фаз", "средний SP 6.9 в P4"],
      },
    ],
  },
  {
    member: "Шуликина",
    role: "Backend",
    zones: [
      {
        id: "ins-config",
        title: "Страховки — настройка тарифов",
        level: "primary",
        initiatives: ["Страховки авиа"],
        evidence: ["US-12 настройка тарифа, подаккаунты", "спр. 43–46"],
      },
      {
        id: "smartmice-be",
        title: "SmartMICE — backend",
        level: "primary",
        initiatives: ["SmartMICE"],
        evidence: ["API и бизнес-логика WL", "MVP в проде"],
      },
      {
        id: "integrations",
        title: "Интеграции и API",
        level: "secondary",
        initiatives: ["Страховки", "SmartMICE"],
        evidence: ["Кросс-функциональные задачи с FE/QA"],
      },
    ],
  },
  {
    member: "Данков",
    role: "Backend",
    zones: [
      {
        id: "ins-features",
        title: "Страховки — продуктовые фичи",
        level: "primary",
        initiatives: ["Страховки авиа"],
        evidence: ["US-4 добавление АБ со страховкой", "US-5.3 аналитика", "спр. 48"],
      },
      {
        id: "avia-domain",
        title: "Авиа-домен",
        level: "secondary",
        initiatives: ["Страховки", "Редизайн"],
        evidence: ["Рост SP +30% P3→P4", "стабильная нагрузка 6.9 SP/спр"],
      },
    ],
  },
  {
    member: "Федорова",
    role: "Frontend",
    zones: [
      {
        id: "redesign-lk",
        title: "Редизайн ЛК и онбординг",
        level: "primary",
        initiatives: ["Редизайн ЛК"],
        evidence: ["Поэтапная раскатка на клиентов", "лидер по SP среди FE (~15)"],
      },
      {
        id: "ins-fe",
        title: "Страховки — UI",
        level: "primary",
        initiatives: ["Страховки авиа"],
        evidence: ["Витрина страховок", "интеграция с редизайном"],
      },
      {
        id: "fe-velocity",
        title: "Высокая delivery-нагрузка FE",
        level: "secondary",
        initiatives: ["Все FE-инициативы"],
        evidence: ["~22% доли команды в P4", "рост +20% P3→P4"],
      },
    ],
  },
  {
    member: "Князев",
    role: "Frontend",
    zones: [
      {
        id: "railway-redesign",
        title: "Редизайн ЖД",
        level: "primary",
        initiatives: ["Редизайн ЖД"],
        evidence: ["Компоненты, демо, прод-баги", "ключевой UX ЖД"],
      },
      {
        id: "redesign-lk",
        title: "Редизайн ЛК",
        level: "primary",
        initiatives: ["Редизайн ЛК", "Страховки"],
        evidence: ["Параллельная работа с Федоровой", "спр. 42+"],
      },
      {
        id: "growth-fe",
        title: "Рост производительности",
        level: "secondary",
        initiatives: ["Команда"],
        evidence: ["+44% SP P3→P4", "11.2 SP/спр в P4"],
      },
    ],
  },
  {
    member: "Куличкина",
    role: "QA (ручное тестирование)",
    zones: [
      {
        id: "ins-qa",
        title: "Страховки — приёмка",
        level: "primary",
        initiatives: ["Страховки авиа"],
        evidence: ["US-11–13 регрессия", "спр. 42–54"],
      },
      {
        id: "redesign-qa",
        title: "Редизайн — регрессия",
        level: "primary",
        initiatives: ["Редизайн ЛК", "Редизайн ЖД"],
        evidence: ["Кросс-браузерное тестирование", "раскатка на клиентов"],
      },
      {
        id: "smartmice-qa",
        title: "SmartMICE — тестирование",
        level: "secondary",
        initiatives: ["SmartMICE"],
        evidence: ["MVP и итерация 2", "рост SP +26% P3→P4"],
      },
    ],
  },
  {
    member: "Верин",
    role: "Team Lead / FE / автотесты",
    zones: [
      {
        id: "ins-bo",
        title: "Страховки — менеджер БО",
        level: "primary",
        initiatives: ["Страховки авиа"],
        evidence: ["US-11 настройка отображения тарифов", "US-12 с Шуликиной", "спр. 43–46"],
      },
      {
        id: "automation",
        title: "Автотесты и качество",
        level: "primary",
        initiatives: ["Качество", "SmartMICE"],
        evidence: ["Автотест-контур", "код-ревью"],
      },
      {
        id: "team-lead",
        title: "Тимлидство и координация",
        level: "primary",
        initiatives: ["Команда"],
        evidence: [
          "Планирование PI",
          "координация 3 инициатив",
          "низкий личный SP из-за лидерской нагрузки",
        ],
      },
    ],
  },
];

export const INITIATIVE_SUMMARY = [
  "Страховки авиабилетов (US-4–13, MVP 4.0)",
  "Редизайн ЛК + онбординг",
  "SmartMICE (WL + отдельный продукт)",
  "Редизайн ЖД",
  "Миграции БД и технический долг",
];
