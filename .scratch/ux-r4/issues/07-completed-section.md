# 07: Секция Completed с Restore и Delete

**What to build:** Пользователь находит завершённые задачи последней секцией List view, свежие сверху, и разбирает их через «выбери, потом действуй»: Restore возвращает задачу в начало её квадранта с toast и Undo, Delete удаляет сразу с Undo. Срез O [спеки R4](../spec.md), раздел «O. Completed как секция List view» (Секция, Порядок и объём, Строка завершённой задачи, Выделение и действия); решение: [Блок Completed](../../ui-ux-audit/issues/14-completed-section.md).

**Blocked by:** 05, 06

**Status:** resolved

- [x] Последняя секция «Completed (N)», без завершённых её нет. По умолчанию свёрнута, сворачивание запоминается как у секций N. Заголовок липкий, без значка и «+»; кнопка «Completed, 12 tasks» с `aria-expanded`. Список — `listbox` «Completed».
- [x] Новые сверху по `completedAt` для обоих Storage: Complete кладёт задачу в начало Completed.
- [x] Строка: текст (приглушённо зачёркнут, контраст ≥ 4.5:1), подпись исходного квадранта словом, «Completed …» форматом M со временем. Без даты создания, дедлайна и кнопок. Задача без квадранта подписана квадрантом, куда её вернёт Restore.
- [x] Выделение → панель Restore / Delete / «×» с подписью «Actions for “…”», desktop и телефон. Delete/Backspace — Delete, `Ctrl/Cmd+Z` — Undo, Esc и «×» снимают. `1–4`, C, Space, E, Enter, `N` не действуют.
- [x] Completed в roving tabindex List view: ↑↓ продолжают из Eliminate и обратно, ←→ считают её последней секцией, свёрнутая пропускается.
- [x] Restore — в начало исходного квадранта, toast «Restored to <квадрант>» с Undo; Undo — обратно в Completed на прежнее место, фокус на ней. Delete — сразу, toast «Task deleted» с Undo.
- [x] Фокус после Restore и Delete: следующая завершённая, иначе предыдущая; Completed опустела — последняя задача последней раскрытой секции, иначе контейнер List view. Не `body`.
- [x] `CompletedTasksAccordion`, его автопрокрутка и страничный `CompletedTasks` удалены. «Delete all» временно — кнопка в заголовке раскрытой секции с прежним `window.confirm` (диалог — тикет 09).
- [x] Вошедший без сети: Restore и Delete видны сразу, копятся в Pending changes.
- [x] Главный seam: без завершённых секции нет; по умолчанию свёрнута, раскрытие переживает `reload()`; только что завершённая задача первая; строка с «Schedule» и «Completed …», без «Created»; выделение → `toolbar` с «Restore» и «Delete»; Restore → первая в `listbox` «Schedule», `status` «Restored to Schedule», Undo → на прежнем месте в Completed и в фокусе; `Delete` → `status` «Task deleted», Undo возвращает; `2` ничего не делает; Restore последней → фокус не на `body`; вошедший `goOffline`/`goOnline` → `serverTasks()`; axe с раскрытой Completed и панелью. Тесты, трогавшие аккордеон (`dialogs`, `noErrorToast`, `selectionPanel`), переходят на секцию.
- [x] Чек-лист: последний пункт основного сценария «Завершить задачу» (возврат из секции Completed); раздел O «Секция Completed» — Restore / Delete / «×» тапом на iPhone, клавиатура, VoiceOver на подписи квадранта и дате.

## Comments

**Что сделано.**

- **Секция** — `entities/matrixLayout/components/completedSection` в конце `ListLayout`: липкий заголовок на стилях `SECTION_HEADER_STYLES` без значка и «+», кнопка «Completed, 3 tasks» с `aria-expanded`/`aria-controls` и `data-section-toggle`, `listbox` «Completed». Раскрытие — `uiStore.isCompletedExpanded` (по умолчанию `false`, сохраняется рядом с `collapsedSections`), действие `setCompletedExpandedAction`. Свернуть Completed с выделенной завершённой задачей снимает выделение, как у секций N. «Delete all» — кнопка в заголовке раскрытой секции с прежним `window.confirm` и `role="alert"` при сбое (до 09).
- **Строка** — `components/completedTaskItem`: текст зачёркнут (gray-700/300 на gray-100/800), точка цвета квадранта `aria-hidden`, название квадранта словом, «Completed …» через `formatDate` со временем. Задача без `quadrantKey` подписана `RESTORE_FALLBACK_QUADRANT`. Клик/фокус выделяют как у карточки: общий хук `useSelectableTask` вынесен из `TaskItem`, классы выделения — `OPTION_SELECTION_CLASS`.
- **Порядок** — `newestCompletedFirst` в `tasksStore/lib`, `TaskMatrix` сортирует через `useMemo` (у старых локальных данных порядок хранения — от старых к новым). `completeTaskAction` кладёт в начало Completed; Undo Restore передаёт прежние индекс и `completedAt`, поэтому задача возвращается на место и в облаке. `restoreTaskAction` без индекса ставит в начало квадранта.
- **Клавиатура** — `listSections`/`listStops`/`listTabStop` получили `shownCompleted` (пусто в Matrix и у свёрнутой Completed), `ListSection.quadrantKey` → `area: TaskArea`. `useMatrixKeys`: у выделенной завершённой только стрелки, Delete/Backspace, Esc, Tab в панель; `1–4`, `N`, C, Space, E, Enter не действуют — и у завершённой, оставленной в фокусе после Esc.
- **Панель** — `ActionToolbar` с вариантом `completedTask`: Restore / Delete / «×», телефонный ряд из двух кнопок. `TaskActionPanel` различает, откуда ушла выделенная задача: из квадранта — сосед в квадранте (как было), из Completed — следующая завершённая, иначе предыдущая, иначе последняя задача раскрытых секций (`lastShownTaskId`), иначе контейнер List view (`useFocusAfterAction`). Тулбары двух видов с разными `key`, чтобы фокус не переезжал с Restore на Complete.
- **Удалено** — `entities/completedTasksAccordion` с автопрокруткой, `pages/home/ui/CompletedTasks.tsx`, иконки `restore-icon.svg` и `delete-icon.svg`.
- **Тесты** — `completedSection.test` на главном seam (21 сценарий из тикета плюс подпись без квадранта, Esc/«×», стрелки ←→, пустой List view, телефонная панель). `noErrorToast`, `offlineWrites`, `quadrantVocabulary`, `undoToast` переведены на секцию; `dialogs` и `selectionPanel` аккордеон не трогали.
- **Чек-лист** — раздел O «Секция Completed», последний пункт «Завершить задачу», шаги E и J про Completed.

**Решения, которых нет в тикете.**

- После Restore и Delete кнопкой панели фокус остаётся на панели, выделение переходит к следующей завершённой — так же, как Complete кнопкой в матрице. С клавиатуры (`Del`) фокус на следующей строке.
- Когда Completed опустела, последняя задача раскрытых секций не только в фокусе, но и выделена (фокус на задаче выделяет её, J1). Это может быть только что восстановленная задача, если её секция была пуста.
- Undo Restore у задачи без `quadrantKey` (до R1) записывает ей квадрант по умолчанию; подпись та же.

**Проверено в Chrome** (dev на 3100, изолированный контекст): порядок новых сверху, подписи квадрантов и дат, панель Restore / Delete / «×», Restore в начало Do First с toast «Restored to Do First» и выделением следующей завершённой; ошибок в консоли нет. VoiceOver и iPhone — пункты чек-листа.

**Ревью (стандарты и спека), что оставлено.** Тройка `(tasks, collapsedSections, shownCompleted)` ходит вместе через `listSections`, `listStops`, `listTabStop` и `useMatrixKeys` — кандидат в один тип «содержимое List view». Пара `location` / `completedLocation` в `TaskActionPanel` и `useMatrixKeys` ветвится в нескольких местах; `ActionToolbar` рисует два вида панели в одном файле. Точки цвета квадранта в строке (приглушённые) и в Move to (яркие) — разные константы сознательно.
