# Growth SP Visualization

Интерактивный дашборд команды **Growth** для анализа Story Points, целевых показателей PI, динамики состава и перформанс-ревью.

Данные: спринты **37–64** (история и PI), отчёты Jira, таблицы velocity команды.

---

## Стек

| Технология | Назначение |
|---|---|
| [Vite](https://vitejs.dev/) 6 | Сборка и dev-сервер |
| [React](https://react.dev/) 18 | UI |
| [TypeScript](https://www.typescriptlang.org/) 5 | Типизация |
| [Recharts](https://recharts.org/) 2 | Графики |

---

## Быстрый старт

**Требования:** Node.js 18+

```bash
cd growth-sp-viz
npm install
npm run dev
```

Откройте в браузере адрес из терминала (обычно http://localhost:5173).

### Production

```bash
npm run build
npm run preview
```

Статические файлы — в папке `dist/`. Её можно отдать любому static-хостингу (nginx, GitHub Pages, S3 и т.д.).

---

## Доступ по паролю

При входе показывается экран авторизации. Пароль задаётся в файле:

`src/constants/auth.ts`

После успешного входа сессия сохраняется в **sessionStorage** (действует до закрытия вкладки/браузера). Кнопка **«Выйти»** в шапке сбрасывает сессию.

> Защита реализована на клиенте. Для публичного деплоя рекомендуется дополнительно настроить серверную авторизацию или Basic Auth на reverse proxy.

---

## Вкладки дашборда

### Избранное

Собственный дашборд из отмеченных блоков. На каждом виджете — **☆** в правом верхнем углу. Список хранится в `localStorage` (`growth-sp-viz-favorites-v1`).

### PI: ключи и импакт

- KPI: ключи PI 10/11, пороги **67.5 SP** (без BUG) и **15.1** себестоимости
- График ключ vs факт (спр. 55–78), линия «без BUG», проекция 65–78
- Отклонение от ключа, себестоимость, структура SP (задачи / ошибки / короткие)
- Stacked bar: вклад сотрудников и **категорий ролей** (спр. 55–64)
- Pie-импакт по выбранному спринту
- Динамические таблицы с выбором периода

### История 37–63

- Масштаб: спринты, кварталы, блоки по 6 спр., годы/этапы
- Режим: **по людям** / **по категориям**, доли **%** или абсолютные SP
- Stacked bar с подписями % на сегментах, линии, pie-срез, таблица
- Legacy-графики среднего SP по блокам (раскрывающийся блок)

### Экспертные зоны

Домены компетенций по отчётам Jira: страховки, редизайн ЛК/ЖД, SmartMICE, миграции — по каждому из 7 сотрудников.

### Риски

Риски команды и персональные (bus factor, перегрузка FE, один QA, TL вне SP-метрик и др.) с уровнями и митигациями.

---

## Ключевые метрики

| Показатель | Значение | Пояснение |
|---|---|---|
| SP без BUG | **67.5** | Задачи + короткие; ошибки (BUG) не входят |
| Себестоимость (ключ) | **15.1** | База PI 10, спр. 55 |
| Себестоимость (цель PI 11) | **10.4** | Целевой тренд |
| Рост за PI | **+30%** | Траектория к спр. 73–78 |

---

## Команда и категории

**Состав (7 человек, оставшиеся к PI 10+):**  
Кальницкий, Шуликина, Данков, Федорова, Князев, Куличкина, Верин.

| Категория | Сотрудники |
|---|---|
| Бэкенд | Кальницкий, Шуликина, Данков |
| Фронт | Федорова, Князев |
| Ручной тест | Куличкина |
| Фронт / автотест / тимлид | Верин |

Маппинг — `src/data/roleCategories.ts`.

---

## Структура проекта

```
growth-sp-viz/
├── src/
│   ├── App.tsx                 # Роутинг вкладок, обёртка LoginGate
│   ├── main.tsx
│   ├── App.css
│   ├── constants/
│   │   ├── auth.ts             # Пароль и сессия
│   │   └── targets.ts          # 67.5, 15.1, цели PI
│   ├── context/
│   │   └── FavoritesContext.tsx
│   ├── data/
│   │   ├── spData.ts           # SP по спринтам и людям
│   │   ├── piTargets.ts        # Ключи и факт PI 10–11, проекция
│   │   ├── roleCategories.ts
│   │   ├── periodPresets.ts
│   │   ├── dashboardWidgets.ts # Реестр виджетов для избранного
│   │   ├── expertise.ts
│   │   └── risks.ts
│   ├── hooks/
│   │   └── useSprintRange.ts   # Выбор периода для таблиц
│   ├── utils/
│   │   ├── piStats.ts
│   │   ├── historyStats.ts
│   │   ├── periodStats.ts
│   │   ├── spAggregates.ts
│   │   └── chartLabels.tsx
│   ├── components/
│   │   ├── PiTargetsSection.tsx
│   │   ├── HistorySection.tsx
│   │   ├── ExpertiseSection.tsx
│   │   ├── RisksSection.tsx
│   │   ├── FavoritesSection.tsx
│   │   ├── LoginGate.tsx
│   │   ├── FavoriteWidget.tsx
│   │   ├── CategoryShareChart.tsx
│   │   ├── DynamicShareTable.tsx
│   │   ├── DynamicPiTable.tsx
│   │   └── PeriodRangeControl.tsx
│   └── types/
├── package.json
├── vite.config.ts
├── tsconfig.json
└── dist/                       # После npm run build
```

---

## Обновление данных

| Что менять | Файл |
|---|---|
| SP по спринтам | `src/data/spData.ts` |
| Ключи и факт PI | `src/data/piTargets.ts` |
| Пороги 67.5 / 15.1 | `src/constants/targets.ts` |
| Экспертные зоны | `src/data/expertise.ts` |
| Риски | `src/data/risks.ts` |
| Пароль входа | `src/constants/auth.ts` |

После правок перезапустите `npm run dev` или пересоберите `npm run build`.

**Примечание:** спринт **63** в `spData.ts` может быть плановым — замените на факт при появлении данных.

---

## Связанные материалы

В родительской папке `Мысли/`:

- `growth_sp_dynamics.md` — таблицы динамики SP по периодам
- `sp_analysis.py` — скрипт пересчёта периодов и генерации markdown

---

## Git

```bash
git init
git add .
git commit -m "Growth SP dashboard"
```

В `.gitignore`: `node_modules/`, `dist/`, `.env`, `.vite/`.

---

## Скрипты npm

| Команда | Действие |
|---|---|
| `npm run dev` | Dev-сервер с hot reload |
| `npm run build` | Проверка TypeScript + сборка в `dist/` |
| `npm run preview` | Локальный просмотр production-сборки |
