import { fetchWithToken } from "@utils/fetchWithToken";
import { useEffect, useState } from "preact/hooks";
import { Button } from "src/elements/Button";
import { DataForm } from "src/elements/DataForm";
import { Input } from "src/elements/Input";
import { Textarea } from "src/elements/TextArea";
import type { MaterialsType } from "../materials/Materials";
import { ListWrapper } from "../quotations/lists/ListWrapper";
import type { TransactionItemsType, TransactionsType } from "./Transactions";

export function TransactionReturn() {
  const [transactionItems, setTransactionItems] = useState<
    TransactionItemsType[]
  >([]);
  const [transaction, setTransaction] = useState<TransactionsType>();
  const [materialBeingUpdated, setMaterialBeingUpdated] = useState("");
  const [validationErros, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [id, setId] = useState("");
  const [barcodeLog, setbarcodeLog] = useState<{
    [key: string]: number;
  }>({});

  useEffect(() => {
    const path = new URL(window.location.href);
    const id = path.hash.replace("#", "").replaceAll("/", "");
    setId(id);
    fetchWithToken<{ transaction: TransactionsType }>({
      path: `/transactions/${id}`,
    }).then((result) => {
      if (result.code == 200) {
        setTransaction(result.data.transaction);
        setTransactionItems(result.data.transaction.items);
      } else {
        window.alert("Erro ao se comunicar com o servidor.");
      }
    });
    setTimeout(() => {
      const scanInput = document.querySelector<HTMLInputElement>("#scanInput");
      if (scanInput) {
        scanInput.focus();
      }
    }, 100);
  }, []);

  useEffect(() => {
    if (materialBeingUpdated == "") {
      return;
    }
    const input = document.querySelector(
      `[name=barcode-${materialBeingUpdated}]`
    ) as HTMLInputElement;
    input.focus();
  }, [materialBeingUpdated]);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    for (const item of transactionItems) {
      if (item.taken_amount < item.separated_amount + item.returned_amount) {
        window.alert(
          "Não é permitido devolver quantidade maior que a entregue"
        );
        return null;
      }
    }

    const result = await fetchWithToken({
      path: `/transactions/${id}`,
      method: "PUT",
      body: JSON.stringify({
        status: "returning",
        quotation_id: transaction?.quotation_id,
        items: transactionItems,
      }),
    });
    if (result.code == 200) {
      window.alert("Devolução salva com sucesso");
      window.location.href = `/pedidos`;
      return null;
    }

    console.error(result.code, result.data);
    return null;
  }

  function focusOnScannedItem(barcode: string) {
    setbarcodeLog((prev) => {
      if (Object.keys(prev).includes(barcode)) {
        return { ...prev, [barcode]: prev[barcode] + 1 };
      } else {
        return { ...prev, [barcode]: 1 };
      }
    });

    setTransactionItems((prev) =>
      prev.map((item) =>
        item.material.barcode == barcode
          ? { ...item, separated_amount: item.separated_amount + 1 }
          : item
      )
    );
    setTransactionItems((prev) =>
      prev.map((item) =>
        item.material.pkg_barcode == barcode
          ? {
              ...item,
              separated_amount: item.separated_amount + item.material.pkg_size,
            }
          : item
      )
    );
    try {
      let input = document.querySelector<HTMLInputElement>(
        `#barcode-${barcode}`
      );
      if (input == null) {
        input = document.querySelector<HTMLInputElement>(
          `[name='separatedAmount${barcode}']`
        );
      }
      if (input == null) {
        console.log(barcode);
        return null;
      }
      input.focus();
      setTimeout(() => {
        input.select();
      }, 50);
    } catch (error) {}
  }

  async function handleMaterialBarcodeUpdate(
    materialId: string,
    barcode: string
  ) {
    const { code, data } = await fetchWithToken<{ material: MaterialsType }>({
      path: `/materials/${materialId}`,
      method: "PUT",
      body: JSON.stringify({ barcode: barcode }),
    });
    if (code == 200) {
      setTransactionItems((prev) =>
        prev.map((item) =>
          item.material_id == materialId
            ? { ...item, material: { ...item.material, barcode } }
            : item
        )
      );
    } else {
      window.alert("Erro ao se comunicar com o servidor");
      window.location.reload();
    }
  }

  function handleScanning(e: KeyboardEvent) {
    const input = e.currentTarget as HTMLInputElement;
    if (e.key == "Enter") {
      e.preventDefault();
      if (input.value.length > 7) {
        focusOnScannedItem(input.value);
      } else {
        try {
          const scanInput =
            document.querySelector<HTMLInputElement>("#scanInput");
          if (scanInput) {
            setTimeout(() => {
              scanInput.focus();
            }, 50);
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
  }

  return (
    <div>
      <DataForm onSubmit={handleSubmit}>
        <Input
          name="scan"
          id={"scanInput"}
          label="Scanear código"
          onKeyPress={(e) => {
            if (e.key == "Enter") {
              e.preventDefault();
              focusOnScannedItem(e.currentTarget.value);
              e.currentTarget.value = "";
            }
          }}
        />
        <ListWrapper label="Materiais" doOnClickAdd={() => {}}>
          {transactionItems.map((item) => {
            return (
              <article
                key={item.id}
                className={`flex flex-col gap-2 py-3 px-2 ${
                  item.separated_amount + item.returned_amount >
                  item.taken_amount
                    ? "bg-amber-200"
                    : ""
                }`}
              >
                <div className={"grid grid-cols-[2fr_1fr] gap-x-2"}>
                  <Textarea
                    label="Nome"
                    name={"name"}
                    value={item.material.name}
                    disabled={true}
                    className={"bg-blue-50! min-h-24"}
                  />
                  <div className={"flex flex-col gap-1"}>
                    <Input
                      id={`barcode-${
                        item.material.barcode || item.material_id
                      }`}
                      name={`separatedAmount${item.material.pkg_barcode}`}
                      label={"Devolvendo"}
                      errors={validationErros}
                      value={item.separated_amount}
                      onKeyPress={handleScanning}
                      className={"text-center font-semibold"}
                      onBlur={(e) => {
                        if (e.currentTarget.value.length > 7) {
                          e.currentTarget.value =
                            item.separated_amount.toString();
                          return;
                        }
                        let val = parseInt(e.currentTarget.value);
                        if (isNaN(val)) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            [`separatedAmount${item.material.pkg_barcode}`]:
                              "Preencha um valor valido",
                          }));
                          val = 0;
                        } else {
                          setValidationErrors((prev) => {
                            delete prev[
                              `separatedAmount${item.material.pkg_barcode}`
                            ];
                            return prev;
                          });
                        }
                        setTransactionItems((prev) => [
                          ...prev.map((pItem) =>
                            pItem.material_id == item.material_id
                              ? { ...pItem, separated_amount: val }
                              : pItem
                          ),
                        ]);
                      }}
                    />

                    <Input
                      id={`barcode-${
                        item.material.barcode || item.material_id
                      }`}
                      name={`takenAmount`}
                      label={"Entregue"}
                      value={`${item.taken_amount} ${item.material.unit}`}
                      className={"bg-blue-50! text-center font-semibold"}
                      disabled={true}
                    />
                  </div>
                </div>

                <div className={"flex items-start gap-1"}>
                  <div className={"flex-1 flex flex-col gap-2 min-h-30"}>
                    <Input
                      name={`barcode-${item.id}`}
                      label={"Código de barras"}
                      value={item.material?.barcode || "cadastre um código"}
                      disabled={materialBeingUpdated !== item.id}
                      className={
                        materialBeingUpdated !== item.id ? "bg-blue-50!" : ""
                      }
                      onKeyPress={(e) => {
                        if (e.key == "Enter") {
                          e.preventDefault();
                          handleMaterialBarcodeUpdate(
                            item.material_id!,
                            e.currentTarget.value.trim()
                          );
                          setMaterialBeingUpdated("");
                        }
                      }}
                    />
                    {materialBeingUpdated == item.id ? (
                      <div className={"flex gap-2"}>
                        {/* <Button
                        text="Salvar"
                        className={"bg-blue-700 text-white text-sm p-1! mb-6"}
                        onClick={(e) => {
                          handleMaterialBarcodeUpdate(
                            item.material_id,
                            e.currentTarget.value.trim()
                          );
                          setMaterialBeingUpdated("");
                        }}
                      /> */}
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
                          setMaterialBeingUpdated(item.id);
                        }}
                      />
                    )}
                  </div>
                  <Input
                    label={"Pedido"}
                    name={`amountRequested`}
                    value={`${item.expected_amount} ${item.material.unit}`}
                    className={"bg-blue-50! text-center font-semibold"}
                    disabled={true}
                  />

                  <Input
                    id={`barcode-${item.material.barcode || item.material_id}`}
                    name={`takenAmount`}
                    label={"Já devolvido"}
                    value={`${item.returned_amount} ${item.material.unit}`}
                    className={"bg-blue-50! text-center font-semibold"}
                    disabled={true}
                  />
                </div>
              </article>
            );
          })}
        </ListWrapper>
        <Button text="Salvar devolução" type={"submit"} />
      </DataForm>
    </div>
  );
}
