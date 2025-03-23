export const STORAGE_KEY = 'task-store';

export const DEFAULT_ACTIVE_STATE = 'local';

export enum MatrixQuadrants {
  ImportantUrgent = 'Urgent & Important',
  ImportantNotUrgent = 'Important & Not Urgent',
  NotImportantUrgent = 'Urgent & Not Important',
  NotImportantNotUrgent = 'Not Urgent & Not Important',
}

export const MatrixQuadrantKeys = Object.keys(MatrixQuadrants);
