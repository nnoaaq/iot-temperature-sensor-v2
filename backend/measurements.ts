import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { CustomError, handleError } from "./error";
import * as z from "zod";
import { dynamodb } from "./client";
import { PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { convertUnixToDate } from "./utilts";
const headers = {
  "Content-Type": "application/json",
};
const measurementsTableName = process.env.measurementsTableName;
const sensorsTableName = process.env.sensorsTableName;
const correctAuthorizationKey = process.env.correctAuthorizationKey;

// /MEASUREMENTS/NEW _____ POST
export const createNewMeasurement = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  try {
    if (!measurementsTableName || !sensorsTableName)
      throw new CustomError(400, {
        message: "Virhe ympäristomuuttujien kanssa",
      });

    if (
      !event.headers.authorization ||
      event.headers.authorization !== correctAuthorizationKey
    ) {
      throw new CustomError(401, {
        message: "Et ole tervetullut.",
      });
    }
    const requiredBodyFields = z.object({
      sensorId: z.string(),
      sensorName: z.string(),
      temperature: z.number(),
      humidity: z.number(),
      timeStamp: z.number(),
    });
    const newMeasurement = JSON.parse(event.body as string);
    const validatedFields = requiredBodyFields.parse(newMeasurement); // TARKISTETAAN ZODILLA ONKO KAIKKI VAADITUT KENTÄT

    // MEASUREMENTS-TAULU
    await dynamodb.send(
      // PUTCOMMAND = KORVAA AIEMMAN TIEDON (SAMA SENSORID JA TIMESTAMP)
      new PutCommand({
        TableName: measurementsTableName,
        Item: validatedFields,
      }),
    );

    // SENSORS-TAULU
    const output = await dynamodb.send(
      new UpdateCommand({
        TableName: sensorsTableName,
        Key: {
          sensorId: validatedFields.sensorId,
        },
        UpdateExpression:
          "SET sensorName = :sensorName ADD measurementDates :date",
        ExpressionAttributeValues: {
          ":date": new Set([convertUnixToDate(validatedFields.timeStamp)]),
          ":sensorName": validatedFields.sensorName,
        },
        ReturnValues: "ALL_NEW",
      }),
    );
    return {
      headers,
      statusCode: 200,
      body: JSON.stringify({
        createdMeasurement: validatedFields,
        measurementDays: Array.from(
          output.Attributes?.measurementDates.values() || [],
        ),
      }),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // puuttuvat kentät
      let missingFields = error.issues.map((issue) => {
        return issue.path;
      });
      return handleError(
        new CustomError(400, { message: `Tarkista kentät: ${missingFields}` }),
      );
    }
    return handleError(error);
  }
};

// /MEASUREMENTS/ ________ GET
// VIIMEISET 7 PÄIVÄÄ ANNETULTA SENSORILTA
export const getMeasurementsBySensor = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  try {
    if (!measurementsTableName)
      throw new CustomError(400, {
        message: "Virhe ympäristomuuttujien kanssa",
      });
    const sensorId = event.queryStringParameters?.sensorId; // VAADITTU JOKAISESSA PYYNNÖSSÄ
    let command;
    if (!sensorId) {
      throw new CustomError(400, { message: "Sensorin tunniste vaaditaan" });
    }

    const { startTime, endTime } = event.queryStringParameters || {};
    if (!isNaN(Number(startTime)) && !isNaN(Number(endTime))) {
      // HALUTAAN HAKEA TIETTY PÄIVÄ
      command = new QueryCommand({
        TableName: measurementsTableName,
        KeyConditionExpression:
          "sensorId = :sensorId AND #timeStamp BETWEEN :startTime AND :endTime",
        ExpressionAttributeNames: {
          "#timeStamp": "timeStamp",
        },
        ExpressionAttributeValues: {
          ":sensorId": sensorId,
          ":startTime": Number(startTime),
          ":endTime": Number(endTime),
        },
      });
    } else {
      // HALUTAAN HAKEA VIIMEISET 7 PÄIVÄÄ
      const timeStampLimit = Math.floor(Date.now() / 1000) - 7 * (60 * 60 * 24); // 7 PÄIVÄÄ NYKYHETKESTÄ SEKUNTEINA
      command = new QueryCommand({
        TableName: measurementsTableName,
        KeyConditionExpression:
          "sensorId = :sensorId AND #timeStamp >= :timeStampLimit",
        ExpressionAttributeNames: { "#timeStamp": "timeStamp" },
        ExpressionAttributeValues: {
          ":sensorId": sensorId,
          ":timeStampLimit": timeStampLimit,
        },
      });
    }
    const foundMeasurements = await dynamodb.send(command);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(foundMeasurements.Items), // AINA VÄHINTÄÄN TAULUKKO
    };
  } catch (error) {
    return handleError(error);
  }
  return {};
};
