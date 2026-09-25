# 09: Диалог выхода при неотправленных правках

**What to build:** Если у вошедшего пользователя есть Pending changes, «Sign out» не выходит сразу, а спрашивает: «N changes aren't saved to your account yet. If you sign out now, they'll be lost.» — «Stay signed in» / «Sign out anyway». Без Pending changes выход идёт сразу. Срез J4 [спеки R2](../spec.md), решение: [Офлайн для вошедшего пользователя](../../ui-ux-audit/issues/17-offline-ux.md), строка «Выход из аккаунта».

**Blocked by:** 02, 03

**Status:** ready-for-agent

- [ ] Диалог — нативный `<dialog>` на общем модальном компоненте, инертный фон. Esc и «Stay signed in» закрывают диалог, фокус возвращается на «Sign out» или кнопку аккаунта.
- [ ] «Sign out anyway» выходит и стирает кэш на устройстве (тикет 03).
- [ ] N — число неподтверждённых записей этой сессии из модели синхронизации: одно действие — одна запись. Если Pending changes есть, а N неизвестно (правки прошлой сессии), текст без числа: «Some changes aren't saved to your account yet. If you sign out now, they'll be lost.»
- [ ] Без Pending changes «Sign out» выходит без диалога, как в 03.
- [ ] Тесты на главном seam: `goOffline`, две правки, «Sign out» — `dialog` с «2 changes…»; Esc и «Stay signed in» — вошедший, фокус вернулся; «Sign out anyway» — вышел, кэш фейка стёрт; без очереди — выход без диалога; `reload()` без сети с очередью — текст без числа; axe на диалоге.
- [ ] Чек-лист: диалог с клавиатуры и VoiceOver.
