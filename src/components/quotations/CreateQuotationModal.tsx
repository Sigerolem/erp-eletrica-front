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

export function CreateQuotationModal({
  closeModal,
  setQuotations,
}: {
  closeModal: () => void;
  setQuotations: Dispatch<StateUpdater<QuotationsType[]>>;
}) {
  const [customers, setCustomers] = useState<CustomersType[]>([]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key == "Escape") {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  useEffect(() => {
    fetchWithToken<{ customers: CustomersType[] }>({ path: "/customers" }).then(
      (result) => {
        if (result.code == 200) {
          setCustomers(result.data.customers);
        } else {
          window.alert("Erro ao buscar lista de clientes para a seleção");
        }
      }
    );
  }, []);

  async function handleDataSubmition(quotationData: Partial<QuotationsType>) {
    const { code, data } = await fetchWithToken<{ quotation: QuotationsType }>({
      path: "/quotations/create",
      method: "POST",
      body: JSON.stringify(quotationData),
    });
    console.log(code, data);

    // if (code == 409) {
    //   let errors = {} as { [key: string]: string };
    //   if (data.message.includes("entity.name")) {
    //     errors = { ...errors, name: "Esse nome já foi utilizado" };
    //   } else if (data.message.includes("entity.cnpj")) {
    //     errors = { ...errors, cnpj: "Esse CNPJ já foi cadastrado" };
    //   }
    //   return errors;
    // }

    if (code == 400) {
      window.alert("Requisição feita ao servidor é inválida.");
      console.error(code, data);
    }

    if (code == 201) {
      setQuotations((prev) => [data.quotation, ...prev]);
      closeModal();
    } else {
      console.error(code, data);
    }
    return null;
  }

  return (
    <section
      className={
        "absolute top-0 left-0 w-full h-full p-10 bg-[#000000AA] z-10 flex flex-col justify-center"
      }
      onClick={() => {
        closeModal();
      }}
    >
      <div
        className={"bg-blue-50 p-8 opacity-100 rounded-md overflow-scroll"}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={"flex justify-between mb-4"}>
          <h2 className={"text-3xl font-semibold"}>Cadastrar novo orçamento</h2>
          <Button
            text="Cancelar"
            className={"bg-red-700 text-white"}
            onClick={() => {
              closeModal();
            }}
          />
        </header>
        <div>
          <QuotationDataForm
            doOnSubmit={handleDataSubmition}
            customers={customers}
          >
            <Button
              className={"bg-blue-700 text-white"}
              type={"submit"}
              text="Salvar"
            />
          </QuotationDataForm>
        </div>
      </div>
    </section>
  );
}
