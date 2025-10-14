import type { TargetedFocusEvent } from "preact";
import type { Dispatch, StateUpdater } from "preact/hooks";

type stringFieldValidationOptions = {
  min?: number;
  max?: number;
  required?: boolean;
};

export function validateStringFieldOnBlur(
  e: TargetedFocusEvent<HTMLInputElement>,
  setValue: Dispatch<StateUpdater<string>>,
  setErrors: Dispatch<StateUpdater<{ [key: string]: string }>>,
  options: stringFieldValidationOptions
) {
  const { min, max, required } = options;
  const value = e.currentTarget.value;
  const name = e.currentTarget.name;

  setValue(value);

  if (required && value.length == 0) {
    setErrors((prev) => ({
      ...prev,
      [name]: "Esse campo é obrigatório",
    }));
    return;
  }

  const minError = !min ? false : value.length < min;
  const maxError = !max ? false : value.length > max;

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
    return prev;
  });
}
