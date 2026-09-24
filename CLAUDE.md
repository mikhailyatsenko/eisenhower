## Agent skills

### Issue tracker

Issues и спеки лежат локальными markdown-файлами в `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Стандартные пять ролей: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` + `docs/adr/` в корне. See `docs/agents/domain.md`.

### Accessibility

Тесты главной идут через `renderHomePage` из `src/app/tests/`, axe — через `axe` из `src/app/tests/axe.ts` (там же известные исключения с кодами находок). Ручной чек-лист клавиатуры и VoiceOver — `docs/agents/a11y-checklist.md`, срез дописывает в него свои сценарии.

### Ветки и мерж при реализации тикетов

Тикеты одного релиза (`.scratch/<release>/issues/`, например `ux-r1`) коммитятся прямо в ветку релиза с тем же именем (`ux-r1`). Отдельную ветку на тикет не создавай, от `main` не ветвись: тикеты зависят друг от друга, и каждому нужен код предыдущих. Если текущая ветка не та, переключись на ветку релиза до начала работы.

В `main` ветка релиза уходит через PR, когда закрыт последний тикет **среза** (буква среза и его тикеты указаны в `spec.md` релиза). `main` деплоится на Vercel, а промежуточное состояние внутри среза в прод попадать не должно. Закрыв последний тикет среза, предложи пользователю PR `<release>` → `main` с проверкой на Vercel preview; мержит пользователь.
