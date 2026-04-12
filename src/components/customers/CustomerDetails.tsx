import { fetchWithToken } from "@utils/fetchWithToken";
import { useEffect, useState } from "preact/hooks";
import { CustomerDataForm } from "./CustomerDataForm";
import type { CustomersType } from "./Customers";
import { Button } from "@elements/Button";

export function CustomerDetails() {
  const [customer, setCustomer] = useState<CustomersType | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const path = new URL(window.location.href);
    const id = path.hash.replace("#", "").replaceAll("/", "");
    fetchWithToken<{ customer: CustomersType }>({
      path: `/customers/${id}`,
    }).then((result) => {
      if (result.code == 200) {
        setCustomer(result.data.customer);
      } else if (result.code == 403) {
        window.location.href = "/";
      } else if (result.code == 404) {
        window.alert("Cliente não encontrado");
        window.location.href = "/clientes";
      } else if (result.code == 400 || result.code == 500) {
        window.alert(
          `Erro ao buscar cliente no servidor. \n ${result.data.error} \n ${result.data.message}`,
        );
        console.error(result);
        window.location.href = "/clientes";
      } else {
        window.alert(`Erro ao buscar cliente no servidor. \n ${result.data}`);
        console.error(result);
        window.location.href = "/clientes";
      }
    });
  }, []);

  async function handleDataSubmition(customerData: Partial<CustomersType>) {
    setIsFetching(true);
    const { code, data } = await fetchWithToken<{ customer: CustomersType }>({
      path: `/customers/${customer?.id}`,
      method: "PUT",
      body: JSON.stringify(customerData),
    });

    if (code == 200 || code == 201) {
      window.alert("Altterações salvas");
      return null;
    }

    setIsFetching(false);

    if (code == 409) {
      const errors = {} as { [key: string]: string };
      if (data.message.includes("entity.name")) {
        errors.name = "Esse nome já foi utilizado";
      } else if (data.message.includes("entity.cnpj")) {
        errors.cnpj = "Esse CNPJ já foi cadastrado";
      }
      return errors;
    } else if (code == 400 || code == 500) {
      window.alert(
        `Erro ao salvar cliente. \n ${data.error} \n ${data.message}`,
      );
      return { erro: "Algum problema ocorreu" };
    } else {
      window.alert(`Erro ao salvar cliente. \n ${data}`);
      console.error(code, data);
      return { erro: "Algum problema ocorreu" };
    }
  }

  return (
    <main>
      {customer ? (
        <CustomerDataForm
          doOnSubmit={handleDataSubmition}
          customerData={customer ?? undefined}
        >
          <Button text="Salvar" type={"submit"} loading={isFetching} />
        </CustomerDataForm>
      ) : (
        <span className={"animate-bounce text-xl block mt-8 font-semibold"}>
          Carregando...
        </span>
      )}
    </main>
  );
}
