import { useEffect, type Dispatch, type StateUpdater } from "preact/hooks";

export function SelectSupplierModal({
  suppliers,
  selectSupplier,
  closeModal,
  cleanError,
}: {
  suppliers: { id: string; name: string }[];
  selectSupplier: Dispatch<StateUpdater<{ id: string; name: string } | null>>;
  closeModal: () => void;
  cleanError: () => void;
}) {
  return (
    <div
      className={"absolute top-0 left-0 w-full h-full p-32 bg-[#000000AA] z-20"}
    >
      <div
        className={
          "bg-blue-50 rounded-md p-4 border flex flex-col gap-2 items-baseline"
        }
      >
        <strong className={"pb-2 block"}>Selecione um fornecedor</strong>
        {suppliers.map((supplier) => (
          <div
            key={supplier.id}
            className={"flex cursor-pointer hover:brightness-90 rounded-md"}
            onClick={() => {
              selectSupplier({ name: supplier.name, id: supplier.id });
              cleanError();
              closeModal();
            }}
          >
            <span className={"rounded-md p-2 bg-white font-semibold shadow"}>
              {supplier.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
