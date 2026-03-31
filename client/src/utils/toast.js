import { toast as hotToast } from "react-hot-toast";

const baseStyle = {
  border: "1px solid #e7e5e4",
  background: "#fafaf9",
  color: "#1c1917",
  borderRadius: "16px",
  padding: "14px 16px",
  boxShadow: "0 10px 30px rgba(28, 25, 23, 0.08)",
};

const mergeOptions = (options = {}) => ({
  duration: 3500,
  style: {
    ...baseStyle,
    ...(options.style || {}),
  },
  ...options,
});

const toast = Object.assign(
  (message, options) => hotToast(message, mergeOptions(options)),
  {
    success: (message, options) =>
      hotToast.success(message, mergeOptions(options)),
    error: (message, options) =>
      hotToast.error(message, mergeOptions(options)),
    loading: (message, options) =>
      hotToast.loading(message, mergeOptions(options)),
    promise: (promise, messages, options) =>
      hotToast.promise(promise, messages, mergeOptions(options)),
    custom: hotToast.custom,
    dismiss: hotToast.dismiss,
    remove: hotToast.remove,
  }
);

export { toast, baseStyle };
