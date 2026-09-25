"use client";
import annotationPlugin from "chartjs-plugin-annotation";
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
import { convertUnixToHoursAndMinutes } from "@/utils/time";
import { Limit } from "@/types/limit";
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  annotationPlugin,
);
export const ChartLine = ({
  measurements,
  type,
  yLimits,
  tempLimits,
  showLimitLane,
}: {
  showLimitLane: boolean;
  tempLimits: Limit;
  measurements: Measurement[];
  type: "temperature" | "humidity";
  yLimits: {
    min: number | undefined;
    max: number | undefined;
  };
}) => {
  // LÄMPÖTILAN RAJA-ARVOT
  const temperatureLimits = tempLimits || {
    maxTemperature: null,
    minTemperature: null,
  };
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
      ...(type === "temperature" && {
        y: {
          min: yLimits.min,
          max: yLimits.max,
        },
      }),
    },
    plugins: {
      annotation: {
        // Jos showLimitLane on false, palautetaan tyhjä olio {}, joka tyhjentää viivat kaaviosta
        annotations:
          type === "temperature" && showLimitLane
            ? {
                ...(temperatureLimits.minTemperature && {
                  min: {
                    type: "line" as const,
                    yMin: temperatureLimits.minTemperature,
                    yMax: temperatureLimits.minTemperature,
                    borderColor: "rgb(5, 16, 177)",
                    borderWidth: 2,
                  },
                }),
                ...(temperatureLimits.maxTemperature && {
                  max: {
                    type: "line" as const,
                    yMin: temperatureLimits.maxTemperature,
                    yMax: temperatureLimits.maxTemperature,
                    borderColor: "rgb(255, 99, 132)",
                    borderWidth: 2,
                  },
                }),
              }
            : {},
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
