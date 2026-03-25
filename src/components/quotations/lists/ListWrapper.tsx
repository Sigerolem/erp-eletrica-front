import type { ReactNode } from "preact/compat";

export function ListWrapper({
  label,
  doOnClickAdd,
  doOnClickSearch,
  doOnClickGear,
  children,
  hideAddButton,
  hideGearButton,
}: {
  label: string;
  doOnClickAdd?: () => void;
  doOnClickSearch?: () => void;
  doOnClickGear?: () => void;
  children: ReactNode | ReactNode[];
  hideAddButton?: boolean;
  hideGearButton?: boolean;
}) {
  return (
    <div>
      <header className={"flex items-center justify-start gap-2 pb-1"}>
        <span className={"font-semibold text-xl"}>{label}</span>
        {!hideAddButton && doOnClickAdd && (
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
        {!hideAddButton && doOnClickSearch && (
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

        {!hideGearButton && doOnClickGear && (
          <button
            type={"button"}
            className={
              "bg-blue-800 p-1.5 shadow-md rounded-md text-white font-semibold flex items-center justify-center"
            }
            onClick={() => {
              doOnClickGear();
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 1.065 1.065 2.828 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.533 1.756-2.644 1.756-3.178 0a1.724 1.724 0 0 0-2.572-1.065c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.533-1.756-2.644 0-3.178a1.724 1.724 0 0 0 1.065-2.572c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
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
