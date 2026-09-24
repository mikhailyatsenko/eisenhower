# 05: Без welcome-модалки, серверный h1 на главной

**What to build:** Матрица открывается сразу, без модалки: ни при первом визите, ни при повторных. Над матрицей стоит постоянный короткий заголовок, который отдаёт сервер. Срез D [спеки R1](../spec.md), решение: [Онбординг первого визита](../../ui-ux-audit/issues/08-first-visit-onboarding.md). Закрывает F1, F2.

**Blocked by:** 02

**Status:** resolved

- [x] Welcome-модалка удалена вместе с автопоказом через 500 мс и чтением и записью `dontShowPopup`. Старый ключ в браузерах просто не читается, миграции нет.
- [x] На главной над матрицей мелким текстом стоит `h1` «Eisenhower Matrix — prioritize tasks by urgency and importance». Он есть в серверном HTML до гидрации и не мелькает.
- [x] Тест на главном seam: модалки нет ни сразу, ни после 500 мс (fake timers).
- [x] Тест на seam серверных страниц: у главной есть `h1` с этим текстом.

## Comments

**Итог (ветка `ux-r1`).**
- Модуль `src/entities/welcomeModal` удалён целиком вместе с автопоказом через 500 мс и `dontShowPopup`, `AppShell` его больше не рендерит. Custom-variants `limitedHeight639` и `sm576` в `globals.css` использовала только модалка, они тоже удалены. У `renderHomePage` больше нет опции `showWelcome`.
- `HomePage` стал серверным компонентом с `h1` «Eisenhower Matrix — prioritize tasks by urgency and importance» над матрицей (`text-sm`). Части, которые зависят от store, вынесены в клиентские `SyncGlow` (градиент облачного Storage) и `CompletedTasks` (данные из store для `CompletedTasksAccordion`). На desktop у `h1` есть отступ `md:mt-7`, без него он прятался под фиксированной размытой полосой шапки (`h-12`). В браузере после `next build && next start` проверено: `h1` есть в серверном HTML (`curl`) и виден на 1280 и 375 px.
- Тесты: главный seam — `src/app/tests/noWelcomeModal.test.tsx` (fake timers, модалки нет сразу и через 500 мс). Тонкий серверный seam — `src/app/tests/serverPages.test.tsx`: `renderToString` из `react-dom/server.node` (браузерной сборке нужен `MessageChannel`, которого нет в jsdom, типы описаны в `reactDomServerNode.d.ts`) и поиск единственного `heading` первого уровня. Тикет 06 допишет в этот же файл страницу `/eisenhower-matrix` и sitemap.
- В чек-лист `docs/agents/a11y-checklist.md` добавлен раздел «D. Онбординг вне матрицы», из вступления убран шаг «закрыть приветственное окно».
- **Для тикета 06:** текст о методе из модалки удалён вместе с ней. Его можно взять из `a688195:src/entities/welcomeModal/components/textContent/`.
- Все 13 наборов jest зелёные (32 теста), tsc, eslint и prettier чистые, `next build` проходит. По итогам ревью (standards + spec) серверный тест переведён на поиск по роли. Не сделано, необязательное: вынести моки Firebase и `next/navigation`, которые повторяются в `renderHomePage` и `serverPages.test.tsx`, в общий модуль. Делать это стоит, когда тикет 06 добавит третий потребитель.
