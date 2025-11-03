import { Table, Td, THead, Tr } from "@elements/Table";
import { fetchWithToken } from "@utils/fetchWithToken";
import { useEffect, useState } from "preact/hooks";
import { CreateCustomerModal } from "./CreateCustomerModal";

export type CustomersType = {
  id: string;
  name: string;
  cnpj: string;
  email: string | null;
  address: string | null;
  phone_number: string | null;
  mobile_number: string | null;
};

export function Customers() {
  const [customers, setCustomers] = useState<CustomersType[]>([]);
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
        <header className={"flex justify-between items-center px-2 mb-2"}>
          <h3 className={"text-xl font-semibold"}>Lista de clientes</h3>
          <button
            className={"bg-blue-700 p-2 rounded-md text-white font-semibold"}
            onClick={handleNewCustomer}
          >
            Novo cliente
          </button>
        </header>
        <Table>
          <THead collumns={[["Nome", "CNPJ"], ["Celular"]]} />
          <tbody>
            {customers.map((customer) => (
              <Tr key={customer.id}>
                <Td link={`${CUSTOMER_URL}${customer.id}/`}>
                  <p>{customer.name}</p>
                  <p className={"text-green-700"}>{customer.cnpj ?? ""}</p>
                </Td>
                <Td link={`${CUSTOMER_URL}${customer.id}/`}>
                  <p>{customer.phone_number}</p>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </div>
    </main>
  );
}
