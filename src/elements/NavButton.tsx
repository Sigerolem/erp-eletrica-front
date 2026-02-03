import { useEffect, useState } from "preact/hooks";

export function NavButton({ name, path }: { name: string; path: string }) {
  const [isSelected, setIsSelected] = useState(false);
  const [isDev, setIsDev] = useState(false);
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.pathname == path) {
      setIsSelected(true);
    }
    if (url.hostname.includes("localhost")) {
      setIsDev(true);
    }
  }, []);
  return (
    <a href={path}>
      <span
        class={`block text-white ${
          isSelected ? "bg-slate-600" : ""
        } cursor-pointer py-2 px-1 text-lg rounded-md hover:brightness-80 ${isDev ? "bg-red-600" : ""}`}
      >
        {name}
      </span>
    </a>
  );
}
