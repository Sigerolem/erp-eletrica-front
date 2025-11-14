import { useEffect, useState } from "preact/hooks";
import { CreateMaterialModal } from "@comp/materials/CreateMaterialModal";
import type { SuppliersType } from "@comp/suppliers/Suppliers";
import { fetchWithToken } from "src/utils/fetchWithToken";
import { Table, Td, THead, Tr } from "src/elements/Table";
import { BrlStringFromCents } from "@utils/formating";
import { Button } from "@elements/Button";

export type MaterialsType = {
  id: string;
  name: string;
  barcode: string | null;
  pkg_size: number;
  min_amount: number;
  ideal_amount: number;
  reserved_amount: number;
  current_amount: number;
  tracked_amount: number;
  avg_cost: number;
  profit: number;
  value: number;
  is_disabled: boolean;
  supplier?: Pick<SuppliersType, "id" | "name">;
  supplier_id: string | null;
};

const MATERIAL_URL =
  window.location.hostname == "localhost"
    ? "/materiais/id#"
    : "/materiais/id/#";

export function Materials() {
  const [materials, setMaterials] = useState<MaterialsType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleNewMaterial() {
    setIsModalOpen(true);
  }

  useEffect(() => {
    fetchWithToken<{ materials: MaterialsType[] }>({ path: "/materials" }).then(
      ({ code, data }) => {
        if (code == 200) {
          setMaterials(data.materials);
        } else {
          window.alert("Erro ao buscar a lista de materiais");
          console.error(data);
        }
      }
    );
  }, []);

  return (
    <>
      {isModalOpen ? (
        <CreateMaterialModal
          setMaterials={setMaterials}
          closeModal={() => {
            setIsModalOpen(false);
          }}
        />
      ) : null}
      <div>
        <header className={"flex justify-between items-center px-2 mb-2"}>
          <h3 className={"text-xl font-semibold"}>Lista de materiais</h3>
          <Button text="Novo material" onClick={handleNewMaterial} />
        </header>
        <Table>
          <THead
            collumns={[
              ["Nome", "Fornecedor"],
              ["Estoque", "(atual / mín)"],
              ["Reservado"],
              ["Preços", "(custo / venda)"],
            ]}
          />
          <tbody>
            {materials.map((material) => (
              <Tr key={material.id}>
                <Td link={`${MATERIAL_URL}${material.id}/`}>
                  <p className={""}>{material.name}</p>
                  <p className={"text-sm font-semibold"}>
                    {material.supplier?.name ?? ""}
                  </p>
                </Td>
                <Td link={`${MATERIAL_URL}${material.id}/`}>
                  <p>{material.current_amount}</p>
                  <p>{material.min_amount}</p>
                </Td>
                <Td link={`${MATERIAL_URL}${material.id}/`}>
                  <p>{material.reserved_amount}</p>
                </Td>
                <Td link={`${MATERIAL_URL}${material.id}/`}>
                  <p className={""}>
                    C: {BrlStringFromCents(material.avg_cost)}
                  </p>
                  <p className={""}>V: {BrlStringFromCents(material.value)}</p>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </div>
    </>
  );
}
