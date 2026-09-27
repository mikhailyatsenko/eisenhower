# 09: Диалог «Delete all»

**What to build:** Пользователь удаляет все завершённые задачи через понятное модальное окно с числом задач и предупреждением, что отменить нельзя, а не через системный `window.confirm`. Срез O [спеки R4](../spec.md), раздел «O. Completed как секция List view» («Delete all»); решения: [Единая модель деструктивных действий](../../ui-ux-audit/issues/04-destructive-actions.md), [Поведение toast-уведомлений](../../ui-ux-audit/issues/12-toast-behaviour.md) (ошибка внутри диалога).

**Blocked by:** 07 (PR среза O — после 08 и 09)

**Status:** resolved

- [x] «Delete all» в заголовке раскрытой Completed открывает нативный `<dialog>` на общем модальном компоненте: «Delete all 12 completed tasks?» («Delete 1 completed task?»), «This can't be undone.», кнопки «Delete all» и «Cancel», фокус на «Cancel».
- [x] Подтверждение удаляет все завершённые задачи (в облаке batch), без Undo; диалог закрыт, секции нет, фокус по правилу «Completed опустела» из 07.
- [x] Esc и «Cancel» закрывают без изменений, фокус на «Delete all».
- [x] Сбой действия стора — «Couldn't delete. Try again» (`role="alert"`) внутри открытого диалога, кнопка снова доступна. Отказ облака — полоса Sync error, без сети — Pending changes.
- [x] `window.confirm` в приложении нигде не вызывается.
- [x] Главный seam: `dialog` «Delete all 3 completed tasks?», фокус на «Cancel»; Esc → фокус на «Delete all»; подтверждение → Completed нет, фокус не на `body`; отклонённое действие → `alert` внутри `dialog`; шпион `window.confirm` не вызван во всех сценариях O; axe на диалоге.
- [x] Чек-лист: раздел O «Delete all» — клавиатура, VoiceOver (диалог с именем, фокус на «Cancel»), нигде нет системного окна подтверждения; раздел E/F про `window.confirm` обновить, если там упомянут.
- [x] Закрыт последний тикет среза O (вместе с 08): предложить PR `ux-r4` → `main` с проверкой на Vercel preview.

## Comments

**Что сделано.**

- **Диалог** — `entities/matrixLayout/components/deleteAllDialog` на общем `Modal`/`DialogButton`, по образцу `SignOutDialog`: заголовок «Delete all 3 completed tasks?» / «Delete 1 completed task?» — имя диалога, «This can't be undone.» — описание, «Cancel» первой (её фокусирует `showModal()`), «Delete all» (`danger`, `disabled` на время удаления). Сбой действия стора — `role="alert"` «Couldn't delete. Try again» внутри диалога, диалог открыт. Прежний `role="alert"` в секции и стиль `ERROR` удалены.
- **Секция** — «Delete all» в заголовке только открывает диалог. Кнопка запоминается при открытии (не через `ref`-проп: React обнуляет его раньше, чем модалка закрывается вместе с секцией), `restoreFocus` возвращает фокус на неё.
- **Фокус после подтверждения** — секция и диалог уходят одним коммитом; cleanup модалки ставит фокус на «Delete all», пока она ещё на странице, затем `useFocusAfterAction` видит, что потерянный элемент был в Completed (`isInCompletedSection`, новый экспорт `matrixLayout`), и ведёт фокус по правилу «Completed опустела»: последняя задача раскрытых секций (`lastShownTaskId`), иначе контейнер List view.
- **`window.confirm`** в коде приложения больше не вызывается (grep по `src/` и `app/`).
- **Тесты** — `completedSection.test`: шпион `window.confirm` в `beforeEach`/`afterEach` на весь файл; диалог и фокус на «Cancel», «Delete 1 completed task?», Esc и «Cancel» → фокус на «Delete all», подтверждение → секции нет и после `reload()`, фокус на «Sort old photos», без задач — на «Task matrix», сбой → `alert` в открытом диалоге и повтор, axe на диалоге. `noErrorToast` и `offlineWrites` подтверждают в диалоге вместо шпиона `confirm`.
- **Чек-лист** — раздел O «Delete all»; в E строки про `window.confirm` и про сбой «Delete all» переписаны.

**Решения, которых нет в тикете.**

- Сбой стора в тесте получен моком `clearAllCompletedTasksAction` (`jest.mock` со сквозной реализацией, `mockRejectedValueOnce` в одном тесте). Через внешние границы его не вызвать: облако при отказе идёт в Sync error, а исключение `localStorage` случается уже после изменения стора в памяти. Это отступление от «собственные модули не мокаются» — единственное в R4.
- Клик по затемнению закрывает диалог, как «Cancel» (умолчание `Modal`, как у `SignOutDialog`); это безопасный ответ.

**Ревью, что оставлено.** Esc или «Cancel» во время удаления закрывают диалог, и если действие затем отклонится, ошибка уйдёт только в консоль; действие стора на деле синхронное, окна почти нет. `useFocusAfterAction` принимает уже четыре позиционных аргумента — кандидат в объект «куда фокус, если элемент ушёл». Путь фокуса после «Delete all» опирается на порядок удаления в React (cleanup модалки раньше удаления DOM секции); это закреплено тестами.

**PR среза O:** https://github.com/mikhailyatsenko/eisenhower/pull/35 (`ux-r4` → `main`), проверка на Vercel preview — по разделу O чек-листа.
