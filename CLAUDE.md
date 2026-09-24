## Agent skills

### Issue tracker

Issues и спеки лежат локальными markdown-файлами в `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Стандартные пять ролей: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` + `docs/adr/` в корне. See `docs/agents/domain.md`.

### Accessibility

Тесты главной идут через `renderHomePage` из `src/app/tests/`, axe — через `axe` из `src/app/tests/axe.ts` (там же известные исключения с кодами находок). Ручной чек-лист клавиатуры и VoiceOver — `docs/agents/a11y-checklist.md`, срез дописывает в него свои сценарии.
