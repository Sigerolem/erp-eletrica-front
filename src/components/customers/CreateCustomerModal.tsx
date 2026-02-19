import { fetchWithToken } from "@utils/fetchWithToken";
import {
  useEffect,
  useState,
  type Dispatch,
  type StateUpdater,
} from "preact/hooks";
import { CustomerDataForm } from "./CustomerDataForm";
import type { CustomersType } from "./Customers";
import { Button } from "@elements/Button";

export function CreateCustomerModal({
  closeModal,
  setCustomers,
}: {
  closeModal: () => void;
  setCustomers: Dispatch<StateUpdater<CustomersType[]>>;
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

  async function handleDataSubmition(customerData: Partial<CustomersType>) {
    setIsFetching(true);
    const { code, data } = await fetchWithToken<{ customer: CustomersType }>({
      path: "/customers/create",
      method: "POST",
      body: JSON.stringify(customerData),
    });

    if (code == 201) {
      setCustomers((prev) => [data.customer, ...prev]);
      closeModal();
      return null;
    }

    setIsFetching(false);

    if (code == 409) {
      let errors = {} as { [key: string]: string };
      if (data.message.includes("customers_name")) {
        errors = { ...errors, name: "Esse nome já foi utilizado" };
        window.alert(`O cliente ${customerData.name} já foi cadastrado.`);
      } else if (data.message.includes("customers_cnpj")) {
        errors = { ...errors, cnpj: "Esse CNPJ já foi cadastrado" };
        window.alert(`O cnpj ${customerData.cnpj} já foi cadastrado.`);
      }
      return errors;
    } else if (code == 400) {
      window.alert("Requisição feita ao servidor é inválida.");
      console.error(code, data);
      return { erro: "Requisição inválida" };
    }

    window.alert(
      "Erro inesperado ao salvar cliente. Consulte o desenvolvedor.",
    );
    console.error(code, data);
    return { error: "Erro inesperado" };
  }

  return (
    <section
      className={`absolute top-0 left-0 w-full h-full p-10 bg-[#000000AA] z-10 flex flex-col justify-center ${isFetching && "hover:cursor-wait!"}`}
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
          <h2 className={"text-3xl font-semibold"}>Cadastrar novo cliente</h2>
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
          <CustomerDataForm doOnSubmit={handleDataSubmition}>
            <Button text="Salvar" type={"submit"} loading={isFetching} />
          </CustomerDataForm>
        </div>
      </div>
    </section>
  );
}
