import type { MaterialsType } from "@comp/materials/Materials";
import type { SuppliersType } from "@comp/suppliers/Suppliers";
import { Button } from "@elements/Button";
import { BrlStringFromCents, formatPurchaseStatusEnum } from "@utils/formating";
import { useEffect, useState } from "preact/hooks";
import { Input } from "src/elements/Input";
import { Table, Td, THead, Tr } from "src/elements/Table";
import { fetchPdf } from "src/utils/fetchPdf";
import { fetchWithToken } from "src/utils/fetchWithToken";
import { hasPermission } from "src/utils/permissionLogic";
import { SelectSupplierModal } from "../suppliers/SelectSupplierModal";

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
  const [supplierSelected, setSupplierSelected] = useState<string | null>(null);
  const [supplierList, setSupplierList] = useState<SuppliersType[]>([]);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [showOnlyConcluded, setShowOnlyConcluded] = useState(false);
  const [userCantSeeSuppliers, setUserCantSeeSuppliers] = useState(false);

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
    if (
      role != "owner" &&
      !hasPermission(permission ?? "----------------", "supplier", "R")
    ) {
      setUserCantSeeSuppliers(true);
      return;
    }

    fetchWithToken<{ suppliers: SuppliersType[] }>({
      path: "/suppliers",
    }).then(({ code, data }) => {
      if (code == 200) {
        setSupplierList(data.suppliers);
        const pageQuery = window.location.search;
        if (pageQuery.includes("supplier")) {
          const supId = pageQuery.split("=")[1];
          const supplier = data.suppliers.find((s) => s.id == supId);
          if (supplier) {
            setSupplierSelected(supplier.name);
          }
        }
      } else if (code == 403) {
        setUserCantSeeSuppliers(true);
        window.alert(
          "Você pode ver a lista de compra, mas não pode ver a lista de fornecedores para realizar filtragens.",
        );
      } else {
        window.alert("Erro ao buscar a lista de fornecedores");
        console.error(data);
      }
    });
  }, []);

  useEffect(() => {
    const pageQuery = window.location.search;
    let supId: string | null = null;
    if (pageQuery.includes("supplier") && !userCantSeeSuppliers) {
      supId = pageQuery.split("=")[1];

      fetchWithToken<{ purchases: PurchasesType[] }>({
        path: `/purchases/query?supplier=${supId}`,
      }).then(({ code, data }) => {
        setIsFetching(false);
        if (code == 200) {
          setPurchases(data.purchases);
        } else {
          window.alert("Erro ao buscar a lista de materiais");
          console.error(data);
        }
      });
    } else {
      if (pageQuery.includes("supplier")) {
        const url = new URL(window.location.href);
        url.searchParams.delete("supplier");
        window.history.pushState({}, "", url);
      }
      fetchWithToken<{ purchases: PurchasesType[] }>({
        path: "/purchases",
      }).then(({ code, data }) => {
        setIsFetching(false);
        if (code == 200) {
          setPurchases(data.purchases);
        } else {
          window.alert("Erro ao buscar a lista de materiais");
          console.error(data);
        }
      });
    }
  }, [supplierSelected]);

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
        {!userCantSeeSuppliers && (
          <div className={"mb-2 flex gap-2 items-center"}>
            <Input
              placeholder="Todos os fornecedores"
              name="supplier"
              className={
                userCantSeeSuppliers ? "cursor-not-allowed" : "cursor-pointer"
              }
              onClick={() => {
                setIsSupplierModalOpen(true);
              }}
              value={supplierSelected ?? ""}
              disabled={userCantSeeSuppliers}
            />
            {supplierSelected && (
              <Button
                text="Limpar"
                onClick={() => {
                  setSupplierSelected(null);
                  const url = new URL(window.location.href);
                  url.searchParams.delete("supplier");
                  window.history.pushState({}, "", url);
                }}
                className={"bg-slate-600 text-white text-sm"}
              />
            )}
          </div>
        )}
        {isSupplierModalOpen && (
          <SelectSupplierModal
            closeModal={() => {
              setIsSupplierModalOpen(false);
            }}
            suppliers={supplierList}
            selectSupplier={(supplier) => {
              setSupplierSelected(supplier.name);
              setIsSupplierModalOpen(false);
              const url = new URL(window.location.href);
              url.searchParams.set("supplier", String(supplier.id));
              window.history.pushState({}, "", url);
            }}
          />
        )}
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
