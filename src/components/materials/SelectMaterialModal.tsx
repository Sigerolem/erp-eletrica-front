import type { MaterialsType } from "./Materials";

export function SelectMaterialModal({
  materials,
  selectMaterial,
  closeModal,
  cleanError,
}: {
  materials: MaterialsType[];
  selectMaterial: (material: MaterialsType) => void;
  closeModal: () => void;
  cleanError: () => void;
}) {
  return (
    <div
      className={"absolute top-0 left-0 w-full h-full p-32 bg-[#000000AA] z-20"}
      onClick={closeModal}
    >
      <div
        className={
          "bg-blue-50 rounded-md p-4 border flex flex-col gap-2 items-baseline"
        }
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <strong className={"pb-2 block"}>Selecione um material</strong>
        {materials.map((material) => (
          <div
            key={material.id}
            className={"flex cursor-pointer hover:brightness-90 rounded-md"}
            onClick={() => {
              selectMaterial(material);
              cleanError();
              closeModal();
            }}
          >
            <span className={"rounded-md p-2 bg-white font-semibold shadow"}>
              {material.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
