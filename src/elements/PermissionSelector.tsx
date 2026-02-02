export function PermissionSelector({
  label,
  doOnSelect,
  value,
}: {
  label?: string;
  value: string;
  doOnSelect: (value: string) => void;
}) {
  return (
    <div className={"flex flex-col"}>
      <label className={"font-semibold not-md:text-sm pl-1"} htmlFor="select">
        {label}
      </label>
      <select
        className={"bg-white border border-slate-300 p-2 rounded-md"}
        onChange={(e) => {
          doOnSelect(e.currentTarget.value);
        }}
        value={value}
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
