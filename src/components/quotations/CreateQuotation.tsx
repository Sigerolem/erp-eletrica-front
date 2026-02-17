import { fetchWithToken } from "@utils/fetchWithToken";
import {
  useEffect,
  useState,
  type Dispatch,
  type StateUpdater,
} from "preact/hooks";
import { QuotationDataForm } from "./QuotationDataForm";
import type { QuotationsType } from "./Quotations";
import type { CustomersType } from "@comp/customers/Customers";
import { Button } from "@elements/Button";

export function CreateQuotation() {
  const [customers, setCustomers] = useState<CustomersType[]>([]);
  const [somethingChanged, setSomethingChanged] = useState(false);

  useEffect(() => {
    fetchWithToken<{ customers: CustomersType[] }>({ path: "/customers" }).then(
      (result) => {
        if (result.code == 200) {
          setCustomers(result.data.customers);
        } else {
          window.alert("Erro ao buscar lista de clientes para a seleção");
        }
      },
    );
  }, []);

  async function handleDataSubmition({
    quotationData,
  }: {
    quotationData: Partial<QuotationsType>;
  }) {
    const { code, data } = await fetchWithToken<{ quotation: QuotationsType }>({
      path: "/quotations/create",
      method: "POST",
      body: JSON.stringify(quotationData),
    });

    if (code == 400 || code == 500) {
      window.alert(
        `Erro ao salvar orçamento. \n ${data.error} \n ${data.message}`,
      );
      console.error(data);
    }

    if (code == 201) {
      window.alert("Orçamento criado com sucesso");
      window.location.href = `/orcamentos`;
    } else {
      console.error(code, data);
    }
    return null;
  }

  return (
    <main className={""}>
      {/* <header className={"flex mb-4"}>
        <h2 className={"text-3xl font-semibold"}>Cadastrar novo orçamento</h2>
      </header> */}
      <div>
        <QuotationDataForm
          doOnSubmit={handleDataSubmition}
          customers={customers}
          setSomethingChanged={setSomethingChanged}
        >
          <Button
            className={"bg-blue-700 text-white"}
            type={"submit"}
            text="Salvar"
          />
        </QuotationDataForm>
      </div>
    </main>
  );
}
