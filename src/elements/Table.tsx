import { type JSX } from "preact/compat";

interface TableProps {
  children: JSX.Element[];
}

interface THeadProps {
  collumns: string[][];
}

export function Table({ children }: TableProps) {
  return <table className={"w-full table-auto"}>{children}</table>;
}

export function Th({ children }: { children: JSX.Element | string }) {
  return (
    <th
      className={
        "py-2 text-start bg-slate-600 text-white px-2 first:rounded-tl-md last:rounded-tr-md"
      }
    >
      {children}
    </th>
  );
}

export function Tr({
  children,
  key,
}: {
  children: JSX.Element[];
  key?: string;
}) {
  return (
    <tr
      key={key}
      className={"bg-blue-100 even:bg-blue-50 border border-blue-100"}
    >
      {children}
    </tr>
  );
}

export function Td({
  children,
  link,
}: {
  children: JSX.Element[] | string | JSX.Element;
  link?: string;
}) {
  if (link) {
    return (
      <td className={""}>
        <a href={link}>
          <div className={"p-1 py-1 min-w-full min-h-full"}>{children}</div>
        </a>
      </td>
    );
  }
  return <td className={"p-1"}>{children}</td>;
}

export function THead({ collumns }: THeadProps) {
  return (
    <thead>
      <tr>
        {collumns.map((col) => {
          if (col[1] == undefined) {
            return <Th>{col[0]}</Th>;
          } else {
            return (
              <Th>
                <>
                  {col[0]} <br />
                  {col[1]}
                </>
              </Th>
            );
          }
        })}
      </tr>
    </thead>
  );
}
