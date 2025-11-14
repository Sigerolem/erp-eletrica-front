import type { JSX } from "preact";

interface AccordionProps {
  children: JSX.Element[];
}

export function Accordion({ children }: AccordionProps) {
  return (
    <div>
      {children.map((child) => (
        <div>{child}</div>
      ))}
    </div>
  );
}
