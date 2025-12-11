export function RoleSelector({
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
      <label className={"font-semibold not-md:text-sm"} htmlFor="select">
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
          <option value="admin">Admin</option>
          <option value="owner">Master</option>
          <option value="employee">Funcionário</option>
          <option value="guest">Convidado</option>
        </optgroup>
      </select>
    </div>
  );
}
