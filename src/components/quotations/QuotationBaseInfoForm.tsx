import { Input } from "@elements/Input";
import { SelectCustomerModal } from "../customers/SelectCustomerModal";
import {
  validateFloatFieldOnBlur,
  validateIntFieldOnBlur,
  validateStringFieldOnBlur,
} from "@utils/inputValidation";
import {
  BrlStringFromCents,
  formatQuotationStatusEnum,
} from "src/utils/formating";
import { useState, type Dispatch, type StateUpdater } from "preact/hooks";
import type { CustomersType } from "../customers/Customers";
import { Textarea } from "src/elements/TextArea";
import type { QuotationImagesType, QuotationsStatusType } from "./Quotations";
import { Tabs } from "src/elements/Tabs";
import { QuotationImages } from "./QuotationImages";

interface Props {
  quotationId: string;
  reference: string;
  description: string;
  publicComments: string;
  privateComments: string;
  toolList: string;
  expectedDuration: number;
  customerSelected: CustomersType | null;
  customers: CustomersType[] | undefined;
  matDiscount: number;
  serDiscount: number;
  updateField: (field: any, value: any) => void;
  validationErrors: { [key: string]: string };
  setValidationErrors: Dispatch<StateUpdater<{ [key: string]: string }>>;
  userCanEdit: boolean;
  status: QuotationsStatusType;
  purchaseOrder: string;
  totals: {
    materialCost: number;
    materialValue: number;
    serviceCost: number;
    serviceValue: number;
    directCost: number;
    directValue: number;
  };
  quotationImgs: Partial<QuotationImagesType>[];
}

export function QuotationBaseInfoForm({
  quotationId,
  reference,
  description,
  publicComments,
  privateComments,
  toolList,
  expectedDuration,
  customerSelected,
  customers,
  matDiscount,
  serDiscount,
  updateField,
  validationErrors,
  setValidationErrors,
  userCanEdit,
  status,
  purchaseOrder,
  totals,
  quotationImgs,
}: Props) {
  const URL_PATH = window.location.pathname;
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const [showValues, setShowValues] = useState(false);

  const {
    materialCost,
    materialValue,
    serviceCost,
    serviceValue,
    directCost,
    directValue,
  } = totals;

  const xSize = window.innerWidth;
  return (
    <>
      <Input
        label="Referência"
        name="reference"
        value={reference}
        onBlur={(e) => {
          validateStringFieldOnBlur(e, updateField, setValidationErrors, {
            required: true,
            min: 5,
          });
        }}
        errors={validationErrors}
        disabled={!userCanEdit}
        className={userCanEdit ? "" : "bg-blue-50!"}
      />
      <Tabs
        tabs={[
          "Info",
          "Detalhes",
          ...(URL_PATH.includes("orcamentos") || quotationId == ""
            ? []
            : ["Imagens"]),
        ]}
      >
        <>
          <div
            className={`grid gap-3 items-end ${
              xSize < 800 ? "grid-cols-2" : "grid-cols-4"
            }`}
          >
            <Input
              label="Tempo esperado"
              name="expectedDuration"
              errors={validationErrors}
              value={expectedDuration}
              onBlur={(e) => {
                validateIntFieldOnBlur(e, updateField, setValidationErrors, {
                  min: 0,
                  required: true,
                });
              }}
              disabled={!userCanEdit}
              className={userCanEdit ? "" : "bg-blue-50!"}
            />
            {customers && isCustomerModalOpen && (
              <SelectCustomerModal
                customers={customers}
                cleanError={() => {
                  setValidationErrors((prev) => {
                    delete prev.customer_id;
                    return prev;
                  });
                }}
                closeModal={() => {
                  setIsCustomerModalOpen(false);
                }}
                selectCustomer={(customer) => {
                  updateField("customerSelected", customer);
                }}
              />
            )}
            <Input
              name="customer_id"
              label="Cliente"
              onFocus={(e) => {
                e.currentTarget.blur();
                setIsCustomerModalOpen(true);
              }}
              value={customerSelected === null ? "" : customerSelected.name}
              errors={validationErrors}
              disabled={customers == undefined}
              className={
                customers == undefined
                  ? "cursor-not-allowed bg-blue-50!"
                  : "cursor-pointer"
              }
            />
            <Input
              label="Desconto Material"
              name="matDiscount"
              errors={validationErrors}
              value={(matDiscount / 100_00).toLocaleString("pt-br", {
                maximumFractionDigits: 2,
                unit: "percent",
                unitDisplay: "short",
                style: "percent",
              })}
              onBlur={(e) => {
                validateFloatFieldOnBlur(e, updateField, setValidationErrors, {
                  removeFromString: "%",
                });
              }}
              disabled={!userCanEdit}
              className={userCanEdit ? "" : "bg-blue-50!"}
            />
            <Input
              label="Desconto Serviço"
              name="serDiscount"
              errors={validationErrors}
              value={(serDiscount / 100_00).toLocaleString("pt-br", {
                maximumFractionDigits: 2,
                unit: "percent",
                unitDisplay: "short",
                style: "percent",
              })}
              onBlur={(e) => {
                validateFloatFieldOnBlur(e, updateField, setValidationErrors, {
                  removeFromString: "%",
                });
              }}
              disabled={!userCanEdit}
              className={userCanEdit ? "" : "bg-blue-50!"}
            />
          </div>

          {URL_PATH.includes("novo") ? (
            <></>
          ) : (
            <div className={"flex gap-4"}>
              <Input
                label="Situação"
                name="status"
                value={formatQuotationStatusEnum(status)}
                disabled={true}
                className={"bg-blue-50!"}
              />
              <Input
                label="Ordem de Compra"
                name="purchaseOrder"
                value={purchaseOrder}
                onBlur={(e) => {
                  validateStringFieldOnBlur(
                    e,
                    updateField,
                    setValidationErrors,
                    {
                      max: 20,
                    },
                  );
                }}
                disabled={!userCanEdit}
                className={userCanEdit ? "" : "bg-blue-50!"}
              />
            </div>
          )}

          {userCanEdit && (
            <div className={"flex gap-4"}>
              <Input
                label="Custo do orçamento"
                name="totalCost"
                value={BrlStringFromCents(
                  materialCost + serviceCost + directCost,
                )}
                disabled={true}
                className={"bg-blue-50!"}
              />
              <Input
                label="Valor do orçamento"
                name="totalAmount"
                value={BrlStringFromCents(
                  (materialValue * (100_00 - matDiscount)) / 100_00 +
                    (serviceValue * (100_00 - serDiscount)) / 100_00 +
                    directValue,
                )}
                disabled={true}
                className={"bg-blue-50!"}
              />
            </div>
          )}

          {userCanEdit && false && (
            <div className={"flex text-xl font-semibold gap-2 -mb-2"}>
              Valores
              <button
                type={"button"}
                className={
                  "bg-blue-800 shadow-md text-white rounded-md flex items-center justify-center"
                }
                onClick={() => {
                  setShowValues((prev) => !prev);
                }}
              >
                <svg fill="#fff" width="30px" viewBox="-5.5 0 32 32">
                  <title>eye-slash</title>
                  <path d="M20.44 15.48c-0.12-0.16-2.28-2.92-5.48-4.56l0.92-3c0.12-0.44-0.12-0.92-0.56-1.040s-0.92 0.12-1.040 0.56l-0.88 2.8c-0.96-0.32-2-0.56-3.080-0.56-5.6 0-9.92 5.56-10.12 5.8-0.24 0.32-0.24 0.72 0 1.040 0.16 0.24 4.2 5.36 9.48 5.76l-0.56 1.8c-0.12 0.44 0.12 0.92 0.56 1.040 0.080 0.040 0.16 0.040 0.24 0.040 0.36 0 0.68-0.24 0.8-0.6l0.72-2.36c5-0.68 8.8-5.48 9-5.72 0.24-0.28 0.24-0.68 0-1zM1.96 16c1.16-1.32 4.52-4.64 8.36-4.64 0.88 0 1.76 0.2 2.6 0.48l-0.28 0.88c-0.68-0.48-1.48-0.72-2.32-0.72-2.2 0-4 1.8-4 4s1.8 4 4 4c0.040 0 0.040 0 0.080 0l-0.2 0.64c-3.8-0.080-7.080-3.36-8.24-4.64zM10.88 18.24c-0.2 0.040-0.4 0.080-0.6 0.080-1.28 0-2.32-1.040-2.32-2.32s1.040-2.32 2.32-2.32c0.68 0 1.32 0.32 1.76 0.8l-1.16 3.76zM12 20.44l2.4-7.88c1.96 1.080 3.52 2.64 4.24 3.44-0.96 1.12-3.52 3.68-6.64 4.44z"></path>
                </svg>
              </button>
            </div>
          )}

          {!URL_PATH.includes("novo") && showValues && userCanEdit && (
            <section className={`border rounded-md p-2 border-gray-400`}>
              <div className={`flex gap-4 items-end`}>
                <Input
                  label="Custo de materiais"
                  name="materialCost"
                  value={BrlStringFromCents(materialCost)}
                  disabled={true}
                  className={"bg-blue-50!"}
                />
                <Input
                  label="Custo de serviços"
                  name="serviceCost"
                  value={BrlStringFromCents(serviceCost)}
                  disabled={true}
                  className={"bg-blue-50!"}
                />
                <Input
                  label="Custo das despesas"
                  name="directCost"
                  value={BrlStringFromCents(directCost)}
                  disabled={true}
                  className={"bg-blue-50!"}
                />
              </div>
              <div className={`flex gap-4 items-end`}>
                <Input
                  label="Valor de materiais"
                  name="materialCost"
                  value={BrlStringFromCents(materialValue)}
                  disabled={true}
                  className={"bg-blue-50!"}
                />
                <Input
                  label="Valor de serviços"
                  name="serviceCost"
                  value={BrlStringFromCents(serviceValue)}
                  disabled={true}
                  className={"bg-blue-50!"}
                />
                <Input
                  label="Valor das despesass"
                  name="directCost"
                  value={BrlStringFromCents(directValue)}
                  disabled={true}
                  className={"bg-blue-50!"}
                />
              </div>
            </section>
          )}
        </>

        <>
          <div className={"flex gap-4 items-end"}>
            <Textarea
              label="Descrição do serviço"
              name="description"
              errors={validationErrors}
              value={description}
              onBlur={(e) => {
                validateStringFieldOnBlur(e, updateField, setValidationErrors, {
                  min: 5,
                  max: 100,
                });
              }}
              disabled={!userCanEdit}
            />
            <Textarea
              label="Ferramentas ou Equipamentos"
              name="toolList"
              errors={validationErrors}
              value={toolList}
              onBlur={(e) => {
                validateStringFieldOnBlur(e, updateField, setValidationErrors, {
                  min: 2,
                  max: 200,
                  required: false,
                });
              }}
              disabled={!userCanEdit}
            />
          </div>
          <div className={"flex gap-4 items-end"}>
            <Textarea
              label="Informações Adicionais"
              name="publicComments"
              errors={validationErrors}
              value={publicComments}
              onBlur={(e) => {
                validateStringFieldOnBlur(e, updateField, setValidationErrors, {
                  min: 0,
                  max: 300,
                  required: false,
                });
              }}
              disabled={!userCanEdit}
            />
            <Textarea
              label="Anotações"
              name="privateComments"
              errors={validationErrors}
              value={privateComments}
              onBlur={(e) => {
                validateStringFieldOnBlur(e, updateField, setValidationErrors, {
                  min: 0,
                  max: 300,
                  required: false,
                });
              }}
              disabled={!userCanEdit}
            />
          </div>
        </>

        {!URL_PATH.includes("orcamentos") && quotationId !== "" && (
          <QuotationImages quotationId={quotationId} />
        )}
      </Tabs>
    </>
  );
}
