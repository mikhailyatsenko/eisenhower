/** "1 task", "3 tasks" */
export const taskCount = (count: number) =>
  `${count} ${count === 1 ? 'task' : 'tasks'}`;
