/** "1 task", "3 tasks": a section's count in its header button's name */
export const tasksLabel = (count: number) =>
  `${count} task${count === 1 ? '' : 's'}`;
