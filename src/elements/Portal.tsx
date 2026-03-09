import { createPortal, type ReactNode } from "preact/compat";
import { useEffect, useState } from "preact/hooks";

export function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? createPortal(children, document.body) : null;
}
