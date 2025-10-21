import { MaterialDataForm } from "@comp/materials/MaterialDataForm";
import type { MaterialsType } from "@comp/materials/Materials";
import { fetchWithToken } from "@utils/fetchWithToken";
import { useState, useEffect } from "preact/hooks";
import type { PurchasesType } from "./Purchases";
import { PurchaseDataForm } from "./PurchaseDataForm";
import { Button } from "@elements/Button";

export function PurchaseDetails() {
  const [purchase, setPurchase] = useState<PurchasesType | null>(null);
  const [id, setId] = useState("");

  useEffect(() => {
    const path = new URL(window.location.href);
    const id = path.hash.replace("#", "");
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

  async function handleConfirmDraft() {
    const { code, data } = await fetchWithToken<{ purchase: PurchasesType }>({
      path: `/purchases/status/${id}`,
      method: "PATCH",
      body: JSON.stringify({ id, status: "requested" }),
    });
    if (code === 200) {
      window.alert("Alterado com sucesso.");
      setPurchase((prev) => {
        if (prev) {
          return { ...prev, status: data.purchase.status };
        }
        return prev;
      });
    }
  }

  async function handleConfirmPurchase() {
    const { code, data } = await fetchWithToken<{ purchase: PurchasesType }>({
      path: `/purchases/status/${id}`,
      method: "PATCH",
      body: JSON.stringify({ id, status: "shipped" }),
    });
    if (code === 200) {
      window.alert("Alterado com sucesso.");
      setPurchase((prev) => {
        if (prev) {
          return { ...prev, status: data.purchase.status };
        }
        return prev;
      });
    }
  }

  async function handleDataSubmition(purchaseData: Partial<PurchasesType>) {
    const { code, data } = await fetchWithToken<{ purchase: PurchasesType }>({
      path: `/purchases/${purchase?.id}`,
      method: "PUT",
      body: JSON.stringify(purchaseData),
    });
    console.log(code, data);

    if (code == 200) {
      window.alert("Alterações salvas");
      return null;
    }

    return { erro: "Alguma coisa" };
  }

  return (
    <main>
      {purchase ? (
        <PurchaseDataForm
          doOnSubmit={handleDataSubmition}
          purchaseData={purchase}
        >
          <div className={"flex justify-stretch gap-4 mt-4"}>
            {purchase.id !== "" && purchase.status == "draft" && (
              <Button
                text={"Confirmar rascunho"}
                type={"button"}
                className={"bg-slate-700 flex-1"}
                onClick={handleConfirmDraft}
              />
            )}
            {purchase.id !== "" && purchase.status == "requested" && (
              <Button
                text={"Confirmar compra"}
                type={"button"}
                className={"bg-slate-700 flex-1"}
                onClick={handleConfirmPurchase}
              />
            )}
            {purchase.id !== "" && purchase.status == "received" && (
              <Button
                text={"Finalizar compra"}
                type={"button"}
                className={"bg-slate-700 flex-1"}
                onClick={handleConfirmPurchase}
              />
            )}
            {purchase.status !== "shipped" ? (
              <Button
                text={"Salvar"}
                type={"submit"}
                className={"bg-blue-700 flex-1"}
              />
            ) : (
              <a
                href={`/compras/recebimento/id#${id}`}
                className={"flex-1 flex"}
              >
                <Button
                  text={"Receber compra"}
                  className={"bg-blue-700 flex-1"}
                />
              </a>
            )}
          </div>
        </PurchaseDataForm>
      ) : (
        <span className={"animate-bounce text-xl block mt-8 font-semibold"}>
          Carregando...
        </span>
      )}
    </main>
  );
}
