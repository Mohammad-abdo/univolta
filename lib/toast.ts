import toast from "react-hot-toast";

/**
 * Toast notification utilities for dashboard actions
 */

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 4000,
    });
  },

  error: (message: string) => {
    toast.error(message, {
      duration: 5000,
    });
  },

  loading: (message: string) => {
    return toast.loading(message);
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, messages);
  },

  info: (message: string) => {
    toast(message, {
      icon: "ℹ️",
      duration: 4000,
    });
  },

  warning: (message: string) => {
    toast(message, {
      icon: "⚠️",
      duration: 4000,
    });
  },
};

