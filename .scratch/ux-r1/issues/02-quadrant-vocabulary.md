# 02: Единый словарь названий квадрантов

**What to build:** Каждый **Quadrant** везде называется одинаково — действием: Do First / Schedule / Delegate / Eliminate. В форме добавления и правки под названием мелким подзаголовком идут критерии. Срез B [спеки R1](../spec.md), решение: [Единый словарь названий квадрантов](../../ui-ux-audit/issues/09-quadrant-vocabulary.md). Закрывает A2 и часть N1.

**Blocked by:** 01

**Status:** resolved

- [x] Один модуль словаря в shared заменяет пару `QUADRANT_TITLES` и UI-строки в значениях enum `MatrixQuadrants`. Для каждого `MatrixKey` он отдаёт название, критерии, порядок и номер клавиши 1–4.
- [x] Критерии строго по шаблону «сначала важность, потом срочность»: «Important & urgent», «Important, not urgent», «Not important, urgent», «Not important, not urgent».
- [x] Ключи `MatrixKey` не меняются, данные в localStorage и Firestore читаются как раньше.
- [x] Заголовок квадранта и toast показывают только название. Кнопки выбора квадранта в формах добавления и правки — название плюс подзаголовок с критериями.
- [x] Строк «Urgent & Important» и подобных сочетаний как названия квадранта в UI нет. Welcome-модалка и Analytics не правятся: они уходят в тикетах 03 и 05.
- [x] Тест на главном seam: названия и подзаголовки в форме, только название в заголовке квадранта.

## Comments

**Итог (ветка `feat/ux-r1-quadrant-vocabulary`, от `feat/ux-r1-a11y-infra`).**
- Словарь — `src/shared/consts/quadrants.ts`: `MATRIX_KEYS` (порядок Do First, Schedule, Delegate, Eliminate), тип `MatrixKey` и `QUADRANTS` с `title`, `criteria`, `shortcut` по каждому ключу. `QUADRANT_TITLES`, enum `MatrixQuadrants` и `MatrixQuadrantKeys` удалены. `MatrixKey` по-прежнему реэкспортируется из `tasksStore`, строки ключей те же, так что localStorage и Firestore читаются как раньше.
- Заголовок квадранта и toast добавления берут только `title`. Шорткаты 1–4 и порядок квадрантов (`useQuadrantOrder`, `MatrixLayout`) идут из словаря.
- Кнопки выбора квадранта в `EditTaskForm` (форма добавления использует её же) показывают название и мелкий подзаголовок-критерии. Имя кнопки — только название (`aria-labelledby`), критерии идут описанием (`aria-describedby`).
- Analytics правился вынужденно: подписи `QuadrantMini` брались из значений удалённого enum и теперь показывают названия из словаря (Do First…). Smart Tip с «Important & Not Urgent» и тексты Welcome не тронуты, их уберут тикеты 03 и 05.
- Тест на главном seam: `src/app/tests/quadrantVocabulary.test.tsx` проверяет заголовки квадрантов, имена и описания кнопок в формах добавления и правки, toast «added to "Delegate"» и отсутствие старых названий. В чек-лист `docs/agents/a11y-checklist.md` добавлен раздел «B. Названия квадрантов».
- Все 9 наборов jest зелёные (26 тестов), tsc и eslint чисты. Ревью (standards + spec) замечаний по существу не оставило. Необязательное, не сделано: перевести на `MATRIX_KEYS` обходы через `Object.keys` в `AuthIndicator`, `TaskListView` и `tasksStore/actions`.
