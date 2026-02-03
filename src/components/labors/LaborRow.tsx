import { useEffect, useState, type Dispatch, type StateUpdater } from "preact/hooks";
import { Button } from "src/elements/Button";
import { Input } from "src/elements/Input";
import { UnitSelector } from "src/elements/UnitSelector";
import { fetchWithToken } from "src/utils/fetchWithToken";
import { BrlStringFromCents } from "src/utils/formating";
import { validateFloatFieldOnBlur, validateStringFieldOnBlur } from "src/utils/inputValidation";
import type { LaborsType } from "./Labors";
import { hasPermission } from "src/utils/permissionLogic";

interface Props {
  labor: LaborsType;
  setLabors: Dispatch<StateUpdater<LaborsType[]>>;
  serverLabors: { [key: string]: LaborsType };
  setServerLabors: Dispatch<StateUpdater<{ [key: string]: LaborsType }>>;
}

export function LaborRow({ labor, serverLabors, setServerLabors, setLabors }: Props) {
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [cost, setCost] = useState(0);
  const [value, setValue] = useState(0);
  const [profit, setProfit] = useState(0);
  const [bgColor, setBgColor] = useState("bg-blue-100");
  const [userCanEditLabor, setUserCanEditLabor] = useState(false);
  const [userCanDeleteLabor, setUserCanDeleteLabor] = useState(false);

  useEffect(() => {
    if (!labor) {
      return;
    }
    const role = localStorage.getItem("apiRole");
    const permission = localStorage.getItem("apiPermissions");
    if (role == "owner" || hasPermission(permission ?? "----------------", "labor", 'W')) {
      setUserCanEditLabor(true);
    }
    if (role == "owner" || hasPermission(permission ?? "----------------", "labor", 'D')) {
      setUserCanDeleteLabor(true);
    }
    setName(labor.name);
    setUnit(labor.unit);
    setCost(labor.cost);
    setValue(labor.value);
    setProfit(labor.profit)
  }, [labor]);

  async function handleCreate() {
    const { data, code } = await fetchWithToken<{ labor: LaborsType }>({
      path: "/labors/create",
      method: "POST",
      body: JSON.stringify({
        name,
        unit,
        cost,
        value,
        profit,
      }),
    });
    if (code == 201) {
      setServerLabors(prev => ({ ...prev, [data.labor.id]: data.labor }))
      return
    }
    window.alert('Erro ao salvar serviço')
    console.error(data)
  }

  async function handleUpdate() {
    const { data, code } = await fetchWithToken<{ labor: LaborsType }>({
      path: `/labors/${labor.id}`,
      method: "PUT",
      body: JSON.stringify({
        name,
        unit,
        cost,
        value,
        profit,
      }),
    });
    if (code == 200) {
      setServerLabors(prev => ({ ...prev, [data.labor.id]: data.labor }))
      return
    }
    window.alert('Erro ao atualizar serviço')
    console.error(data)
  }

  async function handleDelete() {
    const { data, code } = await fetchWithToken<{ labor: LaborsType }>({
      path: `/labors/${labor.id}`,
      method: "DELETE",
    });
    if (code == 200) {
      setServerLabors(prev => {
        delete prev[labor.id]
        return { ...prev }
      })
      return
    }
    window.alert('Erro ao apagar serviço')
    console.error(data)
  }

  const originalLabor = serverLabors[labor.id];
  if (!originalLabor) {
    setBgColor("bg-green-100")
  } else {
    let diffFound = false
    if (originalLabor.name != name) {
      diffFound = true
    }
    if (originalLabor.unit != unit) {
      diffFound = true
    }
    if (originalLabor.cost != cost) {
      diffFound = true
    }
    if (originalLabor.value != value) {
      diffFound = true
    }
    if (originalLabor.profit != profit) {
      diffFound = true
    }
    if (diffFound) {
      setBgColor("bg-blue-200")
    } else {
      setBgColor("bg-blue-100")
    }
  }

  return (
    <article key={labor.id} className={`${bgColor} flex flex-col gap-2 p-4 not-first:border-t not-first:border-slate-600`}>
      <div className={"flex gap-2"}>
        <Input
          label={"Nome"}
          name={`${labor.id}-name`}
          value={name} onBlur={(e) => {
            validateStringFieldOnBlur(e, setName, setValidationErrors, {
              min: 2,
              required: true
            })
          }}
          disabled={!userCanEditLabor}
          className={!userCanEditLabor ? "bg-blue-50!" : ""}
        />
        <UnitSelector
          label={"Unidade"}
          value={unit}
          type={"service"}
          doOnSelect={(value) => { setUnit(value); }}
          disabled={!userCanEditLabor}

        />
      </div>
      <div className={"flex gap-2"}>
        {/* <Input
          label={"Lucro"}
          name={`${labor.id}-profit`}
          value={`${(profit / 100).toFixed(2).replace(".", ",")} %`}
          onBlur={(e) => {
            validateFloatFieldOnBlur(e, setProfit, setValidationErrors, { min: 0, removeFromString: '%' })
          }}
        /> */}
        <Input
          label={"Custo"}
          name={`${labor.id}-cost`}
          value={BrlStringFromCents(cost)}
          onBlur={(e) => {
            validateFloatFieldOnBlur(e, setCost, setValidationErrors, { min: 0, removeFromString: 'R$' })
          }}
          className={!userCanEditLabor ? "bg-blue-50!" : ""}
          disabled={!userCanEditLabor}
        />
        <Input
          label={"Valor"}
          name={`${labor.id}-value`}
          value={BrlStringFromCents(value)}
          onBlur={(e) => {
            validateFloatFieldOnBlur(e, setValue, setValidationErrors, { min: 0, removeFromString: 'R$' })
          }}
          className={!userCanEditLabor ? "bg-blue-50!" : ""}
          disabled={!userCanEditLabor}
        />
      </div>
      <div className={"w-full flex justify-end gap-2"}>
        {
          !originalLabor ?
            <Button
              text="Cancelar"
              className={"bg-red-700 text-white text-sm mt-4"}
              onClick={() => { setLabors(prev => prev.filter(lab => lab.id != labor.id)) }}
            />
            : userCanDeleteLabor && (
              <Button
                text="Excluir"
                className={"bg-red-700 text-white text-sm mt-4"}
                onClick={handleDelete}
              />
            )
        }
        {!originalLabor && (
          <Button
            text="Salvar"
            className={"bg-blue-700 text-white text-sm mt-4"}
            onClick={handleCreate}
          />
        )}
        {bgColor == "bg-blue-200" && (
          <Button
            text="Salvar"
            className={"bg-blue-700 text-white text-sm mt-4"}
            onClick={handleUpdate}
          />
        )}
      </div>
    </article>
  );
}
