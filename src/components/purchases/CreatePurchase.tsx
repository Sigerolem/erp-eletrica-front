import type { SuppliersType } from "@comp/suppliers/Suppliers";
import { Button } from "@elements/Button";
import { useEffect } from "preact/hooks";
import { fetchWithToken } from "@utils/fetchWithToken";
import { PurchaseDataForm } from "./PurchaseDataForm";
import type { PurchasesType } from "./Purchases";
import { hasPermission } from "src/utils/permissionLogic";

export function CreatePurchase() {
  useEffect(() => {
    const role = localStorage.getItem("apiRole");
    const permission = localStorage.getItem("apiPermissions");
    if (
      role !== "owner" &&
      !hasPermission(permission ?? "----------------", "purchase", "W")
    ) {
      window.location.href = "/compras";
    }
  }, []);

  async function onFormSubmit(purchaseData: Partial<PurchasesType>) {
    const basicSupplier = purchaseData.supplier as SuppliersType;
    delete purchaseData.supplier;
    const { data, code } = await fetchWithToken<{ purchase: PurchasesType }>({
      path: "/purchases/create",
      method: "POST",
      body: JSON.stringify(purchaseData),
    });

    if (code == 201) {
      window.location.href = "/compras";
      return null;
    }

    window.alert("Erro ao salvar a compra");
    console.error(code, data, purchaseData);
    return { erro: "Algum problema ocorreu" };
  }

  return (
    <div
      className={"bg-blue-50 p-1 opacity-100 rounded-md overflow-scroll"}
      onClick={(e) => e.stopPropagation()}
    >
      <div>
        <PurchaseDataForm doOnSubmit={onFormSubmit}>
          <div className={"w-full justify-stretch flex"}>
            <Button
              text={"Salvar compra"}
              type={"submit"}
              className={"bg-slate-700 flex-1 text-white"}
            />
          </div>
        </PurchaseDataForm>
      </div>
    </div>
  );
}
