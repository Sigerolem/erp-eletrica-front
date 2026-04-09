import { Table, Td, THead, Tr } from "@elements/Table";
import { fetchWithToken } from "@utils/fetchWithToken";
import { useEffect, useState } from "preact/hooks";
import { Button } from "src/elements/Button";
import {
  formatQuotationStatusEnum,
  formatUserRoleEnum,
} from "src/utils/formating";
import { hasPermission } from "@utils/permissionLogic";
import type {
  QuotationsStatusType,
  QuotationsType,
} from "../quotations/Quotations";
import type { CustomersType } from "../customers/Customers";
import { PrintPdfModal } from "../quotations/PrintPdfModal";
import { Tabs } from "src/elements/Tabs";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "cancelled"
  | "failed"
  | "refunded";

export type PaymentMethod =
  | "pix"
  | "card"
  | "transfer"
  | "cash"
  | "billet"
  | "other";

export type PaymentsType = {
  id: string;
  status: PaymentStatus;
  method: PaymentMethod;
  total_amount: number;
  paid_amount: number;
  material_amount: number;
  service_amount: number;
  expense_amount: number;
  paid_at: Date | null;
  due_date: Date;
  notes: string | null;
  receipt_url: string | null;
  quotation_id: string;
  quotation?: QuotationsType;
  customer_id: string;
  customer?: CustomersType;
};

export function Payments() {
  const [payments, setPayments] = useState<PaymentsType[]>([]);
  const [quotations, setQuotations] = useState<QuotationsType[]>([]);
  const [customers, setCustomers] = useState<CustomersType[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState({
    name: "",
    id: "",
  });
  const [status, setStatus] = useState<QuotationsStatusType | "">("");
  const [lastQuery, setLastQuery] = useState<string | null>(null);
  const [quotationToPrint, setQuotationToPrint] = useState("");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const QUOTATION_URL =
    window.location.hostname == "localhost" ? "/ordens/id#" : "/ordens/id/#";

  useEffect(() => {
    const role = localStorage.getItem("apiRole");
    const permission = localStorage.getItem("apiPermissions");
    if (
      role != "owner" &&
      !hasPermission(permission ?? "----------------", "quotation", "R")
    ) {
      window.location.href = "/";
      return;
    }

    fetchWithToken<{ customers: CustomersType[] }>({
      path: "/customers",
    }).then(({ code, data }) => {
      if (code == 200) {
        setCustomers(data.customers);
        const pageQuery = window.location.search;
        const searchParams = new URLSearchParams(pageQuery);
        if (searchParams.has("customer")) {
          const custId = searchParams.get("customer");
          const cust = data.customers.find((c) => c.id == custId);
          if (cust) {
            setSelectedCustomer({ name: cust.name, id: cust.id });
          }
        }
        if (searchParams.has("status")) {
          setStatus(searchParams.get("status") as QuotationsStatusType);
        }
      } else if (code == 403) {
        window.alert(
          "Não foi permitido acesso à lista de clientes para filtro.",
        );
      } else {
        window.alert("Erro ao buscar a lista de clientes");
        console.error(data);
      }
    });
  }, []);

  useEffect(() => {
    let path = "/quotations/orders-done";
    const params = new URLSearchParams();

    if (selectedCustomer.id) {
      params.append("customer_id", selectedCustomer.id);
    }

    if (status) params.append("status", status);

    const queryString = params.toString();
    if (queryString) {
      path += `?${queryString}`;
    }

    if (lastQuery == path) {
      return;
    }
    setLastQuery(path);
    setIsFetching(true);
    fetchWithToken<{ quotations: QuotationsType[] }>({
      path,
    }).then((result) => {
      setIsFetching(false);
      if (result.code == 200 || result.code == 201) {
        setQuotations(result.data.quotations);
      } else if (result.code == 403) {
        window.location.href = "/";
        return;
      } else {
        window.alert("Erro ao buscar orçamentos.");
        console.error(result.data, result.code);
      }
    });
  }, [selectedCustomer, status]);

  const xSize = window.innerWidth;
  return (
    <main>
      {/* <header className={"flex justify-between items-end mb-2"}>
        <h3 className={"text-lg font-semibold"}>Financeiro</h3>
      </header> */}
      <Tabs tabs={["Ordens", "Pagamentos"]}>
        <div>
          <div className={"mt-4 mb-4 flex gap-2 flex-col justify-stretch"}>
            <div className="flex gap-2 items-end">
              <div className="flex flex-col flex-1">
                <select
                  id="customer"
                  className="bg-white border border-slate-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-wait hover:cursor-pointer hover:bg-slate-50"
                  value={selectedCustomer.id}
                  disabled={isFetching}
                  onChange={(e) => {
                    const val = e.currentTarget.value;
                    const cust = customers.find((c) => c.id === val);
                    if (cust) {
                      setSelectedCustomer({ name: cust.name, id: cust.id });
                    } else {
                      setSelectedCustomer({ name: "", id: "" });
                    }
                    // const url = new URL(window.location.href);
                    // if (val === "") {
                    //   url.searchParams.delete("customer");
                    // } else {
                    //   url.searchParams.set("customer", val);
                    // }
                    // window.history.pushState({}, "", url);
                  }}
                >
                  <option value="">Todos os clientes</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex flex-col flex-1">
                <select
                  id="status"
                  className="bg-white border border-slate-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-wait hover:cursor-pointer hover:bg-slate-50"
                  value={status}
                  disabled={isFetching}
                  onChange={(e) => {
                    const val = e.currentTarget.value as
                      | QuotationsStatusType
                      | "";
                    setStatus(val);
                    // const url = new URL(window.location.href);
                    // if (val === "") {
                    //   url.searchParams.delete("status");
                    // } else {
                    //   url.searchParams.set("status", val);
                    // }
                    // window.history.pushState({}, "", url);
                  }}
                >
                  <option value="">Todas ordens atendidas</option>
                  <option value="awaiting_closure">
                    Aguardando Confirmação do Gestor
                  </option>
                  <option value="awaiting_customer_confirmation">
                    Aguardando Confirmação do Cliente
                  </option>
                  <option value="awaiting_payment">Aguardando Pagamento</option>
                  <option value="finished">Finalizado</option>
                </select>
              </div>
            </div>
          </div>
          <Table>
            {xSize < 720 ? (
              <THead collumns={[["Referência", "Cliente"], ["Situação"]]} />
            ) : (
              <THead
                collumns={[
                  ["Código"],
                  ["Referência", "Cliente"],
                  ["Situação"],
                  [""],
                ]}
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
                    <Td>
                      <p>{formatQuotationStatusEnum(quotation.status)}</p>
                      <div className={"flex gap-1"}>
                        <Button
                          text="PDF"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setQuotationToPrint(quotation.id);
                            setIsPrintModalOpen(true);
                          }}
                          className={"bg-blue-700 text-white text-sm p-1!"}
                        />
                      </div>
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
                    <Td>
                      <Button
                        text="PDF"
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuotationToPrint(quotation.id);
                          setIsPrintModalOpen(true);
                        }}
                      />
                    </Td>
                  </Tr>
                ),
              )}
            </tbody>
          </Table>
          {isPrintModalOpen && (
            <PrintPdfModal
              closeModal={() => setIsPrintModalOpen(false)}
              quotationId={quotationToPrint}
              quotationStatus={"q_awaiting"}
            />
          )}
          {isFetching && (
            <span className={"animate-bounce text-xl block mt-8 font-semibold"}>
              Carregando...
            </span>
          )}
          {!isFetching && quotations.length == 0 && (
            <span className={"text-xl block mt-8 font-semibold"}>
              Nada encontrado para exibir aqui. Tente recarregar a página ou
              fazer um novo cadastro.
            </span>
          )}
        </div>
        <div>
          <span>financeiro</span>
        </div>
      </Tabs>
    </main>
  );
}
