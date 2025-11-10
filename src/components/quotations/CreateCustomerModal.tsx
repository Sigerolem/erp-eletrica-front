import { fetchWithToken } from "@utils/fetchWithToken";
import { useEffect, type Dispatch, type StateUpdater } from "preact/hooks";
import { CustomerDataForm } from "./CustomerDataForm";
import type { CustomersType } from "./Quotations";

export function CreateCustomerModal({
  closeModal,
  setCustomers,
}: {
  closeModal: () => void;
  setCustomers: Dispatch<StateUpdater<CustomersType[]>>;
}) {
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

  async function handleDataSubmition(customerData: Partial<CustomersType>) {
    const { code, data } = await fetchWithToken<{ customer: CustomersType }>({
      path: "/customers/create",
      method: "POST",
      body: JSON.stringify(customerData),
    });

    if (code == 409) {
      let errors = {} as { [key: string]: string };
      if (data.message.includes("entity.name")) {
        errors = { ...errors, name: "Esse nome já foi utilizado" };
      } else if (data.message.includes("entity.cnpj")) {
        errors = { ...errors, cnpj: "Esse CNPJ já foi cadastrado" };
      }
      return errors;
    }

    if (code == 400) {
      window.alert("Requisição feita ao servidor é inválida.");
      console.error(code, data);
    }

    if (code == 201) {
      setCustomers((prev) => [data.customer, ...prev]);
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
        className={"bg-blue-50 p-8 opacity-100 rounded-md"}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={"flex justify-between mb-4"}>
          <h2 className={"text-3xl font-semibold"}>Cadastrar novo customer</h2>
          <button
            className={"bg-red-700 p-2 rounded-md font-semibold text-white"}
            onClick={() => {
              closeModal();
            }}
          >
            Cancelar
          </button>
        </header>
        <div>
          <CustomerDataForm doOnSubmit={handleDataSubmition} />
        </div>
      </div>
    </section>
  );
}
