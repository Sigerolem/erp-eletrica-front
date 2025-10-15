import { type InputHTMLAttributes } from "preact";
import { useEffect } from "preact/hooks";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  errors?: { [key: string]: string };
  name: string;
}

export function Input({ label, errors, name, ...rest }: InputProps) {
  return (
    <div className="flex flex-col mb-4 flex-1">
      <label className="mb-0.5 font-semibold pl-1">{label}</label>
      <input
        onFocus={(e) => {
          e.currentTarget.select();
        }}
        {...rest}
        name={name}
        className={`border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          rest.className || ""
        } ${errors?.[name] ? "border-red-500" : ""}`}
      />
      <span className={"text-red-500 text-sm"}>{errors?.[name]}</span>
    </div>
  );
}
