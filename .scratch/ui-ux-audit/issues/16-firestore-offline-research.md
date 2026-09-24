# Как ведёт себя облачная матрица без сети

Type: research
Status: resolved

## Question

Что сейчас происходит с вошедшим пользователем без сети или при обрыве, и какие средства даёт Firebase?

- Текущий код: `src/shared/config/firebaseConfig.ts` вызывает `getFirestore(app)` без офлайн-кэша, `onSnapshot` не используется. Что делают чтение, добавление, правка, удаление без сети: промисы висят, падают, есть ли таймауты и откат в сторе.
- Поведение Firestore Web SDK (текущая версия из `package.json`) по умолчанию и с `persistentLocalCache` / `persistentMultipleTabManager`: очередь записей, latency compensation, `hasPendingWrites`, несколько вкладок, ограничения.
- Как отследить состояние «есть несинхронизированные изменения» (`waitForPendingWrites`, `snapshotsInSync`, `onSnapshot` с `includeMetadataChanges`).

## Answer

Подробно: [`research/firestore-offline.md`](../research/firestore-offline.md).

- Сейчас используется memory cache с eager GC (`getFirestore` без настроек), живых подписок нет. Записи без сети не падают и не имеют таймаута: они ждут в очереди в памяти, промисы `commit`/`deleteDoc` висят до подтверждения сервером. При закрытии или перезагрузке вкладки очередь теряется.
- Стор обновляется оптимистично, отката и индикации нет, ошибки уходят в `console.error`. Видимые эффекты: форма добавления не закрывается до подтверждения (повторный Enter создаёт дубль); «Copy all tasks to Cloud» исчезает без переключения на облако; «Clear all» очищает UI, но на сервере задачи, по выводу из исходников, остаются.
- Загрузка без сети: лоадер до ~10 с (таймаут `OnlineState` в SDK), затем пустая облачная матрица без ошибки. После появления сети данные не подтягиваются до перезагрузки.
- `persistentLocalCache` + `persistentMultipleTabManager` хранят кэш и очередь записей в IndexedDB, так что очередь переживает перезагрузку. Кэш по умолчанию 40 MB. Без multi-tab вторая вкладка молча откатывается на memory cache. Откат на память также бывает в Firefox Private и при переполнении квоты. В Safari ITP стирает IndexedDB после 7 дней без визитов.
- Для индикации есть `onSnapshot` с `includeMetadataChanges: true` (`metadata.hasPendingWrites`, `metadata.fromCache`) и `waitForPendingWrites()`, плюс `navigator.onLine`/события `online`/`offline`. Публичного online-статуса у SDK нет. `onSnapshotsInSync` о синхронизации с сервером ничего не говорит.
