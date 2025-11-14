import { fetchWithToken } from "@utils/fetchWithToken";
import { useEffect, useState } from "preact/hooks";
import type { QuotationsType } from "./Quotations";
import { QuotationDataForm } from "./QuotationDataForm";
import { Button } from "@elements/Button";

export function QuotationDetails() {
  const [quotation, setQuotation] = useState<QuotationsType | null>(null);
  const [id, setId] = useState("");

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

  async function updateQuotationData(quotationData: Partial<QuotationsType>) {
    const { code, data } = await fetchWithToken<{ quotation: QuotationsType }>({
      path: `/quotations/${id}`,
      method: "PUT",
      body: JSON.stringify(quotationData),
    });

    console.log(code, data, quotationData);
    if (code == 200) {
      window.alert("Alterações salvas com sucesso");
    }
    return null;
  }

  return (
    <main>
      {quotation ? (
        <QuotationDataForm
          doOnSubmit={updateQuotationData}
          quotationData={quotation}
        >
          <Button type={"submit"} text="Salvar" />
        </QuotationDataForm>
      ) : (
        <span className={"animate-bounce text-xl block mt-8 font-semibold"}>
          Carregando...
        </span>
      )}
    </main>
  );
}
