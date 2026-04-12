import { Button } from "@elements/Button";
import { fetchWithToken } from "@utils/fetchWithToken";
import { useEffect, useState } from "preact/hooks";
import { Portal } from "src/elements/Portal";
import type { QuotationsType } from "../quotations/Quotations";
import { PaymentDataForm } from "./PaymentDataForm";
import type { PaymentsType } from "./Payments";

export function CreatePaymentModal({
  closeModal,
  quotation,
}: {
  closeModal: () => void;
  quotation: Partial<QuotationsType>;
}) {
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key == "Escape") {
        if (isFetching == false) {
          closeModal();
        } else {
          window.alert(
            "Aguarde alguns segundos a requisição ao servidor obter resposta, ou atualize a página.",
          );
        }
      }
    };

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [isFetching]);

  useEffect(() => {}, [quotation]);

  async function handleDataSubmition(paymentData: Partial<PaymentsType>) {
    setIsFetching(true);
    const { code, data } = await fetchWithToken<{ payment: PaymentsType }>({
      path: "/payments/create",
      method: "POST",
      body: JSON.stringify({
        quotation_id: paymentData.quotation_id,
        due_date: paymentData.due_date,
        method: paymentData.method,
        notes: paymentData.notes,
      }),
    });
    setIsFetching(false);

    if (code == 201) {
      closeModal();
      window.location.href = `/financeiro`;
      return null;
    }

    if (code == 400 || code == 500) {
      window.alert(
        `Erro ao salvar pagamento: \n ${data.error} \n ${data.message}`,
      );
      console.error(code, data);
      return { error: "Requisição inválida" };
    }

    window.alert(`Erro inesperado ao salvar pagamento. \n ${data}`);
    console.error(code, data);
    return { error: "Erro inesperado" };
  }

  return (
    <Portal>
      <section
        className={`fixed top-0 left-0 w-full h-full p-10 bg-[#000000AA] z-10 flex flex-col justify-center ${isFetching && "hover:cursor-wait!"}`}
        onClick={() => {
          if (isFetching == false) {
            closeModal();
          } else {
            window.alert(
              "Aguarde alguns segundos a requisição ao servidor obter resposta, ou atualize a página.",
            );
          }
        }}
      >
        <div
          className={"bg-blue-50 p-8 opacity-100 rounded-md"}
          onClick={(e) => e.stopPropagation()}
        >
          <header className={"flex justify-between mb-4"}>
            <h2 className={"text-3xl font-semibold"}>
              Cadastrar novo pagamento
            </h2>
            <Button
              text="Cancelar"
              className={"bg-red-700 p-2 rounded-md font-semibold text-white"}
              onClick={() => {
                if (isFetching == false) {
                  closeModal();
                } else {
                  window.alert(
                    "Aguarde alguns segundos a requisição ao servidor obter resposta, ou atualize a página.",
                  );
                }
              }}
            />
          </header>
          <div>
            <PaymentDataForm
              doOnSubmit={handleDataSubmition}
              quotationData={quotation}
            >
              <Button text="Salvar" type={"submit"} loading={isFetching} />
            </PaymentDataForm>
          </div>
        </div>
      </section>
    </Portal>
  );
}
