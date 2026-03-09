import { useState, useEffect, useCallback } from "preact/hooks";
import type {
  QuotationsType,
  QuotationMaterialsType,
  QuotationItemsType,
  QuotationsStatusType,
} from "./Quotations";
import type { MaterialsType } from "../materials/Materials";
import type { LaborsType } from "../labors/Labors";

export function useQuotationState(quotationData: QuotationsType | undefined) {
  const isNotOrderYet = [
    "q_awaiting",
    "q_approved",
    "os_awaiting",
    "denied",
    "cancelled",
  ].includes(quotationData?.status ?? "q_awaiting");

  const [thereIsChange, setThereIsChange] = useState<{
    [key: string]: boolean;
  }>({});

  const [baseInfo, setBaseInfo] = useState({
    id: quotationData?.id ?? undefined,
    reference: quotationData?.reference ?? "",
    description: quotationData?.description ?? "",
    expectedDuration: quotationData?.expected_duration ?? 0,
    toolList: quotationData?.tool_list ?? "",
    privateComments: quotationData?.private_comments ?? "",
    publicComments: quotationData?.public_comments ?? "",
    status: quotationData?.status ?? ("q_awaiting" as QuotationsStatusType),
    purchaseOrder: quotationData?.purchase_order ?? "",
    matDiscount: quotationData?.mat_discount ?? 0,
    serDiscount: quotationData?.ser_discount ?? 0,
    customerSelected: quotationData?.customer ?? null,
  });

  const [quoteMaterials, setQuoteMaterials] = useState<
    Partial<QuotationMaterialsType>[]
  >([]);
  const [occasionalMaterials, setOccasionalMaterials] = useState<
    Partial<QuotationItemsType>[]
  >([]);
  const [serviceItems, setServiceItems] = useState<
    Partial<QuotationItemsType>[]
  >([]);
  const [expenses, setExpenses] = useState<Partial<QuotationItemsType>[]>([]);

  const [itemsToDelete, setItemsToDelete] = useState<string[]>([]);
  const [materialsToDelete, setMaterialsToDelete] = useState<string[]>([]);

  useEffect(() => {
    if (quotationData !== undefined) {
      const occasionalMat: Partial<QuotationMaterialsType>[] = [];
      const services: Partial<QuotationItemsType>[] = [];
      const expenses: Partial<QuotationItemsType>[] = [];
      setQuoteMaterials([...quotationData.materials]);
      quotationData.items.forEach((item) => {
        if (item.type == "occasional_material") {
          occasionalMat.push(item);
        } else if (item.type == "expense") {
          expenses.push(item);
        } else {
          services.push(item);
        }
      });
      setOccasionalMaterials(occasionalMat);
      setExpenses(expenses);
      setServiceItems(services);
    }
  }, [quotationData]);

  let materialCost = 0;
  let materialValue = 0;
  let serviceCost = 0;
  let serviceValue = 0;
  let directCost = 0;
  let directValue = 0;
  quoteMaterials.forEach((quoteMat) => {
    const amount = isNotOrderYet
      ? quoteMat.expected_amount!
      : quoteMat.taken_amount!;
    materialCost += quoteMat.unit_cost! * amount;
    materialValue += quoteMat.unit_value! * quoteMat.expected_amount!;
  });
  occasionalMaterials.forEach((item) => {
    materialCost += item.unit_cost! * item.expected_amount!;
    materialValue += item.unit_value! * item.expected_amount!;
  });
  serviceItems.forEach((item) => {
    serviceCost += item.unit_cost! * item.expected_amount!;
    serviceValue += item.unit_value! * item.expected_amount!;
  });
  expenses.forEach((item) => {
    directCost += item.unit_cost! * item.expected_amount!;
    directValue += item.unit_value! * item.expected_amount!;
  });

  // -- Change Detection --
  useEffect(() => {
    if (!quotationData) {
      return;
    }
    if (
      baseInfo.reference !== quotationData?.reference ||
      baseInfo.expectedDuration !== quotationData?.expected_duration ||
      baseInfo.matDiscount !== quotationData?.mat_discount ||
      baseInfo.serDiscount !== quotationData?.ser_discount ||
      baseInfo.purchaseOrder !== quotationData?.purchase_order ||
      baseInfo.description !== quotationData?.description ||
      baseInfo.toolList !== quotationData?.tool_list ||
      baseInfo.privateComments !== quotationData?.private_comments ||
      baseInfo.publicComments !== quotationData?.public_comments
    ) {
      setThereIsChange((prev) => ({ ...prev, baseInfo: true }));
    } else {
      if (thereIsChange["baseInfo"] == true) {
        setThereIsChange((prev) => {
          delete prev["baseInfo"];
          return { ...prev };
        });
      }
    }
  }, [baseInfo, quotationData]);

  useEffect(() => {
    if (!quotationData) {
      return;
    }
    if (quoteMaterials.length !== quotationData?.materials.length) {
      setThereIsChange((prev) => ({ ...prev, quoteMaterials: true }));
      return;
    }

    const changeFound = quoteMaterials.some((mat, index) => {
      const dataMat = quotationData.materials[index];
      if (
        mat.id !== dataMat.id ||
        mat.expected_amount !== dataMat.expected_amount
      ) {
        return true;
      }
      return false;
    });
    if (changeFound) {
      setThereIsChange((prev) => ({ ...prev, quoteMaterials: true }));
      return;
    }
    if (thereIsChange["quoteMaterials"] == true) {
      setThereIsChange((prev) => {
        delete prev["quoteMaterials"];
        return { ...prev };
      });
    }
  }, [quoteMaterials]);

  useEffect(() => {
    if (!quotationData) {
      return;
    }
    const items = quotationData.items.filter(
      (item) => item.type == "occasional_material",
    );
    if (occasionalMaterials.length !== items.length) {
      setThereIsChange((prev) => ({ ...prev, occasionalMaterials: true }));
      return;
    }

    const changeFound = occasionalMaterials.some((mat, index) => {
      const dataMat = items[index];
      if (
        mat.id !== dataMat.id ||
        mat.name !== dataMat.name ||
        mat.expected_amount !== dataMat.expected_amount ||
        mat.unit !== dataMat.unit ||
        mat.unit_cost !== dataMat.unit_cost ||
        mat.unit_value !== dataMat.unit_value ||
        mat.unit_profit !== dataMat.unit_profit
      ) {
        return true;
      }
      return false;
    });
    if (changeFound) {
      setThereIsChange((prev) => ({ ...prev, occasionalMaterials: true }));
      return;
    }
    if (thereIsChange["occasionalMaterials"] == true) {
      setThereIsChange((prev) => {
        delete prev["occasionalMaterials"];
        return { ...prev };
      });
    }
  }, [occasionalMaterials]);

  useEffect(() => {
    if (!quotationData) {
      return;
    }
    const items = quotationData.items.filter((item) => item.type == "service");
    if (serviceItems.length !== items.length) {
      setThereIsChange((prev) => ({ ...prev, serviceItems: true }));
      return;
    }

    const changeFound = serviceItems.some((mat, index) => {
      const dataMat = items[index];
      if (
        mat.id !== dataMat.id ||
        mat.name !== dataMat.name ||
        mat.expected_amount !== dataMat.expected_amount ||
        mat.unit !== dataMat.unit ||
        mat.unit_cost !== dataMat.unit_cost ||
        mat.unit_value !== dataMat.unit_value ||
        mat.unit_profit !== dataMat.unit_profit
      ) {
        return true;
      }
      return false;
    });
    if (changeFound) {
      setThereIsChange((prev) => ({ ...prev, serviceItems: true }));
      return;
    }
    if (thereIsChange["serviceItems"] == true) {
      setThereIsChange((prev) => {
        delete prev["serviceItems"];
        return { ...prev };
      });
    }
  }, [serviceItems]);

  useEffect(() => {
    if (!quotationData) {
      return;
    }
    const items = quotationData.items.filter((item) => item.type == "expense");
    if (expenses.length !== items.length) {
      setThereIsChange((prev) => ({ ...prev, expenses: true }));
      return;
    }

    const changeFound = expenses.some((mat, index) => {
      const dataMat = items[index];
      if (
        mat.id !== dataMat.id ||
        mat.name !== dataMat.name ||
        mat.expected_amount !== dataMat.expected_amount ||
        mat.unit !== dataMat.unit ||
        mat.unit_cost !== dataMat.unit_cost ||
        mat.unit_value !== dataMat.unit_value ||
        mat.unit_profit !== dataMat.unit_profit
      ) {
        return true;
      }
      return false;
    });
    if (changeFound) {
      setThereIsChange((prev) => ({ ...prev, expenses: true }));
      return;
    }
    if (thereIsChange["expenses"] == true) {
      setThereIsChange((prev) => {
        delete prev["expenses"];
        return { ...prev };
      });
    }
  }, [expenses]);

  const updateField = useCallback((name: keyof typeof baseInfo, value: any) => {
    setBaseInfo((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleNewInventoryMaterial = useCallback((material: MaterialsType) => {
    setQuoteMaterials((prev) => {
      if (prev.some((m) => m.material_id === material.id)) return prev;
      return [
        {
          material_id: material.id,
          name: material.name,
          unit_cost: material.avg_cost,
          unit_profit: material.profit,
          unit_value: material.value,
          expected_amount: 0,
          returned_amount: 0,
          taken_amount: 0,
          quotation_id: baseInfo.id,
          is_private: false,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ];
    });
  }, []);

  const handleNewExceptionalMaterial = useCallback(() => {
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
      created_at: new Date().toISOString(),
    };
    setOccasionalMaterials((prev) => [newOccMaterial, ...prev]);
  }, []);

  const handleNewExpenseItem = useCallback(() => {
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
      created_at: new Date().toISOString(),
    };
    setExpenses((prev) => [...prev, newService]);
  }, []);

  const handleNewBlankServiceItem = useCallback(() => {
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
      created_at: new Date().toISOString(),
    };
    setServiceItems((prev) => [newService, ...prev]);
  }, []);

  const handleSelectLabor = useCallback((labor: LaborsType) => {
    const newService: Partial<QuotationItemsType> = {
      type: "service",
      name: labor.name,
      unit_cost: labor.cost,
      unit_profit: labor.profit,
      unit_value: labor.value,
      unit: labor.unit,
      expected_amount: 0,
      taken_amount: 0,
      is_private: false,
      quotation_id: quotationData?.id,
      created_at: new Date().toISOString(),
    };
    setServiceItems((prev) => [newService, ...prev]);
  }, []);

  return {
    baseInfo,
    totals: {
      materialCost,
      materialValue,
      directCost,
      directValue,
      serviceCost,
      serviceValue,
    },
    thereIsChange,
    lists: {
      quoteMaterials,
      setQuoteMaterials,
      occasionalMaterials,
      setOccasionalMaterials,
      serviceItems,
      setServiceItems,
      expenses,
      setExpenses,
      itemsToDelete,
      setItemsToDelete,
      materialsToDelete,
      setMaterialsToDelete,
    },
    actions: {
      updateField,
      handleNewInventoryMaterial,
      handleNewExceptionalMaterial,
      handleNewExpenseItem,
      handleNewBlankServiceItem,
      handleSelectLabor,
    },
  };
}
