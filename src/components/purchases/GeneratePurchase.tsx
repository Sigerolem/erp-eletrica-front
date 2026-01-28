import { Button } from "@elements/Button";
import { fetchWithToken } from "@utils/fetchWithToken";
import { useEffect, useState } from "preact/hooks";
import { PurchaseDataForm } from "./PurchaseDataForm";
import type {
  PurchaseItemsType,
  PurchaseStatusType,
  PurchasesType,
} from "./Purchases";
import type { MaterialsType } from "../materials/Materials";
import { DataForm } from "src/elements/DataForm";
import { ListWrapper } from "../quotations/lists/ListWrapper";
import { PurchaseItemsList } from "./PurchaseItemsList";
import type { SuppliersType } from "../suppliers/Suppliers";
import { Input } from "src/elements/Input";
import { formatPurchaseStatusEnum } from "src/utils/formating";

const purchaseMap = new Map<
  string,
  { requested: number; delivered: number; status: PurchaseStatusType }
>();

export function GeneratePurchase() {
  const [id, setId] = useState("");
  const [supplier, setSupplier] = useState<SuppliersType | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [purchaseItems, setPurchaseItems] = useState<
    Partial<PurchaseItemsType>[]
  >([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const PURCHASE_URL =
    window.location.hostname == "localhost" ? "/compras/id#" : "/compras/id/#";

  useEffect(() => {
    const path = new URL(window.location.href);
    const id = path.hash.replace("#", "").replaceAll("/", "");
    setId(id);
    fetchWithToken<{
      materials: MaterialsType[];
      supplier: SuppliersType;
      items: PurchaseItemsType[];
    }>({
      path: `/materials/purchase-list/${id}`,
    }).then(({ code, data }) => {
      if (code == 200) {
        data.items.forEach((item) => {
          if (purchaseMap.has(item.material_id)) {
            const temp = purchaseMap.get(item.material_id)!;
            purchaseMap.set(item.material_id, {
              requested: temp.requested + item.amount_requested,
              delivered: temp.delivered + item.amount_delivered,
              status: item.purchase.status,
            });
          } else {
            purchaseMap.set(item.material_id, {
              requested: item.amount_requested,
              delivered: item.amount_delivered,
              status: item.purchase.status,
            });
          }
        });
        const newItems = data.materials.map(
          (material): Partial<PurchaseItemsType> => ({
            amount_requested: material.purchase_amount,
            ipi: material.ipi,
            material_id: material.id,
            new_clean_cost: material.clean_cost,
            old_clean_cost: material.clean_cost,
            old_unit_cost: material.avg_cost,
            material,
            profit: material.profit,
          }),
        );
        setPurchaseItems(newItems);
        setSupplier(data.supplier);
      } else {
        window.alert("Erro ao se comunicar com o servidor.");
      }
    });
  }, []);

  function handleRemoveItem(id: string) {
    setPurchaseItems((prev) => prev.filter((item) => item.material_id != id));
  }

  async function handleDataSubmition() {
    setIsSubmitting(true)
    const { data, code } = await fetchWithToken<{ purchase: PurchasesType }>({
      path: "/purchases/create",
      method: "POST",
      body: JSON.stringify({
        supplier_id: id,
        is_tracked: false,
        purchase_items: purchaseItems,
      }),
    });

    if (code == 201) {
      window.alert("Compra criada com sucesso!");
      setIsSubmitting(false)
      window.location.href = "/compras";
      return;
    }

    window.alert("Erro ao salvar a compra");
    console.error(code, data);
    setIsSubmitting(false)
  }

  const xSize = window.innerWidth;

  return (
    <main>
      {purchaseItems ? (
        <section>
          <div className={"flex gap-4 mb-2"}>
            <Input
              label="Fornecedor"
              name="supplier"
              value={supplier?.name || ""}
              disabled={true}
              className={"bg-blue-50!"}
            />
            <Input
              label="Status"
              name="status"
              value={formatPurchaseStatusEnum("draft")}
              disabled={true}
              className={"bg-blue-50!"}
            />
          </div>
          <DataForm>
            <ListWrapper label="Lista de materiais">
              {purchaseItems.map((item) => (
                <article
                  className={
                    "w-full grid px-2 grid-cols-4 items-center gap-x-2 gap-y-2 pb-4"
                  }
                >
                  <div
                    className={`${xSize < 500 ? "col-span-4" : "col-span-2"}`}
                  >
                    <Input
                      name="name"
                      label="Material"
                      className={"bg-blue-50!"}
                      value={item.material!.name}
                      disabled={true}
                    />
                    <div className={`${"flex gap-2"}`}>
                      <Input
                        name="pkgSize"
                        label="Embalagem"
                        value={item.material!.pkg_size}
                        className={"bg-blue-50!"}
                        disabled={true}
                      />
                      {xSize < 500 && (
                        <>
                          <Input
                            name="idealAmount"
                            label="Ideal"
                            value={item.material!.ideal_amount}
                            className={"bg-blue-50!"}
                            disabled={true}
                          />
                          <Input
                            name="currentAmount"
                            label="Disponível"
                            value={
                              item.material!.current_amount -
                              item.material!.reserved_amount
                            }
                            className={"bg-blue-50!"}
                            disabled={true}
                          />
                        </>
                      )}
                    </div>
                  </div>
                  {xSize >= 500 && (
                    <div>
                      <Input
                        name="currentAmount"
                        label="Disponível"
                        value={
                          item.material!.current_amount -
                          item.material!.reserved_amount
                        }
                        className={"bg-blue-50!"}
                        disabled={true}
                      />
                      <Input
                        name="currentAmount"
                        label="Ideal"
                        value={item.material!.ideal_amount}
                        className={"bg-blue-50!"}
                        disabled={true}
                      />
                    </div>
                  )}
                  <div
                    className={`flex ${xSize < 500
                      ? "items-end gap-4 col-span-4 w-full h-full"
                      : "flex-col h-full items-stretch max-w-full justify-end"
                      }`}
                  >
                    <Input
                      label="Pedido"
                      name={item.material!.id}
                      value={item.amount_requested ?? 0}
                      onBlur={(e) => {
                        const value = e.currentTarget.value;
                        if (isNaN(parseInt(value))) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            [item.material_id || ""]: "Digite um valor válido",
                          }));
                        } else {
                          setValidationErrors((prev) => {
                            delete prev[item.material_id || ""];
                            return { ...prev };
                          });
                        }
                        setPurchaseItems((prev) =>
                          prev.map((i) =>
                            i.material_id == item.material_id
                              ? { ...i, amount_requested: parseInt(value) }
                              : i,
                          ),
                        );
                      }}
                      errors={validationErrors}
                    />
                    <div
                      className={"flex gap-2 items-end max-w-full justify-end"}
                    >
                      {purchaseMap.has(item.material_id!) && (
                        <Input
                          name={`hasPurchase-${item.material_id}`}
                          label="Tem compra"
                          value={
                            purchaseMap.get(item.material_id!)?.requested ||
                            purchaseMap.get(item.material_id!)?.delivered
                          }
                          className={"bg-red-200! font-semibold"}
                          disabled={true}
                          errors={{
                            [`hasPurchase-${item.material_id}`]: `${formatPurchaseStatusEnum(
                              purchaseMap.get(item.material_id!)?.status ||
                              "draft",
                            )}`,
                          }}
                        />
                      )}

                      <div className={""}>
                        <Button
                          text="X"
                          className={"bg-red-600 py-1 text-white"}
                          onClick={() => {
                            handleRemoveItem(item.material_id || "");
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </ListWrapper>
          </DataForm>
          {supplier && (
            <Button text="Criar compra" onClick={handleDataSubmition} disabled={isSubmitting} />
          )}
        </section>
      ) : (
        <span className={"animate-bounce text-xl block mt-8 font-semibold"}>
          Carregando...
        </span>
      )}
    </main>
  );
}
