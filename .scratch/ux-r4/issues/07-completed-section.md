# 07: Секция Completed с Restore и Delete

**What to build:** Пользователь находит завершённые задачи последней секцией List view, свежие сверху, и разбирает их через «выбери, потом действуй»: Restore возвращает задачу в начало её квадранта с toast и Undo, Delete удаляет сразу с Undo. Срез O [спеки R4](../spec.md), раздел «O. Completed как секция List view» (Секция, Порядок и объём, Строка завершённой задачи, Выделение и действия); решение: [Блок Completed](../../ui-ux-audit/issues/14-completed-section.md).

**Blocked by:** 05, 06

**Status:** ready-for-agent

- [ ] Последняя секция «Completed (N)», без завершённых её нет. По умолчанию свёрнута, сворачивание запоминается как у секций N. Заголовок липкий, без значка и «+»; кнопка «Completed, 12 tasks» с `aria-expanded`. Список — `listbox` «Completed».
- [ ] Новые сверху по `completedAt` для обоих Storage: Complete кладёт задачу в начало Completed.
- [ ] Строка: текст (приглушённо зачёркнут, контраст ≥ 4.5:1), подпись исходного квадранта словом, «Completed …» форматом M со временем. Без даты создания, дедлайна и кнопок. Задача без квадранта подписана квадрантом, куда её вернёт Restore.
- [ ] Выделение → панель Restore / Delete / «×» с подписью «Actions for “…”», desktop и телефон. Delete/Backspace — Delete, `Ctrl/Cmd+Z` — Undo, Esc и «×» снимают. `1–4`, C, Space, E, Enter, `N` не действуют.
- [ ] Completed в roving tabindex List view: ↑↓ продолжают из Eliminate и обратно, ←→ считают её последней секцией, свёрнутая пропускается.
- [ ] Restore — в начало исходного квадранта, toast «Restored to <квадрант>» с Undo; Undo — обратно в Completed на прежнее место, фокус на ней. Delete — сразу, toast «Task deleted» с Undo.
- [ ] Фокус после Restore и Delete: следующая завершённая, иначе предыдущая; Completed опустела — последняя задача последней раскрытой секции, иначе контейнер List view. Не `body`.
- [ ] `CompletedTasksAccordion`, его автопрокрутка и страничный `CompletedTasks` удалены. «Delete all» временно — кнопка в заголовке раскрытой секции с прежним `window.confirm` (диалог — тикет 09).
- [ ] Вошедший без сети: Restore и Delete видны сразу, копятся в Pending changes.
- [ ] Главный seam: без завершённых секции нет; по умолчанию свёрнута, раскрытие переживает `reload()`; только что завершённая задача первая; строка с «Schedule» и «Completed …», без «Created»; выделение → `toolbar` с «Restore» и «Delete»; Restore → первая в `listbox` «Schedule», `status` «Restored to Schedule», Undo → на прежнем месте в Completed и в фокусе; `Delete` → `status` «Task deleted», Undo возвращает; `2` ничего не делает; Restore последней → фокус не на `body`; вошедший `goOffline`/`goOnline` → `serverTasks()`; axe с раскрытой Completed и панелью. Тесты, трогавшие аккордеон (`dialogs`, `noErrorToast`, `selectionPanel`), переходят на секцию.
- [ ] Чек-лист: последний пункт основного сценария «Завершить задачу» (возврат из секции Completed); раздел O «Секция Completed» — Restore / Delete / «×» тапом на iPhone, клавиатура, VoiceOver на подписи квадранта и дате.
