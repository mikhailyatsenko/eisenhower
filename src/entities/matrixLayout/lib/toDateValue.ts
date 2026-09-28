import { format } from 'date-fns';

/** A date as the native date field holds it */
export const toDateValue = (date: Date) => format(date, 'yyyy-MM-dd');
