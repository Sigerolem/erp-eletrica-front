import type { TargetedFocusEvent } from "preact";
import type { Dispatch, StateUpdater } from "preact/hooks";
import { formatFloatWithDecimalDigits } from "./formating";

type StringFieldValidationOptions = {
  min?: number;
  max?: number;
  required?: boolean;
};

export function validateStringFieldOnBlur(
  e: TargetedFocusEvent<HTMLInputElement>,
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
  decimalDigits: 0 | 1 | 2 | 3;
  removeFromString?: string;
};

export function validateFloatFieldOnBlur(
  e: TargetedFocusEvent<HTMLInputElement>,
  setValue: Dispatch<StateUpdater<number>>,
  setErrors: Dispatch<StateUpdater<{ [key: string]: string }>>,
  { min, max, decimalDigits, removeFromString }: FloatFieldValidationOptions
) {
  const { name } = e.currentTarget;
  let value = e.currentTarget.value;
  if (removeFromString) {
    value = value.replaceAll(removeFromString, "").trim();
  }

  if (value == "") {
    setValue(formatFloatWithDecimalDigits(0, decimalDigits));
    return;
  }

  const floatValue = parseFloat(value.replaceAll(".", "").replaceAll(",", "."));
  if (isNaN(floatValue)) {
    setValue(NaN);
    setErrors((prev) => ({ ...prev, [name]: "Valor com formato inválido" }));
    return;
  }

  if (min != undefined && floatValue < min) {
    setErrors((prev) => ({
      ...prev,
      [name]: `Valor não pode ser menor que ${min}`,
    }));
    return;
  } else if (max != undefined && floatValue > max) {
    setErrors((prev) => ({
      ...prev,
      [name]: `Valor não pode ser maior que ${max}`,
    }));
    return;
  }

  setValue(formatFloatWithDecimalDigits(floatValue, decimalDigits));
  setErrors((prev) => {
    delete prev[name];
    return { ...prev };
  });
}
