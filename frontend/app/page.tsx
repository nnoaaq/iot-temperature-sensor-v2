"use server";

import { getSensors } from "@/api/sensors";
import { ParentComponent } from "@/components/SensorParent";
import { Sensor } from "@/types/sensor";

export default async function Home() {
  // HAKEE SENSORIT SIVULLE TULLESSA
  const sensors: Sensor[] = await getSensors();

  return <ParentComponent initialSensors={sensors} />;
}
