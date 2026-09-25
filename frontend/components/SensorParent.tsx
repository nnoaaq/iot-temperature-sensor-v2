"use client";

import { Sensor } from "@/types/sensor";
import { use, useEffect, useMemo, useState } from "react";
import { SelectComponent } from "./Input";
import { Measurement } from "@/types/measurement";
import {
  getMeasurementsFromDay,
  getMeasurementsFromSensor,
} from "@/api/measurements";
import { ChartLine } from "./Chart";
import { convertUnixToDay } from "@/utils/time";
import { SettingsModal } from "./Modal";
import { getSensorsLimits, saveLimits } from "@/api/limits";
import { Limit } from "@/types/limit";

// TILANHALLINTA TÄSSÄ PARENT-KOMPONENTISSA
export const ParentComponent = ({
  initialSensors,
}: {
  initialSensors: Sensor[];
}) => {
  // SENSORIN RAJA-ARVOT
  const [sensorLimitsCache, setSensorLimitsCache] = useState<
    Map<string, Limit>
  >(() => {
    const map = new Map();
    return map;
    0;
  });

  // USE STATE Y-RAJA-ARVOILLE
  const [chartY, setChartY] = useState<{
    min: number | undefined;
    max: number | undefined;
  }>({
    min: undefined,
    max: undefined,
  });
  // MODAALIN TILA
  const [showModal, setShowModal] = useState(false);
  // VALITUN SENSORIN STATE
  // DEFAULT == ENSIMMÄINEN LÖYTYNYT SENSORI (RANDOM.. (nice..(ei ole)))
  const [selectedSensor, setSelectedSensor] = useState(
    initialSensors?.[0].sensorId || "",
  );
  // VALITUN PÄIVÄN STATE
  // DEFAULT == KAIKKI
  const [selectedDay, setSelectedDay] = useState("all");

  // NÄYTETTÄVÄN SENSORIN RAJA-ARVOT
  const temperatureLimitsForSensor = sensorLimitsCache.get(selectedSensor);

  // CACHETETAAN MITTAUSTULOKSET
  // DEFAULT == TYHJÄ MAP
  const [measurementsCache, setMeasurementsCache] = useState<
    Map<string, Measurement[]>
  >(new Map());

  // KUN VALITTU SENSORI MUUTTUU -- VARMENNETAAN RAJA-ARVOT -- SULJETAAN MODAALI -- NOLLATAAN Y-ARVOT
  useEffect(() => {
    setShowModal(false);
    setChartY({ min: undefined, max: undefined });
    const fetch = async () => {
      const limits = sensorLimitsCache.get(selectedSensor);
      if (limits) return; // ON JO OLEMASSA (UUSIN TIETO (PÄIVITETÄÄN STATEA HETI KUN NE MUUTTUU))
      const foundLimits = await getSensorsLimits(selectedSensor);
      if (foundLimits[0]) {
        // RAJA-ARVOJA LÖYTYNYT
        setSensorLimitsCache((previouslyCachedLimits) => {
          const map = new Map(previouslyCachedLimits);
          map.set(selectedSensor, foundLimits[0]);
          return map;
        });
      }
    };
    fetch();
  }, [selectedSensor]);

  // KUN VALITTU SENSORI TAI PÄIVÄ MUUTTUU -- VARMENNETAAN CACHE
  useEffect(() => {
    const fetch = async () => {
      const sensorMeasurements = measurementsCache.get(selectedSensor);
      if (!sensorMeasurements) {
        // EI OLLENKAAN TIETOJA KYSEISELLE SENSORILLE
        // HAETAAN VIIMEISET 7 PÄIVÄÄ
        const foundMeasurements: Measurement[] =
          await getMeasurementsFromSensor(selectedSensor);
        if (foundMeasurements.length == 0) return;
        setMeasurementsCache((previouslyCachedMeasurements) => {
          const map = new Map(previouslyCachedMeasurements);
          map.set(selectedSensor, foundMeasurements);
          return map;
        });
      }
      // SENSOR OLEMASSA
      if (selectedDay == "all") return;
      const dateAlreadyCached = sensorMeasurements?.some((measurement) => {
        return convertUnixToDay(measurement.timeStamp) == selectedDay;
      });
      if (!dateAlreadyCached) {
        const [day, month, year] = selectedDay.split(".");
        const startTime = Math.floor(
          new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
            0,
            0,
            0,
          ).getTime() / 1000,
        );
        const endTime = startTime + 24 * 60 * 60;
        const foundMeasurements: Measurement[] = await getMeasurementsFromDay(
          selectedSensor,
          startTime,
          endTime,
        );
        if (foundMeasurements.length == 0) return;
        if (!sensorMeasurements) return;
        setMeasurementsCache((previouslyCachedMeasurements) => {
          const map = new Map(previouslyCachedMeasurements);
          map.set(selectedSensor, [
            ...sensorMeasurements,
            ...foundMeasurements,
          ]);
          return map;
        });
      }
    };
    fetch();
  }, [selectedSensor, selectedDay]);
  // NÄYTETTÄVÄT TIEDOT
  const filteredMeasurements = measurementsCache
    .get(selectedSensor)
    ?.filter((measurement) => {
      if (selectedDay == "all") return measurement;
      if (convertUnixToDay(measurement.timeStamp) == selectedDay)
        return measurement;
    })
    .sort((a, b) => a.timeStamp - b.timeStamp);

  return (
    <div className="p-2 m-2 border border-zinc-200 rounded-xl shadow-xs">
      <div className="flex justify-between relative">
        <h1 className="text-amber-500 text-lg">Mittaustulokset</h1>
        <button
          onClick={(e) => setShowModal(true)}
          className="cursor-pointer focus:text-amber-500 hover:text-amber-500 focus:text-amber-500  outline-none"
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
              d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
            />
          </svg>
        </button>
        {showModal && (
          <SettingsModal
            saveTempLimits={async (limits: Limit) => {
              // TALLENNETAAN TIETOKANTAAN
              await saveLimits(selectedSensor, limits); // TIETOKANTA
              setSensorLimitsCache((previouslyCachedLimits) => {
                const map = new Map(previouslyCachedLimits);
                map.set(selectedSensor, limits);
                return map;
              });
            }}
            tempLimits={temperatureLimitsForSensor!}
            onClose={() => setShowModal(false)}
            yLimits={chartY}
            changeYLimits={(field: "max" | "min", value: string) => {
              console.log("Ok");
              setChartY((previousLimits) => ({
                ...previousLimits,
                [field]: !value ? undefined : Number(value),
              }));
            }}
          />
        )}
      </div>
      <SelectComponent
        onChange={(type: "sensor" | "day", value: string) => {
          setSelectedDay("all");
          if (type === "sensor") setSelectedSensor(value);
          if (type === "day") setSelectedDay(value);
        }}
        sensors={initialSensors}
        type="sensor"
        selectedDay={selectedDay}
        selectedSensor={selectedSensor}
      />
      <SelectComponent
        onChange={(type: "sensor" | "day", value: string) => {
          setSelectedDay("all");
          if (type === "sensor") setSelectedSensor(value);
          if (type === "day") setSelectedDay(value);
        }}
        sensors={initialSensors}
        type="day"
        selectedDay={selectedDay}
        selectedSensor={selectedSensor}
      />
      <ChartLine
        yLimits={chartY}
        measurements={filteredMeasurements || []}
        type="temperature"
        selectedDay={selectedDay}
        selectedSensor={selectedSensor}
      />
      <ChartLine
        yLimits={chartY}
        measurements={filteredMeasurements || []}
        type="humidity"
        selectedDay={selectedDay}
        selectedSensor={selectedSensor}
      />
    </div>
  );
};
