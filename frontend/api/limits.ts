"use server";

import { Limit } from "@/types/limit";

const API_URL = process.env.API_URL;
const authorizationKey = process.env.authorizationKey;

export const getSensorsLimits = async (sensorId: string) => {
  try {
    if (!API_URL) return [];
    const response = await fetch(`${API_URL}/limits?sensorId=${sensorId}`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    return [];
  }
};

export const saveLimits = async (sensorId: string, limits: Limit) => {
  if (!sensorId) return;
  if (!limits) return;
  if (!authorizationKey) return;

  const output = await fetch(`${API_URL}/limits/save`, {
    method: "POST",
    headers: {
      authorization: authorizationKey,
    },
    body: JSON.stringify({
      maxTemperature: Number(limits.maxTemperature),
      minTemperature: Number(limits.minTemperature),
      sensorId: sensorId,
    }),
  });
  console.log(
    JSON.stringify({
      maxTemperature: Number(limits.maxTemperature),
      minTemperature: Number(limits.minTemperature),
      sensorId: sensorId,
    }),
  );
  console.log(await output.json());
};
