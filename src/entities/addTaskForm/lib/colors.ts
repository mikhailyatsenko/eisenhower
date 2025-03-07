// eslint-disable-next-line boundaries/element-types
import { type MatrixKey } from '@/entities/Tasks/@x/matrixKey'; //@x notation is used to cross-imports between slices (see https://feature-sliced.design/docs/guides/examples/types)

export const colors: Record<
  MatrixKey,
  { bg: string; hover: string; peerCheckedBg: string; border: string }
> = {
  ImportantUrgent: {
    bg: 'bg-red-300',
    hover: 'hover:bg-red-400',
    peerCheckedBg: 'peer-checked:bg-red-400',
    border: 'border-red-200',
  },
  ImportantNotUrgent: {
    bg: 'bg-amber-300',
    hover: 'hover:bg-amber-400',
    peerCheckedBg: 'peer-checked:bg-amber-400',
    border: 'border-amber-200',
  },
  NotImportantUrgent: {
    bg: 'bg-blue-300',
    hover: 'hover:bg-blue-400',
    peerCheckedBg: 'peer-checked:bg-blue-400',
    border: 'border-blue-200',
  },
  NotImportantNotUrgent: {
    bg: 'bg-green-300',
    hover: 'hover:bg-green-400',
    peerCheckedBg: 'peer-checked:bg-green-400',
    border: 'border-green-200',
  },
};
