import { saveLimits } from "@/api/limits";
import { Limit } from "@/types/limit";
import { useState } from "react";

export const SettingsModal = ({
  onClose,
  yLimits,
  changeYLimits,
  tempLimits,
  saveTempLimits,
}: {
  saveTempLimits: (limits: Limit) => void;
  tempLimits: Limit;
  onClose: () => void;
  yLimits: { min: number | undefined; max: number | undefined };
  changeYLimits: (field: "min" | "max", value: string) => void;
}) => {
  const [temperatureLimits, setTemperatureLimits] = useState(
    tempLimits || { maxTemperature: undefined, minTemperature: undefined },
  );
  const [chartY, setChartY] = useState(yLimits);
  const updateLimits = async () => {
    if (!temperatureLimits.maxTemperature || !temperatureLimits.minTemperature)
      return;
    // VIEDÄÄN YLEMMÄLLE KOMPONENTILLE TIEDOT
    saveTempLimits(temperatureLimits);
  };
  const changeTemperatureLimits = async (
    type: "maxTemperature" | "minTemperature",
    value: string,
  ) => {
    setTemperatureLimits((previousLimits) => ({
      ...previousLimits,
      [type]: value,
    }));
  };
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
              onChange={(e) => {
                setChartY((previousChartYLimits) => ({
                  ...previousChartYLimits,
                  ["minTemperature"]: e.target.value,
                }));
                changeYLimits("min", e.target.value);
              }}
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
              onChange={(e) => {
                setChartY((previousChartYLimits) => ({
                  ...previousChartYLimits,
                  ["maxTemperature"]: e.target.value,
                }));
                changeYLimits("max", e.target.value);
              }}
              value={chartY.max}
              placeholder="auto"
              type="number"
              name=""
              className="p-2 border border-zinc-200 rounded-xl rounded-tl-none w-full placeholder:italic outline-none hover:ring-1 hover:ring-amber-500 focus:ring-1 focus:ring-amber-500 transition text-center"
            />
          </div>
        </div>
      </div>
      <div className="border border-zinc-100 p-2 rounded-xl shadow-xs mt-2">
        <p className="text-zinc-500 text-xs uppercase">
          Muokkaa sensorin raja-arvoja
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
              onChange={(e) =>
                changeTemperatureLimits("minTemperature", e.target.value)
              }
              value={String(temperatureLimits.minTemperature)}
              placeholder="---"
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
              onChange={(e) =>
                changeTemperatureLimits("maxTemperature", e.target.value)
              }
              value={String(temperatureLimits.maxTemperature)}
              placeholder="---"
              type="number"
              name=""
              className="p-2 border border-zinc-200 rounded-xl rounded-tl-none w-full placeholder:italic outline-none hover:ring-1 hover:ring-amber-500 focus:ring-1 focus:ring-amber-500 transition text-center"
            />
          </div>
          <button
            onClick={updateLimits}
            className="mt-2 text-emerald-700 cursor-pointer hover:text-emerald-900 transition "
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
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </button>
        </div>
      </div>
    </dialog>
  );
};
