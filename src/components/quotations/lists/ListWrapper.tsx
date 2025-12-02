import type { JSX } from "preact";
import type { ReactNode } from "preact/compat";

export function ListWrapper({
  label,
  doOnClickAdd,
  children,
}: {
  label: string;
  doOnClickAdd: () => void;
  children: ReactNode | ReactNode[];
}) {
  return (
    <div>
      <header className={"flex items-center justify-start gap-2"}>
        <span className={"font-semibold"}>{label}</span>
        <button
          type={"button"}
          className={
            "bg-slate-700 px-2 shadow-md rounded-md text-white text-sm font-semibold"
          }
          onClick={() => {
            doOnClickAdd();
          }}
        >
          +
        </button>
      </header>
      <div
        className={"bg-slate-100 border border-slate-400 py-1 rounded-md mb-4"}
      >
        {children}
      </div>
    </div>
  );
}
