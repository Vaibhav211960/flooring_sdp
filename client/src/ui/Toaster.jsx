import { Toaster as HotToaster } from "react-hot-toast";
import { baseStyle } from "../utils/toast";

export function Toaster() {
  return (
    <HotToaster
      position="top-right"
      gutter={12}
      toastOptions={{
        duration: 3500,
        style: baseStyle,
        success: {
          iconTheme: {
            primary: "#d97706",
            secondary: "#fafaf9",
          },
        },
        error: {
          iconTheme: {
            primary: "#dc2626",
            secondary: "#fafaf9",
          },
        },
      }}
    />
  );
}
