import type { PurchaseStatusType } from "@comp/purchases/Purchases";
import type { QuotationsStatusType } from "@comp/quotations/Quotations";

export function changeDotsCommas(text: string) {
  return text.replaceAll(",", "*").replaceAll(".", ",").replaceAll("*", ".");
}

export function BrlStringFromCents(cents?: number) {
  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return cents ? formatter.format(cents / 100) : formatter.format(0);
}

export function formatFloatWithDecimalDigits(
  value: number,
  numOfDigits: 0 | 1 | 2 | 3
) {
  const formatter = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: numOfDigits,
    maximumFractionDigits: numOfDigits,
    // roundingMode: "trunc",
  });
  const stringValue = formatter.format(value);
  const floatValue = parseFloat(
    stringValue.replaceAll(".", "").replaceAll(",", ".")
  );
  return floatValue;
}

export function formatPurchaseStatusEnum(status: PurchaseStatusType) {
  const PurchaseStatusMap = {
    draft: "Rascunho",
    requested: "Pedido",
    shipped: "Aguardando entrega",
    received: "Recebida",
    finished: "Concluída",
    cancelled: "Cancelada",
  };

  return PurchaseStatusMap[status] || status;
}

export function formatQuotationStatusEnum(status: QuotationsStatusType) {
  const QuotationStatusMap = {
    draft: "Rascunho de Orçamento",
    q_awaiting: "Aguardando Aceite",
    q_approved: "Orçamento Aceito",
    os_awaiting: "Aguardando Atendimento",
    os_ongoing: "Em Atendimento",
    os_done_mo: "Concluídos os Serviços",
    os_done_mat: "Concluídos os Materiais",
    awaiting_closure: "Aguardando Confirmação",
    awaiting_delivery: "Aguardando Envio ao Cliente",
    delivered: "Entregue ao Cliente",
    awaiting_payment: "Aguardando pagamento",
    finished: "Ordem de Serviço Encerrada",
    denied: "Orçamento Recusado",
    cancelled: "Serviço Cancelado",
  };

  return QuotationStatusMap[status] || status;
}
