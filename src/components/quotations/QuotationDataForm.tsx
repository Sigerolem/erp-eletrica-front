import type { JSX, TargetedSubmitEvent } from "preact";
import {
  useEffect,
  useState,
  type Dispatch,
  type StateUpdater,
} from "preact/hooks";

import { fetchWithToken } from "@utils/fetchWithToken";
import { hasPermission } from "@utils/permissionLogic";

import type { CustomersType } from "@comp/customers/Customers";
import type { LaborsType } from "@comp/labors/Labors";
import { SelectLaborModal } from "@comp/labors/SelectLaborModal";
import type { MaterialsType } from "@comp/materials/Materials";
import { SelectMultipleMaterialsModal } from "@comp/materials/SelectMultipleMaterialsModal";

import { DataForm } from "@elements/DataForm";

import { ExceptionalItemsList } from "./lists/ExceptionalItemsList";
import { InventoryItemsList } from "./lists/InventoryItemsList";
import { ListWrapper } from "./lists/ListWrapper";
import { QuotationBaseInfoForm } from "./QuotationBaseInfoForm";
import type { QuotationsType } from "./Quotations";
import { useQuotationState } from "./useQuotationFormState";
import { UpdateQuoteMaterialsModal } from "./UpdateQuoteMaterialsModal";

export function QuotationDataForm({
  quotationData,
  doOnSubmit,
  customers,
  children,
  setSomethingChanged,
}: {
  doOnSubmit: ({}: {
    quotationData: Partial<QuotationsType>;
    itemsToDelete?: string[];
    materialsToDelete?: string[];
  }) => Promise<{ [key: string]: string } | null>;
  quotationData?: QuotationsType;
  customers?: CustomersType[];
  children?: JSX.Element;
  setSomethingChanged: Dispatch<StateUpdater<boolean>>;
}) {
  const { baseInfo, totals, actions, lists, thereIsChange } =
    useQuotationState(quotationData);
  const {
    status,
    description,
    reference,
    publicComments,
    privateComments,
    toolList,
    expectedDuration,
    purchaseOrder,
    matDiscount,
    serDiscount,
    customerSelected,
  } = baseInfo;
  const {
    quoteMaterials,
    setQuoteMaterials,
    occasionalMaterials,
    setOccasionalMaterials,
    serviceItems,
    setServiceItems,
    expenses,
    setExpenses,
    materialsToDelete,
    setMaterialsToDelete,
    itemsToDelete,
    setItemsToDelete,
    quotationImgs,
    setQuotationImgs,
  } = lists;
  const {
    updateField,
    handleNewInventoryMaterial,
    handleNewExceptionalMaterial,
    handleNewExpenseItem,
    handleNewBlankServiceItem,
    handleSelectLabor,
  } = actions;

  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [materials, setMaterials] = useState<MaterialsType[]>([]);
  const [isLaborModalOpen, setIsLaborModalOpen] = useState(false);
  const [labors, setLabors] = useState<LaborsType[]>([]);

  const [isUpdateMaterialsModalOpen, setIsUpdateMaterialsModalOpen] =
    useState(false);

  const [userCanEdit, setUserCanEdit] = useState(false);

  useEffect(() => {
    async function fetchLists() {
      const [materialsResult, laborsResult] = await Promise.all([
        fetchWithToken<{ materials: MaterialsType[] }>({ path: "/materials" }),
        fetchWithToken<{ labors: LaborsType[] }>({ path: "/labors" }),
      ]);
      if (materialsResult.code == 200) {
        setMaterials(materialsResult.data.materials);
      } else if (materialsResult.code == 403) {
        window.alert(
          "Você não tem permissão para obter a lista de materiais cadastrados.",
        );
      }
      if (laborsResult.code == 200) {
        setLabors(laborsResult.data.labors);
      } else if (laborsResult.code == 403) {
        window.alert(
          "Você não tem permissão para obter a lista de serviços cadastrados.",
        );
      }
    }
    fetchLists();
  }, []);

  useEffect(() => {
    const role = localStorage.getItem("apiRole");
    const permission = localStorage.getItem("apiPermissions");
    if (
      role != "owner" &&
      !hasPermission(permission ?? "----------------", "quotation", "R") &&
      !hasPermission(permission ?? "----------------", "order", "R")
    ) {
      window.location.href = "/";
      return;
    }
    const isNotOrderYet = ["q_awaiting", "q_approved", "denied"].includes(
      quotationData?.status ?? "q_awaiting",
    );
    if (
      role == "owner" ||
      hasPermission(
        permission ?? "----------------",
        isNotOrderYet ? "quotation" : "order",
        "W",
      )
    ) {
      setUserCanEdit(true);
    }
  }, [quotationData]);

  useEffect(() => {
    setSomethingChanged(Object.keys(thereIsChange).length > 0);
  }, [thereIsChange]);

  async function onFormSubmit(e: TargetedSubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    let errorFound = false;

    if (Object.keys(validationErrors).length > 0) {
      window.alert("Só é possivel salvar com dados válidos.");
      console.warn(Object.values(validationErrors));
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
      mat_discount: matDiscount,
      ser_discount: serDiscount,
      private_comments: privateComments,
      public_comments: publicComments,
      purchase_order: purchaseOrder,
      // material_cost: materialCost,
      // material_value: materialValue,
      // service_cost: serviceCost,
      // service_value: serviceValue,
      // direct_cost: directCost,
      // direct_value: directValue,
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

  return (
    <>
      <DataForm onSubmit={onFormSubmit}>
        <QuotationBaseInfoForm
          quotationId={quotationData?.id || ""}
          reference={reference}
          description={description}
          publicComments={publicComments}
          privateComments={privateComments}
          toolList={toolList}
          expectedDuration={expectedDuration}
          customerSelected={customerSelected}
          customers={customers}
          status={status}
          purchaseOrder={purchaseOrder}
          totals={totals}
          matDiscount={matDiscount}
          serDiscount={serDiscount}
          updateField={updateField}
          userCanEdit={userCanEdit}
          validationErrors={validationErrors}
          setValidationErrors={setValidationErrors}
          quotationImgs={quotationImgs}
        />
        <>
          <SelectMultipleMaterialsModal
            materials={materials}
            cleanError={() => {}}
            closeModal={() => {
              setIsMaterialModalOpen(false);
            }}
            isHiddden={!isMaterialModalOpen}
            selectMaterial={(material) => {
              handleNewInventoryMaterial(material);
            }}
            selectedMaterialIds={quoteMaterials
              .map((m) => m.material_id)
              .filter((id): id is string => !!id)}
          />
          {isLaborModalOpen && (
            <SelectLaborModal
              labors={labors}
              cleanError={() => {}}
              closeModal={() => {
                setIsLaborModalOpen(false);
              }}
              selectLabor={handleSelectLabor}
            />
          )}
        </>

        <ListWrapper
          label={"Materiais estoque"}
          doOnClickAdd={() => {
            setIsMaterialModalOpen(true);
          }}
          hideAddButton={!userCanEdit}
          doOnClickGear={() => {
            setIsUpdateMaterialsModalOpen(true);
          }}
          hideGearButton={!userCanEdit}
        >
          <InventoryItemsList
            itemsList={quoteMaterials}
            setItemsList={setQuoteMaterials}
            setIsThereError={itemsListErrorChecker}
            deleteItem={setMaterialsToDelete}
            readOnly={!userCanEdit}
          />
        </ListWrapper>
        <ListWrapper
          label={"Materiais excepcionais"}
          doOnClickAdd={handleNewExceptionalMaterial}
          hideAddButton={!userCanEdit}
        >
          <ExceptionalItemsList
            itemsList={occasionalMaterials}
            setItemsList={setOccasionalMaterials}
            deleteItem={setItemsToDelete}
            quotation={quotationData}
            setIsThereError={itemsListErrorChecker}
            readOnly={!userCanEdit}
          />
        </ListWrapper>
        <ListWrapper
          label={"Serviços"}
          doOnClickAdd={handleNewBlankServiceItem}
          doOnClickSearch={() => {
            setIsLaborModalOpen(true);
          }}
          hideAddButton={!userCanEdit}
        >
          <ExceptionalItemsList
            itemsList={serviceItems}
            setItemsList={setServiceItems}
            deleteItem={setItemsToDelete}
            quotation={quotationData}
            setIsThereError={itemsListErrorChecker}
            type="service"
            readOnly={!userCanEdit}
          />
        </ListWrapper>
        <ListWrapper
          label={"Despesas"}
          doOnClickAdd={handleNewExpenseItem}
          hideAddButton={!userCanEdit}
        >
          <ExceptionalItemsList
            itemsList={expenses}
            setItemsList={setExpenses}
            deleteItem={setItemsToDelete}
            quotation={quotationData}
            setIsThereError={itemsListErrorChecker}
            type="expense"
            readOnly={!userCanEdit}
          />
        </ListWrapper>
        {children}
      </DataForm>
      {isUpdateMaterialsModalOpen && quotationData && (
        <UpdateQuoteMaterialsModal
          quotationId={quotationData.id}
          closeModal={() => {
            setIsUpdateMaterialsModalOpen(false);
          }}
        />
      )}
    </>
  );
}
