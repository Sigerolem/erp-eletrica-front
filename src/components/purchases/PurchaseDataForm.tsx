import { useEffect, useState } from "preact/hooks";
import type {
  PurchaseItemsType,
  PurchaseStatusType,
  PurchasesType,
} from "./Purchases";
import type { MaterialsType } from "@comp/materials/Materials";
import type { SuppliersType } from "@comp/suppliers/Suppliers";
import { SelectSupplierModal } from "@comp/suppliers/SelectSupplierModal";
import { SelectMaterialModal } from "@comp/materials/SelectMaterialModal";
import { PurchaseItemsList } from "@comp/purchases/PurchaseItemsList";
import { fetchWithToken } from "@utils/fetchWithToken";
import { Input } from "@elements/Input";
import type { JSX, TargetedSubmitEvent } from "preact";
import { BrlStringFromCents, formatPurchaseStatusEnum } from "@utils/formating";
import { Button } from "@elements/Button";
import {
  validateFloatFieldOnBlur,
  validateStringFieldOnBlur,
} from "@utils/inputValidation";
import { Checkbox } from "@elements/Checkbox";
import type { ReactNode } from "preact/compat";
import { ReceivedItemsList } from "./ReceivedItemsList";

export function PurchaseDataForm({
  purchaseData,
  doOnSubmit,
  children,
}: {
  purchaseData?: PurchasesType;
  doOnSubmit: (purchaseData: Partial<PurchasesType>) => Promise<{
    [key: string]: string;
  } | null>;
  children?: ReactNode;
}) {
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [itemsWereChanged, setItemsWereChanged] = useState(false);
  const [isSupModalOpen, setIsSupModalOpen] = useState(false);
  const [isMatModalOpen, setIsMatModalOpen] = useState(false);
  const [suppliers, setSuppliers] = useState<SuppliersType[]>([]);
  const [materials, setMaterials] = useState<MaterialsType[]>([]);
  const [purchaseItems, setPurchaseItems] = useState<
    Partial<PurchaseItemsType>[]
  >([]);
  const [selectedSupplier, setSelectedSupplier] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [id, setId] = useState("");
  const [nf, setNF] = useState("");
  const [isTracked, setIsTracked] = useState(false);
  const [status, setStatus] = useState<PurchaseStatusType>("draft");
  const [purchaseCost, setPurchaseCost] = useState(0);
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [taxCost, setTaxCost] = useState(0);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      e.stopPropagation();
      if (e.key == "Escape") {
        setIsMatModalOpen(false);
        setIsSupModalOpen(false);
      }
    };

    if (isSupModalOpen || isMatModalOpen) {
      document.addEventListener("keydown", handleKeyPress, { capture: true });

      return () => {
        document.removeEventListener("keydown", handleKeyPress, {
          capture: true,
        });
      };
    }
  }, [isSupModalOpen, isMatModalOpen]);

  useEffect(() => {
    fetchWithToken<{ suppliers: SuppliersType[] }>({ path: "/suppliers" }).then(
      ({ code, data }) => {
        if (code == 200) {
          setSuppliers(data.suppliers);
        } else {
          window.alert("Erro ao se comunicar com o servidor.");
        }
      },
    );
    fetchWithToken<{ materials: MaterialsType[] }>({ path: "/materials" }).then(
      ({ code, data }) => {
        if (code == 200) {
          setMaterials(data.materials);
        } else {
          window.alert("Erro ao se comunicar com o servidor.");
        }
      },
    );
  }, []);

  useEffect(() => {
    if (purchaseData !== undefined) {
      setId(purchaseData.id);
      setNF(purchaseData.nf || "");
      setIsTracked(purchaseData.is_tracked);
      setStatus(purchaseData.status);
      setPurchaseCost(purchaseData.purchase_cost);
      setDeliveryCost(purchaseData.delivery_cost);
      setTaxCost(purchaseData.tax_cost);
      setPurchaseItems(purchaseData.purchase_items || []);
      if (purchaseData.supplier !== undefined) {
        setSelectedSupplier(purchaseData.supplier);
      }
    }
  }, [purchaseData]);

  useEffect(() => {
    if (status !== "received" && purchaseItems.length > 0) {
      return;
    }
    let pItems = purchaseItems.map((item) => item as PurchaseItemsType);
    let [newPurchaseCost, newTaxCost] = [0, 0];
    pItems.forEach((item) => {
      newPurchaseCost += item.amount_delivered * item.new_unit_cost;
      newTaxCost +=
        item.amount_delivered * (item.new_unit_cost - item.new_clean_cost);
    });
    setPurchaseCost(Math.round(newPurchaseCost + deliveryCost));
    setTaxCost(Math.round(newTaxCost));
  }, [purchaseItems]);

  const isThereChange =
    purchaseData?.is_tracked != isTracked ||
    purchaseData?.purchase_cost != purchaseCost ||
    purchaseData?.delivery_cost != deliveryCost ||
    purchaseData?.tax_cost != taxCost;

  function handleNewPurchaseMaterial(material: MaterialsType) {
    setPurchaseItems((prev) => [
      ...prev,
      {
        material: material,
        material_id: material.id,
        amount_requested:
          Math.ceil(
            (material.ideal_amount - material.current_amount) /
              material.pkg_size,
          ) * material.pkg_size,
        new_unit_cost: material.avg_cost,
        purchase_id: purchaseData?.id || undefined,
        amount_delivered: 0,
        ipi: material.ipi,
        profit: material.profit,
        old_clean_cost: material.clean_cost,
        new_clean_cost: material.clean_cost,
      },
    ]);
  }

  async function handleSubmit(e: TargetedSubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (selectedSupplier == null) {
      setValidationErrors((prev) => ({
        ...prev,
        supplier: "Selecione um fornecedor",
      }));
      return;
    }

    if (purchaseItems.length == 0) {
      window.alert("Adicione pelo menos um material à compra.");
      return;
    }

    const purchaseData: Partial<PurchasesType> = {
      status,
      nf: nf || null,
      delivery_cost: deliveryCost,
      tax_cost: taxCost,
      purchase_cost: purchaseCost,
      is_tracked: isTracked,
      supplier: {
        id: selectedSupplier.id,
        name: selectedSupplier.name,
      } as SuppliersType,
      supplier_id: selectedSupplier?.id || "",
      purchase_items: purchaseItems as PurchaseItemsType[],
    };

    const errors = await doOnSubmit(purchaseData);

    if (errors) {
      setValidationErrors((prev) => ({ ...prev, ...errors }));
    } else {
      setItemsWereChanged(false);
    }
  }

  const showCostsBool =
    purchaseData?.status == "finished" || purchaseData?.status == "received";

  return (
    <form className={"flex flex-col gap-2 w-ful"} onSubmit={handleSubmit}>
      {showCostsBool && (
        <>
          <div className={"flex gap-4"}>
            <Input
              label="NF"
              name="nf"
              value={nf}
              onBlur={(e) => {
                setItemsWereChanged(true);
                validateStringFieldOnBlur(e, setNF, setValidationErrors, {
                  max: 50,
                });
              }}
              errors={validationErrors}
            />
            <Checkbox
              label="NF para E.S. Elétrica"
              name="isTracked"
              checked={isTracked}
              setChecked={setIsTracked}
            />
          </div>
          <div className={"flex gap-4"}>
            <Input
              label="Valor total NF"
              name="purchaseCost"
              value={BrlStringFromCents(purchaseCost)}
              onBlur={(e) => {
                validateFloatFieldOnBlur(
                  e,
                  setPurchaseCost,
                  setValidationErrors,
                  { removeFromString: "R$" },
                );
              }}
              errors={validationErrors}
              disabled={true}
              className={"bg-blue-50! font-semibold"}
            />
            <Input
              label="Produtos + IPI"
              name="taxCost"
              value={BrlStringFromCents(purchaseCost - deliveryCost)}
              onBlur={(e) => {
                validateFloatFieldOnBlur(e, setTaxCost, setValidationErrors, {
                  removeFromString: "R$",
                });
              }}
              errors={validationErrors}
              disabled={true}
              className={"bg-blue-50!"}
            />
            <Input
              label="Frete"
              name="deliveryCost"
              value={BrlStringFromCents(deliveryCost)}
              onBlur={(e) => {
                let val = parseFloat(
                  e.currentTarget.value
                    .replaceAll("R$", "")
                    .replaceAll(".", "")
                    .replaceAll(",", ".")
                    .trim(),
                );
                if (isNaN(val)) {
                  val = 0;
                }
                val = Math.round(val * 100);
                setDeliveryCost(val);
                let pItems = purchaseItems.map(
                  (item) => item as PurchaseItemsType,
                );
                let [newPurchaseCost, newTaxCost] = [0, 0];
                pItems.forEach((item) => {
                  newPurchaseCost += item.amount_delivered * item.new_unit_cost;
                  newTaxCost +=
                    item.amount_delivered *
                    (item.new_unit_cost - item.new_clean_cost);
                });
                setPurchaseCost(Math.round(newPurchaseCost + val));
                setTaxCost(Math.round(newTaxCost));
              }}
              errors={validationErrors}
            />
          </div>
        </>
      )}
      <div className={"flex gap-4"}>
        <Input
          label="Fornecedor"
          name="supplier"
          value={selectedSupplier?.name || ""}
          onClick={() => {
            setIsSupModalOpen(true);
          }}
          errors={validationErrors}
          disabled={
            purchaseData?.status == "shipped" ||
            purchaseData?.status == "received" ||
            purchaseData?.status == "finished" ||
            purchaseData?.status == "cancelled"
          }
          className={status == "draft" ? undefined : "bg-blue-50!"}
        />
        <Input
          label="Status"
          name="status"
          value={formatPurchaseStatusEnum(status)}
          disabled={true}
          className={"bg-blue-50!"}
        />
      </div>

      {isSupModalOpen && (
        <SelectSupplierModal
          suppliers={suppliers}
          closeModal={() => {
            setIsSupModalOpen(false);
          }}
          selectSupplier={setSelectedSupplier}
          cleanError={() => {
            setValidationErrors((prev) => {
              delete prev.supplier;
              return { ...prev };
            });
          }}
        />
      )}
      <div className={"flex items-center justify-start gap-2 mt-2 -mb-1"}>
        <span className={"font-semibold"}>Lista de itens</span>
        <button
          type={"button"}
          className={
            "bg-slate-700 px-2 shadow-md rounded-md text-white text-sm font-semibold"
          }
          onClick={() => {
            setIsMatModalOpen(true);
          }}
        >
          +
        </button>
        {isMatModalOpen && (
          <SelectMaterialModal
            materials={materials}
            cleanError={() => {}}
            closeModal={() => {
              setIsMatModalOpen(false);
            }}
            selectMaterial={handleNewPurchaseMaterial}
          />
        )}
      </div>
      <div
        className={"bg-slate-100 border border-slate-400 py-1 rounded-md mb-4"}
      >
        {purchaseData?.status == "received" ? (
          <ReceivedItemsList
            purchase={{
              ...purchaseData,
              delivery_cost: deliveryCost,
              purchase_cost: purchaseCost,
              tax_cost: taxCost,
            }}
            purchaseItems={purchaseItems.map(
              (item) => ({ ...item }) as PurchaseItemsType,
            )}
            setPurchaseItems={setPurchaseItems}
            setItemsWereChanged={setItemsWereChanged}
          />
        ) : (
          <PurchaseItemsList
            purchase={purchaseData!}
            purchaseItems={purchaseItems}
            setPurchaseItems={setPurchaseItems}
            setItemsWereChanged={setItemsWereChanged}
          />
        )}
      </div>
      <div className={"flex gap-2"}>
        {itemsWereChanged || isThereChange ? (
          <Button
            text={
              purchaseData == undefined ? "Salvar compra" : "Salvar alterações"
            }
            type={"submit"}
          />
        ) : (
          children
        )}
      </div>
    </form>
  );
}
