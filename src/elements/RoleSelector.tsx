export function RoleSelector({
  label,
  doOnSelect,
  value,
  disabled,
}: {
  label?: string;
  value: string;
  doOnSelect: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className={"flex flex-col"}>
      <label className={"font-semibold not-md:text-sm pl-1"} htmlFor="select">
        {label}
      </label>
      <select
        className={
          "bg-white border border-slate-300 p-2 rounded-md " +
          (disabled ? "bg-blue-50! cursor-not-allowed!" : "")
        }
        onChange={(e) => {
          doOnSelect(e.currentTarget.value);
        }}
        value={value}
        disabled={disabled}
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
