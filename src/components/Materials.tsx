import { useEffect, useState } from "preact/hooks";
import type { SuppliersType } from "./Suppliers";
import { CreateMaterialModal } from "./CreateMaterialModal";

type MaterialsType = {
  id: string;
  name: string;
  current_amount: number;
  min_amount: number;
  ideal_amount: number;
  reserved_amount: number;
  avg_cost: string;
  value: number;
  supplier: SuppliersType;
};

export function Materials() {
  const [materials, setMaterials] = useState<MaterialsType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/materials", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: "Bearer " + localStorage.getItem("apiToken"),
      },
    })
      .then((response) => {
        if (response.status !== 200) {
          throw new Error("Erro no fetch");
        } else {
          return response.json();
        }
      })
      .then((data: MaterialsType[]) => {
        setMaterials(data);
      })
      .catch((error) => console.log(error));
  }, []);

  return (
    <main>
      {isModalOpen ? (
        <CreateMaterialModal
          closeModal={() => {
            setIsModalOpen(false);
          }}
        />
      ) : null}
      <div>
        <h1>Materials Page</h1>
        <p>This is where you can manage your materials.</p>
        <table
          className={"w-full table-auto border-separate border-spacing-y-2 p-4"}
        >
          <thead className={"gap-4"}>
            <tr className={"bg-amber-950"}>
              <th className={"border py-2"}>Material / Fornecedor</th>
              <th className={"border py-2"}>
                Estoque <br />
                (atual / mín)
              </th>
              <th className={"border py-2"}>Reservado</th>
              <th className={"border py-2"}>
                Preços <br />
                (custo / venda)
              </th>
            </tr>
          </thead>
          <tbody className={"gap-4 border-separate border-spacing-y-4"}>
            {materials.map((material) => (
              <tr key={material.id}>
                <td className={"py-2 bg-amber-300 p-2"}>
                  <p>{material.name}</p>
                  <p className={"text-green-700"}>
                    {material.supplier?.name ?? ""}
                  </p>
                </td>
                <td className={"py-2 bg-amber-300 p-2"}>
                  <p>{material.current_amount}</p>
                  <p>{material.min_amount}</p>
                </td>
                <td className={"py-2 bg-amber-300 p-2"}>
                  {material.reserved_amount}
                </td>
                <td className={"py-2 bg-amber-300 p-2"}>
                  <p>{material.avg_cost}</p>
                  <p>{material.value}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
