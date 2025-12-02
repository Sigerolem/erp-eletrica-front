//checkbox input with state
import { type InputHTMLAttributes, type TargetedEvent } from "preact";
import type { Dispatch, StateUpdater } from "preact/hooks";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  checked: boolean;
  setChecked: Dispatch<StateUpdater<boolean>>;
}

export function Checkbox({
  label,
  name,
  checked,
  setChecked,
  ...rest
}: CheckboxProps) {
  return (
    <div className="flex flex-col gap-1 items-start">
      <label htmlFor={name} className={"font-semibold"}>
        {label}
      </label>
      <input
        type="checkbox"
        id={name}
        name={name}
        checked={checked}
        onChange={(e) => {
          setChecked(e.currentTarget.checked);
        }}
        className={
          "min-w-8 min-h-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        }
        onKeyPress={(e) => {
          if (e.key == "Enter") {
            e.preventDefault();
          }
        }}
        {...rest}
      />
    </div>
  );
}
