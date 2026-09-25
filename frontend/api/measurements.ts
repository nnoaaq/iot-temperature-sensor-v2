"use server";
const API_URL = process.env.API_URL;
export const getMeasurementsFromSensor = async (sensorId: string) => {
  try {
    console.log("HAETTU TIETOKANNASTA getMeasurementFromSensor");

    if (!API_URL) return [];
    if (!sensorId) return [];
    const response = await fetch(
      `${API_URL}/measurements?sensorId=${sensorId}`,
      {
        cache: "no-cache",
      },
    );
    return await response.json();
  } catch (error) {
    return [];
  }
};

export const getMeasurementsFromDay = async (
  sensorId: string,
  startTime: number,
  endTime: number,
) => {
  try {
    console.log("HAETTU TIETOKANNASTA getMeasurementsFromDay");
    if (!API_URL) return [];
    if (!sensorId) return [];
    const response = await fetch(
      `${API_URL}/measurements?sensorId=${sensorId}&startTime=${startTime}&endTime=${endTime}`,
      {
        cache: "no-cache",
      },
    );
    return await response.json();
  } catch (error) {
    return [];
  }
};
