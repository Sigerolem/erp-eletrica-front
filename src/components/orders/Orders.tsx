import type { QuotationsType } from "@comp/quotations/Quotations";
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
        window.alert("Erro ao buscar ordens de serviço.");
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
          <THead
            collumns={[["Código"], ["Referência", "Cliente"], ["Situação"]]}
          />
          <tbody>
            {quotations.map((quotation) => (
              <Tr key={quotation.id}>
                <Td link={`${QUOTATION_URL}${quotation.id}/`}>
                  <p>{quotation.slug}</p>
                </Td>
                <Td link={`${QUOTATION_URL}${quotation.id}/`}>
                  <p>{quotation.reference}</p>
                  <p className={"font-semibold text-sm"}>
                    {quotation.customer.name}
                  </p>
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
