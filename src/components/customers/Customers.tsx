import { Table, Td, THead, Tr } from "@elements/Table";
import { fetchWithToken } from "@utils/fetchWithToken";
import { useEffect, useState } from "preact/hooks";
import { CreateCustomerModal } from "./CreateCustomerModal";
import { Button } from "@elements/Button";

export type CustomersType = {
  id: string;
  name: string;
  cnpj: string;
  email: string | null;
  address: string | null;
  phone_number: string | null;
  mobile_number: string | null;
  prefers_es: boolean;
};

export function Customers() {
  const [customers, setCustomers] = useState<CustomersType[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const CUSTOMER_URL =
    window.location.hostname == "localhost"
      ? "/clientes/id#"
      : "/clientes/id/#";

  function handleNewCustomer() {
    setIsModalOpen(true);
  }

  useEffect(() => {
    fetchWithToken<{ customers: CustomersType[] }>({ path: "/customers" }).then(
      (result) => {
        setIsFetching(false);
        if (result.code == 200 || result.code == 201) {
          setCustomers(result.data.customers);
        } else {
          window.alert("Erro ao buscar clientes.");
          console.error(result.data, result.code);
        }
      }
    );
  }, []);

  return (
    <main>
      {isModalOpen ? (
        <CreateCustomerModal
          closeModal={() => {
            setIsModalOpen(false);
          }}
          setCustomers={setCustomers}
        />
      ) : null}
      <div>
        <header className={"flex justify-between items-end mb-2"}>
          <h3 className={"text-lg font-semibold"}>Lista de clientes</h3>
          <Button
            text="Novo cliente"
            onClick={handleNewCustomer}
            className={"bg-blue-700 text-white not-md:text-sm"}
          />
        </header>
        <Table>
          <THead
            collumns={[
              ["Nome", "CNPJ"],
              ["Celular", "E-mail"],
            ]}
          />
          <tbody>
            {customers.map((customer) => (
              <Tr key={customer.id}>
                <Td link={`${CUSTOMER_URL}${customer.id}/`}>
                  <p>{customer.name}</p>
                  <p className={"text-sm font-semibold"}>
                    {customer.cnpj ?? ""}
                  </p>
                </Td>
                <Td link={`${CUSTOMER_URL}${customer.id}/`}>
                  <p>{customer.phone_number}</p>
                  <p>{customer.email}</p>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
        {isFetching && (
          <span className={"animate-bounce text-xl block mt-8 font-semibold"}>
            Carregando...
          </span>
        )}
        {!isFetching && customers.length == 0 && (
          <span className={"text-xl block mt-8 font-semibold"}>
            Nada encontrado para exibir aqui. Tente recarregar a página ou fazer
            um novo cadastro.
          </span>
        )}
      </div>
    </main>
  );
}
