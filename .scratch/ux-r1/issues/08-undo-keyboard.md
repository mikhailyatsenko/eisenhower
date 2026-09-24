# 08: Ctrl/Cmd+Z и подсказка клавиши у Undo

**What to build:** Пока виден toast, пользователь отменяет последнее действие по `Ctrl/Cmd+Z`. Screen reader сообщает об этой клавише, а на устройствах с мышью рядом с Undo показана подсказка. Срез E [спеки R1](../spec.md), решение: [Поведение toast-уведомлений](../../ui-ux-audit/issues/12-toast-behaviour.md).

**Blocked by:** 07

**Status:** ready-for-agent

- [ ] `Ctrl+Z` (`Cmd+Z` на macOS) отменяет действие из слота, пока toast виден. Когда toast скрыт, сочетание ничего не делает.
- [ ] В `input`, `textarea` и `contenteditable` сочетание не перехватывается: работает обычная отмена ввода.
- [ ] На устройствах с мышью рядом с Undo стоит `kbd` `⌘Z` или `Ctrl+Z`. На touch подсказки нет. Устройство определяется по основному указателю `(hover: none) and (pointer: coarse)`, а не по ширине экрана.
- [ ] Объявление screen reader'а: «Task deleted. Undo with Ctrl+Z» (или «⌘Z» на macOS), по тому же шаблону для каждого текста toast.
- [ ] Тесты на главном seam: `Ctrl+Z` откатывает Delete, внутри поля формы не перехватывается; `kbd` виден при fine-указателе и скрыт при coarse.
