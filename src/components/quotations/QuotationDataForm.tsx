import type { CustomersType } from "@comp/customers/Customers";
import { SelectCustomerModal } from "@comp/customers/SelectCustomerModal";
import type { MaterialsType } from "@comp/materials/Materials";
import { SelectMaterialModal } from "@comp/materials/SelectMaterialModal";
import { DataForm } from "@elements/DataForm";
import { Input } from "@elements/Input";
import { Textarea } from "@elements/TextArea";
import { fetchWithToken } from "@utils/fetchWithToken";
import {
  validateFloatFieldOnBlur,
  validateIntFieldOnBlur,
  validateStringFieldOnBlur,
} from "@utils/inputValidation";
import type { JSX, TargetedSubmitEvent } from "preact";
import { useEffect, useState } from "preact/hooks";
import { ExceptionalItemsList } from "./lists/ExceptionalItemsList";
import { InventoryItemsList } from "./lists/InventoryItemsList";
import type {
  QuotationItemsType,
  QuotationMaterialsType,
  QuotationsStatusType,
  QuotationsType,
} from "./Quotations";
import { ListWrapper } from "./lists/ListWrapper";
import {
  BrlStringFromCents,
  formatQuotationStatusEnum,
} from "@utils/formating";

export function QuotationDataForm({
  quotationData,
  doOnSubmit,
  customers,
  children,
}: {
  doOnSubmit: ({}: {
    quotationData: Partial<QuotationsType>;
    itemsToDelete?: string[];
    materialsToDelete?: string[];
  }) => Promise<{ [key: string]: string } | null>;
  quotationData?: QuotationsType;
  customers?: CustomersType[];
  children?: JSX.Element;
}) {
  const URL_PATH = window.location.pathname;

  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [materials, setMaterials] = useState<MaterialsType[]>([]);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<string[]>([]);
  const [materialsToDelete, setMaterialsToDelete] = useState<string[]>([]);

  const [reference, setReference] = useState("");
  const [description, setDescription] = useState("");
  const [expectedDuration, setExpectedDuration] = useState(0);
  const [toolList, setToolList] = useState("");
  const [privateComments, setPrivateComments] = useState("");
  const [publicComments, setPublicComments] = useState("");
  const [status, setStatus] = useState<QuotationsStatusType>("draft");
  const [purchaseOrder, setPurchaseOrder] = useState("");

  const [materialCost, setMaterialCost] = useState(0);
  const [materialValue, setMaterialValue] = useState(0);
  const [serviceCost, setServiceCost] = useState(0);
  const [serviceValue, setServiceValue] = useState(0);
  const [directCost, setDirectCost] = useState(0);
  const [directValue, setDirectValue] = useState(0);
  const [discount, setDiscount] = useState(0);

  const [customerSelected, setCustomerSelected] =
    useState<CustomersType | null>(null);
  const [quoteMaterials, setQuoteMaterials] = useState<
    Partial<QuotationItemsType>[]
  >([]);
  const [occasionalMaterials, setOccasionalMaterials] = useState<
    Partial<QuotationItemsType>[]
  >([]);
  const [serviceItems, setServiceItems] = useState<
    Partial<QuotationItemsType>[]
  >([]);
  const [expenses, setExpenses] = useState<Partial<QuotationItemsType>[]>([]);

  useEffect(() => {
    if (quotationData) {
      setStatus(quotationData.status);
      setReference(quotationData.reference);
      setDescription(quotationData.description);
      setExpectedDuration(quotationData.expected_duration);
      setToolList(quotationData.tool_list);
      setPrivateComments(quotationData.private_comments);
      setPublicComments(quotationData.public_comments);
      setPurchaseOrder(quotationData.purchase_order);
      setMaterialCost(quotationData.material_cost);
      setMaterialValue(quotationData.material_value);
      setServiceCost(quotationData.service_cost);
      setServiceValue(quotationData.service_value);
      setDirectCost(quotationData.direct_cost);
      setDirectValue(quotationData.direct_value);
      setDiscount(quotationData.discount);
      setCustomerSelected(quotationData.customer);
      setQuoteMaterials(quotationData.materials);
      setOccasionalMaterials(
        quotationData.items.filter(
          (item) => item.type === "occasional_material"
        )
      );
      setServiceItems(
        quotationData.items.filter((item) => item.type === "service")
      );
      setExpenses(
        quotationData.items.filter((item) => item.type === "expense")
      );
    }
  }, [quotationData]);

  useEffect(() => {
    fetchWithToken<{ materials: MaterialsType[] }>({ path: "/materials" }).then(
      (result) => {
        if (result.code == 200) {
          setMaterials(result.data.materials);
        }
      }
    );
  }, []);

  useEffect(() => {}, [validationErrors]);

  async function onFormSubmit(e: TargetedSubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    let errorFound = false;

    if (Object.keys(validationErrors).length > 0) {
      window.alert("Só é possivel salvar com dados válidos.");
      return;
    }

    if (reference == "") {
      setValidationErrors((prev) => ({
        ...prev,
        reference: "Esse campo é obrigatório.",
      }));
      errorFound = true;
    }

    if (customerSelected == null) {
      setValidationErrors((prev) => ({
        ...prev,
        customer_id: "Selecione um cliente",
      }));
      errorFound = true;
    }

    if (errorFound) {
      return;
    }

    const newQuotationData: Partial<QuotationsType> = {
      status,
      reference,
      description,
      expected_duration: expectedDuration,
      tool_list: toolList,
      discount,
      private_comments: privateComments,
      public_comments: publicComments,
      purchase_order: purchaseOrder,
      material_cost: materialCost,
      material_value: materialValue,
      service_cost: serviceCost,
      service_value: serviceValue,
      direct_cost: directCost,
      direct_value: directValue,
      customer_id: customerSelected!.id,
      items: [...occasionalMaterials, ...serviceItems, ...expenses],
      materials: quoteMaterials,
    };

    const errors = await doOnSubmit({
      quotationData: newQuotationData,
      itemsToDelete,
      materialsToDelete,
    });

    if (errors) {
      setValidationErrors((prev) => ({ ...prev, ...errors }));
    }
  }

  function itemsListErrorChecker(bool: boolean) {
    if (bool) {
      setValidationErrors((prev) => ({ ...prev, quoteMaterials: "Tem erro" }));
    } else {
      setValidationErrors((prev) => {
        delete prev.quoteMaterials;
        return prev;
      });
    }
  }

  function handleNewInventoryMaterial(material: MaterialsType) {
    const newInvMaterial: Partial<QuotationMaterialsType> = {
      material_id: material.id,
      name: material.name,
      unit_cost: material.avg_cost,
      unit_profit: material.profit,
      unit_value: material.value,
      expected_amount: 0,
      returned_amount: 0,
      taken_amount: 0,
      quotation_id: quotationData?.id || undefined,
      is_private: false,
    };
    setQuoteMaterials((prev) => [...prev, newInvMaterial]);
  }

  function handleNewExceptionalMaterial() {
    const newOccMaterial: Partial<QuotationItemsType> = {
      type: "occasional_material",
      name: "",
      unit_cost: 0,
      unit_profit: 0,
      unit_value: 0,
      unit: "un",
      expected_amount: 0,
      taken_amount: 0,
      is_private: false,
      quotation_id: quotationData?.id,
    };
    setOccasionalMaterials((prev) => [...prev, newOccMaterial]);
  }

  function handleNewServiceItem() {
    const newService: Partial<QuotationItemsType> = {
      type: "service",
      name: "",
      unit_cost: 0,
      unit_profit: 0,
      unit_value: 0,
      unit: "un",
      expected_amount: 0,
      taken_amount: 0,
      is_private: false,
      quotation_id: quotationData?.id,
    };
    setServiceItems((prev) => [...prev, newService]);
  }

  function handleNewExpenseItem() {
    const newService: Partial<QuotationItemsType> = {
      type: "expense",
      name: "",
      unit_cost: 0,
      unit_profit: 0,
      unit_value: 0,
      unit: "un",
      expected_amount: 0,
      taken_amount: 0,
      is_private: false,
      quotation_id: quotationData?.id,
    };
    setExpenses((prev) => [...prev, newService]);
  }

  return (
    <DataForm onSubmit={onFormSubmit}>
      {URL_PATH.includes("novo") ? (
        <></>
      ) : (
        <>
          <div className={"flex gap-4"}>
            <Input
              label="Custo de materiais"
              name="materialCost"
              value={BrlStringFromCents(materialCost)}
              disabled={true}
            />
            <Input
              label="Custo de serviços"
              name="serviceCost"
              value={BrlStringFromCents(serviceCost)}
              disabled={true}
            />
            <Input
              label="Custo das despesas"
              name="directCost"
              value={BrlStringFromCents(directCost)}
              disabled={true}
            />
          </div>
          <div className={"flex gap-4"}>
            <Input
              label="Valor de materiais"
              name="materialCost"
              value={BrlStringFromCents(materialValue)}
              disabled={true}
            />
            <Input
              label="Valor de serviços"
              name="serviceCost"
              value={BrlStringFromCents(serviceValue)}
              disabled={true}
            />
            <Input
              label="Valor das despesass"
              name="directCost"
              value={BrlStringFromCents(directValue)}
              disabled={true}
            />
          </div>
        </>
      )}
      {URL_PATH.includes("novo") ? (
        <></>
      ) : (
        <div className={"flex gap-4"}>
          <Input
            label="Situação"
            name="status"
            value={formatQuotationStatusEnum(status)}
            disabled={true}
          />
          <Input
            label="Ordem de Compra"
            name="purchaseOrder"
            value={purchaseOrder}
            onBlur={(e) => {
              validateStringFieldOnBlur(
                e,
                setPurchaseOrder,
                setValidationErrors,
                {
                  max: 20,
                }
              );
            }}
          />
        </div>
      )}
      <Input
        label="Referência"
        name="reference"
        value={reference}
        onBlur={(e) => {
          validateStringFieldOnBlur(e, setReference, setValidationErrors, {
            required: true,
            min: 5,
          });
        }}
        errors={validationErrors}
      />
      <div className={"flex gap-4"}>
        <Textarea
          label="Descrição do serviço"
          name="description"
          errors={validationErrors}
          value={description}
          onBlur={(e) => {
            validateStringFieldOnBlur(e, setDescription, setValidationErrors, {
              min: 5,
              max: 100,
            });
          }}
        />
        <Textarea
          label="Ferramentas ou Equipamento"
          name="toolList"
          errors={validationErrors}
          value={toolList}
          onBlur={(e) => {
            validateStringFieldOnBlur(e, setToolList, setValidationErrors, {
              min: 2,
              max: 200,
              required: false,
            });
          }}
        />
      </div>
      <div className={"flex gap-4"}>
        <Textarea
          label="Informações Adicionais"
          name="publicComments"
          errors={validationErrors}
          value={publicComments}
          onBlur={(e) => {
            validateStringFieldOnBlur(
              e,
              setPublicComments,
              setValidationErrors,
              {
                min: 0,
                max: 300,
                required: false,
              }
            );
          }}
        />
        <Textarea
          label="Anotações"
          name="privateComments"
          errors={validationErrors}
          value={privateComments}
          onBlur={(e) => {
            validateStringFieldOnBlur(
              e,
              setPrivateComments,
              setValidationErrors,
              {
                min: 0,
                max: 300,
                required: false,
              }
            );
          }}
        />
      </div>
      <div className={"flex gap-4"}>
        <Input
          label="Tempo esperado"
          name="expectedDuration"
          errors={validationErrors}
          value={expectedDuration}
          onBlur={(e) => {
            validateIntFieldOnBlur(
              e,
              setExpectedDuration,
              setValidationErrors,
              {
                min: 0,
                required: true,
              }
            );
          }}
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
            selectCustomer={setCustomerSelected}
          />
        )}
        <Input
          name="customer_id"
          label="Cliente"
          onFocus={(e) => {
            e.currentTarget.blur();
            setIsCustomerModalOpen(true);
          }}
          className={"cursor-pointer"}
          value={customerSelected === null ? "" : customerSelected.name}
          errors={validationErrors}
          disabled={customers == undefined}
        />
        <Input
          label="Desconto"
          name="discount"
          errors={validationErrors}
          value={(discount / 100_00).toLocaleString("pt-br", {
            maximumFractionDigits: 2,
            unit: "percent",
            unitDisplay: "short",
            style: "percent",
          })}
          onBlur={(e) => {
            validateFloatFieldOnBlur(e, setDiscount, setValidationErrors, {
              removeFromString: "%",
            });
          }}
        />
      </div>

      <>
        {isMaterialModalOpen && (
          <SelectMaterialModal
            materials={materials}
            cleanError={() => {}}
            closeModal={() => {
              setIsMaterialModalOpen(false);
            }}
            selectMaterial={handleNewInventoryMaterial}
          />
        )}
      </>

      <ListWrapper
        label={"Materiais cadastrados"}
        doOnClickAdd={() => {
          setIsMaterialModalOpen(true);
        }}
      >
        <InventoryItemsList
          itemsList={quoteMaterials}
          setItemsList={setQuoteMaterials}
          setIsThereError={itemsListErrorChecker}
          deleteItem={setMaterialsToDelete}
        />
      </ListWrapper>
      <ListWrapper
        label={"Materiais não cadastrados"}
        doOnClickAdd={handleNewExceptionalMaterial}
      >
        <ExceptionalItemsList
          itemsList={occasionalMaterials}
          setItemsList={setOccasionalMaterials}
          deleteItem={setItemsToDelete}
          quotation={quotationData}
          setIsThereError={itemsListErrorChecker}
        />
      </ListWrapper>
      <ListWrapper label={"Serviços"} doOnClickAdd={handleNewServiceItem}>
        <ExceptionalItemsList
          itemsList={serviceItems}
          setItemsList={setServiceItems}
          deleteItem={setItemsToDelete}
          quotation={quotationData}
          setIsThereError={itemsListErrorChecker}
          type="service"
        />
      </ListWrapper>
      <ListWrapper label={"Despesas"} doOnClickAdd={handleNewExpenseItem}>
        <ExceptionalItemsList
          itemsList={expenses}
          setItemsList={setExpenses}
          deleteItem={setItemsToDelete}
          quotation={quotationData}
          setIsThereError={itemsListErrorChecker}
          type="expense"
        />
      </ListWrapper>
      {children}
    </DataForm>
  );
}
