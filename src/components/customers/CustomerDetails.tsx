import { fetchWithToken } from "@utils/fetchWithToken";
import { useEffect, useState } from "preact/hooks";
import { CustomerDataForm } from "./CustomerDataForm";
import type { CustomersType } from "./Customers";
import { Button } from "@elements/Button";

export function CustomerDetails() {
  const [customer, setCustomer] = useState<CustomersType | null>(null);

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
      }
    });
  }, []);

  async function handleDataSubmition(customerData: Partial<CustomersType>) {
    const { code, data } = await fetchWithToken<{ customer: CustomersType }>({
      path: `/customers/${customer?.id}`,
      method: "PUT",
      body: JSON.stringify(customerData),
    });

    if (code == 409) {
      const errors = {} as { [key: string]: string };
      if (data.message.includes("entity.name")) {
        errors.name = "Esse nome já foi utilizado";
      } else if (data.message.includes("entity.cnpj")) {
        errors.cnpj = "Esse CNPJ já foi cadastrado";
      }
      return errors;
    }

    if (code == 200 || code == 201) {
      window.alert("Altterações salvas");
    }
    return null;
  }

  return (
    <main>
      {customer ? (
        <CustomerDataForm
          doOnSubmit={handleDataSubmition}
          customerData={customer ?? undefined}
        >
          <Button text="Salvar" type={"submit"} />
        </CustomerDataForm>
      ) : (
        <span className={"animate-bounce text-xl block mt-8 font-semibold"}>
          Carregando...
        </span>
      )}
    </main>
  );
}
