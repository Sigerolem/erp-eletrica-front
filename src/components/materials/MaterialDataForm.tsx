import { Input } from "@elements/Input";

export function MaterialDataForm() {
  return (
    <form onSubmit={onFormSubmit} className={"flex flex-col gap-2 w-ful"}>
      <Input
        label="Nome do material"
        name="name"
        onBlur={(e) => {
          if (
            e.currentTarget.value.length > 3 &&
            e.currentTarget.value.length <= 100
          ) {
            setValidationErrors((prev) => {
              delete prev.name;
              return { ...prev };
            });
          }
        }}
        errors={validationErrors}
      />
      <Input
        label="Codigo de barras"
        name="barcode"
        onBlur={(e) => {
          if (e.currentTarget.value.length <= 100) {
            setValidationErrors((prev) => {
              delete prev.barcode;
              return { ...prev };
            });
          }
        }}
      />
      <div className={"flex gap-4"}>
        <Input
          label="Quantidade mínima"
          name="minAmount"
          onBlur={handleChangeAmount}
          errors={validationErrors}
        />
        <Input
          label="Quantidade ideal"
          name="idealAmount"
          onBlur={handleChangeAmount}
          errors={validationErrors}
        />
      </div>
      <div className={"flex gap-4"}>
        <Input
          label="Tamanho da embalagem"
          name="pkgSize"
          value={pkgSize}
          onBlur={handleChangePkgSize}
          errors={validationErrors}
        />
        <Input
          label="Lucro"
          name="profit"
          value={profit}
          onBlur={handleChangeProfit}
        />
      </div>
      <div className={"flex gap-4"}>
        <Input
          label="Custo [R$]"
          name="cost"
          value={cost}
          onBlur={handleChangeCost}
          errors={validationErrors}
        />
        <Input label="Valor [R$]" name="value" value={value} disabled />
      </div>
      <div className={"flex gap-4 justify-between items-end"}>
        <div>
          <Input
            name="supplier"
            label="Fornecedor"
            onFocus={(e) => {
              e.currentTarget.blur();
              setIsSupModalOpen(true);
            }}
            className={"cursor-pointer"}
            value={supplierSelected === null ? "" : supplierSelected.name}
            errors={validationErrors}
          />
        </div>
        <button
          className={
            "bg-blue-800 p-2 max-w-2xl rounded-md font-semibold text-white"
          }
          type={"submit"}
        >
          Salvar
        </button>
      </div>
    </form>
  );
}
