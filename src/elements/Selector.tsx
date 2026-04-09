export function Selector({
  label,
  doOnSelect,
  options,
  value,
  disabled = false,
}: {
  label?: string;
  value: string;
  options: { value: string; label: string }[];
  doOnSelect: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className={"flex flex-col"}>
      {label && (
        <label className={"font-semibold not-md:text-sm"}>{label}</label>
      )}
      <select
        className={
          "bg-white border border-slate-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-blue-50"
        }
        onChange={(e) => {
          doOnSelect(e.currentTarget.value);
        }}
        value={value}
        disabled={disabled}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
