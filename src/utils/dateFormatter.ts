import { format } from 'date-fns';

export function formatDate(value: string) {
  return format(new Date(value), 'yyyy年M月d日');
}

export function todayInputValue() {
  return format(new Date(), 'yyyy-MM-dd');
}
