"use client";
import { Sensor } from "@/types/sensor";
// YKSITTÄINEN INPUT COMPONENTTI
export const SelectComponent = ({
  sensors,
  selectedSensor,
  selectedDay,
  type,
  onChange,
}: {
  selectedSensor: string;
  selectedDay: string;
  sensors: Sensor[];
  type: "sensor" | "day";
  onChange: (type: "sensor" | "day", value: string) => void;
}) => {
  const sensorsMap = new Map(
    sensors.map((sensor) => [sensor.sensorId, sensor]),
  );
  return (
    <div>
      {sensors && type === "sensor" && (
        <div>
          <label
            htmlFor="selectedSensor"
            className="block translate-y-2 translate-x-2 bg-white w-fit text-zinc-500 uppercase text-xs"
          >
            Valitse sensori
          </label>
          <select
            value={selectedSensor}
            onChange={(e) => {
              onChange("sensor", e.target.value);
            }}
            name="selectedSensor"
            className="p-2 border border-zinc-300 rounded-xl rounded-tl-none outline-none cursor-pointer hover:ring-1 hover:ring-amber-500 focus:ring-1 focus:ring-amber-500 w-full"
          >
            {sensors &&
              sensors.map((sensor) => (
                <option key={sensor.sensorId} value={sensor.sensorId}>
                  {sensor.sensorName} - #{sensor.sensorId}
                </option>
              ))}
          </select>
        </div>
      )}
      {sensors && type === "day" && (
        <div>
          <label
            htmlFor="selectecDay"
            className="block translate-y-2 translate-x-2 bg-white w-fit text-zinc-500 uppercase text-xs"
          >
            Valitse päivä
          </label>
          <select
            value={selectedDay}
            onChange={(e) => {
              onChange("day", e.target.value);
            }}
            name="selectecDay"
            className="p-2 border border-zinc-300 rounded-xl rounded-tl-none outline-none cursor-pointer hover:ring-1 hover:ring-amber-500 focus:ring-1 focus:ring-amber-500 w-full"
          >
            <option value="all">Kaikki päivät</option>
            {sensors &&
              sensorsMap.get(selectedSensor)?.measurementDates.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
          </select>
        </div>
      )}
    </div>
  );
};
