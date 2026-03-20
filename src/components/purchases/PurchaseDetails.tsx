import { Button } from "@elements/Button";
import { fetchWithToken } from "@utils/fetchWithToken";
import { useEffect, useState } from "preact/hooks";
import { PurchaseDataForm } from "./PurchaseDataForm";
import type { PurchasesType } from "./Purchases";
import { hasPermission } from "@utils/permissionLogic";

export function PurchaseDetails() {
  const [purchase, setPurchase] = useState<PurchasesType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);
    fetchWithToken<{ purchase: PurchasesType }>({
      path: `/purchases/${id}`,
    }).then((result) => {
      setIsLoading(false);
      if (result.code == 200) {
        setPurchase(result.data.purchase);
      } else {
        window.alert("Erro ao se comunicar com o servidor.");
      }
    });
  }, []);

  async function handleDeletePurchase() {
    setIsLoading(true);
    const { code, data } = await fetchWithToken<{ purchase: PurchasesType }>({
      path: `/purchases/${id}`,
      method: "DELETE",
    });
    setIsLoading(false);
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
    setIsLoading(true);
    const { code, data } = await fetchWithToken<{ purchase: PurchasesType }>({
      path: `/purchases/status/${id}`,
      method: "PATCH",
      body: JSON.stringify({ id, status: "requested" }),
    });
    setIsLoading(false);
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
    setIsLoading(true);
    const { code, data } = await fetchWithToken<{ purchase: PurchasesType }>({
      path: `/purchases/status/${id}`,
      method: "PATCH",
      body: JSON.stringify({ id, status: "shipped" }),
    });
    setIsLoading(false);
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
    setIsLoading(true);
    const { code, data } = await fetchWithToken<{ purchase: PurchasesType }>({
      path: `/purchases/status/${id}`,
      method: "PATCH",
      body: JSON.stringify({ id, status: "finished" }),
    });
    setIsLoading(false);
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
    setIsLoading(true);
    const { code, data } = await fetchWithToken<{ purchase: PurchasesType }>({
      path: `/purchases/${purchase?.id}`,
      method: "PUT",
      body: JSON.stringify(purchaseData),
    });
    setIsLoading(false);

    if (code == 200) {
      window.alert("Alterações salvas");
      setPurchase(data.purchase);
      return null;
    }

    return { erro: "Alguma coisa" };
  }

  return (
    <main>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm transition-opacity duration-300">
          <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-white shadow-2xl border border-slate-100">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-slate-100 rounded-full"></div>
              <div className="w-12 h-12 border-4 border-slate-700 border-t-transparent rounded-full animate-spin absolute top-0"></div>
            </div>
            <div className="text-xl font-bold text-slate-800 tracking-tight">
              carregando
            </div>
          </div>
        </div>
      )}
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
