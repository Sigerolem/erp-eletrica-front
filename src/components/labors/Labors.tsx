import { Button } from "@elements/Button";
import { BrlStringFromCents } from "@utils/formating";
import { useEffect, useRef, useState } from "preact/hooks";
import { Input } from "src/elements/Input";
import { Table, Td, THead, Tr } from "/src/elements/Table";
import { fetchWithToken } from "/src/utils/fetchWithToken";
import { UnitSelector } from "src/elements/UnitSelector";
import { LaborRow } from "./LaborRow";

export type LaborsType = {
  id: string;
  name: string;
  unit: string;
  cost: number;
  value: number;
  profit: number;
  created_at: Date;
};

export function Labors() {
  const [labors, setLabors] = useState<LaborsType[]>([]);
  const serverLabors = useRef<Map<string, LaborsType>>(
    new Map<string, LaborsType>(),
  );
  const [isFetching, setIsFetching] = useState(true);
  const [diffFound, setDiffFound] = useState(false);

  useEffect(() => {
    fetchWithToken<{ labors: LaborsType[] }>({
      path: "/labors",
    }).then(({ code, data }) => {
      setIsFetching(false);
      if (code == 200) {
        setLabors(data.labors);
        data.labors.forEach((labor) =>
          serverLabors.current.set(labor.id, labor),
        );
      } else {
        window.alert("Erro ao buscar a lista de materiais");
        console.error(data);
      }
    });
  }, []);

  const xSize = window.innerWidth;

  return (
    <>
      <div className={"pb-20 h-full"}>
        <header className={"flex justify-between items-end mb-2"}>
          <h3 className={"text-lg font-semibold"}>Lista de serviços</h3>

          <Button
            text="Cadastrar novo"
            className={"bg-blue-700 text-white text-sm"}
            onClick={() => {
              setLabors((prev) => [
                ...prev,
                {
                  name: "Novo serviço",
                  cost: 0,
                  profit: 0,
                  value: 0,
                  unit: "un",
                  id: new Date().toISOString(),
                  created_at: new Date(),
                },
              ]);
            }}
          />
        </header>
        <Table>
          <THead
            collumns={[
              ["Nome", "Unidade"],
              ["Custo", "Valor"],
            ]}
          />

          <tbody className={"overflow-scroll"}>
            {labors.map((labor) => {
              return <LaborRow labor={labor} />;
            })}
          </tbody>
        </Table>
        {isFetching && (
          <span className={"animate-bounce text-xl block mt-8 font-semibold"}>
            Carregando...
          </span>
        )}
        {!isFetching && labors.length == 0 && (
          <span className={"text-xl block mt-8 font-semibold"}>
            Nada encontrado para exibir aqui. Tente recarregar a página ou fazer
            um novo cadastro.
          </span>
        )}
      </div>
    </>
  );
}
