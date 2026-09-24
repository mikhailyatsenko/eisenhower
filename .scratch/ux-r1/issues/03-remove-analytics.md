# 03: Убрать Analytics

**What to build:** Новичок больше не видит Analytics с непонятным Focus Score, а Alt+S ничего не делает. Срез C [спеки R1](../spec.md), решение: [Что Analytics даёт новичку](../../ui-ux-audit/issues/13-analytics-value.md). Закрывает N1, N2.

**Blocked by:** 01

**Status:** resolved

- [x] Модуль `viewAnalytics`, флаг `isAnalyticsOpened` в `uiStore` и его action удалены.
- [x] Кнопки Analytics в интерфейсе нет.
- [x] Обработки Alt+S в `useKeyboardShortcuts` нет, Alt+S нигде не упоминается.
- [x] Тест на главном seam: кнопки Analytics нет, Alt+S не открывает диалог.

## Comments

**Итог (ветка `ux-r1`).**
- Удалены модуль `src/features/viewAnalytics` целиком (кнопка, модалка, `useAnalytics`), флаг `isAnalyticsOpened` в `uiStore` (тип и начальное значение) и `setIsAnalyticsOpenedAction`. Из `useKeyboardShortcuts` убрана ветка Alt+S. Из `AppShell` убрана `<ViewAnalytics />`. Кнопка стояла крайней слева в правой угловой группе, поэтому дыры в шапке не осталось.
- Тест на главном seam — `src/app/tests/noAnalytics.test.tsx`: кнопки с именем Analytics нет, Alt+S не показывает заголовок Analytics. На `role="dialog"` тест не опирается: у общего `Modal` роли пока нет, и такая проверка прошла бы и на старом коде. Оба теста падали до удаления.
- В `docs/agents/a11y-checklist.md` добавлен раздел «C. Analytics и кнопка аккаунта». Тикет 04 дописывает в него сценарий кнопки аккаунта.
- `src/shared/lib/HeadScripts.tsx` (Google Analytics) к фиче не относится и не тронут. Alt+S упоминается только в тесте и чек-листе как проверка того, что клавиша ничего не делает.
- Все 10 наборов jest зелёные (28 тестов), tsc и eslint чистые. Ревью (standards + spec) замечаний по коду не оставило; тест и чек-лист поправлены по его замечаниям.
