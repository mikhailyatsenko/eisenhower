# 07: Слот отмены и новый toast для Complete и Delete

**What to build:** Удаление срабатывает сразу, без системного `window.confirm`. После Complete и Delete снизу появляется один toast с Undo, который держится 6 секунд. Добавление и правка проходят молча. Срез E [спеки R1](../spec.md), решения: [Поведение toast-уведомлений](../../ui-ux-audit/issues/12-toast-behaviour.md), [Единая модель деструктивных действий](../../ui-ux-audit/issues/04-destructive-actions.md). Закрывает C2.

**Blocked by:** 02

**Status:** resolved

- [ ] Все отменяемые действия идут через один модуль отмены с одним слотом: выполнить действие, показать toast с текстом, запомнить, как откатить и какую задачу сфокусировать после отката. Новое действие заменяет слот и toast. Стека нет.
- [ ] Complete показывает «Task completed», Delete — «Task deleted». Кнопка «Undo» написана обычным регистром, «successfully» в текстах нет.
- [ ] Delete в матрице, в List view и одиночное удаление в Completed не вызывают `window.confirm`. Undo возвращает задачу на прежнюю позицию.
- [ ] Toast'ов добавления и правки нет, их Undo тоже. После самого Undo toast не показывается.
- [ ] Toast снизу по центру на всех ширинах, один за раз. Держится 6 с, ставится на паузу при наведении, при фокусе на Undo, при уходе со вкладки и пока палец на toast. Крестика нет. На touch toast смахивается. Escape его не закрывает.
- [ ] Контейнер `role="status"` (polite) стоит в DOM сразу после матрицы, Undo достижим по Tab.
- [ ] После Undo фокус на карточке восстановленной задачи, на `body` он не падает.
- [ ] При `prefers-reduced-motion` вместо выезда — fade.
- [ ] Тесты на главном seam: Delete без confirm (шпион падает при вызове), Undo восстанавливает позицию, новый toast заменяет старый, через 6 с toast исчезает, при наведении или фокусе на Undo — нет; добавление и правка без toast; `role="status"`.
- [ ] В ручной чек-лист добавлены сценарии Complete, Delete и Undo.

## Comments

**Итог (ветка `ux-r1`).**
- Toast свой, `react-toastify` удалён. Причины: его автозакрытие и анимации завязаны на `animationend`, а в jsdom это событие не приходит, поэтому 6 с не проверить. Кроме того, у него нет контейнера `role="status"` и паузы при фокусе на Undo.
- `shared/ui/toast`: один слот (`showToast`, `dismissToast`) и `ToastRegion`. `ToastRegion` — контейнер `role="status"` с именем «Notifications»: имя нужно, потому что свой `role="status"` есть и у live region dnd-kit. Длительность 6 с (`useCountdown` помнит остаток между паузами). Пауза при наведении мышью (только `pointerType === 'mouse'`, иначе тап залипает в hover), при фокусе внутри toast, при уходе со вкладки (`blur` и `visibilitychange`) и пока палец на toast. Toast смахивается на touch. Крестика нет, Escape не обрабатывается. Появление: `motion-safe` — выезд, `motion-reduce` — fade.
- `features/undo`: `performUndoable({ message, perform, focusTaskId })` и готовые `completeTask`, `deleteTask`, `deleteCompletedTask`, `restoreTask`. Действия store (`completeTaskAction`, `deleteTaskAction`, `deleteCompletedTaskAction`, `restoreTaskAction`) больше не показывают toast и не принимают `skipToast`, а возвращают `Revert` или `undefined`. У правки и добавления Undo и toast убраны.
- Фокус после Undo: `requestTaskFocusAction(id)` в `uiStore`, карточка ловит запрос через `useTaskFocusRequest`. Работает в матрице, List view и Completed; у `li` в Completed `tabIndex={-1}`.
- Слои: entities не видят features, поэтому `completeTask`/`deleteTask` передаются в матрицу пропсами `TaskMatrix → InteractWithMatrix → MatrixLayout`. `ToastRegion` стоит в `HomePage` сразу после `<TaskMatrix />`.
- Restore уже идёт через слот с «Restored to <название>», потому что старый модуль toast удалён. Тесты Undo для Restore и Move остаются за тикетом 09. Тест словаря B теперь проверяет название в toast Restore, раз toast добавления больше нет.
- Переходное, до тикета 10: «Failed to clear completed tasks», «All local tasks copied to cloud» и ошибка дедлайна в `EditTaskForm` показываются через тот же слот без Undo и вытесняют текущий Undo.
- Тесты: `src/app/tests/undoToast.test.tsx`, 13 шт. `renderHomePage` теперь сбрасывает toast, работает с `jest.useFakeTimers()` и заглушает `scrollIntoView`. Чек-лист дополнен: сценарий «Отменить Complete или Delete» и раздел «E. Toast и Undo». Все 15 наборов jest зелёные (52 теста), tsc и eslint чистые.
- Известные ограничения: `performUndoable` ждёт синхронизации с Firebase до показа toast. В облачном режиме toast появляется с задержкой сети, а два быстрых действия теоретически могут показать toast в обратном порядке. Если после Undo карточка не отрисована (другой квадрант развёрнут), запрос фокуса снимается при следующем действии. Кнопка «Copy to Cloud» из `TaskMatrix` встаёт по Tab между матрицей и Undo (её убирает срез K).
