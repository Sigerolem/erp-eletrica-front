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
