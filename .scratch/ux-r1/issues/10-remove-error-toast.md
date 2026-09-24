# 10: Убрать error-toast

**What to build:** Toast бывает только одного вида — отменяемый результат. Сбой «Delete all» в Completed показывается текстом прямо в блоке Completed. Срез E [спеки R1](../spec.md), решение: [Поведение toast-уведомлений](../../ui-ux-audit/issues/12-toast-behaviour.md).

**Blocked by:** 09

**Status:** ready-for-agent

- [ ] Error-toast как вид удалён.
- [ ] **Переходное решение до среза O:** при сбое «Delete all» в блоке Completed рядом с кнопкой «Delete all» появляется «Couldn't delete. Try again», а завершённые задачи остаются в списке.
- [ ] `window.confirm` у «Delete all» остаётся до среза O, где появится свой диалог. Это единственный оставшийся `window.confirm`.
- [ ] Toast «All local tasks copied to cloud» идёт через тот же слот без Undo, пока в срезе K не уберут «Copy to Cloud».
- [ ] Тест на главном seam: при отказе очистки облака сообщение видно в блоке Completed, toast нет.

## Comments

Из тикета 07: после удаления `react-toastify` сообщения об ошибках идут через единственный слот `showToast` из `@/shared/ui/toast` без Undo. Это `clearAllCompletedTasksAction` («Failed to clear completed tasks…») и валидация дедлайна в `EditTaskForm` («Please select a valid deadline date and time»). Второе тоже error-toast, его нужно куда-то перенести (например, в текст ошибки у поля формы).
