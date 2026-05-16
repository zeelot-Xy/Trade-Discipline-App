import { useEffect, useState } from "react";

export default function useToast(duration = 2800) {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeout = setTimeout(() => setToast(null), duration);
    return () => clearTimeout(timeout);
  }, [toast, duration]);

  return { toast, setToast };
}
