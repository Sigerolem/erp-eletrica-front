import { Input } from "src/elements/Input";
import { Td, Tr } from "src/elements/Table";
import { UnitSelector } from "src/elements/UnitSelector";
import { BrlStringFromCents } from "src/utils/formating";
import type { LaborsType } from "./Labors";
import { useEffect, useState } from "preact/hooks";

interface Props {
  labor: LaborsType;
}

export function LaborRow({ labor }: Props) {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [cost, setCost] = useState(0);
  const [value, setValue] = useState(0);
  const [profit, setProfit] = useState(0);

  useEffect(() => {
    if (!labor) {
      return;
    }
    setName(labor.name);
    setUnit(labor.unit);
    setCost(labor.cost);
    setValue(labor.value);
    setProfit(labor.profit)
  }, [labor]);

  return (
    <Tr key={labor.id}>
      <Td>
        <Input name={`${labor.id}-name`} value={name} />
        <UnitSelector
          value={unit}
          type={"service"}
          doOnSelect={(value) => { setUnit(value); }}
        />
      </Td>
      <Td>
        <Input
          name={`${labor.id}-cost`}
          value={BrlStringFromCents(cost)}
        />
        <Input
          name={`${labor.id}-profit`}
          value={`${(profit / 100).toFixed(2).replace(".", ",")} %`}
        />
        <Input
          name={`${labor.id}-value`}
          value={BrlStringFromCents(value)}
        />
      </Td>
    </Tr>
  );
}
