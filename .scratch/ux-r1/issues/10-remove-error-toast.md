# 10: Убрать error-toast

**What to build:** Toast бывает только одного вида — отменяемый результат. Сбой «Delete all» в Completed показывается текстом прямо в блоке Completed. Срез E [спеки R1](../spec.md), решение: [Поведение toast-уведомлений](../../ui-ux-audit/issues/12-toast-behaviour.md).

**Blocked by:** 09

**Status:** resolved

- [x] Error-toast как вид удалён.
- [x] **Переходное решение до среза O:** при сбое «Delete all» в блоке Completed рядом с кнопкой «Delete all» появляется «Couldn't delete. Try again», а завершённые задачи остаются в списке.
- [x] `window.confirm` у «Delete all» остаётся до среза O, где появится свой диалог. Это единственный оставшийся `window.confirm`.
- [x] Toast «All local tasks copied to cloud» идёт через тот же слот без Undo, пока в срезе K не уберут «Copy to Cloud».
- [x] Тест на главном seam: при отказе очистки облака сообщение видно в блоке Completed, toast нет.

## Comments

Из тикета 07: после удаления `react-toastify` сообщения об ошибках идут через единственный слот `showToast` из `@/shared/ui/toast` без Undo. Это `clearAllCompletedTasksAction` («Failed to clear completed tasks…») и валидация дедлайна в `EditTaskForm` («Please select a valid deadline date and time»). Второе тоже error-toast, его нужно куда-то перенести (например, в текст ошибки у поля формы).

**Итог (ветка `ux-r1`).**
- Error-toast больше не вызывается нигде. `showToast` зовут только `performUndoable` и «All local tasks copied to cloud» (`CopyLocalToCloudButton`, тот же слот без Undo, до среза K). `tasksStore` больше не импортирует `shared/ui/toast`.
- «Delete all»: `clearAllCompletedTasksAction` не ловит ошибку, а пробрасывает её, и store чистится только после успеха облака. `CompletedTasksAccordion` при сбое показывает под строкой с «delete all» текст «Couldn't delete. Try again» (`role="alert"`: это inline-ошибка, а не toast). Завершённые задачи остаются. Сообщение снимается при новой попытке и при сворачивании блока. `window.confirm` у «Delete all» остался, это единственный в `src`, комментарий в коде это отмечает.
- Ошибка дедлайна в `EditTaskForm` показывается текстом под полями даты (`role="alert"`, поля связаны с ней через `aria-invalid` и `aria-describedby`). Её сбрасывает любая смена дедлайна через `changeDueDate`. У полей даты и времени появились скрытые подписи «Deadline date» / «Deadline time»: без них axe находил `label-title-only`, когда форма впервые попала под проверку.
- Тесты: `src/app/tests/noErrorToast.test.tsx`, 2 шт. Отказ облака: `activeState: 'firebase'` без вошедшего пользователя, `clearCompletedTasksFromFirebase` падает по-настоящему, собственные модули не мокаются. Сообщение в блоке Completed, задачи на месте, toast пуст, axe чистый. Пустой дедлайн: ошибка в форме и в описании поля, toast пуст, axe чистый. Все 16 наборов jest зелёные (66 тестов), tsc и eslint чистые. Под высокой нагрузкой на машине один прогон упал по таймаутам в `a11y` и `quadrantVocabulary` (эти файлы не менялись), повторные прогоны зелёные.
- Чек-лист: в разделе E сценарий 9 и проверка для обоих сообщений.
- Срез E закрыт этим тикетом.

