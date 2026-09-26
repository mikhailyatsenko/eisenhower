# 16: Аватар и меню аккаунта

**What to build:** Вошедший пользователь видит в шапке свой аватар, а по клику — аккуратное меню с именем, email, местом хранения и «Sign out» вместо «пузыря» на полэкрана. Меню работает с клавиатуры по стандарту. Срез L [спеки R3](../spec.md), решения: [Шапка и навигация](../../ui-ux-audit/issues/07-header-navigation.md), [Минимальная планка доступности](../../ui-ux-audit/issues/11-accessibility-baseline.md) (меню аккаунта). Закрывает F4, P5, T1 (аккаунт).

**Blocked by:** 15

**Status:** resolved

- [x] Аватар-кнопка с доступным именем по имени аккаунта, `aria-haspopup="menu"`, `aria-expanded`. Без фото — первая буква имени в круге.
- [x] Меню под аватаром: имя и email (текст, не пункты), строка «Saved to your Google account», пункт `menuitem` «Sign out» (бывший «Logout»). Клиент аутентификации отдаёт `email`, в `CloudUser` добавлено поле; фейк seam тоже.
- [x] Паттерн WAI-ARIA menu button: Enter, Space и ↓ открывают меню и ставят фокус на первый пункт; ↑↓ по пунктам; Esc закрывает и возвращает фокус на аватар; Tab и клик снаружи закрывают. Фокус никогда не на `body` (закрыт долг R1 C).
- [x] «Sign out» при Pending changes открывает диалог R2 (J4) без изменений; «Stay signed in» и Esc возвращают фокус на аватар. Без Pending changes — выход сразу.
- [x] Меню появляется fade'ом или мгновенно при `prefers-reduced-motion`.
- [x] Удалены `entities/authIndicator` с компонентным тестом, `entities/themeToggleButton` (если ещё жив), `shared/ui/bubbleCornerButton`.
- [x] Тесты на главном seam: кнопка с именем аккаунта и `aria-haspopup="menu"`; Enter → `menu` с именем, email, «Saved to your Google account», фокус на `menuitem` «Sign out»; Esc → фокус на аватаре; Tab и клик снаружи закрывают; «Sign out» при очереди → диалог R2, «Stay signed in» → фокус на аватаре; без очереди — выход; axe с открытым меню. `signOutDialog.test` и `signOut.test` обновлены под новое меню.
- [x] Чек-лист, раздел L: меню клавиатурой и VoiceOver на macOS и iOS, закрытие касанием снаружи на телефоне, меню не перекрывает полосу синхронизации. Чек-лист J4 («Logout») поправлен на «Sign out».

## Comments

**Что сделано.**

- **Меню** — `features/auth/components/AccountMenu`: аватар-кнопка 44×44 (фото 32px с `alt=""` или первая буква имени в индиго-круге), `aria-label` по имени (запасные — email, «Account»), `aria-haspopup="menu"`, `aria-expanded`, `aria-controls` на открытое меню. Под ней панель: имя, email (`truncate`), «Saved to your Google account», под линией `menu` с одним `menuitem` «Sign out» (`tabIndex=-1`).
- **Текст — не пункты.** Имя, email и строка лежат в панели рядом с `menu`, а не внутри: `menu` подписан аватаром (`aria-labelledby`) и описан этим блоком (`aria-describedby`). Так в `menu` только пункты (axe `aria-required-children` чист), а VoiceOver читает имя меню и описание при входе в него.
- **Клавиатура:** Enter, Space (родной клик) и ↓/↑ на аватаре открывают меню, фокус на «Sign out»; клик мышью тоже. В меню ↑↓, Home, End держат фокус на пункте; Esc закрывает с фокусом на аватар; Tab уводит фокус дальше и меню закрывается по `blur`; Shift+Tab закрывает с фокусом на аватар.
- **Закрытие снаружи** — `pointerdown` на документе, а не потеря фокуса: iOS Safari не снимает фокус тапом по пустому месту, а Safari и Firefox на macOS не фокусируют кнопку по клику. Из-за второго `blur` без `relatedTarget` игнорируется, иначе повторный клик по аватару закрывал меню на `blur` и тут же открывал его кликом (нашло ревью).
- **Где стоит меню:** `absolute` с `top: var(--top-bars-height) + 4px` и правым отступом как у шапки. Контейнер — шапка (`backdrop-filter` делает её containing block), поэтому меню стоит под шапкой и полосой синхронизации и её не перекрывает. Обёртка `Auth` потеряла `relative z-50`. Появление — `motion-safe:animate-menu-fade-in` (150 мс), при `prefers-reduced-motion` сразу.
- **Sign out:** пункт закрывает меню с фокусом на аватар и зовёт прежний `handleSignOut`: при Pending changes диалог R2, его `restoreFocus` возвращает на аватар.
- **Фокус после входа** (долг из 15): `Auth` помнит, что пользователь был вышедшим после загрузки. Когда появляется пользователь, а фокус на `body` (кнопка «Sign in» в шапке или над пустой матрицей размонтировалась), фокус идёт на аватар. На странице, открытой уже вошедшим, и поверх диалога Migration — нет.
- `CloudUser.email` в клиенте и в фейке; у `SignedInUser` `email` необязателен, по умолчанию `<имя>@example.com`. Удалены `entities/authIndicator` с компонентным тестом и `shared/ui/bubbleCornerButton`; в `architecture.md` из «Унаследованного» убраны `authIndicator` и `themeToggleButton`.

**Тесты.** Новый `accountMenu.test`: аватар с именем, `aria-haspopup`, буквой; Enter/Space/↓ открывают с фокусом на «Sign out»; Enter → `menu` «Ada» с описанием «Ada ada@example.com Saved to your Google account»; стрелки; Esc; второй клик; второй клик без фокуса (Safari); Tab и Shift+Tab; клик снаружи; тап снаружи без смены фокуса; выход сразу; при очереди диалог и «Stay signed in» → аватар; фокус на аватар после «Sign in» в шапке и не на старте; axe с открытым меню. `account.ts` получил `getAccountButton`. `signOut`, `signOutDialog`, `migration`, `oneMatrix`, `noSignUpLine`, `signedOutLine`, `emptySpaceHint` жмут `menuitem` «Sign out». Весь jest: 410 тестов.

**Проверено в Chrome** (dev на 3100, изолированный контекст; вошедший подставлен временной правкой `Auth`, в коммит не вошла — настоящего входа Google нет): 1280 в тёмной и светлой теме — меню у правого края под шапкой; Enter → фокус на «Sign out», Esc → аватар, ↓ и Tab → фокус на «New task», меню закрыто. 320×640 и 375×667 с touch, с имитацией полосы 37px (`--top-bars-height` 93px): меню 24–312 и 79–367px, верх 97px — под полосой; `scrollWidth` равен ширине; аватар и пункт 44px; тап мимо закрывает. VoiceOver и настоящий Safari не проверял — пункты чек-листа L.

**Для следующих тикетов.** Срез L закрыт. `useAuth` держит `isLoading` до первого ответа Firebase; если аватар или «Sign in» появятся позже шапки на медленной сети, это видно как `opacity-20` — как и до R3.
