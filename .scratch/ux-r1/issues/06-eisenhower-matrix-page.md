# 06: Страница /eisenhower-matrix

**What to build:** Отдельная индексируемая страница объясняет метод: четыре квадранта с примерами, совет о балансе, как пользоваться приложением, «без регистрации», FAQ. Ссылка на неё есть в футере. Срез D [спеки R1](../spec.md), решения: [Онбординг первого визита](../../ui-ux-audit/issues/08-first-visit-onboarding.md), [Что Analytics даёт новичку](../../ui-ux-audit/issues/13-analytics-value.md).

**Blocked by:** 02

**Status:** resolved

- [x] Серверная страница `/eisenhower-matrix` на английском, со своими title и description.
- [x] Разделы: (1) что такое матрица и зачем она нужна; (2) четыре квадранта — название и критерии из словаря (тикет 02), 2–3 примера на квадрант (для Do First: «e.g. Server is down, tax return due tomorrow»), совет о балансе «следи, чтобы Do First не разрастался, а Schedule не пустел»; (3) как пользоваться приложением — описывает UI на момент релиза, позже его дополняют тикеты 13 и 17; (4) «No sign-up: tasks stay in this browser; sign in with Google to sync»; (5) короткий FAQ.
- [x] Текст о методе из удалённой welcome-модалки перенесён сюда.
- [x] В конце кнопка-ссылка «Open the matrix» ведёт на главную.
- [x] Страница есть в `sitemap`.
- [x] В футере рядом с Privacy Policy есть ссылка на страницу.
- [x] Страница проходит axe. Тест на seam серверных страниц: разделы, названия квадрантов, «Open the matrix», запись в `sitemap()`.

## Comments

**Итог (ветка `ux-r1`).**
- Страница — серверный компонент `src/pages/eisenhowerMatrix`, маршрут `app/eisenhower-matrix/page.tsx` со своими title, description и canonical. Разделы оформлены как `section` с `aria-labelledby`: What is the Eisenhower Matrix?, The four quadrants, How to use the app, No sign-up needed, FAQ. В конце ссылка «Open the matrix» на `/`, белый на `amber-700` (на `amber-600` контраст был ниже 4.5:1).
- Названия, критерии и клавиши квадрантов берутся из словаря `src/shared/consts/quadrants.ts`. В словарь добавлено поле `examples` («e.g. Server is down, tax return due tomorrow» и т. д.), его потом возьмёт срез I для пустых квадрантов. Пояснения «что делать с задачей» (переработанный текст welcome-модалки) живут на странице.
- Раздел 3 описывает UI на момент D: New Task, клавиши 1–4 открывают форму с выбранным квадрантом, действия по наведению (на touch видны всегда), drag, Completed под матрицей, переключатель вида. Срезы F и H его дописывают.
- Страница добавлена в `sitemap`, в футере рядом с Privacy Policy появилась ссылка «How the Eisenhower Matrix works».
- Тесты: `serverPages.test.tsx` проверяет metadata, пять разделов, карточки квадрантов (через регион и `listitem`), «Open the matrix», axe и запись в `sitemap()`. `renderServerHtml` теперь вешает разметку на `document.body`, иначе не работает axe. Ссылку в футере проверяет `footer.test.tsx` на главном seam: футер рендерит клиентский `AppShell`, а не страница. Моки Firebase и `next/navigation` в общий модуль не вынесены: третьего потребителя не появилось, `footer.test.tsx` идёт через `renderHomePage`.
- Чек-лист `docs/agents/a11y-checklist.md`, раздел D: шаги 4–5 и проверки страницы.
- Все 14 наборов jest зелёные (39 тестов), tsc, eslint и prettier чистые, `next build` проходит. На `next start` в серверном HTML есть title, canonical, `h1`, пять `h2` и ссылка в футере, `sitemap.xml` содержит `/eisenhower-matrix`. Вёрстку глазами в браузере не смотрел.
- Не сделано, необязательное (по ревью): `QUADRANT_DOTS` на странице — ещё одна карта MatrixKey→цвет рядом с `entities/addTaskForm/lib/colors.ts`, которая наружу не экспортируется. Шорткаты 1–4 и переключатель вида из `AppShell` работают и на этой странице (как и на `/privacy`), хотя там ничего не делают.
