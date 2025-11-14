import { fetchWithToken } from "@utils/fetchWithToken";
import { useEffect, useState } from "preact/hooks";
import type { PurchasesType } from "./Purchases";
import { PurchaseDataForm } from "./PurchaseDataForm";
import { Button } from "@elements/Button";

export function PurchaseDelivery() {
  const [id, setId] = useState("");
  const [purchase, setPurchase] = useState<PurchasesType | undefined>(
    undefined
  );

  useEffect(() => {
    const path = new URL(window.location.href);
    const id = path.hash.replace("#", "").replaceAll("/", "");
    setId(id);
    fetchWithToken<{ purchase: PurchasesType }>({
      path: `/purchases/${id}`,
    }).then((result) => {
      if (result.code == 200) {
        setPurchase(result.data.purchase);
      } else {
        window.alert("Erro ao se comunicar com o servidor.");
      }
    });
  }, []);

  async function handleSubmit(purchaseData: Partial<PurchasesType>) {
    purchaseData = { ...purchaseData, status: "received" };
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

  return (
    <div>
      <PurchaseDataForm doOnSubmit={handleSubmit} purchaseData={purchase}>
        <div className={"flex flex-1"}>
          <Button
            className={"bg-blue-700 flex-1 text-white"}
            type={"submit"}
            text="Confirmar recebimento com dados preenchidos"
          />
        </div>
      </PurchaseDataForm>
    </div>
  );
}
