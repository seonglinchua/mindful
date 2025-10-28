import { useCallback, useEffect, useRef, useState } from "react";
import { showGlobalToast } from "@/components/toast";

type InitialValue<T> = T | (() => T);

function resolveInitialValue<T>(value: InitialValue<T>): T {
  return typeof value === "function" ? (value as () => T)() : value;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: InitialValue<T>,
) {
  const defaultValue = useRef(resolveInitialValue(initialValue));
  const [storedValue, setStoredValue] = useState<T>(defaultValue.current);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Failed to read localStorage key "${key}"`, error);
    } finally {
      setIsHydrated(true);
    }
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const nextValue =
          typeof value === "function" ? (value as (prevValue: T) => T)(prev) : value;

        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem(key, JSON.stringify(nextValue));
          } catch (error) {
            // Handle quota exceeded errors
            if (
              error instanceof DOMException &&
              (error.name === "QuotaExceededError" ||
                error.name === "NS_ERROR_DOM_QUOTA_REACHED")
            ) {
              console.error(
                `localStorage quota exceeded for key "${key}". ` +
                  "Consider clearing old data or exporting to free up space.",
              );
              showGlobalToast(
                "Storage is full! Please export your data and consider clearing old entries.",
                "error",
                8000
              );
            } else {
              console.warn(`Failed to write localStorage key "${key}"`, error);
            }
          }
        }

        return nextValue;
      });
    },
    [key],
  );

  return [storedValue, setValue, isHydrated] as const;
}
