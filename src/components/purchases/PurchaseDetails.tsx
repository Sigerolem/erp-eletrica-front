import { Button } from "@elements/Button";
import { fetchWithToken } from "@utils/fetchWithToken";
import { useEffect, useState } from "preact/hooks";
import { PurchaseDataForm } from "./PurchaseDataForm";
import type { PurchasesType } from "./Purchases";
import { hasPermission } from "@utils/permissionLogic";

export function PurchaseDetails() {
  const [purchase, setPurchase] = useState<PurchasesType | null>(null);
  const [id, setId] = useState("");
  const [userCanEditPurchase, setUserCanEditPurchase] = useState(false);
  const [userCanDeletePurchase, setUserCanDeletePurchase] = useState(false);

  const PURCHASE_DELIVERY_URL =
    window.location.hostname == "localhost"
      ? "/compras/recebimento/id#"
      : "/compras/recebimento/id/#";

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
      setUserCanEditPurchase(true);
    }
    if (
      role == "owner" ||
      hasPermission(permission ?? "----------------", "purchase", "D")
    ) {
      setUserCanDeletePurchase(true);
    }

    const path = new URL(window.location.href);
    const id = path.hash.replace("#", "").replaceAll("/", "");
    setId(id);
    fetchWithToken<{ purchase: PurchasesType }>({
      path: `/purchases/${id}`,
    }).then((result) => {
      if (result.code == 200) {
        setPurchase(result.data.purchase);
        console.log(result.data);
      } else {
        window.alert("Erro ao se comunicar com o servidor.");
      }
    });
  }, []);

  async function handleDeletePurchase() {
    const { code, data } = await fetchWithToken<{ purchase: PurchasesType }>({
      path: `/purchases/${id}`,
      method: "DELETE",
    });
    if (code === 200) {
      window.alert("Compra deletada com sucesso.");
      window.location.href = "/compras";
    } else if (code === 403) {
      window.alert("Você não tem permissão para deletar esta compra.");
    } else {
      window.alert("Erro ao se comunicar com o servidor.");
    }
  }

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
          return { ...prev, status: "requested" };
        }
        return prev;
      });
    } else if (code === 403) {
      window.alert("Você não tem permissão para confirmar esta compra.");
    } else {
      window.alert("Erro ao se comunicar com o servidor.");
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
          return { ...prev, status: "shipped" };
        }
        return prev;
      });
    }
  }

  async function handleConcludePurchase() {
    const { code, data } = await fetchWithToken<{ purchase: PurchasesType }>({
      path: `/purchases/status/${id}`,
      method: "PATCH",
      body: JSON.stringify({ id, status: "finished" }),
    });
    if (code === 200) {
      window.alert("Alterado com sucesso.");
      setPurchase((prev) => {
        if (prev) {
          return { ...prev, status: "finished" };
        }
        return prev;
      });
      window.location.href = "/compras";
    }
  }

  async function handleDataSubmition(purchaseData: Partial<PurchasesType>) {
    const { code, data } = await fetchWithToken<{ purchase: PurchasesType }>({
      path: `/purchases/${purchase?.id}`,
      method: "PUT",
      body: JSON.stringify(purchaseData),
    });

    if (code == 200) {
      window.alert("Alterações salvas");
      setPurchase(data.purchase);
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
          {userCanEditPurchase ? (
            <div className={"flex items-center justify-between gap-8 w-full"}>
              {purchase.id !== "" && purchase.status == "draft" && (
                <>
                  {userCanDeletePurchase && (
                    <Button
                      text={"Deletar compra"}
                      type={"button"}
                      className={"bg-red-700 flex-1 text-white"}
                      onClick={handleDeletePurchase}
                    />
                  )}
                  <Button
                    text={"Confirmar rascunho"}
                    type={"button"}
                    className={"bg-slate-700 flex-1 text-white"}
                    onClick={handleConfirmDraft}
                  />
                </>
              )}
              {purchase.id !== "" && purchase.status == "requested" && (
                <>
                  {userCanDeletePurchase && (
                    <Button
                      text={"Deletar compra"}
                      type={"button"}
                      className={"bg-red-700 flex-1 text-white"}
                      onClick={handleDeletePurchase}
                    />
                  )}
                  <Button
                    text={"Confirmar compra"}
                    type={"button"}
                    className={"bg-slate-700 flex-1 text-white"}
                    onClick={handleConfirmPurchase}
                  />
                </>
              )}

              {purchase.id !== "" && purchase.status == "received" && (
                <Button
                  text={"Finalizar compra"}
                  type={"button"}
                  className={"bg-slate-700 flex-1 text-white"}
                  onClick={handleConcludePurchase}
                />
              )}

              {purchase.status == "shipped" && (
                <a
                  href={`${PURCHASE_DELIVERY_URL}${id}/`}
                  className={"flex-1 flex"}
                >
                  <Button
                    text={"Receber compra"}
                    className={"bg-slate-700 flex-1 text-white"}
                  />
                </a>
              )}
            </div>
          ) : (
            <></>
          )}
        </PurchaseDataForm>
      ) : (
        <span className={"animate-bounce text-xl block mt-8 font-semibold"}>
          Carregando...
        </span>
      )}
    </main>
  );
}
