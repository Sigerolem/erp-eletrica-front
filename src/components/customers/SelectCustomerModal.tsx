import { Button } from "src/elements/Button";
import type { CustomersType } from "./Customers";
import { useEffect, useState } from "preact/hooks";
import { Input } from "src/elements/Input";
import { validateStringFieldOnBlur } from "src/utils/inputValidation";
import { fetchWithToken } from "src/utils/fetchWithToken";

export function SelectCustomerModal({
  customers,
  selectCustomer,
  closeModal,
  cleanError,
}: {
  customers: CustomersType[];
  selectCustomer: (customer: CustomersType) => void;
  closeModal: () => void;
  cleanError: () => void;
}) {
  const [search, setSearch] = useState("");
  const [validationErrors, setValidationErros] = useState<{
    [key: string]: string;
  }>({});
  const [customersFound, setCustomersFound] = useState<CustomersType[]>([]);
  const [nothingWasFound, setNothingWasFound] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    setCustomersFound(customers);
  }, [customers]);

  function handleCustomerSelect(customer: CustomersType) {
    selectCustomer(customer);
    cleanError();
    closeModal();
  }

  async function handleSearchCustomer(value?: string) {
    const searchString = encodeURIComponent(value ? value : search);
    const { code, data } = await fetchWithToken<{
      customers: CustomersType[];
    }>({
      path:
        search == ""
          ? "/customers"
          : `/customers?search=${searchString}&page=1`,
    });
    if (code == 200) {
      setCustomersFound(data.customers);
      setNothingWasFound(data.customers.length == 0);
    }
  }

  const xSize = window.innerWidth;
  return (
    <section className={"absolute top-0 left-0 w-full h-full"}>
      <div
        className={`fixed top-0 left-0 w-full h-full ${
          xSize < 700 ? "p-8" : "p-32"
        } bg-[#000000AA] z-20`}
        onClick={closeModal}
      >
        <div
          className={
            "bg-blue-50 rounded-md p-4 border flex flex-col gap-2 items-baseline"
          }
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <strong className={"pb-2 text-lg block"}>Selecione um cliente</strong>
          <div className={"flex gap-2 w-full items-end"}>
            <Input
              name="search"
              placeholder={"Nome do cliente"}
              onBlur={(e) => {
                validateStringFieldOnBlur(e, setSearch, setValidationErros, {
                  min: 2,
                });
              }}
              errors={validationErrors}
              className={"min-h-10 text-lg"}
              onKeyPress={(e) => {
                if (e.key == "Enter") {
                  e.preventDefault();
                  const button = document.querySelector<HTMLButtonElement>(
                    "[name='searchButton']",
                  );
                  if (button) {
                    e.currentTarget.blur();
                    setTimeout(() => {
                      button.click();
                    }, 100);
                  }
                }
              }}
            />
            <Button
              name="searchButton"
              onClick={() => {
                handleSearchCustomer();
              }}
              text="Buscar"
            />
          </div>
          <div className={"flex flex-col gap-2 w-full md:grid md:grid-cols-2"}>
            {customersFound.map((customer) => (
              <Button
                key={customer.id}
                text={customer.name}
                onClick={() => {
                  handleCustomerSelect(customer);
                }}
                className={
                  "bg-blue-50 border border-gray-400 flex-1 flex justify-baseline shadow-sm!"
                }
              />
            ))}
          </div>
          {nothingWasFound && (
            <span>Nenhum cliente encontrado com essa busca!</span>
          )}
        </div>
      </div>
    </section>
  );
}
