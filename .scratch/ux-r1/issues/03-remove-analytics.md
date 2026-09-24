# 03: Убрать Analytics

**What to build:** Новичок больше не видит Analytics с непонятным Focus Score, а Alt+S ничего не делает. Срез C [спеки R1](../spec.md), решение: [Что Analytics даёт новичку](../../ui-ux-audit/issues/13-analytics-value.md). Закрывает N1, N2.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Модуль `viewAnalytics`, флаг `isAnalyticsOpened` в `uiStore` и его action удалены.
- [ ] Кнопки Analytics в интерфейсе нет.
- [ ] Обработки Alt+S в `useKeyboardShortcuts` нет, Alt+S нигде не упоминается.
- [ ] Тест на главном seam: кнопки Analytics нет, Alt+S не открывает диалог.
