# Как ведёт себя облачная матрица без сети и что для этого даёт Firestore

Исследование по тикету `.scratch/ui-ux-audit/issues/16-firestore-offline-research.md`. Дата: 2026-09-24.

Источники первичные:

- код приложения (ссылки вида `file:line` от корня репозитория);
- исходники Firestore Web SDK той версии, что стоит в проекте: `firebase@11.4.0` (`package.json:28`, `^11.4.0`), внутри него `@firebase/firestore@4.7.9`. TypeScript-исходники извлечены из `node_modules/@firebase/firestore/dist/index.esm2017.js.map` (поле `sourcesContent`), так что это ровно тот код, который попадает в бандл. Пути ниже даны от `packages/firestore/src/` репозитория [firebase/firebase-js-sdk](https://github.com/firebase/firebase-js-sdk) (тег `@firebase/firestore@4.7.9`), номера строк взяты из извлечённых файлов;
- официальная документация: [Access data offline](https://firebase.google.com/docs/firestore/manage-data/enable-offline) и [Get realtime updates](https://firebase.google.com/docs/firestore/query-data/listen) (обе страницы: «Last updated 2026-09-24 UTC»), справочник [firebase/firestore](https://firebase.google.com/docs/reference/js/firestore_);
- для Safari: блог WebKit [Full Third-Party Cookie Blocking and More](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/).

Вживую в браузере с выключенной сетью ничего не проверялось. Поведение приложения выведено из кода приложения и исходников SDK. Там, где это вывод, а не прямая цитата, так и написано.

## Коротко

- Firestore создаётся через `getFirestore(app)` без настроек (`src/shared/config/firebaseConfig.ts:15`), значит используется **memory cache** с eager GC: кэш и очередь записей живут только в памяти вкладки. Живых подписок (`onSnapshot`) в приложении нет, задачи читаются одним `getDocs`.
- **Записи без сети не падают и не имеют таймаута.** SDK ставит их в очередь в памяти и шлёт при восстановлении связи. Промис `batch.commit()` / `deleteDoc()` висит, пока сервер не подтвердит запись. Если закрыть или перезагрузить вкладку до этого, очередь теряется.
- **Стор обновляется оптимистично, отката нет.** Все действия сначала меняют zustand-стор и только потом пишут в Firestore. Ошибки записи ловятся и уходят в `console.error`. Индикации «офлайн» или «не сохранено» в UI нет.
- **Заметные для пользователя эффекты**: форма добавления не закрывается, пока нет подтверждения от сервера; кнопка «Copy all tasks to Cloud» исчезает, но переключения на облако не происходит; «Clear all» очищает выполненные задачи в UI, но на сервере они, скорее всего, остаются (вывод, см. ниже).
- **Загрузка без сети:** полноэкранный лоадер держится до ~10 с (или меньше, если соединение сразу падает), потом облачная матрица показывается **пустой** и без ошибки: `getDocs` возвращает пустой снимок из пустого кэша.
- SDK даёт всё нужное для индикации: `persistentLocalCache` (IndexedDB, очередь переживает перезагрузку), `metadata.hasPendingWrites` / `fromCache` в `onSnapshot` с `includeMetadataChanges: true`, `waitForPendingWrites()`. Публичного «online/offline» статуса у SDK нет.

## 1. Текущий код

### Конфигурация

- `src/shared/config/firebaseConfig.ts:14-16`: `initializeApp`, `getFirestore(app)`, `getAuth(app)`. Настроек `localCache` нет. По [документации](https://firebase.google.com/docs/firestore/manage-data/enable-offline): «For the web, offline persistence is disabled by default», «Memory cache is the default if no config is specified». Для memory cache без настроек SDK использует eager GC: «A `MemoryEagerGarbageCollector` is used when this is undefined» (`api/cache_config.ts:235-237`).
- Firestore используется только в `src/shared/stores/tasksStore/lib/index.ts`. `onSnapshot` не используется нигде.
- `firebaseTasks` / `firebaseCompletedTasks` **не сохраняются** в localStorage: `partialize` сохраняет только локальные задачи (`src/shared/stores/tasksStore/hooks/useTasksStore.ts:30-33`). После перезагрузки облачная часть стора пустая, пока не отработает `getDocs`.
- Вход (auth) офлайн: `getAuth` в `@firebase/auth@1.9.1` использует `indexedDBLocalPersistence` / `browserLocalPersistence`, поэтому `auth.currentUser` восстанавливается без сети. `useAuth` отдаёт `user` из `onAuthStateChanged` (`src/shared/api/auth/model/lib/hooks/useAuth.ts:17-26`). Вывод: при загрузке без сети вошедший пользователь остаётся вошедшим, и приложение идёт по «облачной» ветке.

### Слой доступа к Firestore (`src/shared/stores/tasksStore/lib/index.ts`)

| Функция | Что делает | Без сети |
|---|---|---|
| `fetchTasksFromFirebase` (`:23-74`) | `getDocs(query(tasks, userId == uid))` (`:33`) | Не висит бесконечно. SDK ждёт синхронизации, пока состояние «может быть онлайн», а после перехода в Offline отдаёт снимок из кэша. В memory cache после перезагрузки кэш пуст, поэтому возвращается **пустой результат без ошибки** (подробно в разделе 2). `catch` → `console.error`, `return null` (`:70-73`). |
| `syncTasksToFirebase` (`:76-138`) | Переписывает **все** задачи из стора: `batch.set` для каждой активной и выполненной задачи, `order` = индекс в массиве, пачками по 500 с последовательным `await batch.commit()` (`:126-134`) | `commit()` не резолвится, пока сервер не подтвердит запись. Таймаута нет. При >500 задачах следующая пачка не ставится в очередь, пока не подтверждена предыдущая. `catch` → `console.error` (`:135-137`), наружу ошибка не пробрасывается. |
| `deleteTaskFromFirebase` (`:140-150`) | `deleteDoc` (`:146`) | То же: промис висит до подтверждения, ошибка только в консоль. |
| `clearCompletedTasksFromFirebase` (`:152-182`) | `getDocs(userId == uid && completed == true)` (`:165`), затем `batch.delete` по найденным | Сначала `getDocs` (см. выше), потом `commit` висит. Ошибку пробрасывает (`:180`). |

Во всём этом слое нет таймаутов, повторов и проверки `navigator.onLine`. Совпадений по `navigator.onLine`, `'online'` и `'offline'` в `src/` нет.

### Действия стора (`src/shared/stores/tasksStore/actions/index.ts`) и вызовы из UI

Общее для всех действий: сначала синхронный `useTaskStore.setState(...)`, потом `await syncTasksToFirebase(...)` или `deleteTaskFromFirebase`, если `activeState === 'firebase'`. Результат записи на стор не влияет: ни отката, ни пометки «не сохранено».

| Операция | Код | Что происходит без сети | Что видит пользователь |
|---|---|---|---|
| **Загрузка** | `TaskMatrix.fetchTasks` → `syncTasks` (`src/widgets/taskMatrix/ui/taskMatrix/TaskMatrix.tsx:34-61`) → `fetchTasksFromFirebase` (`actions/index.ts:19-26`) | Пока идёт `getDocs`, `isSyncing=true` → `LoaderFullScreen` (`TaskMatrix.tsx:63-65`). После перехода SDK в Offline `getDocs` резолвится пустым снимком → `firebaseTasks` = пустые квадранты (`actions/index.ts:22-25`). Если `getDocs` отклонится, `fetchTasksFromFirebase` вернёт `null`, стор не меняется, но после перезагрузки он и так пуст. Ветка `syncState.error` (`TaskMatrix.tsx:67-73`) не срабатывает: ошибки глотаются внутри `fetchTasksFromFirebase`. Повторной загрузки при восстановлении сети нет: эффект зависит только от `user` (`TaskMatrix.tsx:57-61`). | Лоадер на весь экран до ~10 с, затем пустая облачная матрица без сообщения. После появления сети данные не подтягиваются до перезагрузки. Если сеть пропала посреди сессии, уже загруженные задачи остаются в сторе, и визуально ничего не меняется. |
| **Добавление** | `addTaskAction` (`actions/index.ts:40-71`): вставка в стор `:54-62`, `await syncTasksToFirebase` `:63-69`. UI: `AddTask.handleSave` (`src/features/addTask/ui/AddTask/AddTask.tsx:29-50`) делает `await addTaskAction` (`:36`) и только потом показывает тост (`:43-47`) и закрывает форму (`:49`). | Задача сразу появляется в сторе, запись стоит в очереди. `addTaskAction` не возвращается, пока нет подтверждения. | Задача появляется в квадранте за модалкой, но **модалка не закрывается** и тост «добавлено» не показывается. Кнопка сохранения не блокируется, поэтому повторный Enter добавит ещё одну задачу (новый `uuid`). Если закрыть модалку вручную, при восстановлении сети висящий `handleSave` досрабатывает: тост и `setIsFormOpenedAction(false)` (вывод из кода). |
| **Правка** (текст, срок, квадрант из формы) | `editTaskAction` (`actions/index.ts:73-142`): стор `:87-118`, тост с undo `:121-132`, `await sync` `:134-140`. UI: `TaskItem.handleSave` вызывает без `await` и сразу закрывает форму (`src/entities/matrixLayout/components/taskItem/ui/TaskItem.tsx:103-112`). | Стор изменён, запись в очереди. | Всё выглядит как успешное сохранение: форма закрыта, тост показан. Undo работает локально и ставит в очередь ещё одну полную перезапись. |
| **Завершение** | `completeTaskAction` (`actions/index.ts:182-237`): стор `:192-219`, тост `:222-227`, `await sync` `:229-235`. UI без `await` (`TaskItem.tsx:89-94`). | То же. | Как при успехе. |
| **Восстановление из выполненных** | `restoreTaskAction` (`actions/index.ts:239-293`); UI `HomePage.handleRestoreTask` делает `await`, но после него ничего нет (`src/pages/home/ui/HomePage.tsx:22-29`). | То же. | Как при успехе. |
| **Удаление** | `deleteTaskAction` (`actions/index.ts:331-366`) и `deleteCompletedTaskAction` (`:368-402`): стор, тост с undo, `await deleteTaskFromFirebase`. UI `TaskItem.handleDelete` без `await` (`TaskItem.tsx:80-87`). Undo → `undoDeleteTaskAction` → полный `syncTasksToFirebase` (`:295-329`). | `deleteDoc` в очереди. Если нажать undo, `set` встанет в очередь после `delete`, порядок сохраняется. | Как при успехе. |
| **Перемещение (drag)** | `dragOverQuadrantAction` меняет только стор (`actions/index.ts:144-164`). `dragEndAction` (`:166-180`) пишет стор и делает `await syncTasksToFirebase`. UI вызывает без `await` (`src/features/interactWithMatrix/lib/hooks/useDragEvents.ts:36,62`). | Запись в очереди. | Как при успехе. |
| **Очистка выполненных («Clear all»)** | `clearAllCompletedTasksAction` (`actions/index.ts:404-423`): **сначала** `await clearCompletedTasksFromFirebase()`, потом очистка стора. UI: `handleClearAll` со спиннером `isDeleting` (`src/entities/completedTasksAccordion/ui/CompletedTasksAccordion.tsx:119-136`). | `getDocs(completed == true)` ждёт перехода в Offline (до ~10 с), потом берёт кэш. При eager GC документы прошлого `getDocs` из кэша уже выброшены, и приходит пустой результат, поэтому удалять нечего. `commit` пустых пачек не происходит, промис резолвится, стор очищается (вывод из исходников SDK, вживую не проверялось). | Спиннер до ~10 с, потом список выполненных пуст и ошибки нет. На сервере выполненные задачи, по этому выводу, остаются и вернутся после перезагрузки. |
| **Перенос локальных задач в облако** | `copyLocalTasksToFirebaseAction` (`actions/index.ts:425-454`): копии с новыми `uuid` в `firebaseTasks` (`:428-447`), `await syncTasksToFirebase` (`:450-453`). UI: `CopyLocalToCloudButton.handleCopyLocalToCloud` (`src/features/copyTasksToCloud/ui/CopyLocalToCloudButton.tsx:46-59`) делает `await`, потом тост и `switchToFirebaseTasks()` (`:50-52`). | Стор облака заполнен сразу, запись в очереди, `await` висит. | Кнопка показывается только при пустом облаке (`:33-44`). Как только `firebaseTasks` заполнились, компонент рендерит `null`, и **кнопка со спиннером исчезает**. Пользователь остаётся на локальном виде, тоста и переключения нет до подтверждения записи. Если закрыть вкладку до этого, задачи в облако не попадут, а локальные останутся. |

### Сквозные последствия текущей схемы (выводы из кода)

- **Полная перезапись вместо точечных изменений.** Каждое действие отправляет `set` всех задач (`lib/index.ts:90-133`). Без сети каждое действие добавляет в очередь пачку размером со всю матрицу.
- **Пустая матрица после офлайн-загрузки плюс запись.** Если после офлайн-загрузки (стор пуст) пользователь добавит задачу, `syncTasksToFirebase` запишет только её с `order: 0`. Серверные задачи `set` не трогает и не удаляет, но их `order` может совпасть с новой. После перезагрузки с сетью вернутся все задачи.
- **Ошибки записи не видны.** Постоянные ошибки (например `PERMISSION_DENIED`) отклоняют промис, но `syncTasksToFirebase` и `deleteTaskFromFirebase` их глотают (`lib/index.ts:135-137,147-149`). Стор при этом расходится с сервером. Тост об ошибке есть только у «Clear all» (`actions/index.ts:419-422`).

## 2. Firestore Web SDK 11.4.0 (`@firebase/firestore` 4.7.9)

### Как SDK решает, что он офлайн

- Внутреннее состояние `OnlineState`: `Unknown` / `Online` / `Offline` (`remote/online_state_tracker.ts`). В `Offline` SDK переходит после **одной** ошибки watch-стрима (`MAX_WATCH_STREAM_FAILURES = 1`, `:31`, `:139-151`) или если бэкенд не ответил за **10 секунд** (`ONLINE_STATE_TIMEOUT_MS = 10 * 1000`, `:37`, `:96-111`). Один раз за сессию в консоль пишется ошибка «Could not reach Cloud Firestore backend… The client will operate in offline mode until it is able to successfully connect to the backend» (`:182-194`).
- SDK слушает `window` `online` / `offline` (`platform/browser/connectivity_monitor.ts:53-56`) и по любому из этих событий перезапускает стримы (`remote/remote_store.ts:174-186`, `restartNetwork` `:858-865`).
- Стрим watch открывается только когда есть активный запрос (listener или `getDocs`). Без активных запросов переход в Offline может не случиться. Это вывод: `handleWatchStreamStart` вызывается при старте watch-стрима.
- **Публичного API для `OnlineState` нет.** В `dist/index.d.ts` нет ни одного упоминания `OnlineState`. Снаружи его видно только косвенно, через `metadata.fromCache`.

### Чтение: `getDocs`

- В документации: «`getDocs()` attempts to provide up-to-date data when possible by waiting for data from the server, but it may return cached data or fail if you are offline» (`api/reference_impl.ts:200-209`).
- Реализация: временный listener с `includeMetadataChanges: true, waitForSyncWhenOnline: true` (`core/firestore_client.ts:750-788`). Первый снимок из кэша поднимается, только если SDK считает себя Offline и в снимке есть документы, или были кэшированные результаты, или состояние Offline (`core/event_manager.ts:488-527`). Пока состояние `Unknown`/`Online`, `getDocs` ждёт.
- Официальная формулировка: «When querying a collection, an empty result is returned if there are no cached documents. When fetching a specific document, an error is returned instead» ([enable-offline](https://firebase.google.com/docs/firestore/manage-data/enable-offline)).
- Для явного поведения есть `getDocsFromCache` / `getDocsFromServer`. Второй при данных из кэша отклоняется с `UNAVAILABLE` (`core/firestore_client.ts:766-775`).

### Запись: очередь и latency compensation

- `setDoc` / `updateDoc` / `deleteDoc`: «A Promise resolved once the data has been successfully written to the backend (note that it won't resolve while you're offline)» (`api/reference_impl.ts:292-293`, `:354-355`, `:430-431`). Для `WriteBatch.commit()` то же самое: «note that it won't resolve while you're offline» (`lite-api/write_batch.ts:226-228`). Полный SDK: «write batches are persisted offline» (`api/write_batch.ts:31-32`).
- Запись сначала применяется локально, потом ставится в очередь мутаций. В сеть одновременно уходит не больше 10 пачек (`MAX_PENDING_WRITES = 10`, `remote/remote_store.ts:62`, `:710-714`), остальные ждут в очереди.
- **Ошибки сети записи не отклоняют.** `UNAVAILABLE`, `DEADLINE_EXCEEDED`, `UNAUTHENTICATED` и прочие считаются временными («Transient error, just let the retry logic kick in», `remote/remote_store.ts:856-857`, `remote/rpc_error.ts:58-71`). Отклоняются только постоянные ошибки: `INVALID_ARGUMENT`, `NOT_FOUND`, `PERMISSION_DENIED`, `FAILED_PRECONDITION` и др. (`rpc_error.ts:72-104`). Таймаута на запись нет.
- **Latency compensation**: «Local writes in your app will invoke snapshot listeners immediately… your listeners will be notified with the new data before the data is sent to the backend. Retrieved documents have a `metadata.hasPendingWrites` property that indicates whether the document has local changes that haven't been written to the backend yet» ([listen](https://firebase.google.com/docs/firestore/query-data/listen)). Работает только для слушателей `onSnapshot` и для последующих чтений из кэша. В приложении слушателей нет, поэтому эту роль сейчас выполняет собственный оптимистичный стор.
- **Memory cache:** очередь мутаций держится в массиве в памяти (`MemoryMutationQueue.mutationQueue`, `local/memory_mutation_queue.ts:37-42`). Вывод: при закрытии или перезагрузке вкладки неотправленные записи теряются.

### `persistentLocalCache` (IndexedDB)

- Включается при создании: `initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) })` ([enable-offline](https://firebase.google.com/docs/firestore/manage-data/enable-offline)). Старые `enableIndexedDbPersistence` / `enableMultiTabIndexedDbPersistence` помечены `@deprecated` (`api/database.ts:356-359`, `:403`). `getFirestore` при этом нужно заменить на `initializeFirestore`, настройки задаются один раз.
- Что даёт (по документации и исходникам):
  - кэш документов и **очередь мутаций в IndexedDB**, поэтому неотправленные записи переживают перезагрузку. `waitForPendingWrites` прямо говорит о «writes… written in a previous app session» (`api/database.ts:509-513`);
  - `getDocs` без сети отдаёт последние известные данные, а не пустоту;
  - «Cloud Firestore's cache isn't automatically cleared between sessions… if your web app handles sensitive information, make sure to ask the user if they're on a trusted device before enabling persistence» ([enable-offline](https://firebase.google.com/docs/firestore/manage-data/enable-offline)).
- **Вкладки.** Без `tabManager` используется single-tab: «Defaults to single-tab persistence if no tab manager is specified». Если вторая вкладка не получает эксклюзивный доступ, `start()` падает с `FAILED_PRECONDITION` «Failed to obtain exclusive access to the persistence layer. To allow shared access, multi-tab synchronization has to be enabled in all tabs» (`local/indexeddb_persistence.ts:100-104`, `:272-280`). Такая ошибка входит в список допустимых для отката (`core/firestore_client.ts:270-277`), и эта вкладка тихо переходит на memory cache с `logWarn('Error using user provided cache. Falling back to memory cache: …')` (`:315-329`). С `persistentMultipleTabManager()` вкладки делят один IndexedDB и синхронизируются. `persistentSingleTabManager({ forceOwnership: true })` «cannot be used with multi-tab synchronization and is primarily intended for use with Web Workers» (`api/cache_config.ts:410-418`).
- **Браузеры.** «For the web, offline persistence is supported only by the Chrome, Safari, and Firefox web browsers» ([enable-offline](https://firebase.google.com/docs/firestore/manage-data/enable-offline)). SDK сам откатывается на memory cache при `QuotaExceededError`, `AbortError` и `InvalidStateError`. Про последний в исходниках сказано: «Firefox Private Browsing mode disables IndexedDb and returns INVALID_STATE for any usage» (`core/firestore_client.ts:278-298`). Платформы без полноценного IndexedDB получают «This platform is either missing IndexedDB or is known to have an incomplete implementation. Offline persistence has been disabled» (`local/indexeddb_persistence.ts:105-107`, проверка `local/simple_db.ts:170-218`). Откат только логируется, приложение о нём не узнаёт.
- **Safari (ITP).** WebKit удаляет «all of a website's script-writable storage after seven days of Safari use without user interaction on the site» ([WebKit blog](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)). IndexedDB входит в эту категорию, так что кэш и неотправленная очередь Firestore в Safari могут исчезнуть после 7 дней без визитов. Отдельной документации Firebase про Safari private mode в найденных источниках нет, кроме общего предупреждения про поддерживаемые браузеры.
- **Размер кэша.** В SDK 4.7.9 по умолчанию 40 MB: `LRU_DEFAULT_CACHE_SIZE_BYTES = 40 * 1024 * 1024` (`local/lru_garbage_collector.ts:39`). Минимум 1 MB (`local/lru_garbage_collector_impl.ts:44`, проверка `api/database.ts:189-193`), `CACHE_SIZE_UNLIMITED` отключает GC (`api/database.ts:84`). JSDoc: «The default value is 40 MB… The SDK does not guarantee that the cache will stay below that size» (`api/cache_config.ts:253-266`). На странице enable-offline упоминается 100 MB, но это примеры для Apple и Android. Для веба источник истины — код SDK.

### Отслеживание состояния

- **`onSnapshot(query, { includeMetadataChanges: true }, cb)`.** «By default, listeners are not notified of changes that only affect metadata». С опцией приходит отдельное событие, когда «the "pending writes" flag is now false» ([listen](https://firebase.google.com/docs/firestore/query-data/listen)). Определение опции в `api/reference_impl.ts:76-88`.
- **`snapshot.metadata.hasPendingWrites`**: «True if the snapshot contains the result of local writes… that have not yet been committed to the backend» (`api/snapshot.ts:314-322`). Есть у `QuerySnapshot` и у каждого `DocumentSnapshot`.
- **`snapshot.metadata.fromCache`**: «True if the snapshot was created from cached data rather than guaranteed up-to-date server data… you will receive another snapshot with `fromCache` set to false once the client has received up-to-date data» (`api/snapshot.ts:324-331`). В документации: «If `fromCache` is `true`, the data came from the cache and might be stale or incomplete» ([enable-offline](https://firebase.google.com/docs/firestore/manage-data/enable-offline)).
- **`waitForPendingWrites(db)`**: резолвится, когда подтверждены все записи, ожидавшие на момент вызова, включая записи прошлой сессии. Записи, сделанные после вызова, не ждёт. Отклоняется при смене пользователя (`api/database.ts:505-527`). Резолвится сразу, если очередь пуста.
- **`onSnapshotsInSync(db, cb)`**: «only indicates that listeners are in sync with each other, but does not relate to whether those snapshots are in sync with the server» (`api/reference_impl.ts:767-781`). Для статуса «синхронизировано с сервером» не подходит.
- **`disableNetwork` / `enableNetwork`**: при выключенной сети «snapshot listeners, `getDoc()` or `getDocs()` calls will return results from cache, and any write operations will be queued» (`api/database.ts:529-553`). Пригодно для ручного режима или тестов офлайна.
- **Промисы отдельных записей** резолвятся по подтверждению сервера. Количество ещё не выполненных промисов — тоже прямой счётчик «неотправленных».

## 3. Как в UI различить «офлайн», «есть неотправленные» и «синхронизировано»

Только перечень доступных сигналов, без выбора.

| Состояние | Сигналы, которые даёт платформа/SDK | Оговорки из источников |
|---|---|---|
| **Офлайн** | `navigator.onLine` и события `window` `online`/`offline` (на них же реагирует сам SDK, `connectivity_monitor.ts:53-56`); `metadata.fromCache === true` у снимка `onSnapshot` с `includeMetadataChanges: true`; `getDocsFromServer` отклоняется с `UNAVAILABLE` | Публичного `OnlineState` у SDK нет. `fromCache` также бывает `true` в первые мгновения после подписки, до ответа сервера, и после любого перезапуска стрима, так что это «данные не подтверждены сервером», а не строго «нет сети». |
| **Есть неотправленные изменения** | `metadata.hasPendingWrites === true` у `QuerySnapshot` или документа; незарезолвленные промисы `commit`/`setDoc`/`deleteDoc`; незарезолвленный `waitForPendingWrites()` | `hasPendingWrites` видят только слушатели `onSnapshot`. `waitForPendingWrites` не учитывает записи после вызова. В memory cache очередь теряется при перезагрузке, в `persistentLocalCache` переживает её. |
| **Синхронизировано** | Снимок с `hasPendingWrites === false` и `fromCache === false` (приходит отдельным metadata-событием при `includeMetadataChanges: true`); резолв `waitForPendingWrites()` | `onSnapshotsInSync` для этого не подходит (см. выше). |

Для всех трёх вариантов нужна живая подписка `onSnapshot`. Сейчас в приложении её нет: одноразовый `getDocs` плюс собственный оптимистичный zustand-стор, который об очереди SDK ничего не знает.

## Ограничения

- Офлайн в браузере не прогонялся. Поведение `getDocs` и «Clear all» без сети выведено из исходников SDK (`event_manager.ts`, `online_state_tracker.ts`, eager GC memory cache) и помечено как вывод.
- Номера строк SDK соответствуют исходникам из source map установленного пакета. На GitHub по тегу `@firebase/firestore@4.7.9` они должны совпадать, но отдельно не сверялись.
- Поведение IndexedDB в приватных режимах Safari и Chrome первичными источниками Firebase не описано. Приведён только комментарий в коде SDK про Firefox Private Browsing.
