import type { Dispatch, StateUpdater } from "preact/hooks";

export function PermissionSelector({
  label,
  setPermissions,
  index,
  value,
}: {
  label?: string;
  index: number;
  value: string;
  setPermissions: Dispatch<StateUpdater<string>>
}) {
  return (
    <div className={"flex flex-col"}>
      <label className={"font-semibold not-md:text-sm pl-1"} htmlFor="select">
        {label}
      </label>
      <select
        className={"bg-white border border-slate-300 p-2 rounded-md"}
        onChange={(e) => {
          const newPermission = e.currentTarget.value;
          setPermissions(prev => prev.split('').map((value, i) => i == index ? newPermission : value).join(''))
        }}
        value={value[index]}
      >
        <optgroup label={"Selecione:"}>
          <option value="-">Nenhum</option>
          <option value="R">Visualizar</option>
          <option value="W">Criar/Editar</option>
          <option value="D">Deletar</option>
        </optgroup>
      </select>
    </div>
  );
}
