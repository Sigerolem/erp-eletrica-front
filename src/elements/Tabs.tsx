import { useState } from "preact/hooks";

interface TabsProps {
  tabs: string[];
  children: React.ReactNode[];
}

export function Tabs({ tabs, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  if (tabs.length !== children.filter((child) => child !== false).length) {
    throw new Error("Tabs and children must have the same length.");
  }

  return (
    <div className={"border border-slate-400 rounded-lg overflow-hidden"}>
      <nav>
        <ul className="flex min-w-full border-slate-500">
          {tabs.map((tab, index) => (
            <li
              key={index}
              className={`flex-1 text-center font-semibold text-lg border-slate-400 not-first:border-l ${
                index === activeTab
                  ? "bg-slate-100 text-black"
                  : "bg-slate-200 text-black border-b cursor-pointer hover:brightness-90!"
              }`}
              onClick={() => setActiveTab(index)}
            >
              {tab}
            </li>
          ))}
        </ul>
      </nav>
      <div className={"px-2 pb-4"}>{children[activeTab]}</div>
    </div>
  );
}
