import { type InputHTMLAttributes, type TextareaHTMLAttributes } from "preact";
import { useEffect } from "preact/hooks";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  errors?: { [key: string]: string };
  name: string;
  disabled?: boolean;
}

export function Textarea({
  label,
  errors,
  name,
  disabled,
  ...rest
}: TextAreaProps) {
  return (
    <div className="flex flex-col flex-1 relative min-w-20">
      {label !== "" && (
        <label className="mb-0.5 font-semibold pl-1">{label}</label>
      )}
      <textarea
        onFocus={(e) => {
          e.currentTarget.select();
        }}
        {...rest}
        name={name}
        disabled={disabled}
        className={`min-h-16 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          rest.className || ""
        } 
        ${errors?.[name] ? "border-red-500" : ""} 
        ${disabled ? "bg-blue-50" : "bg-white"}
        `}
      />
      {errors?.[name] == undefined || (
        <span className={"text-red-500 text-xs absolute -bottom-4 left-1"}>
          {errors?.[name]}
        </span>
      )}
    </div>
  );
}
