import { DataForm } from "@elements/DataForm";
import { Input } from "@elements/Input";
import type { JSX, TargetedSubmitEvent } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import type { PaymentMethod, PaymentStatus, PaymentsType } from "./Payments";
import type { QuotationsType } from "../quotations/Quotations";
import { Selector } from "src/elements/Selector";

export function PaymentDataForm({
  paymentData,
  doOnSubmit,
  quotationData,
  children,
}: {
  doOnSubmit: (
    paymentData: Partial<PaymentsType>,
  ) => Promise<{ [key: string]: string } | null>;
  paymentData?: PaymentsType;
  quotationData?: Partial<QuotationsType>;
  children: JSX.Element;
}) {
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [id, setId] = useState<string>();
  const [status, setStatus] = useState<PaymentStatus>("pending");
  const [method, setMethod] = useState<PaymentMethod>("pix");
  const [totalAmount, setTotalAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [materialAmount, setMaterialAmount] = useState(0);
  const [serviceAmount, setServiceAmount] = useState(0);
  const [expenseAmount, setExpenseAmount] = useState(0);
  const [paidAt, setPaidAt] = useState<Date | null>(null);
  const [dueDate, setDueDate] = useState<Date>();
  const [notes, setNotes] = useState<string | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [quotationId, setQuotationId] = useState("");
  const [customerId, setCustomerId] = useState("");

  const [quotationSlug, setQuotationSlug] = useState("");
  const [customerName, setCustomerName] = useState("");
  // const [quotation, setQuotation] = useState<Partial<QuotationsType>>({});

  const dueDateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (paymentData) {
      setId(paymentData.id);
      setStatus(paymentData.status);
      setMethod(paymentData.method);
      setTotalAmount(paymentData.total_amount);
      setPaidAmount(paymentData.paid_amount);
      setMaterialAmount(paymentData.material_amount);
      setServiceAmount(paymentData.service_amount);
      setExpenseAmount(paymentData.expense_amount);
      setPaidAt(paymentData.paid_at);
      setDueDate(paymentData.due_date);
      setNotes(paymentData.notes);
      setReceiptUrl(paymentData.receipt_url);
      setQuotationId(paymentData.quotation_id);
      setCustomerId(paymentData.customer_id);
      if (paymentData?.quotation) {
        setQuotationSlug(paymentData.quotation.slug);
        setCustomerName(paymentData.quotation.customer.name);
        // setQuotation(paymentData.quotation);
      }
    } else {
      if (quotationData) {
        const { direct_value, service_value, material_value } = quotationData;
        setCustomerId(quotationData.customer_id!);
        setQuotationId(quotationData.id!);
        setQuotationSlug(quotationData.slug!);
        setCustomerName(quotationData.customer?.name ?? "");
        // setQuotation(quotationData);
        setTotalAmount(
          (direct_value ?? 0) + (service_value ?? 0) + (material_value ?? 0),
        );
        setMaterialAmount(material_value ?? 0);
        setServiceAmount(service_value ?? 0);
        setExpenseAmount(direct_value ?? 0);
      } else {
        window.alert("Dados da OS não foram carregados.");
      }
    }
  }, [paymentData, quotationData]);

  async function onFormSubmit(e: TargetedSubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (Object.keys(validationErrors).length > 0) {
      window.alert(
        "Só é possivel salvar com dados válidos. Talvez seja necessário atualizar a página.",
      );
      return;
    }

    if (dueDate == null) {
      setValidationErrors((prev) => ({
        ...prev,
        dueDate: "Data de vencimento é obrigatória.",
      }));
      return;
    }

    const newPaymentData = {
      id,
      status,
      method,
      total_amount: totalAmount,
      paid_amount: paidAmount,
      material_amount: materialAmount,
      service_amount: serviceAmount,
      expense_amount: expenseAmount,
      paid_at: paidAt,
      due_date: dueDate,
      notes,
      receipt_url: receiptUrl,
      quotation_id: quotationId,
      customer_id: customerId,
    };

    const errors = await doOnSubmit(newPaymentData);

    if (errors) {
      setValidationErrors((prev) => ({ ...prev, ...errors }));
    }
  }

  return (
    <DataForm onSubmit={onFormSubmit}>
      <div className={"flex gap-4"}>
        <Input
          label="O.S."
          name="quotationSlug"
          errors={validationErrors}
          value={quotationSlug}
          className={"bg-blue-50!"}
          disabled
        />
        <Input
          label="Cliente"
          name="customerName"
          errors={validationErrors}
          value={customerName}
          className={"bg-blue-50!"}
          disabled
        />
      </div>
      <div className={"flex gap-4 relative"}>
        <input
          type="date"
          className={"opacity-0 max-w-0 max-h-0 absolute"}
          lang="pt-br"
          ref={dueDateRef}
          onChange={(e) => {
            const selectedDate = new Date(e.currentTarget.value);
            selectedDate.setUTCHours(12, 0, 0, 0);
            setDueDate(selectedDate);
          }}
          aria-disabled
        />
        <Input
          label="Data de vencimento"
          name="dueDate"
          type="text"
          errors={validationErrors}
          value={dueDate?.toLocaleDateString("pt-BR") ?? ""}
          onClick={() => {
            dueDateRef.current?.showPicker();
            setValidationErrors((prev) => {
              delete prev.dueDate;
              return { ...prev };
            });
          }}
          readOnly
        />
        <Input
          label="NF"
          name="notes"
          type="text"
          errors={validationErrors}
          placeholder="0001"
          value={notes ?? ""}
          onChange={(e) => {
            setNotes(e.currentTarget.value);
          }}
        />

        <Selector
          label="Status"
          value={status}
          options={[
            { value: "pending", label: "Pendente" },
            { value: "paid", label: "Pago" },
            { value: "cancelled", label: "Cancelado" },
            { value: "failed", label: "Falhado" },
            { value: "refunded", label: "Reembolsado" },
          ]}
          doOnSelect={(value) => setStatus(value as PaymentStatus)}
        />
        <Selector
          label="Método"
          value={method}
          options={[
            { value: "pix", label: "Pix" },
            { value: "card", label: "Cartão" },
            { value: "transfer", label: "Transferência" },
            { value: "cash", label: "Dinheiro" },
            { value: "billet", label: "Boleto" },
            { value: "other", label: "Outro" },
          ]}
          doOnSelect={(value) => setMethod(value as PaymentMethod)}
        />
        {/* <Checkbox
          label="Prefere E.S."
          name="prefers"
          checked={prefers}
          setChecked={setPrefers}
        /> */}
      </div>
      {children}
    </DataForm>
  );
}
