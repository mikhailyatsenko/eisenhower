# 16: Аватар и меню аккаунта

**What to build:** Вошедший пользователь видит в шапке свой аватар, а по клику — аккуратное меню с именем, email, местом хранения и «Sign out» вместо «пузыря» на полэкрана. Меню работает с клавиатуры по стандарту. Срез L [спеки R3](../spec.md), решения: [Шапка и навигация](../../ui-ux-audit/issues/07-header-navigation.md), [Минимальная планка доступности](../../ui-ux-audit/issues/11-accessibility-baseline.md) (меню аккаунта). Закрывает F4, P5, T1 (аккаунт).

**Blocked by:** 15

**Status:** ready-for-agent

- [ ] Аватар-кнопка с доступным именем по имени аккаунта, `aria-haspopup="menu"`, `aria-expanded`. Без фото — первая буква имени в круге.
- [ ] Меню под аватаром: имя и email (текст, не пункты), строка «Saved to your Google account», пункт `menuitem` «Sign out» (бывший «Logout»). Клиент аутентификации отдаёт `email`, в `CloudUser` добавлено поле; фейк seam тоже.
- [ ] Паттерн WAI-ARIA menu button: Enter, Space и ↓ открывают меню и ставят фокус на первый пункт; ↑↓ по пунктам; Esc закрывает и возвращает фокус на аватар; Tab и клик снаружи закрывают. Фокус никогда не на `body` (закрыт долг R1 C).
- [ ] «Sign out» при Pending changes открывает диалог R2 (J4) без изменений; «Stay signed in» и Esc возвращают фокус на аватар. Без Pending changes — выход сразу.
- [ ] Меню появляется fade'ом или мгновенно при `prefers-reduced-motion`.
- [ ] Удалены `entities/authIndicator` с компонентным тестом, `entities/themeToggleButton` (если ещё жив), `shared/ui/bubbleCornerButton`.
- [ ] Тесты на главном seam: кнопка с именем аккаунта и `aria-haspopup="menu"`; Enter → `menu` с именем, email, «Saved to your Google account», фокус на `menuitem` «Sign out»; Esc → фокус на аватаре; Tab и клик снаружи закрывают; «Sign out» при очереди → диалог R2, «Stay signed in» → фокус на аватаре; без очереди — выход; axe с открытым меню. `signOutDialog.test` и `signOut.test` обновлены под новое меню.
- [ ] Чек-лист, раздел L: меню клавиатурой и VoiceOver на macOS и iOS, закрытие касанием снаружи на телефоне, меню не перекрывает полосу синхронизации. Чек-лист J4 («Logout») поправлен на «Sign out».
