"use server";
const API_URL = process.env.API_URL;

export const getSensors = async () => {
  try {
    if (!API_URL) return [];
    const response = await fetch(`${API_URL}/sensors`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    return [];
  }
};
