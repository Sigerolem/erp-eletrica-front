import type { ReactNode } from "preact/compat";

export function ListWrapper({
  label,
  doOnClickAdd,
  doOnClickSearch,
  children,
}: {
  label: string;
  doOnClickAdd?: () => void;
  doOnClickSearch?: () => void;
  children: ReactNode | ReactNode[];
}) {
  return (
    <div>
      <header className={"flex items-center justify-start gap-2 pb-1"}>
        <span className={"font-semibold text-xl"}>{label}</span>
        {doOnClickAdd && (
          <button
            type={"button"}
            className={
              "bg-blue-800 px-2 shadow-md rounded-md text-2xl text-white font-semibold"
            }
            onClick={() => {
              doOnClickAdd();
            }}
          >
            +
          </button>
        )}
        {doOnClickSearch && (
          <button
            type={"button"}
            className={
              "bg-blue-800 p-1.5 shadow-md rounded-md text-white font-semibold flex items-center justify-center"
            }
            onClick={() => {
              doOnClickSearch();
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2.5"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </button>
        )}
      </header>

      <div
        className={"bg-slate-100 border border-slate-400 py-1 rounded-md mb-4"}
      >
        {children}
      </div>
    </div>
  );
}
