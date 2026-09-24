# 09: Move с Undo — drag между квадрантами и Restore

**What to build:** Если перетащить задачу в другой квадрант, появляется toast «Moved to Schedule» с Undo. Restore из Completed показывает «Restored to Schedule» с Undo. Срез E [спеки R1](../spec.md), решения: [Единая модель деструктивных действий](../../ui-ux-audit/issues/04-destructive-actions.md), [Поведение toast-уведомлений](../../ui-ux-audit/issues/12-toast-behaviour.md). Закрывает M6.

**Blocked by:** 08

**Status:** resolved

- [x] В store есть отдельное действие Move: переносит задачу из квадранта в квадрант и запоминает исходную позицию для Undo. Им будут пользоваться Move to и `1–4` в тикетах 11 и 12.
- [x] Drag вызывает Move, только если квадрант на старте и на финише drag'а разный. Смена порядка внутри квадранта проходит без toast.
- [x] Toast «Moved to <название>», Undo возвращает задачу в исходный квадрант на исходную позицию и фокусирует её.
- [x] Restore из Completed идёт через слот отмены с toast «Restored to <название>». Undo возвращает задачу в Completed на прежнее место.
- [x] Тесты на главном seam: Restore даёт нужный toast, Undo откатывает. Move вызывается напрямую из теста или через Restore. Drag проверяется вручную: jsdom не выполняет drag, пункт добавлен в ручной чек-лист.

## Comments

**Итог (ветка `ux-r1`).**
- Move — `moveTaskAction(fromQuadrant, taskId, toQuadrant, index?)` в `tasksStore`: переносит задачу и возвращает `Revert`, который ставит её в исходный квадрант на исходную позицию. Перенос в тот же квадрант и отсутствующая задача дают `undefined`, поэтому toast не появляется. В `features/undo` добавлена `moveTask` с toast «Moved to <название>» и фокусом на задаче после Undo. Тикеты 11 и 12 (Move to, `1–4`) зовут её же.
- Drag: `features/interactWithMatrix` не видит `features/undo`, поэтому `moveTask` приходит пропсом `TaskMatrix → InteractWithMatrix` (как `completeTask` и `deleteTask` в 07). `useDragEvents` на старте запоминает квадрант и позицию задачи. Preview dnd-kit (`dragOverQuadrantAction`) по-прежнему двигает задачу между квадрантами прямо в store, без sync. На drop в другой квадрант preview откатывается в исходную точку, затем вызывается `moveTask` с позицией падения, так что Undo возвращает туда, откуда задачу взяли. Если квадрант на финише тот же, это тихая перестановка через `dragEndAction`: при drop на сам квадрант задача остаётся на исходном месте, даже если preview уводил её в чужой квадрант и обратно. Drop вне матрицы и отмена drag (`onDragCancel`, раньше не обрабатывалась) возвращают задачу на место. Обработчики читают задачи из store, а не из замыкания рендера: preview меняет store между рендерами.
- Restore уже шёл через слот с 07. Здесь добавлены тесты Undo для него. `restoreTaskAction` остался своим действием, а не частным случаем `moveTaskAction`: Restore переносит задачу из Completed, а не между квадрантами.
- Тесты: `src/app/tests/undoToast.test.tsx`, блок «Undo for Move and Restore», 3 шт. `moveTask` вызывается напрямую: toast, Undo на прежнее место, фокус; в тот же квадрант — без toast. Restore: «Restored to Schedule», Undo возвращает задачу на прежнее место в Completed с фокусом. Все 15 наборов jest зелёные (64 теста), tsc и eslint чистые.
- Drag проверен в Chrome (desktop 1280, синтетические mouse-события): перенос в пустой квадрант и на карточку в квадранте с задачами, Undo на прежнее место с фокусом, перестановка внутри квадранта без toast, «туда и обратно» без toast, Esc во время drag. Чек-лист дополнен пунктом 8 в разделе E, проверкой в E и описанием drag в «Что проверяется только вручную». Drag на touch не проверялся.
- Попутно отдельным коммитом: `'use client'` в `shared/api/auth/.../useAuth.ts`. После `dd5f793` серверный `AppShell` через barrel `@/features/auth` тянул хук без директивы, и `next dev` отдавал 500 на `/`.

