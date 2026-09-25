import { useState } from "react";

export const SettingsModal = ({
  onClose,
  yLimits,
  changeYLimits,
}: {
  onClose: () => void;
  yLimits: { min: number | undefined; max: number | undefined };
  changeYLimits: (field: "min" | "max", value: string) => void;
}) => {
  const [chartY, setChartY] = useState(yLimits);
  return (
    <dialog
      open={true}
      closedby="any"
      onClose={onClose}
      className="z-99 absolute top-0 right-0 left-auto border border-zinc-200 p-2 rounded-xl w-full max-w-md modal-open"
    >
      <div className="flex justify-between border-b border-zinc-200 pb-2">
        <h2 className="text-amber-500 text-lg">Asetukset</h2>
        <button
          onClick={onClose}
          className="cursor-pointer focus:text-amber-500 hover:text-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div className="border border-zinc-100 p-2 rounded-xl shadow-xs mt-2">
        <p className="text-zinc-500 text-xs uppercase">
          Muokkaa kaavion näytettäviä arvoja
        </p>
        <div className="flex gap-2">
          <div>
            <label
              htmlFor="yMin"
              className="text-zinc-400 uppercase text-xs block bg-white w-fit translate-y-2 translate-x-1"
            >
              Min °C
            </label>
            <input
              onChange={(e) => changeYLimits("min", e.target.value)}
              value={chartY.min}
              placeholder="auto"
              type="number"
              name=""
              className="p-2 border border-zinc-200 rounded-xl rounded-tl-none w-full placeholder:italic outline-none hover:ring-1 hover:ring-amber-500 focus:ring-1 focus:ring-amber-500 transition text-center"
            />
          </div>
          <div>
            <label
              htmlFor="yMax"
              className="text-zinc-400 uppercase text-xs block bg-white w-fit translate-y-2 translate-x-1"
            >
              Max °C
            </label>
            <input
              onChange={(e) => changeYLimits("max", e.target.value)}
              value={chartY.max}
              placeholder="auto"
              type="number"
              name=""
              className="p-2 border border-zinc-200 rounded-xl rounded-tl-none w-full placeholder:italic outline-none hover:ring-1 hover:ring-amber-500 focus:ring-1 focus:ring-amber-500 transition text-center"
            />
          </div>
        </div>
      </div>
    </dialog>
  );
};
