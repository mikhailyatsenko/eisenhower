# Единый словарь названий квадрантов

Type: grilling
Status: resolved

## Question

Сейчас в UI три словаря: действия (Do First / Schedule / Delegate / Eliminate) в матрице и toast, «Urgent & Important» / «Important & Not Urgent» (разный порядок слов) в форме, «URGENT & IMPORTANT» в Analytics. Оси подписаны «Urgent / Not Urgent», «Important / Not Important».

Какое название основное, какое вспомогательное (подзаголовок?), где какое показывать, и совпадает ли это с `CONTEXT.md`? Research: у конкурентов квадранты подписаны действиями, критерии идут подзаголовком.

## Answer

**Основное название квадранта — действие**, критерии идут подзаголовком. Названия не меняем:

| Ключ | Название (Title Case) | Критерии (sentence case) |
|---|---|---|
| `ImportantUrgent` | Do First | Important & urgent |
| `ImportantNotUrgent` | Schedule | Important, not urgent |
| `NotImportantUrgent` | Delegate | Not important, urgent |
| `NotImportantNotUrgent` | Eliminate | Not important, not urgent |

- Шаблон критериев строгий: сначала важность, потом срочность, как в строках матрицы. Меняется только одно слово.
- «Eliminate» и «Delegate» оставляем: это канонические термины метода и SEO-запросов. Опасение, что «Eliminate» прочитают как «удалить», снимает подзаголовок.
- **Где что показывать:**
  - заголовок квадранта и toast — только название;
  - кнопки квадранта в форме и Analytics — название плюс мелкий подзаголовок;
  - Smart Tip и прочие тексты — ссылаются на название («Schedule»), а не на критерии в кавычках;
  - в матрице критерии дают оси, подзаголовок в квадранте не нужен;
  - на mobile, где осей может не быть, решает задача «Мобильная матрица»;
  - онбординг решает задача «Онбординг первого визита».
- Для реализации: один источник названий и критериев вместо пары `QUADRANT_TITLES` и enum `MatrixQuadrants`, в котором сейчас лежат UI-строки. Welcome-тексты и Smart Tip приводятся к таблице выше.

## Comments

Дополнено из [Что Analytics даёт новичку](13-analytics-value.md): Analytics убирается, поэтому подзаголовок с критериями остаётся только в форме.
