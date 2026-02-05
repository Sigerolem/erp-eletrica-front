import type { QuotationsType } from "@comp/quotations/Quotations";
import { Table, Td, THead, Tr } from "@elements/Table";
import { fetchWithToken } from "@utils/fetchWithToken";
import { formatQuotationStatusEnum } from "@utils/formating";
import { useEffect, useState } from "preact/hooks";
import { hasPermission } from "src/utils/permissionLogic";

export function Orders() {
  const [quotations, setQuotations] = useState<QuotationsType[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  const QUOTATION_URL =
    window.location.hostname == "localhost" ? "/ordens/id#" : "/ordens/id/#";

  useEffect(() => {
    const role = localStorage.getItem("apiRole");
    const permission = localStorage.getItem("apiPermissions");
    if (
      role != "owner" &&
      !hasPermission(permission ?? "----------------", "order", "R")
    ) {
      window.location.href = "/";
      return;
    }

    fetchWithToken<{ quotations: QuotationsType[] }>({
      path: "/quotations/orders",
    }).then((result) => {
      setIsFetching(false);
      if (result.code == 200 || result.code == 201) {
        setQuotations(result.data.quotations);
      } else if (result.code == 403) {
        window.location.href = "/";
        return;
      } else {
        window.alert("Erro ao buscar ordens de serviço.");
        console.error(result.data, result.code);
      }
    });
  }, []);

  const xSize = window.innerWidth;
  return (
    <main>
      <div>
        <header className={"flex justify-between items-end mb-2"}>
          <h3 className={"text-lg font-semibold"}>Lista de ordens abertas</h3>
        </header>
        <Table>
          {xSize < 720 ? (
            <THead collumns={[["Referência", "Cliente"], ["Situação"]]} />
          ) : (
            <THead
              collumns={[["Código"], ["Referência", "Cliente"], ["Situação"]]}
            />
          )}
          <tbody>
            {quotations.map((quotation) =>
              xSize < 720 ? (
                <Tr key={quotation.id}>
                  <Td link={`${QUOTATION_URL}${quotation.id}/`}>
                    <p>{quotation.slug}</p>
                    <p>{quotation.reference}</p>
                    <p className={"font-semibold text-sm"}>
                      {quotation.customer.name}
                    </p>
                  </Td>
                  <Td link={`${QUOTATION_URL}${quotation.id}/`}>
                    <p>{formatQuotationStatusEnum(quotation.status)}</p>
                  </Td>
                </Tr>
              ) : (
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
              ),
            )}
          </tbody>
        </Table>
        {isFetching && (
          <span className={"animate-bounce text-xl block mt-8 font-semibold"}>
            Carregando...
          </span>
        )}
        {!isFetching && quotations.length == 0 && (
          <span className={"text-xl block mt-8 font-semibold"}>
            Nada encontrado para exibir aqui. Tente recarregar a página ou fazer
            um novo cadastro.
          </span>
        )}
      </div>
    </main>
  );
}
