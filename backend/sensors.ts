import { dynamodb } from "./client";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { CustomError, handleError } from "./error";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

const sensorsTableName = process.env.sensorsTableName;
const headers = {
  "Content-Type": "application/json",
};
// /SENSORS ____ GET
export const getSensors = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  try {
    if (!sensorsTableName) {
      throw new CustomError(400, {
        message: "Virhe ympäristomuuttujien kanssa",
      });
    }
    const output = await dynamodb.send(
      new ScanCommand({
        TableName: sensorsTableName,
      }),
    );
    const foundSensors =
      (output.Items as {
        sensorId: string;
        sensorName: string;
        measurementDates: Set<string>;
      }[]) || [];
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(foundSensors, (key, value) =>
        value instanceof Set ? Array.from(value) : value,
      ),
    };
  } catch (error) {
    return handleError(error);
  }
};
