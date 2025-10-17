import { useEffect, useState } from "preact/hooks";
import { CreateMaterialModal } from "@comp/materials/CreateMaterialModal";
import type { SuppliersType } from "@comp/suppliers/Suppliers";
import { fetchWithToken } from "src/utils/fetchWithToken";
import { Table, Td, THead, Tr } from "src/elements/Table";
import { BrlStringFromCents } from "@utils/formating";

export type PurchaseItemsType = {
  id: string;
};

export type PurchasesType = {
  id: string;
  profit: number;
  value: number;
  purchase_items?: PurchaseItemsType[];
};

export function Purchases() {
  const [purchases, setPurchases] = useState<PurchasesType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchWithToken<{ purchases: PurchasesType[] }>({ path: "/purchases" }).then(
      ({ code, data }) => {
        if (code == 200) {
          setPurchases(data.purchases);
          console.log(data.purchases);
        } else {
          window.alert("Erro ao buscar a lista de materiais");
          console.error(data);
        }
      }
    );
  }, []);

  return (
    <>
      {/* {isModalOpen ? (
        <CreateMaterialModal
          setMaterials={setMaterials}
          closeModal={() => {
            setIsModalOpen(false);
          }}
          suppliersList={suppliersList}
        />
      ) : null} */}
      <div>
        <header className={"flex justify-between items-center px-2 mb-2"}>
          <h3 className={"text-xl font-semibold"}>Lista de compras</h3>
          <button
            className={"bg-blue-700 p-2 rounded-md text-white font-semibold"}
            onClick={() => {
              setIsModalOpen(true);
            }}
          >
            Novo material
          </button>
        </header>
        <Table>
          <THead
            collumns={[
              ["Fornecedor"],
              ["Status", "Data"],
              ["Valor"],
              ["Itens", "comprados"],
            ]}
          />
          <tbody>
            {/* {materials.map((material) => (
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
            ))} */}
          </tbody>
        </Table>
      </div>
    </>
  );
}
