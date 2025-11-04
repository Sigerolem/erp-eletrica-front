import { useEffect, useState } from "preact/hooks";
import type { PurchaseItemsType, PurchasesType } from "./Purchases";
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
import { ReceivePurchaseItemsList } from "./ReceivePurchaseItemsList";
import {
  validateFloatFieldOnBlur,
  validateStringFieldOnBlur,
} from "@utils/inputValidation";

export function PurchaseDataForm({
  purchaseData,
  doOnSubmit,
  children,
}: {
  purchaseData?: PurchasesType;
  doOnSubmit: (purchaseData: Partial<PurchasesType>) => Promise<{
    [key: string]: string;
  } | null>;
  children?: JSX.Element;
}) {
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
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
  const [status, setStatus] = useState("draft");
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
      }
    );
    fetchWithToken<{ materials: MaterialsType[] }>({ path: "/materials" }).then(
      ({ code, data }) => {
        if (code == 200) {
          setMaterials(data.materials);
        } else {
          window.alert("Erro ao se comunicar com o servidor.");
        }
      }
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
      setSelectedSupplier(purchaseData.supplier);
      setPurchaseItems(purchaseData.purchase_items || []);
    }
  }, [purchaseData]);

  function handleNewPurchaseMaterial(material: MaterialsType) {
    setPurchaseItems((prev) => [
      ...prev,
      {
        material: material,
        material_id: material.id,
        amount_requested: material.ideal_amount - material.current_amount,
        old_unit_cost: material.avg_cost,
        purchase_id: purchaseData?.id || undefined,
        amount_delivered: 0,
        new_unit_cost: material.avg_cost,
        is_tracked: isTracked,
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
    }
  }

  const showCostsBool =
    purchaseData?.status == "finished" ||
    purchaseData?.status == "received" ||
    (purchaseData?.status == "shipped" &&
      window.location.href.includes("recebimento"));
  const isDeliveryList =
    purchaseData?.status == "received" ||
    purchaseData?.status == "finished" ||
    (purchaseData?.status == "shipped" &&
      window.location.href.includes("recebimento"));
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
                validateStringFieldOnBlur(e, setNF, setValidationErrors, {
                  max: 50,
                });
              }}
              errors={validationErrors}
            />
            <div className={"flex flex-col gap-1 items-start"}>
              <label htmlFor="isTracked" className={"font-semibold"}>
                E.S. Elétrica
              </label>
              <input
                name="isTracked"
                className={
                  "min-w-8 min-h-8 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                }
                type="checkbox"
                checked={isTracked}
                onChange={(e) => {
                  setIsTracked(e.currentTarget.checked);
                }}
                // value={isTracked}
              />
            </div>
          </div>
          <div className={"flex gap-4"}>
            <Input
              label="Custo"
              name="purchaseCost"
              value={BrlStringFromCents(purchaseCost)}
              onBlur={(e) => {
                validateFloatFieldOnBlur(
                  e,
                  setPurchaseCost,
                  setValidationErrors,
                  { removeFromString: "R$" }
                );
              }}
              errors={validationErrors}
            />
            <Input
              label="Frete"
              name="deliveryCost"
              value={BrlStringFromCents(deliveryCost)}
              onBlur={(e) => {
                validateFloatFieldOnBlur(
                  e,
                  setDeliveryCost,
                  setValidationErrors,
                  { removeFromString: "R$" }
                );
              }}
              errors={validationErrors}
            />
            <Input
              label="Impostos"
              name="taxCost"
              value={BrlStringFromCents(taxCost)}
              onBlur={(e) => {
                validateFloatFieldOnBlur(e, setTaxCost, setValidationErrors, {
                  removeFromString: "R$",
                });
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
        />
        <Input
          label="Status"
          name="status"
          value={formatPurchaseStatusEnum(status)}
          disabled
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
        <div>
          {isDeliveryList ? (
            <ReceivePurchaseItemsList
              purchaseItems={purchaseItems}
              setPurchaseItems={setPurchaseItems}
              purchaseStatus={purchaseData.status}
            />
          ) : (
            <PurchaseItemsList
              purchaseItems={purchaseItems}
              setPurchaseItems={setPurchaseItems}
            />
          )}
        </div>
      </div>
      {children}
    </form>
  );
}
