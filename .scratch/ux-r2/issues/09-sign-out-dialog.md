# 09: Диалог выхода при неотправленных правках

**What to build:** Если у вошедшего пользователя есть Pending changes, «Sign out» не выходит сразу, а спрашивает: «N changes aren't saved to your account yet. If you sign out now, they'll be lost.» — «Stay signed in» / «Sign out anyway». Без Pending changes выход идёт сразу. Срез J4 [спеки R2](../spec.md), решение: [Офлайн для вошедшего пользователя](../../ui-ux-audit/issues/17-offline-ux.md), строка «Выход из аккаунта».

**Blocked by:** 02, 03

**Status:** resolved

- [x] Диалог — нативный `<dialog>` на общем модальном компоненте, инертный фон. Esc и «Stay signed in» закрывают диалог, фокус возвращается на «Sign out» или кнопку аккаунта.
- [x] «Sign out anyway» выходит и стирает кэш на устройстве (тикет 03).
- [x] N — число неподтверждённых записей этой сессии из модели синхронизации: одно действие — одна запись. Если Pending changes есть, а N неизвестно (правки прошлой сессии), текст без числа: «Some changes aren't saved to your account yet. If you sign out now, they'll be lost.»
- [x] Без Pending changes «Sign out» выходит без диалога, как в 03.
- [x] Тесты на главном seam: `goOffline`, две правки, «Sign out» — `dialog` с «2 changes…»; Esc и «Stay signed in» — вошедший, фокус вернулся; «Sign out anyway» — вышел, кэш фейка стёрт; без очереди — выход без диалога; `reload()` без сети с очередью — текст без числа; axe на диалоге.
- [x] Чек-лист: диалог с клавиатуры и VoiceOver.

## Comments

- `SignOutDialog` — приватный компонент `features/auth` (`components/SignOutDialog`) на общем `Modal`. `Auth` при «Logout» читает модель синхронизации: без `selectHasPendingChanges` выход сразу (как в 03), иначе открывает диалог. «Sign out anyway» закрывает диалог и выходит тем же путём, что и 03 (`requestDeviceClear` + `handleLogout`).
- Диалог называется «Sign out?» (не «unsaved changes»: так в `CONTEXT.md` не говорим), текст о потере правок связан с ним через `aria-describedby` (у `Modal` появился `describedBy`), VoiceOver читает его при открытии.
- N — `selectPendingChangesCount` модели синхронизации в момент нажатия: `unconfirmedWrites`, при `hasPendingWrites` и нуле записей этой сессии — `null`, текст без числа. Число фиксируется при открытии и не меняется, пока диалог открыт. Добавлена форма единственного числа: «1 change isn't saved to your account yet. If you sign out now, it'll be lost.»
- Фокус: клик по «Logout» закрывает меню аккаунта, и кнопки «Logout» после диалога уже нет, поэтому `restoreFocus` ставит фокус на кнопку аккаунта. Для этого `BubbleCornerButton` и `AuthIndicator` принимают ref на закрытую кнопку. После «Sign out anyway» та же кнопка становится «Sign in».
- Если пользователь вышел, пока диалог открыт (сессия истекла, выход в другой вкладке), диалог закрывается: иначе «Sign out anyway» стёр бы очередь, которую потеря сессии сохраняет (07). Есть тест.
- Пункт меню пока называется «Logout»: переименование в «Sign out» — в шапке (срез L, R3).
- Известные ограничения: если есть и записи этой сессии, и очередь прошлой, N считает только записи этой сессии (спека определяет N именно так). Если правки подтвердились, пока диалог открыт, диалог остаётся с прежним текстом: спека этот случай не описывает, «Sign out anyway» тогда ничего не теряет. Неудачный выход после «Sign out anyway» только логируется, как в 03.
- Тесты: `src/app/tests/signOutDialog.test.tsx`; тест 03 «leaves none of the user's tasks on the device» теперь подтверждает выход через «Sign out anyway».
- Ручной чек-лист: раздел J, «Диалог выхода при неотправленных правках». В настоящем браузере и с VoiceOver в этой сессии не проверялся.
