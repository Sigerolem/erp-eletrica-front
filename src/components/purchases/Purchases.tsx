import type { SuppliersType } from "@comp/suppliers/Suppliers";
import { BrlStringFromCents, formatPurchaseStatusEnum } from "@utils/formating";
import { useEffect, useState } from "preact/hooks";
import { Table, Td, THead, Tr } from "src/elements/Table";
import { fetchWithToken } from "src/utils/fetchWithToken";
import { CreatePurchaseModal } from "./CreatePurchaseModal";
import type { MaterialsType } from "@comp/materials/Materials";

export type PurchaseItemsType = {
  id: string;
  material_id: string;
  purchase_id: string;
  material: MaterialsType;
  amount_requested: number;
  amount_delivered: number;
  old_unit_cost: number;
  new_unit_cost: number;
};

export type PurchasesType = {
  id: string;
  nf: string | null;
  delivery_cost: number;
  purchase_cost: number;
  tax_cost: number;
  status: string;
  supplier: SuppliersType;
  supplier_id: string;
  purchase_items?: PurchaseItemsType[];
  updated_at: string;
};

const PURCHASE_URL = import.meta.env.DEV ? "/compras/id#" : "/compras/id/#";

export function Purchases() {
  const [purchases, setPurchases] = useState<PurchasesType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchWithToken<{ purchases: PurchasesType[] }>({ path: "/purchases" }).then(
      ({ code, data }) => {
        if (code == 200) {
          setPurchases(data.purchases);
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
        <CreatePurchaseModal
          closeModal={() => {
            setIsModalOpen(false);
          }}
          setPurchases={setPurchases}
        />
      ) : null}
      <div>
        <header className={"flex justify-between items-center px-2 mb-2"}>
          <h3 className={"text-xl font-semibold"}>Lista de compras</h3>
          <button
            className={"bg-blue-700 p-2 rounded-md text-white font-semibold"}
            onClick={() => {
              setIsModalOpen(true);
            }}
          >
            Nova compra
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
            {purchases.map((purchase) => {
              const totalCost =
                purchase.delivery_cost +
                purchase.tax_cost +
                purchase.purchase_cost;
              const status = formatPurchaseStatusEnum(purchase.status);
              return (
                <Tr key={purchase.id}>
                  <Td link={`${PURCHASE_URL}${purchase.id}/`}>
                    <p className={""}>{purchase.supplier?.name || "null"}</p>
                  </Td>
                  <Td link={`${PURCHASE_URL}${purchase.id}/`}>
                    <p>{status}</p>
                    <p>
                      {new Date(purchase.updated_at).toLocaleDateString(
                        "pt-BR"
                      )}
                    </p>
                  </Td>
                  <Td link={`${PURCHASE_URL}${purchase.id}/`}>
                    <p>{BrlStringFromCents(totalCost)}</p>
                  </Td>
                  <Td link={`${PURCHASE_URL}${purchase.id}/`}>
                    <p className={""}>{purchase.purchase_items?.length || 0}</p>
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </>
  );
}
