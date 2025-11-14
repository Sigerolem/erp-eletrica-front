import type { ButtonHTMLAttributes } from "preact";

interface ButtonProps extends ButtonHTMLAttributes {
  text: string;
}

export function Button({ text, type, className, ...rest }: ButtonProps) {
  return (
    <button
      type={type ?? "button"}
      className={`p-2 rounded-md shadow-md font-semibold ${
        className ? "" : "bg-blue-700 text-white"
      }`}
      {...rest}
    >
      {text}
    </button>
  );
}
