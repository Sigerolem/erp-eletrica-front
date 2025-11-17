import type { FormHTMLAttributes, JSX } from "preact";

interface DataFormProps extends FormHTMLAttributes {
  children: (JSX.Element | undefined)[];
}

export function DataForm({ children, className, ...rest }: DataFormProps) {
  return (
    <form
      className={`flex flex-col w-ful ${className ? className : "gap-4"}`}
      // onKeyDown={(e) => {
      //   if (e.key == "Enter") {
      //     e.preventDefault();
      //   }
      // }}
      {...rest}
    >
      {children}
    </form>
  );
}
