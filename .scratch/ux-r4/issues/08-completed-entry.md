# 08: Строка «✓ N completed →» и «Show more»

**What to build:** Пользователь Matrix узнаёт о завершённых задачах по строке под матрицей и одним нажатием попадает на раскрытую секцию Completed; длинный Completed показывается порциями по 50. Срез O [спеки R4](../spec.md), раздел «O. Completed как секция List view» (Строка в Matrix, Порядок и объём); решение: [Блок Completed](../../ui-ux-audit/issues/14-completed-section.md).

**Blocked by:** 07

**Status:** resolved

- [x] Под матрицей и строкой подсказки I кнопка «✓ N completed →» («✓ 1 completed →»); без завершённых её нет. Контраст ≥ 4.5:1, 44×44 на телефоне.
- [x] Клик: вид List, Completed раскрыта (и запомнено), прокрутка к её заголовку, фокус на кнопке заголовка. Прокрутки наверх из 06 здесь нет — явное исключение в том же пути смены вида.
- [x] В Completed первые 50, «Show more» добавляет следующие 50, пока не кончатся; после нажатия фокус на первой из новых. Сколько показано, не запоминается.
- [x] Главный seam: без завершённых строки нет; с тремя — «✓ 3 completed →», клик → выбран `tab` «List», «Completed, 3 tasks» раскрыта и в фокусе, `scrollTo` наверх не вызывался, `scrollIntoView` у заголовка вызван; 60 завершённых → 50 `option`, «Show more» → 60, фокус на 51-й; после `reload()` снова 50; axe.
- [x] Чек-лист: раздел O «Путь в Completed» — строка на телефоне и desktop, переход без автопрокрутки страницы мимо секции, «Show more» клавиатурой и VoiceOver.

## Comments

**Что сделано.**

- **Строка** — `features/switchViewMode/ui/CompletedEntry`: кнопка «✓ N completed →» после `SelectionHint`, только в Matrix и только с завершёнными. «✓» и «→» `aria-hidden`, доступное имя «3 completed». `min-h-11`, gray-700/300 как у строки подсказки.
- **Переход** — `switchView('list', { scrollsToTop: false })` (опция, как просил 06) и `setCompletedExpandedAction(true)` внутри `flushSync`, чтобы секция уже была в DOM; затем `revealCompletedSection()` из `entities/matrixLayout/lib`: `scrollIntoView({ block: 'start', behavior: 'instant' })` у обёртки секции (`data-completed-section`, `scroll-mt` на высоту верхних полос) и фокус на кнопке заголовка с `preventScroll`.
- **Порции** — `COMPLETED_PAGE_SIZE = 50` в `widgets/taskMatrix/consts`, лимит — `useState` в `TaskMatrix`: и секция, и клавиатура/панель (`shownCompleted`) видят одну порцию. `ListLayout`/`CompletedSection` получили `completedCount` (для «Completed (60)» и имени кнопки) и `onShowMore` (нет, когда показаны все). «Show more» под списком, фокус на первой из новых — эффект по `tasks.length`.
- **Тесты** — `completedEntry.test`: без завершённых строки нет; «✓ 1 completed →» после подсказки, axe; клик → List, «Completed, 3 tasks» раскрыта и в фокусе, `scrollTo` не вызывался, `scrollIntoView` у элемента с заголовком, запоминание через `reload()`; 60 → 50, «Show more» → 60 и фокус на 51-й, после `reload()` снова 50, axe; «Show more» в Tab-порядке после последней показанной; сброс на 50 после сворачивания. В `completedSection.test` проверка «нет Completed в Matrix» уточнена: строка-вход там теперь есть.
- **Чек-лист** — раздел O «Путь в Completed».

**Решения, которых нет в тикете.**

- `scrollIntoView` вызывается у обёртки секции, а не у самого заголовка: заголовок липкий, и если он уже прилип, прокрутка к нему ничего бы не сделала. Верх обёртки — естественное место заголовка, `scroll-mt` ставит его сразу под шапку.
- Лимит сбрасывается на 50, когда Completed не видна (свёрнута, Matrix, опустела): «сколько показано, не запоминается» и внутри сессии.
- `↓` с последней показанной задачи дальше не идёт: скрытые задачи не в roving tabindex, до «Show more» доходят `Tab`.

**Проверено в Chrome** (dev на 3100, изолированный контекст, 16 задач и 60 завершённых, тёмная тема): из прокрученной матрицы клик по «✓ 60 completed →» — List, заголовок Completed на 60px (под полосами 56px), фокус на нём; «Show more» 44px, фокус на «Done 51» в видимой области, кнопка исчезла; ошибок и предупреждений в консоли нет. VoiceOver и телефон — пункты чек-листа.

**Ревью (стандарты и спека), что оставлено.** `revealCompletedSection` в `lib`, хотя делает прокрутку и фокус, а не чистое вычисление; перенос фокуса после «Show more» — эффект внутри `CompletedSection`, не отдельный хук. Тройка `completedTasks` / `completedCount` / `onShowMoreCompleted` идёт через `TaskMatrix → TaskListView → ListLayout → CompletedSection` — кандидат в один тип вместе с тройкой из 07. Если `tasks.length` вырастет по другой причине между «Show more» и рендером (снимок облака), фокус может встать не на первую новую — маловероятная гонка.
