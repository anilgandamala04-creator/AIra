import { create } from 'zustand';
import type { Toast, ToastType, ToastAction } from '../components/common/Toast';

const NOTIFICATION_HISTORY_MAX = 50;

export interface NotificationEntry extends Toast {
    timestamp: number;
}

interface ToastStore {
    toasts: Toast[];
    history: NotificationEntry[];
    showToast: (message: string, type?: ToastType, duration?: number, action?: ToastAction) => void;
    removeToast: (id: string) => void;
    clearAll: () => void;
    clearHistory: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    history: [],
    showToast: (message, type = 'info', duration = 5000, action) => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        const toast: Toast = { id, message, type, duration, action };
        const entry: NotificationEntry = { ...toast, timestamp: Date.now() };
        set((state) => ({
            toasts: [...state.toasts, toast],
            history: [entry, ...state.history].slice(0, NOTIFICATION_HISTORY_MAX),
        }));
    },
    removeToast: (id) => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    },
    clearAll: () => {
        set({ toasts: [] });
    },
    clearHistory: () => set({ history: [] }),
}));

// Convenience functions
export const toast = {
    success: (message: string, duration?: number, action?: ToastAction) => useToastStore.getState().showToast(message, 'success', duration, action),
    error: (message: string, duration?: number, action?: ToastAction) => useToastStore.getState().showToast(message, 'error', duration, action),
    info: (message: string, duration?: number, action?: ToastAction) => useToastStore.getState().showToast(message, 'info', duration, action),
    warning: (message: string, duration?: number, action?: ToastAction) => useToastStore.getState().showToast(message, 'warning', duration, action),
};
