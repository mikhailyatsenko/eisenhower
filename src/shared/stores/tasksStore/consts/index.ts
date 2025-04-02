export const STORAGE_KEY = 'task-store';

export const LOCAL_STATE_KEY = 'local';
export const CLOUD_STATE_KEY = 'firebase';

export enum MatrixQuadrants {
  ImportantUrgent = 'Urgent & Important',
  ImportantNotUrgent = 'Important & Not Urgent',
  NotImportantUrgent = 'Urgent & Not Important',
  NotImportantNotUrgent = 'Not Urgent & Not Important',
}

export const MatrixQuadrantKeys = Object.keys(MatrixQuadrants);
