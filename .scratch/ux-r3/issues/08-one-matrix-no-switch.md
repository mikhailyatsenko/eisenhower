# 08: Одна матрица без переключателя

**What to build:** У пользователя одна Matrix: вошёл — она в облаке, не вошёл — на устройстве. Переключателя Local/Cloud, «Copy all tasks to Cloud» и `?cloud` больше нет, в меню аккаунта одна строка о месте хранения. Это префакторинг под Migration: после этого тикета задачи устройства у вошедшего не видны до тикета 09, поэтому PR K открывается только после всего среза. Срез K [спеки R3](../spec.md), решение: [Модель «одна матрица»](../../ui-ux-audit/issues/03-one-matrix-model.md).

**Blocked by:** 04, 05, 06, 07 (по умолчанию после I; по коду ничем — можно вести в отдельной ветке `ux-r3-08` от `ux-r3`, правила `CLAUDE.md`)

**Status:** resolved

- [x] Storage выводится из того, есть ли вошедший пользователь; признак `activeState` и действия `switchToLocalTasks` / `switchToFirebaseTasks` удалены. Все действия стора, Completed, List view, панель и drag читают и пишут текущую матрицу по этому признаку.
- [x] Удалены: фича `switchTaskSource` с обработкой `?cloud` (параметр просто игнорируется), сущность `taskSourceTabs`, фича `copyTasksToCloud` и `copyLocalTasksToFirebaseAction`, плитки «Cloud Matrix» / «Local Matrix» в меню аккаунта.
- [x] В текущем угловом меню вошедшего вместо плиток строка «Saved to your Google account».
- [x] Градиент `SyncGlow` показывается при вошедшем пользователе (удалит L).
- [x] Схема Firestore и ключи localStorage не меняются; анонимная матрица по-прежнему в persist `tasksStore`.
- [x] Тесты на главном seam: на странице нет «Cloud Matrix», «Local Matrix», «Copy all tasks to Cloud»; в меню «Saved to your Google account»; вошедший видит облачные задачи, после Sign out — задачи устройства; все тесты R1 и R2 зелёные, те, что трогали `activeState` (например, `noErrorToast`), переведены на действия пользователя; axe.
- [x] Чек-лист, раздел K: открыть `/?cloud` вошедшим и анонимным — главная как обычно.

## Comments

**Что сделано.**

- **Storage в сторе.** Вместо `activeState` в `tasksStore` флаг `isInCloud`. Его ставит облачная подписка R2 (`subscribeToCloudMatrix`), когда узнаёт `uid`, и снимает отписка. Флаг не сохраняется в localStorage, `partialize` по-прежнему хранит только `localTasks` и `localCompletedTasks`, схема Firestore не менялась.
- **Текущая матрица.** Новые селекторы `selectTasks` и `selectCompletedTasks` (`tasksStore/lib`, экспорт из корня стора). Через них читают и пишут:
  - все действия стора;
  - Completed;
  - List view и панель (через `TaskMatrix`);
  - drag (`useDragEvents`, `InteractWithMatrix`);
  - инлайн-поле.

  Запись в облако идёт по `isInCloud`.
- **Лоадер.** `TaskMatrix` показывает лоадер при `user && !isCloudLoaded`: подписка стартует в эффекте после рендера с пользователем, и прежнее условие на один рендер показало бы задачи устройства. При выходе всё как раньше: `user` пропадает на рендер раньше, чем отписка снимает `isInCloud` (прежний `SwitchTaskSource` тоже переключал в эффекте). Строка «No sign-up…» от этого защищена: пустоту она считает по `localTasks` (тикет 07). Тикету 09 стоит это учитывать.
- **Удалено:**
  - `features/switchTaskSource` вместе с обработкой `?cloud` и `router.replace('/')`: параметр просто игнорируется, адрес не переписывается;
  - `entities/taskSourceTabs`;
  - `features/copyTasksToCloud`, `copyLocalTasksToFirebaseAction`, `switchToLocalTasks` и `switchToFirebaseTasks`;
  - `StateKey`, `LOCAL_STATE_KEY` и `CLOUD_STATE_KEY`;
  - `isSignedInToCloud`: `uid` и `isInCloud` ставятся вместе, так что проверка стала мёртвой.
- **Меню аккаунта.** Плитки «Cloud Matrix» / «Local Matrix» заменены строкой «Saved to your Google account» под «Logged in as …». `Auth` больше не передаёт в `AuthIndicator` задачи. Анонимную панель («cloud matrix») не трогал: её текст меняет тикет 12.
- **`SyncGlow`** показывается по `isInCloud`, то есть пока пользователь вошёл.

**Тесты.**

- Новый `src/app/tests/oneMatrix.test.tsx`:
  - вошедшему с задачами на устройстве, в том числе в открытом меню, не показываются «Cloud Matrix», «Local Matrix» и «Copy all tasks to Cloud»;
  - в меню есть «Saved to your Google account»;
  - axe;
  - анонимному то же при открытой панели входа;
  - вошедший видит облачные задачи, после «Logout» — задачи устройства;
  - задача, добавленная вошедшим, уходит на сервер, а после выхода её нет среди задач устройства.
- `noErrorToast`: кейс «Delete all» ставил `activeState: 'firebase'` без пользователя, теперь такого состояния нет. Переведён на действия пользователя: вошедший, сервер отказывает (`rejectNextWrite`), «delete all» → `alert` Sync error, Completed вернулся с обеими задачами, toast пуст, axe.
- Удалены тесты снятых функций: «shows the Local matrix while the cloud one is still loading» (`cloudMatrix.test`) и «copies the local tasks to the cloud…» (`offlineWrites.test`). Из компонентного `AuthIndicator.test` убран тест счётчиков в плитках.
- Все 42 набора и 344 теста зелёные.

Чек-лист: новый раздел K, блок «Одна матрица без переключателя».

**Проверено в Chrome** (dev-сервер, изолированный профиль):

- desktop 1280px: анонимный `/?cloud` открывает главную, адрес остаётся `/?cloud`, плиток и градиента нет;
- добавил задачу и перезагрузил: задача на месте;
- эмуляция 375×667 с touch: сетка, «Tap to add», панель входа без «Cloud/Local Matrix».

**Известные ограничения.**

- Меню вошедшего, градиент и `/?cloud` вошедшим в браузере не проверены: настоящего входа через Google в этой сессии нет. Их покрывают jest и чек-лист K.
- Путь «Couldn't delete. Try again» в `CompletedTasksAccordion` теперь достижим только при неожиданном исключении. Действие само больше не бросает, отказ облака показывает Sync error R2. `catch` оставлен как защита. Убрать его может срез O (диалог «Delete all»).
- До тикета 09 задачи устройства у вошедшего не видны, поэтому PR K открывается только после 11 и 12.
