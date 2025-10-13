export function validateDecimalInput(value: string): {
  decimalValue: number;
  intString: string;
  float0String: string;
  float00String: string;
  float0Value: number;
  float00Value: number;
  error?: string;
} {
  const intlString = value.replaceAll(".", "").replaceAll(",", ".");
  const floatValue = parseFloat(intlString);
  if (isNaN(floatValue)) {
    return {
      error: "Digite um valor válido",
      decimalValue: 0,
      float00String: "",
      float0String: "",
      intString: "",
      float00Value: 0,
      float0Value: 0,
    };
  }
  const float00String = floatValue.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const float0String = floatValue.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const intString = floatValue.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  const float00Value = parseFloat(floatValue.toFixed(2));
  const float0Value = parseFloat(floatValue.toFixed(1));

  return {
    decimalValue: floatValue,
    float00String,
    float0String,
    intString,
    float00Value,
    float0Value,
  };
}
