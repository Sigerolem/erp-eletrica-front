import { Button } from "@elements/Button";
import { fetchWithToken } from "@utils/fetchWithToken";
import { useEffect, useState } from "preact/hooks";
import { QuotationDataForm } from "./QuotationDataForm";
import type { QuotationsStatusType, QuotationsType } from "./Quotations";

export function QuotationDetails() {
  const [quotation, setQuotation] = useState<QuotationsType | null>(null);
  const [id, setId] = useState("");

  const quotationStatusButtonMap = {
    draft: [{ text: "Concluir rascunho", class: "", status: "q_awaiting" }],
    q_awaiting: [
      { text: "Aprovar orçamento", class: "", status: "q_approved" },
      {
        text: "Recusar orçamento",
        class: "bg-red-500 text-white",
        status: "denied",
      },
    ],
    q_approved: [
      { text: "Autorizar ordem de serviço", class: "", status: "os_awaiting" },
    ],
    os_awaiting: [
      { text: "Iniciar ordem de serviço", class: "", status: "os_ongoing" },
    ],
    os_ongoing: [
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
        status: "awaiting_delivery",
      },
    ],
    awaiting_delivery: [
      {
        text: "Documentação da OS entregue ao Cliente",
        class: "",
        status: "delivered",
      },
    ],
    delivered: [
      {
        text: "Cliente confirmou atendimento da OS",
        class: "",
        status: "awaiting_payment",
      },
    ],
    awaiting_payment: [
      { text: "Cliente realizou o pagamento", class: "", status: "finished" },
    ],
    finished: [],
    denied: [],
    cancelled: [],
  };

  useEffect(() => {
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
    }
    return null;
  }

  async function updateQuotationStatus(newStatus: QuotationsStatusType) {
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
  }

  return (
    <main>
      {quotation ? (
        <QuotationDataForm
          doOnSubmit={updateQuotationData}
          quotationData={quotation}
        >
          <div className={"flex justify-evenly"}>
            {quotationStatusButtonMap[quotation.status].length > 0 ? (
              quotationStatusButtonMap[quotation.status].map((btn) => (
                <Button
                  text={btn.text}
                  className={btn.class || "bg-slate-600 text-white"}
                  onClick={() => {
                    updateQuotationStatus(btn.status as QuotationsStatusType);
                  }}
                />
              ))
            ) : (
              <></>
            )}
            <Button type={"submit"} text="Salvar alterações" />
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
