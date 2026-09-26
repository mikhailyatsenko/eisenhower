/**
 * What the deadline fields hold: the date as `yyyy-MM-dd`, empty without a
 * deadline, and the time as `HH:mm`, null while the time field is closed
 */
export interface DeadlineInput {
  date: string;
  time: string | null;
}
