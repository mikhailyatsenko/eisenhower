# 09: Move с Undo — drag между квадрантами и Restore

**What to build:** Если перетащить задачу в другой квадрант, появляется toast «Moved to Schedule» с Undo. Restore из Completed показывает «Restored to Schedule» с Undo. Срез E [спеки R1](../spec.md), решения: [Единая модель деструктивных действий](../../ui-ux-audit/issues/04-destructive-actions.md), [Поведение toast-уведомлений](../../ui-ux-audit/issues/12-toast-behaviour.md). Закрывает M6.

**Blocked by:** 08

**Status:** ready-for-agent

- [ ] В store есть отдельное действие Move: переносит задачу из квадранта в квадрант и запоминает исходную позицию для Undo. Им будут пользоваться Move to и `1–4` в тикетах 11 и 12.
- [ ] Drag вызывает Move, только если квадрант на старте и на финише drag'а разный. Смена порядка внутри квадранта проходит без toast.
- [ ] Toast «Moved to <название>», Undo возвращает задачу в исходный квадрант на исходную позицию и фокусирует её.
- [ ] Restore из Completed идёт через слот отмены с toast «Restored to <название>». Undo возвращает задачу в Completed на прежнее место.
- [ ] Тесты на главном seam: Restore даёт нужный toast, Undo откатывает. Move вызывается напрямую из теста или через Restore. Drag проверяется вручную: jsdom не выполняет drag, пункт добавлен в ручной чек-лист.
