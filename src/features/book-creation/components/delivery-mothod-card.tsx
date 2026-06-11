import { DeliveryMethodCardProps } from "../types";

interface Icon {
  width: number;
  height: number;
}

export const DeliveryMethodCard = ({
  method,
  selectedPages,
  selectedFormat,
  onSelect,
  prices,
  disabled,
}: DeliveryMethodCardProps & { disabled?: boolean }) => {
  const methodPricing = prices?.find((p) => p.deliveryType === method.apiType);
  const tier = methodPricing?.pageTiers
    ?.sort((a, b) => a.pageLimit - b.pageLimit)
    .find((t) => t.pageLimit >= selectedPages);

  const totalPrice = tier?.price;
  const displayPrice = totalPrice !== undefined ? `$${totalPrice}` : "---";

  return (
    <button
      onClick={() => !disabled && onSelect(method.id)}
      disabled={disabled}
      className={`relative h-[280px] rounded-[24px] flex flex-col items-center justify-center py-6 px-[20px] transition-all ${
        disabled
          ? "opacity-50 cursor-not-allowed border-gray-200 bg-gray-50"
          : selectedFormat === method.id
            ? "border-2 border-primary bg-primary/10"
            : "border-2 border-[#e1e3e5] bg-white hover:border-primary/50"
      }`}
    >
      <div className="flex flex-col gap-[16px] items-center w-full max-w-[300px]">
        <div className="bg-primary rounded-[50px] p-[8px] flex items-center justify-center">
          <div className="w-[32px] h-[32px] flex items-center justify-center">
            <DownloadIcon width={32} height={32} />
          </div>
        </div>

        <div className="flex flex-col gap-[4px] items-center text-center">
          <h5 className="text-lg font-semibold font-inter text-[#0a0a0a]">
            {method.title}
          </h5>
          <p className="text-sm font-normal font-inter text-[#4a5565]">
            {method.subtitle}
          </p>
          <p className="text-xl font-bold font-inter text-[#ff8b36] mt-2">
            {displayPrice}
          </p>
        </div>
      </div>

      {selectedFormat === method.id && (
        <div className="absolute inset-0 rounded-[24px] border-2 border-[#ff8b36] pointer-events-none" />
      )}
      {method.popular && (
        <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2">
          <div className="bg-[#ff8b36] text-white text-sm font-semibold px-4 py-2 rounded-lg whitespace-nowrap">
            Most Popular
          </div>
        </div>
      )}
    </button>
  );
};

const DownloadIcon = ({ width = 42, height = 42 }: Icon) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 42 42"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21 0.75C10.1875 0.75 1.5 9.4375 1.5 20.25C1.5 31.0625 10.1875 39.75 21 39.75C31.8125 39.75 40.5 31.0625 40.5 20.25C40.5 9.4375 31.8125 0.75 21 0.75ZM21 36.75C12.0625 36.75 4.5 29.1875 4.5 20.25C4.5 11.3125 12.0625 3.75 21 3.75C29.9375 3.75 37.5 11.3125 37.5 20.25C37.5 29.1875 29.9375 36.75 21 36.75Z"
      fill="white"
    />
    <path d="M20.25 11.25H21.75V24.75H20.25V11.25Z" fill="white" />
    <path
      d="M26.4375 19.3125L25.6875 20.0625L21 14.625L16.3125 20.0625L15.5625 19.3125L21 12.5625L26.4375 19.3125Z"
      fill="white"
    />
    <path
      d="M28.5 27.75H13.5C13.0625 27.75 12.75 27.4375 12.75 27C12.75 26.5625 13.0625 26.25 13.5 26.25H28.5C28.9375 26.25 29.25 26.5625 29.25 27C29.25 27.4375 28.9375 27.75 28.5 27.75Z"
      fill="white"
    />
  </svg>
);
