export function UnitSelector({
  label,
  doOnSelect,
  value,
  type = "material",
  disabled = false,
}: {
  label?: string;
  value: string;
  type?: "material" | "service";
  doOnSelect: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className={"flex flex-col"}>
      <label className={"font-semibold not-md:text-sm"} htmlFor="select">
        {label}
      </label>
      <select
        className={"bg-white border border-slate-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-blue-50"}
        onChange={(e) => {
          doOnSelect(e.currentTarget.value);
        }}
        value={value}
        disabled={disabled}
      >
        {type == "material" && (
          <optgroup label={"Selecione:"}>
            <option value="un">Unidade</option>
            <option value="m">Metro</option>
            <option value="cent">Cento</option>
            <option value="pct">Pacote</option>
          </optgroup>
        )}
        {type == "service" && (
          <optgroup label={"Selecione:"}>
            <option value="un">Unidade</option>
            <option value="h">Hora</option>
            <option value="d">Dia</option>
            <option value="km">Kilometro</option>
          </optgroup>
        )}
      </select>
    </div>
  );
}
