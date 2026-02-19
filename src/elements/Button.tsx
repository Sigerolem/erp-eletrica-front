import type { ButtonHTMLAttributes } from "preact";

interface ButtonProps extends ButtonHTMLAttributes {
  text: string;
  loading?: boolean;
}

export function Button({
  text,
  type,
  className,
  loading,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type ?? "button"}
      className={`p-2 rounded-md shadow-md font-semibold ${
        className ? className : "bg-blue-700 text-white"
      }
      ${loading && "cursor-wait!"}
      `}
      {...rest}
    >
      {text}
    </button>
  );
}
