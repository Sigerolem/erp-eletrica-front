export function UnitSelector({
  label,
  doOnSelect,
  value,
  type = "material",
}: {
  label?: string;
  value: string;
  type?: "material" | "service";
  doOnSelect: (value: string) => void;
}) {
  return (
    <div className={"flex flex-col"}>
      <label className={"font-semibold"} htmlFor="select">
        {label}
      </label>
      <select
        className={"bg-white border border-slate-300 p-2 rounded-md"}
        onChange={(e) => {
          doOnSelect(e.currentTarget.value);
        }}
        value={value}
      >
        {type == "material" && (
          <optgroup label={"Selecione:"}>
            <option value="un">Unidade</option>
            <option value="m">Metro</option>
            <option value="l">Litro</option>
            <option value="kg">Kilograma</option>
            <option value="pct">Pacote</option>
            <option value="rolo">Rolo</option>
            <option value="cx">Caixa</option>
          </optgroup>
        )}
        {type == "service" && (
          <optgroup label={"Selecione:"}>
            <option value="un">Unidade</option>
            <option value="h">Hora</option>
            <option value="d">Dia</option>
            <option value="sem">Semana</option>
            <option value="m">Metro</option>
            <option value="m2">Metro²</option>
            <option value="km">Kilometro</option>
          </optgroup>
        )}
      </select>
    </div>
  );
}
