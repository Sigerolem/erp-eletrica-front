import type { FormHTMLAttributes, JSX } from "preact";

interface DataFormProps extends FormHTMLAttributes {
  children: (JSX.Element | undefined)[];
}

export function DataForm({ children, className, ...rest }: DataFormProps) {
  return (
    <form className={`flex flex-col gap-4 w-ful ${className ?? ""}`} {...rest}>
      {children}
    </form>
  );
}
