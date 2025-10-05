import { useEffect } from "preact/hooks";

export function CreateMaterialModal({
  closeModal,
}: {
  closeModal: () => void;
}) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      console.log(e.key);
      if (e.key == "Escape") {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  return (
    <section
      className={"absolute top-0 left-0 w-full h-full p-8 bg-[#000000AA]"}
      onClick={() => {
        closeModal();
      }}
    >
      <div
        className={"bg-red-600 p-4 opacity-100"}
        onClickCapture={(e) => e.stopPropagation()}
      >
        <h2>modal de criação</h2>
      </div>
    </section>
  );
}
