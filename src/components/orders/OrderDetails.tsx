import { Button } from "@elements/Button";
import { fetchWithToken } from "@utils/fetchWithToken";
import { useEffect, useState } from "preact/hooks";
import { hasPermission } from "src/utils/permissionLogic";
import { QuotationDataForm } from "@comp/quotations/QuotationDataForm";
import type {
  QuotationsStatusType,
  QuotationsType,
} from "@comp/quotations/Quotations";
import { quotationStatusButtonMap } from "@comp/quotations/QuotationDetails";

export function OrderDetails() {
  const [quotation, setQuotation] = useState<QuotationsType | null>(null);
  const [id, setId] = useState("");
  const [userCanEditOrders, setUserCanEditOrders] = useState(false);
  const [userCanDeleteQuotations, setUserCanDeleteQuotations] = useState(false);
  const [somethingChanged, setSomethingChanged] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("apiRole");
    const permission = localStorage.getItem("apiPermissions");
    if (
      role != "owner" &&
      !hasPermission(permission ?? "----------------", "order", "R")
    ) {
      window.location.href = "/";
      return;
    }
    if (
      role == "owner" ||
      hasPermission(permission ?? "----------------", "order", "W")
    ) {
      setUserCanEditOrders(true);
    }
    if (
      role == "owner" ||
      hasPermission(permission ?? "----------------", "order", "D")
    ) {
      setUserCanDeleteQuotations(true);
    }

    const path = new URL(window.location.href);
    const id = path.hash.replace("#", "").replaceAll("/", "");
    setId(id);
    fetchWithToken<{ quotation: QuotationsType }>({
      path: `/quotations/${id}`,
    }).then((result) => {
      if (result.code == 200) {
        setQuotation(result.data.quotation);
      } else if (result.code == 403) {
        window.location.href = "/";
        return;
      } else {
        window.alert("Erro ao se comunicar com o servidor.");
      }
    });
  }, []);

  async function updateQuotationData({
    quotationData,
    itemsToDelete,
    materialsToDelete,
  }: {
    quotationData: Partial<QuotationsType>;
    itemsToDelete?: string[];
    materialsToDelete?: string[];
  }) {
    setIsFetching(true);
    const { code, data } = await fetchWithToken<{ quotation: QuotationsType }>({
      path: `/quotations/${id}`,
      method: "PUT",
      body: JSON.stringify({
        quotation: quotationData,
        itemsToDelete,
        materialsToDelete,
      }),
    });

    if (code == 200) {
      window.alert("Alterações salvas com sucesso");
      setQuotation(data.quotation);
      if (
        data.quotation.status == "q_awaiting" ||
        data.quotation.status == "q_approved"
      ) {
        window.location.href = "/ordens";
      }
    }
    setIsFetching(false);
    return null;
  }

  async function deleteOrder() {
    setIsFetching(true);
    const { code } = await fetchWithToken({
      path: `/quotations/${id}`,
      method: "DELETE",
    });
    if (code == 200) {
      window.alert("Ordem de serviço excluída com sucesso");
      window.location.href = "/ordens";
    }
    setIsFetching(false);
  }

  console.log(quotation?.materials);

  async function updateQuotationStatus(newStatus: QuotationsStatusType) {
    setIsFetching(true);
    if (newStatus == "cancelled") {
      const canCancel = quotation?.materials.every(
        (material) => material.taken_amount == material.returned_amount,
      );
      if (!canCancel) {
        window.alert(
          "Não é possível cancelar uma ordem de serviço com materiais não devolvidos",
        );
        setIsFetching(false);
        return;
      }
    }
    const { code, data } = await fetchWithToken<{ quotation: QuotationsType }>({
      path: `/quotations/${id}`,
      method: "PATCH",
      body: JSON.stringify({ id: quotation?.id, status: newStatus }),
    });
    if (code == 200) {
      window.alert("Alterações salvas com sucesso");
      if (data.quotation.status == "os_awaiting") {
        window.location.href = "/ordens";
      }
      setQuotation(data.quotation);
    }
    setIsFetching(false);
  }

  return (
    <main>
      {quotation ? (
        <QuotationDataForm
          doOnSubmit={updateQuotationData}
          quotationData={quotation}
          setSomethingChanged={setSomethingChanged}
        >
          <div className={"flex justify-evenly"}>
            {!somethingChanged &&
            quotationStatusButtonMap[quotation.status].length > 0 &&
            userCanEditOrders ? (
              quotationStatusButtonMap[quotation.status].map((btn) => (
                <Button
                  text={btn.text}
                  className={btn.class || "bg-blue-700 text-white"}
                  onClick={() => {
                    updateQuotationStatus(btn.status as QuotationsStatusType);
                  }}
                  disabled={isFetching}
                />
              ))
            ) : (
              <></>
            )}
            {somethingChanged && userCanEditOrders && (
              <Button
                type={"submit"}
                text="Salvar alterações"
                disabled={isFetching}
              />
            )}

            {userCanDeleteQuotations &&
              ["cancelled"].includes(quotation.status) && (
                <Button
                  type={"button"}
                  text="Excluir ordem"
                  onClick={() => {
                    deleteOrder();
                  }}
                  className={"bg-red-500 text-white"}
                  disabled={isFetching}
                />
              )}
          </div>
        </QuotationDataForm>
      ) : (
        <span className={"animate-bounce text-xl block mt-8 font-semibold"}>
          Carregando...
        </span>
      )}
    </main>
  );
}
