import type { CustomersType } from "./Customers";

export function SelectCustomerModal({
  customers,
  selectCustomer,
  closeModal,
  cleanError,
}: {
  customers: CustomersType[];
  selectCustomer: (customer: CustomersType) => void;
  closeModal: () => void;
  cleanError: () => void;
}) {
  return (
    <section className={"absolute top-0 left-0 w-full h-full"}>
      <div
        className={"fixed top-0 left-0 w-full h-full p-32 bg-[#000000AA] z-20"}
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
          <strong className={"pb-2 block"}>Selecione um cliente</strong>
          {customers.map((customer) => (
            <div
              key={customer.id}
              className={"flex cursor-pointer hover:brightness-90 rounded-md"}
              onClick={() => {
                selectCustomer(customer);
                cleanError();
                closeModal();
              }}
            >
              <span className={"rounded-md p-2 bg-white font-semibold shadow"}>
                {customer.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
