# 09: Диалог «Delete all»

**What to build:** Пользователь удаляет все завершённые задачи через понятное модальное окно с числом задач и предупреждением, что отменить нельзя, а не через системный `window.confirm`. Срез O [спеки R4](../spec.md), раздел «O. Completed как секция List view» («Delete all»); решения: [Единая модель деструктивных действий](../../ui-ux-audit/issues/04-destructive-actions.md), [Поведение toast-уведомлений](../../ui-ux-audit/issues/12-toast-behaviour.md) (ошибка внутри диалога).

**Blocked by:** 07 (PR среза O — после 08 и 09)

**Status:** ready-for-agent

- [ ] «Delete all» в заголовке раскрытой Completed открывает нативный `<dialog>` на общем модальном компоненте: «Delete all 12 completed tasks?» («Delete 1 completed task?»), «This can't be undone.», кнопки «Delete all» и «Cancel», фокус на «Cancel».
- [ ] Подтверждение удаляет все завершённые задачи (в облаке batch), без Undo; диалог закрыт, секции нет, фокус по правилу «Completed опустела» из 07.
- [ ] Esc и «Cancel» закрывают без изменений, фокус на «Delete all».
- [ ] Сбой действия стора — «Couldn't delete. Try again» (`role="alert"`) внутри открытого диалога, кнопка снова доступна. Отказ облака — полоса Sync error, без сети — Pending changes.
- [ ] `window.confirm` в приложении нигде не вызывается.
- [ ] Главный seam: `dialog` «Delete all 3 completed tasks?», фокус на «Cancel»; Esc → фокус на «Delete all»; подтверждение → Completed нет, фокус не на `body`; отклонённое действие → `alert` внутри `dialog`; шпион `window.confirm` не вызван во всех сценариях O; axe на диалоге.
- [ ] Чек-лист: раздел O «Delete all» — клавиатура, VoiceOver (диалог с именем, фокус на «Cancel»), нигде нет системного окна подтверждения; раздел E/F про `window.confirm` обновить, если там упомянут.
- [ ] Закрыт последний тикет среза O (вместе с 08): предложить PR `ux-r4` → `main` с проверкой на Vercel preview.
