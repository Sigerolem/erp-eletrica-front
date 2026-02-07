import { useEffect, useState } from "preact/hooks";

export function NavButton({
  name,
  path,
  isSelected,
}: {
  name: string;
  path: string;
  isSelected?: boolean;
}) {
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    if (window.location.hostname.includes("localhost")) {
      setIsDev(true);
    }
  }, []);

  return (
    <a href={path}>
      <span
        class={`block text-white cursor-pointer py-2 px-1 text-lg rounded-md hover:brightness-80 ${isSelected ? "bg-slate-600" : isDev ? "bg-red-400" : ""}`}
      >
        {name}
      </span>
    </a>
  );
}
