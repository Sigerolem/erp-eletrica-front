import { Button } from "@elements/Button";
import { fetchWithToken } from "@utils/fetchWithToken";
import { useEffect, useState } from "preact/hooks";
import { QuotationDataForm } from "./QuotationDataForm";
import type { QuotationsStatusType, QuotationsType } from "./Quotations";
import { hasPermission } from "src/utils/permissionLogic";
import { PrintPdfModal } from "./PrintPdfModal";

export const quotationStatusButtonMap = {
  q_awaiting: [
    {
      text: "Recusar orçamento",
      class: "bg-red-500 text-white",
      status: "denied",
    },
    {
      text: "Aprovar orçamento",
      class: "",
      status: "q_approved",
    },
  ],
  q_approved: [
    {
      text: "Reverter para 'Aguardando'",
      class: "bg-slate-600 text-white",
      status: "q_awaiting",
    },
    { text: "Autorizar ordem de serviço", class: "", status: "os_awaiting" },
  ],
  os_awaiting: [
    {
      text: "Cancelar ordem",
      class: "bg-red-500 text-white",
      status: "cancelled",
    },
    {
      text: "Reverter para orçamento",
      class: "bg-slate-600 text-white",
      status: "q_approved",
    },
    { text: "Iniciar ordem de serviço", class: "", status: "os_ongoing" },
  ],
  os_ongoing: [
    {
      text: "Cancelar Ordem de Serviço",
      class: "bg-red-500 text-white",
      status: "cancelled",
    },
    { text: "Mão de obra finalizada", class: "", status: "os_done_mo" },
    { text: "Materiais finalizados", class: "", status: "os_done_mat" },
  ],
  os_done_mo: [
    { text: "Materiais finalizados", class: "", status: "awaiting_closure" },
  ],
  os_done_mat: [
    { text: "Mão de obra finalizada", class: "", status: "awaiting_closure" },
  ],
  awaiting_closure: [
    {
      text: "Finalizar atendimento da OS",
      class: "",
      status: "awaiting_customer_confirmation",
    },
  ],
  awaiting_customer_confirmation: [
    {
      text: "Pagamento agendado com o cliente",
      class: "",
      status: "awaiting_payment",
    },
  ],
  awaiting_payment: [
    // { text: "Cliente realizou o pagamento", class: "", status: "finished" },
  ],
  finished: [],
  denied: [],
  cancelled: [],
} as {
  [key in QuotationsStatusType]: {
    text: string;
    class: string;
    status: QuotationsStatusType;
  }[];
};

export function QuotationDetails() {
  const [quotation, setQuotation] = useState<QuotationsType | null>(null);
  const [id, setId] = useState("");
  const [userCanEditQuotations, setUserCanEditQuotations] = useState(false);
  const [userCanDeleteQuotations, setUserCanDeleteQuotations] = useState(false);
  const [somethingChanged, setSomethingChanged] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("apiRole");
    const permission = localStorage.getItem("apiPermissions");
    if (
      role != "owner" &&
      !hasPermission(permission ?? "----------------", "quotation", "R")
    ) {
      window.location.href = "/";
      return;
    }
    if (
      role == "owner" ||
      hasPermission(permission ?? "----------------", "quotation", "W")
    ) {
      setUserCanEditQuotations(true);
    }
    if (
      role == "owner" ||
      hasPermission(permission ?? "----------------", "quotation", "D")
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
      window.location.reload();
    } else if (code == 403) {
      window.alert("Você não tem permissão para realizar essa ação");
      return { erro: "Permissão negada" };
    } else if (code == 400 || code == 500) {
      window.alert(
        `Erro ao salvar orçamento. \n ${data.error} \n ${data.message}`,
      );
      return { erro: "Algum problema ocorreu" };
    } else {
      window.alert(`Erro ao salvar orçamento. \n ${data}`);
      console.error(code, data);
      return { erro: "Algum problema ocorreu" };
    }
    setIsFetching(false);
    return null;
  }

  async function deleteQuotation() {
    setIsFetching(true);
    const { code } = await fetchWithToken({
      path: `/quotations/${id}`,
      method: "DELETE",
    });
    if (code == 200) {
      window.alert("Orçamento excluído com sucesso");
      window.location.href = "/orcamentos";
    }
    setIsFetching(false);
  }

  async function updateQuotationStatus(newStatus: QuotationsStatusType) {
    setIsFetching(true);
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
      window.location.reload();
    }
    setIsFetching(false);
  }

  return (
    <main className={"relative"}>
      <div
        className={"absolute w-full flex justify-end -mt-7 md:pr-4 md:-mt-9"}
      >
        <Button
          text="PDF"
          onClick={() => {
            setIsPrintModalOpen(true);
          }}
        />
      </div>
      {isPrintModalOpen && (
        <PrintPdfModal
          closeModal={() => {
            setIsPrintModalOpen(false);
          }}
          quotationId={id}
          quotationStatus={"q_awaiting"}
        />
      )}
      {quotation ? (
        <QuotationDataForm
          doOnSubmit={updateQuotationData}
          quotationData={quotation}
          setSomethingChanged={setSomethingChanged}
        >
          <div className={"flex gap-1 justify-evenly"}>
            {!somethingChanged &&
            quotationStatusButtonMap[quotation.status].length > 0 &&
            userCanEditQuotations ? (
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

            {userCanEditQuotations && somethingChanged && (
              <Button
                type={"submit"}
                text="Salvar alterações"
                disabled={isFetching}
              />
            )}

            {userCanDeleteQuotations &&
              ["denied"].includes(quotation.status) && (
                <Button
                  type={"button"}
                  text="Excluir orçamento"
                  className={"bg-red-500 text-white"}
                  onClick={() => {
                    deleteQuotation();
                  }}
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
