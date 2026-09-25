# 08: Одна матрица без переключателя

**What to build:** У пользователя одна Matrix: вошёл — она в облаке, не вошёл — на устройстве. Переключателя Local/Cloud, «Copy all tasks to Cloud» и `?cloud` больше нет, в меню аккаунта одна строка о месте хранения. Это префакторинг под Migration: после этого тикета задачи устройства у вошедшего не видны до тикета 09, поэтому PR K открывается только после всего среза. Срез K [спеки R3](../spec.md), решение: [Модель «одна матрица»](../../ui-ux-audit/issues/03-one-matrix-model.md).

**Blocked by:** 04, 05, 06, 07 (по умолчанию после I; по коду ничем — можно вести в отдельной ветке `ux-r3-08` от `ux-r3`, правила `CLAUDE.md`)

**Status:** ready-for-agent

- [ ] Storage выводится из того, есть ли вошедший пользователь; признак `activeState` и действия `switchToLocalTasks` / `switchToFirebaseTasks` удалены. Все действия стора, Completed, List view, панель и drag читают и пишут текущую матрицу по этому признаку.
- [ ] Удалены: фича `switchTaskSource` с обработкой `?cloud` (параметр просто игнорируется), сущность `taskSourceTabs`, фича `copyTasksToCloud` и `copyLocalTasksToFirebaseAction`, плитки «Cloud Matrix» / «Local Matrix» в меню аккаунта.
- [ ] В текущем угловом меню вошедшего вместо плиток строка «Saved to your Google account».
- [ ] Градиент `SyncGlow` показывается при вошедшем пользователе (удалит L).
- [ ] Схема Firestore и ключи localStorage не меняются; анонимная матрица по-прежнему в persist `tasksStore`.
- [ ] Тесты на главном seam: на странице нет «Cloud Matrix», «Local Matrix», «Copy all tasks to Cloud»; в меню «Saved to your Google account»; вошедший видит облачные задачи, после Sign out — задачи устройства; все тесты R1 и R2 зелёные, те, что трогали `activeState` (например, `noErrorToast`), переведены на действия пользователя; axe.
- [ ] Чек-лист, раздел K: открыть `/?cloud` вошедшим и анонимным — главная как обычно.
