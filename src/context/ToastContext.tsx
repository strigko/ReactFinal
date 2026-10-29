import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode
} from "react";

type ToastType = "success" | "error";

type ToastMessage = {
  id: number;
  text: string;
  type: ToastType;
};

type ToastContextType = {
  showToast: (text: string, type: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  function showToast(text: string, type: ToastType) {
    const id = Date.now() + Math.random();

    setToasts((current) => [...current, { id, text, type }]);
  }

  useEffect(() => {
    if (toasts.length === 0) return;

    const timer = window.setTimeout(() => {
      setToasts((current) => current.slice(1));
    }, 3500);

    return () => window.clearTimeout(timer);
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="toastContainer">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast ${toast.type}`}
            role="status"
          >
            {toast.text}
            <button
              type="button"
              onClick={() =>
                setToasts((current) =>
                  current.filter((item) => item.id !== toast.id)
                )
              }
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}