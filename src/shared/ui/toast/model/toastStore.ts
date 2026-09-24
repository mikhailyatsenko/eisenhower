import { create } from 'zustand';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastContent {
  message: string;
  action?: ToastAction;
}

export interface Toast extends ToastContent {
  id: number;
}

interface ToastState {
  /** The only slot: a new toast replaces the shown one */
  toast: Toast | null;
}

export const useToastStore = create<ToastState>()(() => ({ toast: null }));

let lastId = 0;

/** Shows a toast in place of the current one and returns its id */
export const showToast = (content: ToastContent) => {
  lastId += 1;
  useToastStore.setState({ toast: { ...content, id: lastId } });
  return lastId;
};

/** Hides the toast; with an id, only if that toast is still the shown one */
export const dismissToast = (id?: number) => {
  useToastStore.setState((state) =>
    id === undefined || state.toast?.id === id ? { toast: null } : state,
  );
};
