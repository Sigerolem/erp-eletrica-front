import { useEffect, useState } from "preact/hooks";
import { CreateMaterialModal } from "@comp/materials/CreateMaterialModal";
import type { SuppliersType } from "@comp/suppliers/Suppliers";
import { fetchWithToken } from "src/utils/fetchWithToken";
import { Table, Td, THead, Tr } from "src/elements/Table";
import { BrlStringFromCents } from "@utils/formating";

export type MaterialsType = {
  id: string;
  name: string;
  barcode: string | null;
  current_amount: number;
  pkg_size: number;
  min_amount: number;
  ideal_amount: number;
  reserved_amount: number;
  avg_cost: number;
  profit: number;
  value: number;
  supplier?: Pick<SuppliersType, "id" | "name">;
  supplier_id: string | null;
};

export function Materials() {
  const [materials, setMaterials] = useState<MaterialsType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [suppliersList, setSuppliersList] = useState<
    { id: string; name: string }[]
  >([]);

  function handleNewMaterial() {
    setIsModalOpen(true);
    fetchWithToken<{ suppliers: SuppliersType[] }>({ path: "/suppliers" }).then(
      ({ code, data }) => {
        if (code === 200) {
          setSuppliersList([
            ...data.suppliers.map((supplier) => ({
              id: supplier.id,
              name: supplier.name,
            })),
          ]);
        }
      }
    );
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
          suppliersList={suppliersList}
        />
      ) : null}
      <div>
        <header className={"flex justify-between items-center px-2 mb-2"}>
          <h3 className={"text-xl font-semibold"}>Lista de materiais</h3>
          <button
            className={"bg-blue-700 p-2 rounded-md text-white font-semibold"}
            onClick={handleNewMaterial}
          >
            Novo material
          </button>
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
                <Td link={`/materiais/id#${material.id}`}>
                  <p className={""}>{material.name}</p>
                  <p className={"text-sm font-semibold"}>
                    {material.supplier?.name ?? ""}
                  </p>
                </Td>
                <Td link={`/materiais/id#${material.id}`}>
                  <p
                  // className={`${
                  //   material.current_amount < material.min_amount
                  //     ? "text-red-700 font-semibold text-lg"
                  //     : ""
                  // }`}
                  >
                    {material.current_amount}
                  </p>
                  <p>{material.min_amount}</p>
                </Td>
                <Td link={`/materiais/id#${material.id}`}>
                  <p>{material.reserved_amount}</p>
                </Td>
                <Td link={`/materiais/id#${material.id}`}>
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
