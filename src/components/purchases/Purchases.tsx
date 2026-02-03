import type { MaterialsType } from "@comp/materials/Materials";
import type { SuppliersType } from "@comp/suppliers/Suppliers";
import { Button } from "@elements/Button";
import { BrlStringFromCents, formatPurchaseStatusEnum } from "@utils/formating";
import { useEffect, useState } from "preact/hooks";
import { Table, Td, THead, Tr } from "src/elements/Table";
import { fetchPdf } from "src/utils/fetchPdf";
import { fetchWithToken } from "src/utils/fetchWithToken";
import { hasPermission } from "src/utils/permissionLogic";

export type PurchaseStatusType =
  | "draft"
  | "requested"
  | "shipped"
  | "received"
  | "finished"
  | "cancelled";

export type PurchaseItemsType = {
  id: string;
  material_id: string;
  purchase_id: string;
  purchase: PurchasesType;
  material: MaterialsType;
  amount_requested: number;
  amount_delivered: number;
  old_unit_cost: number;
  profit: number;
  new_unit_cost: number;
  new_clean_cost: number;
  old_clean_cost: number;
  ipi: number;
};

export type PurchasesType = {
  id: string;
  nf: string | null;
  delivery_cost: number;
  purchase_cost: number;
  tax_cost: number;
  status: PurchaseStatusType;
  is_tracked: boolean;
  supplier: SuppliersType;
  supplier_id: string;
  purchase_items: PurchaseItemsType[];
  updated_at: string;
};

const PURCHASE_URL =
  window.location.hostname == "localhost" ? "/compras/id#" : "/compras/id/#";

export function Purchases() {
  const [purchases, setPurchases] = useState<PurchasesType[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [userCanCreatePurchase, setUserCanCreatePurchase] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("apiRole");
    const permission = localStorage.getItem("apiPermissions");
    if (
      role != "owner" &&
      !hasPermission(permission ?? "----------------", "purchase", "R")
    ) {
      window.location.href = "/";
      return;
    }
    if (
      role == "owner" ||
      hasPermission(permission ?? "----------------", "purchase", "W")
    ) {
      setUserCanCreatePurchase(true);
    }
    fetchWithToken<{ purchases: PurchasesType[] }>({ path: "/purchases" }).then(
      ({ code, data }) => {
        setIsFetching(false);
        if (code == 200) {
          setPurchases(data.purchases);
        } else {
          window.alert("Erro ao buscar a lista de materiais");
          console.error(data);
        }
      },
    );
  }, []);

  const xSize = window.innerWidth;
  return (
    <>
      <div>
        <header className={"flex justify-between items-end mb-2 gap-1"}>
          <h3 className={"text-lg font-semibold"}>Lista de compras</h3>
          {userCanCreatePurchase && (
            <>
              <a href="/compras/nova">
                <Button
                  text="Nova compra"
                  className={"bg-blue-700 text-white text-sm"}
                />
              </a>
              <a href="/compras/gerar">
                <Button
                  text="Compras necessárias"
                  className={"bg-blue-700 text-white text-sm"}
                />
              </a>
            </>
          )}
        </header>
        <Table>
          {xSize < 720 ? (
            <THead
              collumns={[
                ["Fornecedor", "Data"],
                ["Status", "Qtd. Materiais"],
              ]}
            />
          ) : (
            <THead
              collumns={[
                ["Fornecedor"],
                ["Status", "Data"],
                ["Valor"],
                ["Itens", "comprados"],
                [""],
              ]}
            />
          )}
          <tbody>
            {purchases.map((purchase) => {
              const totalCost =
                purchase.delivery_cost +
                purchase.tax_cost +
                purchase.purchase_cost;
              const status = formatPurchaseStatusEnum(purchase.status);
              return xSize < 720 ? (
                <Tr key={purchase.id}>
                  <Td link={`${PURCHASE_URL}${purchase.id}/`}>
                    <p className={""}>{purchase.supplier?.name || "null"}</p>
                    <p>
                      {new Date(purchase.updated_at).toLocaleDateString(
                        "pt-BR",
                      )}
                    </p>
                  </Td>
                  <Td link={`${PURCHASE_URL}${purchase.id}/`}>
                    <div className={"flex items-center justify-between"}>
                      <div className={"col-span-1"}>
                        <p className={"font-semibold text-sm"}>{status}</p>
                        <p className={"text-sm"}>
                          Qtd.: {purchase.purchase_items?.length || 0}
                        </p>
                      </div>
                      <Button
                        text="PDF"
                        onClick={() =>
                          fetchPdf(`/purchases/print/${purchase.id}`)
                        }
                        className={
                          "bg-blue-700 text-white p-1.5! text-sm col-span-1 mr-2"
                        }
                      />
                    </div>
                  </Td>
                </Tr>
              ) : (
                <Tr key={purchase.id}>
                  <Td link={`${PURCHASE_URL}${purchase.id}/`}>
                    <p className={""}>{purchase.supplier?.name || "null"}</p>
                  </Td>
                  <Td link={`${PURCHASE_URL}${purchase.id}/`}>
                    <p>{status}</p>
                    <p>
                      {new Date(purchase.updated_at).toLocaleDateString(
                        "pt-BR",
                      )}
                    </p>
                  </Td>
                  <Td link={`${PURCHASE_URL}${purchase.id}/`}>
                    <p>{BrlStringFromCents(totalCost)}</p>
                  </Td>
                  <Td link={`${PURCHASE_URL}${purchase.id}/`}>
                    <p className={""}>{purchase.purchase_items?.length || 0}</p>
                  </Td>
                  <Td>
                    <Button
                      text="PDF"
                      onClick={() =>
                        fetchPdf(`/purchases/print/${purchase.id}`)
                      }
                    />
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
        {isFetching && (
          <span className={"animate-bounce text-xl block mt-8 font-semibold"}>
            Carregando...
          </span>
        )}
        {!isFetching && purchases.length == 0 && (
          <span className={"text-xl block mt-8 font-semibold"}>
            Nada encontrado para exibir aqui. Tente recarregar a página ou fazer
            um novo cadastro.
          </span>
        )}
      </div>
    </>
  );
}
