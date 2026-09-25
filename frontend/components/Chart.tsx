"use client";

import { Measurement } from "@/types/measurement";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { convertUnixToDay, convertUnixToHoursAndMinutes } from "@/utils/time";
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
);
export const ChartLine = ({
  measurements,
  type,
  selectedSensor,
  selectedDay,
  yLimits,
}: {
  measurements: Measurement[];
  type: "temperature" | "humidity";
  selectedSensor: string;
  selectedDay: string;
  yLimits: {
    min: number | undefined;
    max: number | undefined;
  };
}) => {
  // USESTATE MEASUREMENTSEILLE
  // sensorId:[{},{},{}] __ SENSORID TAKANA KYSEISEN SENSORIN MITTAUKSET
  const [measurementsCache, setMeasurementsCache] = useState<
    Map<string, Measurement[]>
  >(() => {
    // LUODAAN MAP
    const map = new Map();
    if (!measurements) return map;
    measurements.forEach((measurement) => {
      // EI OLE VIELÄ NÄKYNYT MAPISSA MITTAUSTULOKSEN SENSORIA
      if (!map.has(measurement.sensorId)) {
        // LUODAAN SINNE TAULUKKOA
        map.set(measurement.sensorId, []);
      }
      // LISÄTÄÄN MITTAUSTULOS OIKEAN SENSORIN ALLE
      map.get(measurement.sensorId).push(measurement);
    });
    return map;
  });
  // PÄIVITETÄÄN CACHEA KUN MEASUREMENTS MUUTTUU > TULEE LISÄÄ TIETOA
  useEffect(() => {
    setMeasurementsCache((previouslyCachedMeasurements) => {
      const map = new Map(previouslyCachedMeasurements);
      measurements.forEach((measurement) => {
        const measurements = map.get(measurement.sensorId) || []; // EI OLEMASSA == TYHJÄ TAULUKKO
        const alreadyInCache = measurements.some(
          (m) => m.timeStamp === measurement.timeStamp,
        );
        if (!alreadyInCache) {
          map.set(measurement.sensorId, [...measurements, measurement]);
        }
      });
      return map;
    });
  }, [measurements]);

  // KAAVION ASETUKSET
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          maxTicksLimit: 5,
          font: {
            size: 10,
          },
        },
      },
      y: {
        min: yLimits.min,
        max: yLimits.max,
      },
    },
  };
  // KAAVION DATA
  const chartData = () => {
    return {
      labels: measurements?.map((measurement) => {
        return convertUnixToHoursAndMinutes(measurement.timeStamp);
      }),
      datasets: [
        {
          backgroundColor:
            type == "temperature"
              ? "oklch(76.9% 0.188 70.08)"
              : "oklch(48.8% 0.243 264.376)",
          borderColor:
            type == "temperature"
              ? "oklch(76.9% 0.188 70.08)"
              : "oklch(48.8% 0.243 264.376)",
          label: type == "temperature" ? "Lämpötila °C" : "Kosteus %",
          data: measurements?.map((measurement) => {
            return measurement[type];
          }),
          tension: 0.3,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHitRadius: 25,
        },
      ],
    };
  };
  return (
    <div className="h-100 w-full">
      <Line options={chartOptions} data={chartData()} />
    </div>
  );
};
