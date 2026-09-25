/** The task's card in the matrix, if it's on the page */
export const taskCard = (taskId: string) =>
  Array.from(
    document.querySelectorAll<HTMLElement>('[role="option"][data-task-id]'),
  ).find((card) => card.dataset.taskId === taskId) ?? null;
