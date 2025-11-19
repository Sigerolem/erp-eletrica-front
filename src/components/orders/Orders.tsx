import type { CustomersType } from "@comp/customers/Customers";
import type { MaterialsType } from "@comp/materials/Materials";
import type { QuotationsType } from "@comp/quotations/Quotations";
import { Button } from "@elements/Button";
import { Table, Td, THead, Tr } from "@elements/Table";
import { fetchWithToken } from "@utils/fetchWithToken";
import { formatQuotationStatusEnum } from "@utils/formating";
import { useEffect, useState } from "preact/hooks";

export function Orders() {
  const [quotations, setQuotations] = useState<QuotationsType[]>([]);

  const QUOTATION_URL =
    window.location.hostname == "localhost" ? "/ordens/id#" : "/ordens/id/#";

  useEffect(() => {
    fetchWithToken<{ quotations: QuotationsType[] }>({
      path: "/quotations/orders",
    }).then((result) => {
      if (result.code == 200 || result.code == 201) {
        setQuotations(result.data.quotations);
      } else {
        window.alert("Erro ao buscar orçamentos.");
        console.error(result.data, result.code);
      }
    });
  }, []);

  return (
    <main>
      <div>
        <header className={"flex justify-between items-center px-2 mb-2"}>
          <h3 className={"text-xl font-semibold"}>Lista de ordens abertas</h3>
        </header>
        <Table>
          <THead collumns={[["Referência", "Cliente"], ["Situação"]]} />
          <tbody>
            {quotations.map((quotation) => (
              <Tr key={quotation.id}>
                <Td link={`${QUOTATION_URL}${quotation.id}/`}>
                  <p>{quotation.reference}</p>
                  <p className={"text-green-700"}>{quotation.customer.name}</p>
                </Td>
                <Td link={`${QUOTATION_URL}${quotation.id}/`}>
                  <p>{formatQuotationStatusEnum(quotation.status)}</p>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </div>
    </main>
  );
}
