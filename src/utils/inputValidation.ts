import type { TargetedFocusEvent } from "preact";
import type { Dispatch, StateUpdater } from "preact/hooks";

type StringFieldValidationOptions = {
  min?: number;
  max?: number;
  required?: boolean;
};

export function validateStringFieldOnBlur(
  e: TargetedFocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  setValue: Dispatch<StateUpdater<string>>,
  setErrors: Dispatch<StateUpdater<{ [key: string]: string }>>,
  options: StringFieldValidationOptions
) {
  const { min, max, required } = options;
  const { name, value } = e.currentTarget;

  setValue(value);

  if (required && value.length == 0) {
    setErrors((prev) => ({
      ...prev,
      [name]: "Esse campo é obrigatório",
    }));
    return;
  }

  const maxError = value.length > (max ?? Infinity);
  let minError = value.length < (min ?? -Infinity);
  if (!required && value.length == 0) {
    minError = false;
  }

  if (maxError || minError) {
    setErrors((prev) => ({
      ...prev,
      [name]: `Esse campo deve ter no ${maxError ? "máximo" : "mínimo"} ${
        maxError ? max : min
      } caracteres`,
    }));
    return;
  }

  setErrors((prev) => {
    delete prev[name];
    return { ...prev };
  });
}

type IntFieldValidationOptions = {
  min?: number;
  max?: number;
  required?: boolean;
  canBeNegative?: boolean;
  defaultFieldValue?: number;
};

export function validateIntFieldOnBlur(
  e: TargetedFocusEvent<HTMLInputElement>,
  setValue: Dispatch<StateUpdater<number>>,
  setErrors: Dispatch<StateUpdater<{ [key: string]: string }>>,
  { min, max, defaultFieldValue = 0 }: IntFieldValidationOptions
) {
  const { value, name } = e.currentTarget;

  if (value == "" && defaultFieldValue == 0) {
    e.currentTarget.value = "0";
  }

  const intValue = value == "" ? 0 : parseInt(value);

  if (isNaN(intValue)) {
    setErrors((prev) => ({
      ...prev,
      [name]: "Campo deve ser preenchido com um numero inteiro válido.",
    }));
    setValue(intValue);
    return;
  }

  setValue(intValue);
  if (min != undefined && intValue < min) {
    setErrors((prev) => ({
      ...prev,
      [name]: `Valor não pode ser menor que ${min}`,
    }));
    return;
  } else if (max != undefined && intValue > max) {
    setErrors((prev) => ({
      ...prev,
      [name]: `Valor não pode ser maior que ${max}`,
    }));
    return;
  }

  setErrors((prev) => {
    delete prev[name];
    return { ...prev };
  });
}

type FloatFieldValidationOptions = {
  min?: number;
  max?: number;
  removeFromString?: string;
};

export function validateFloatFieldOnBlur(
  e: TargetedFocusEvent<HTMLInputElement>,
  setValue: Dispatch<StateUpdater<number>>,
  setErrors: Dispatch<StateUpdater<{ [key: string]: string }>>,
  { min, max, removeFromString }: FloatFieldValidationOptions
) {
  const { name } = e.currentTarget;
  let value = e.currentTarget.value;
  if (removeFromString) {
    value = value.replaceAll(removeFromString, "").trim();
  }

  if (value == "") {
    setValue(0);
    return;
  }

  const floatValue = parseFloat(value.replaceAll(".", "").replaceAll(",", "."));
  if (isNaN(floatValue)) {
    setValue(NaN);
    setErrors((prev) => ({ ...prev, [name]: "Valor com formato inválido" }));
    return;
  }
  const centsValue = Math.round(floatValue * 100);

  if (min != undefined && centsValue < min) {
    setErrors((prev) => ({
      ...prev,
      [name]: `Valor não pode ser menor que ${min}`,
    }));
    return;
  } else if (max != undefined && centsValue > max) {
    setErrors((prev) => ({
      ...prev,
      [name]: `Valor não pode ser maior que ${max}`,
    }));
    return;
  }

  setValue(centsValue);
  setErrors((prev) => {
    delete prev[name];
    return { ...prev };
  });
}

export function parseFloatFromString({
  value,
  options: { max, min, removeFromString },
  name = "any",
}: {
  value: string;
  options: FloatFieldValidationOptions;
  setErrors?: Dispatch<StateUpdater<{ [key: string]: string }>>;
  name?: string;
}) {
  console.log(value);
  let erro: { [key: string]: string };

  if (removeFromString) {
    value = value.replaceAll(removeFromString, "").trim();
  }

  const floatValue =
    value == ""
      ? 0
      : parseFloat(value.replaceAll(".", "").replaceAll(",", "."));

  if (isNaN(floatValue)) {
    erro = {
      [name]: "Valor com formato inválido",
    };
    return { centsValue: NaN, erro, intValue: NaN };
  }

  const centsValue = Math.round(floatValue * 100);

  if (min != undefined && centsValue < min) {
    erro = {
      [name]: `Valor não pode ser menor que ${min}`,
    };
    return { centsValue, erro, intValue: Math.round(centsValue / 100) };
  } else if (max != undefined && centsValue > max) {
    erro = {
      [name]: `Valor não pode ser maior que ${max}`,
    };
    return { centsValue, erro, intValue: Math.round(centsValue / 100) };
  }

  return {
    centsValue,
    intValue: Math.round(centsValue / 100),
    erro: null,
  };
}
