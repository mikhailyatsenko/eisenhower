import { DEADLINE_CHIPS, DEADLINE_CHIP_KEYS } from '@/shared/consts';
import { keyLetter } from '@/shared/lib/keyLetter';
import { Deadline } from '@/shared/stores/tasksStore';
import { deadlineChipDate } from './deadlineChipDate';

/**
 * The deadline a key picks in the deadline choices: a chip's whole day by
 * its letter, on any layout, null (No deadline) by Delete or Backspace,
 * undefined for any other key
 */
export const deadlineByKey = (
  event: KeyboardEvent,
  now: Date,
): Deadline | null | undefined => {
  if (event.key === 'Delete' || event.key === 'Backspace') return null;
  const letter = keyLetter(event);
  const chip = DEADLINE_CHIPS.find(
    (deadlineChip) => DEADLINE_CHIP_KEYS[deadlineChip].toLowerCase() === letter,
  );
  return chip && { dueDate: deadlineChipDate(chip, now), hasDueTime: false };
};
