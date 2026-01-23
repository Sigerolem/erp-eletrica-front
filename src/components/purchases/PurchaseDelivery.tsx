import { fetchWithToken } from "@utils/fetchWithToken";
import { useEffect, useState } from "preact/hooks";
import { Button } from "src/elements/Button";
import { Checkbox } from "src/elements/Checkbox";
import { DataForm } from "src/elements/DataForm";
import { Input } from "src/elements/Input";
import { Textarea } from "src/elements/TextArea";
import { BrlStringFromCents } from "src/utils/formating";
import {
  validateFloatFieldOnBlur,
  validateStringFieldOnBlur,
} from "src/utils/inputValidation";
import type { MaterialsType } from "../materials/Materials";
import { ListWrapper } from "../quotations/lists/ListWrapper";
import type { SuppliersType } from "../suppliers/Suppliers";
import type { PurchaseItemsType, PurchasesType } from "./Purchases";

export function PurchaseDelivery() {
  const [isSearchingBarcode, setIsSearchingBarcode] = useState(false);

  const [materialBeingUpdated, setMaterialBeingUpdated] = useState("");
  const [validationErros, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItemsType[]>([]);
  const [id, setId] = useState("");
  const [nf, setNF] = useState("");
  const [isTracked, setIsTracked] = useState(false);
  const [supplier, setSupplier] = useState<SuppliersType | null>(null);
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [barcodeLog, setbarcodeLog] = useState<{
    [key: string]: number;
  }>({});
  const taxCost = Math.round(
    purchaseItems.reduce(
      (acc, item) =>
        acc + (item.ipi / 100_00) * item.amount_delivered * item.new_clean_cost,
      0,
    ),
  );
  const purchaseCost = Math.round(
    taxCost +
      deliveryCost +
      purchaseItems.reduce(
        (acc, item) => acc + item.amount_delivered * item.new_clean_cost,
        0,
      ),
  );

  useEffect(() => {
    const path = new URL(window.location.href);
    const id = path.hash.replace("#", "").replaceAll("/", "");
    setId(id);
    fetchWithToken<{ purchase: PurchasesType }>({
      path: `/purchases/${id}`,
    }).then((result) => {
      if (result.code == 200) {
        const purchase = result.data.purchase;
        setNF(purchase.nf || "");
        setSupplier(purchase.supplier);
        setPurchaseItems(
          result.data.purchase.purchase_items.map((item) => ({
            ...item,
            new_clean_cost: item.material.clean_cost,
          })),
        );
      } else {
        window.alert("Erro ao se comunicar com o servidor.");
      }
    });
  }, []);

  useEffect(() => {
    if (materialBeingUpdated == "") {
      return;
    }
    const input = document.querySelector(
      `[name=barcode-${materialBeingUpdated}]`,
    ) as HTMLInputElement;
    input.focus();
  }, [materialBeingUpdated]);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (nf == "") {
      window.alert("Preencha o numero da NF");
      setValidationErrors((prev) => ({ ...prev, nf: "Campo obrigarório" }));
      return;
    }
    const purchaseData = {
      status: "received",
      is_tracked: isTracked,
      nf,
      tax_cost: taxCost,
      purchase_cost: purchaseCost,
      delivery_cost: deliveryCost,
      supplier_id: supplier?.id,
      purchase_items: purchaseItems.map((item) => ({
        ...item,
        new_unit_cost: Math.round(
          item.new_clean_cost * (1 + item.ipi / 100_00),
        ),
        id: item.id.includes("null-") ? undefined : item.id,
        purchase: undefined,
      })),
    };
    const result = await fetchWithToken({
      path: `/purchases/${id}`,
      method: "PUT",
      body: JSON.stringify(purchaseData),
    });
    if (result.code == 200) {
      window.alert("Compra recebida com sucesso");
      window.location.href = "/compras";
      return null;
    }

    console.error(result.code, result.data);
    return null;
  }

  async function handleMaterialBarcodeUpdate(
    materialId: string,
    barcode: string,
  ) {
    const { code, data } = await fetchWithToken<{ material: MaterialsType }>({
      path: `/materials/${materialId}`,
      method: "PUT",
      body: JSON.stringify({ barcode: barcode }),
    });
    if (code == 200) {
      setPurchaseItems((prev) => [
        ...prev.map((item) =>
          item.material_id == materialId
            ? {
                ...item,
                material: { ...item.material, barcode: data.material.barcode },
              }
            : item,
        ),
      ]);
    } else if (code == 409) {
      setValidationErrors((prev) => ({
        ...prev,
        [`barcode-${materialId}`]: "Código repetido",
      }));
    }
  }

  async function updateScannedItemAmount(barcode: string) {
    let itemWasFoundHere = false;
    setPurchaseItems((prev) =>
      prev.map((item) => {
        if (item.material.barcode == barcode) {
          itemWasFoundHere = true;
          return { ...item, amount_delivered: item.amount_delivered + 1 };
        }
        return item;
      }),
    );
    setPurchaseItems((prev) =>
      prev.map((item) => {
        if (item.material.pkg_barcode == barcode) {
          itemWasFoundHere = true;
          return {
            ...item,
            amount_delivered: item.amount_delivered + item.material.pkg_size,
          };
        }
        return item;
      }),
    );
    if (itemWasFoundHere) {
      return true;
    }
    setIsSearchingBarcode(true);
    const result = await fetchWithToken<{ material: MaterialsType }>({
      path: `/materials/scan/${barcode}`,
    });
    setIsSearchingBarcode(false);
    if (result.code == 200) {
      const material = result.data.material;
      setPurchaseItems((prev) => [
        {
          amount_delivered: 1,
          amount_requested: 0,
          ipi: material.ipi,
          material: material,
          material_id: material.id,
          new_clean_cost: material.clean_cost,
          new_unit_cost: 0,
          purchase_id: id,
          profit: material.profit,
          old_unit_cost: material.avg_cost,
          old_clean_cost: material.clean_cost,
          id: `null-${material.id}`,
          purchase: {} as PurchasesType,
        },
        ...prev,
      ]);
      return true;
    } else {
      window.alert(
        `Nenhum material encontrado com codigo de barras '${barcode}'`,
      );
    }
  }

  function focusOnScannedItem(barcode: string) {
    try {
      let input = document.querySelector<HTMLInputElement>(
        `#barcode-${barcode}`,
      );
      if (input == null) {
        input = document.querySelector<HTMLInputElement>(
          `[name='amountDelivered-${barcode}`,
        );
      }
      if (input == null) {
        return null;
      }
      input.focus();
      setTimeout(() => {
        input.select();
      }, 50);
    } catch (error) {}
  }

  async function handleScanning(e: KeyboardEvent) {
    if (e.key == "Enter") {
      e.preventDefault();
      const input = e.currentTarget as HTMLInputElement;
      const value = input.value;
      if (input.value.length > 6) {
        setbarcodeLog((prev) => {
          if (Object.keys(prev).includes(value)) {
            return { ...prev, [value]: prev[value] + 1 };
          } else {
            return { ...prev, [value]: 1 };
          }
        });
        const result = await updateScannedItemAmount(value);
        if (result) {
          focusOnScannedItem(value);
        }
      } else {
        input.blur();
      }
    }
  }

  return (
    <div>
      <DataForm onSubmit={handleSubmit}>
        <div className={"flex gap-4"}>
          <Input
            name="supplier"
            value={supplier?.name}
            label="Fornecedor"
            disabled={true}
            className={"bg-blue-50!"}
          />
          <Input
            name="purchaseCost"
            value={BrlStringFromCents(purchaseCost)}
            label="Valor da Nota"
            className={"bg-blue-50!"}
            disabled={true}
          />
          <Input
            name="taxes"
            value={BrlStringFromCents(taxCost)}
            label="Impostos da NF"
            className={"bg-blue-50!"}
            disabled={true}
          />
        </div>
        <div className={"flex gap-4"}>
          <Input
            value={nf}
            name="nf"
            label="Número da NF"
            onBlur={(e) => {
              validateStringFieldOnBlur(e, setNF, setValidationErrors, {
                required: true,
              });
            }}
            errors={validationErros}
          />
          <Input
            name="deliveryCost"
            label="Frete"
            value={BrlStringFromCents(deliveryCost)}
            errors={validationErros}
            onBlur={(e) => {
              validateFloatFieldOnBlur(
                e,
                setDeliveryCost,
                setValidationErrors,
                { removeFromString: "R$" },
              );
            }}
          />
          <Checkbox
            label="NF para ES"
            name="isTracked"
            checked={isTracked}
            setChecked={setIsTracked}
          />
        </div>
        <Input
          name="scan"
          label="Scanear código"
          onKeyPress={async (e) => {
            if (e.key == "Enter") {
              const input = e.currentTarget;
              await handleScanning(e);
              input.value = "";
            }
          }}
        />
        <ListWrapper label="Materiais" doOnClickAdd={() => {}}>
          {purchaseItems.map((item) => {
            let totalVal = item.amount_delivered * item.new_clean_cost;
            totalVal = totalVal * (item.ipi / 100_00);
            const hasBeenScanned =
              Object.keys(barcodeLog).includes(
                item.material.barcode || "void",
              ) ||
              Object.keys(barcodeLog).includes(
                item.material.pkg_barcode || "void",
              );
            let color = "";
            color =
              item.amount_delivered == item.amount_requested
                ? "bg-green-200"
                : color;
            color =
              item.amount_delivered > item.amount_requested
                ? "bg-blue-200"
                : color;
            color =
              item.amount_delivered < item.amount_requested
                ? "bg-yellow-200"
                : color;
            color =
              item.amount_requested == 0 && item.amount_delivered > 0
                ? "bg-amber-300"
                : color;

            return (
              <article
                key={item.material_id}
                className={`grid grid-cols-[minmax(0,4fr)_minmax(0,4fr)_minmax(0,2fr)_minmax(0,3fr)_minmax(0,2fr)] gap-x-2 p-2 py-3 items-center ${
                  hasBeenScanned && color
                }`}
              >
                <div className={"flex flex-col gap-4 min-h-30"}>
                  <Input
                    name={`barcode-${item.material_id}`}
                    label={"Código de barras"}
                    value={item.material?.barcode || "cadastre um código"}
                    disabled={materialBeingUpdated !== item.material_id}
                    errors={validationErros}
                    className={
                      materialBeingUpdated !== item.material_id
                        ? "bg-blue-50!"
                        : ""
                    }
                    onKeyPress={(e) => {
                      if (e.key == "Enter") {
                        e.preventDefault();
                        handleMaterialBarcodeUpdate(
                          item.material_id,
                          e.currentTarget.value.trim(),
                        );
                        setMaterialBeingUpdated("");
                      }
                    }}
                  />
                  {materialBeingUpdated == item.material_id ? (
                    <div className={"flex gap-2"}>
                      <Button
                        text="Cancelar"
                        className={"bg-red-700 text-white text-sm p-1! mb-6"}
                        onClick={() => {
                          setMaterialBeingUpdated("");
                        }}
                      />
                    </div>
                  ) : (
                    <Button
                      text="Alterar"
                      className={
                        "max-w-16 bg-blue-700 text-white text-sm p-1! mb-6"
                      }
                      onClick={() => {
                        setMaterialBeingUpdated(item.material_id);
                      }}
                    />
                  )}
                </div>
                <Textarea
                  label="Nome"
                  name={"name"}
                  value={item.material.name}
                  disabled={true}
                  className={"bg-blue-50! min-h-24"}
                />
                <div className={"flex flex-col gap-1"}>
                  <Input
                    id={`barcode-${item.material.barcode || item.material_id}`}
                    name={`amountDelivered-${
                      item.material.pkg_barcode || item.material_id
                    }`}
                    label={"Entregue"}
                    value={item.amount_delivered}
                    onKeyPress={async (e) => {
                      await handleScanning(e);
                    }}
                    className={"text-center font-semibold"}
                    onBlur={(e) => {
                      if (e.currentTarget.value.length > 7) {
                        e.currentTarget.value =
                          item.amount_delivered.toString();
                        return;
                      }
                      let val = parseInt(e.currentTarget.value);
                      if (isNaN(val)) {
                        val = 0;
                      }
                      setPurchaseItems((prev) => [
                        ...prev.map((pItem) =>
                          pItem.material_id == item.material_id
                            ? { ...pItem, amount_delivered: val }
                            : pItem,
                        ),
                      ]);
                    }}
                  />
                  <Input
                    label={"Pedido"}
                    name={`amountRequested`}
                    value={`${item.amount_requested} ${item.material.unit}`}
                    className={"bg-blue-50! text-center font-semibold"}
                    disabled={true}
                  />
                </div>
                <div className={"flex flex-col gap-1"}>
                  <Input
                    label={"Valor Unitário"}
                    name={`amountDelivered`}
                    value={BrlStringFromCents(item.new_clean_cost)}
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
                      setPurchaseItems((prev) => [
                        ...prev.map((pItem) =>
                          pItem.material_id == item.material_id
                            ? { ...pItem, new_clean_cost: val }
                            : pItem,
                        ),
                      ]);
                    }}
                  />
                  <Input
                    label={"Valor Total"}
                    name={`totalValue`}
                    value={BrlStringFromCents(
                      item.amount_delivered * item.new_clean_cost,
                    )}
                    className={"bg-blue-50!"}
                    disabled={true}
                  />
                </div>
                <div className={"flex flex-col gap-1"}>
                  <Input
                    label={"Taxa IPI"}
                    name={`ipi`}
                    value={(item.ipi / 100_00).toLocaleString("pt-br", {
                      style: "percent",
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 2,
                    })}
                    onBlur={(e) => {
                      let val = parseFloat(
                        e.currentTarget.value
                          .replaceAll("%", "")
                          .replaceAll(".", "")
                          .replaceAll(",", ".")
                          .trim(),
                      );
                      if (isNaN(val)) {
                        val = 0;
                      }
                      val = Math.round(val * 100);
                      setPurchaseItems((prev) => [
                        ...prev.map((pItem) =>
                          pItem.material_id == item.material_id
                            ? { ...pItem, ipi: val }
                            : pItem,
                        ),
                      ]);
                    }}
                  />
                  <Input
                    label={"Valor IPI"}
                    name={`ipiValue`}
                    value={BrlStringFromCents(totalVal)}
                    className={"bg-blue-50!"}
                    disabled={true}
                  />
                </div>
              </article>
            );
          })}
        </ListWrapper>
        <Button text="Salvar" type={"submit"} />
      </DataForm>
    </div>
  );
}
