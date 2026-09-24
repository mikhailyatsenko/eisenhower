# 08: Ctrl/Cmd+Z и подсказка клавиши у Undo

**What to build:** Пока виден toast, пользователь отменяет последнее действие по `Ctrl/Cmd+Z`. Screen reader сообщает об этой клавише, а на устройствах с мышью рядом с Undo показана подсказка. Срез E [спеки R1](../spec.md), решение: [Поведение toast-уведомлений](../../ui-ux-audit/issues/12-toast-behaviour.md).

**Blocked by:** 07

**Status:** resolved

- [x] `Ctrl+Z` (`Cmd+Z` на macOS) отменяет действие из слота, пока toast виден. Когда toast скрыт, сочетание ничего не делает.
- [x] В `input`, `textarea` и `contenteditable` сочетание не перехватывается: работает обычная отмена ввода.
- [x] На устройствах с мышью рядом с Undo стоит `kbd` `⌘Z` или `Ctrl+Z`. На touch подсказки нет. Устройство определяется по основному указателю `(hover: none) and (pointer: coarse)`, а не по ширине экрана.
- [x] Объявление screen reader'а: «Task deleted. Undo with Ctrl+Z» (или «⌘Z» на macOS), по тому же шаблону для каждого текста toast.
- [x] Тесты на главном seam: `Ctrl+Z` откатывает Delete, внутри поля формы не перехватывается; `kbd` виден при fine-указателе и скрыт при coarse.

## Comments

**Итог (ветка `ux-r1`).**
- Сочетание, подсказка и объявление живут в `shared/ui/toast`: у `ToastAction` появилось поле `shortcutKey` (буква, модификатор — Cmd на Apple-платформах, Ctrl на остальных). `performUndoable` передаёт `shortcutKey: 'z'`. Платформа определяется по `navigator.platform` (`Mac|iPhone|iPad|iPod`, iPadOS отдаёт `MacIntel`).
- `useActionShortcut` слушает `keydown` только пока показан toast с таким действием. Сочетание пропускается, если: фокус в `input`, `textarea` или `contenteditable` (общий `shared/lib/isTextField`, им теперь пользуется и `useKeyboardShortcuts`); открыт модальный диалог (`[aria-modal="true"]`: toast под оверлеем, фокус увёл бы из диалога); это автоповтор; нажаты Alt или Shift (Shift — это redo). Буква берётся из `event.key` на латинских раскладках (Dvorak тоже) и из `event.code` на остальных (кириллица).
- Объявление: `role="status"` теперь отдельный `sr-only` узел только с текстом «<сообщение>. Undo with Ctrl+Z» (`⌘Z` на Apple), а видимая карточка с кнопкой стоит рядом в том же контейнере. Так «Undo» не читается дважды. Место в порядке Tab не изменилось. Текст видимой карточки `aria-hidden`: он дублирует объявление. Объявление есть и на touch — по шаблону спеки.
- `kbd` стоит рядом с Undo, если не выполняется `(hover: none) and (pointer: coarse)`. Для этого добавлен `shared/hooks/useMediaQuery` (`useSyncExternalStore`, на сервере `false`), он же пригодится срезу H.
- Попутно: у `Modal` появились `role="dialog"`, `aria-modal` и обязательный `label` («New task», «Edit task»). Без этого открытый диалог нечем было отличить. Имя нужно, иначе axe ругается на `aria-dialog-name`.
- Тесты — `src/app/tests/undoToast.test.tsx`, 9 новых: Ctrl+Z откатывает Delete и фокусирует задачу; ничего не делает после 6 с; не перехватывается в поле формы и при открытом диалоге; текст объявления; `kbd` при fine и его нет при coarse; ⌘Z на macOS (Ctrl+Z там не срабатывает); axe с диалогом поверх toast. Проверки `textarea` и `contenteditable` отдельно не тестировались: поле формы одно. Чек-лист дополнен пунктом 7 и тремя проверками в разделе E. Все 15 наборов jest зелёные (61 тест), tsc и eslint чистые. В браузере не проверялось — это по чек-листу.
