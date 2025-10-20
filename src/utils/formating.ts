export function changeDotsCommas(text: string) {
  return text.replaceAll(",", "*").replaceAll(".", ",").replaceAll("*", ".");
}

export function BrlStringFromCents(cents: number) {
  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return formatter.format(cents / 100);
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

export function formatPurchaseStatusEnum(status: string) {
  const purchaseStatus =
    status == "draft"
      ? "Rascunho"
      : status == "requested"
      ? "Pedido"
      : status == "shipped"
      ? "Aguardando entrega"
      : status == "received"
      ? "Recebida"
      : status == "finished"
      ? "Concluída"
      : status == "cancelled"
      ? "Cancelada"
      : "Erro, verificar status no server";

  return purchaseStatus;
}
