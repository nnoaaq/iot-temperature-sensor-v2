import { CustomError, handleError } from "./error";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import * as z from "zod";
import { dynamodb } from "./client";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
const limitsTableName = process.env.limitsTableName;
const correctAuthorizationKey = process.env.correctAuthorizationKey;

const headers = {
  "Content-Type": "application/json",
};

// /LIMITS/SAVE ___ POST
export const saveLimits = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  try {
    if (
      !event.headers.authorization ||
      event.headers.authorization !== correctAuthorizationKey
    ) {
      throw new CustomError(401, {
        message: "Et ole tervetullut.",
      });
    }
    if (!limitsTableName) {
      throw new CustomError(400, {
        message: "Virhe ympäristömuuttujien kanssa.",
      });
    }
    const requiredBodyFields = z.object({
      sensorId: z.string(),
      maxTemperature: z.number(),
      minTemperature: z.number(),
    });
    const limit = JSON.parse(event.body as string);
    const validatedFields = requiredBodyFields.parse(limit); // TARKISTETAAN ZODILLA ONKO KAIKKI VAADITUT KENTÄT
    await dynamodb.send(
      new PutCommand({
        TableName: limitsTableName,
        Item: {
          sensorId: validatedFields.sensorId,
          maxTemperature: validatedFields.maxTemperature,
          minTemperature: validatedFields.minTemperature,
        },
      }),
    );
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(validatedFields),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log("error", error);
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
// /LIMITS ________ GET
export const getLimitsFromSensor = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  try {
    if (!limitsTableName) {
      throw new CustomError(400, {
        message: "Virhe ympäristömuuttujien kanssa.",
      });
    }
    const sensorId = event.queryStringParameters?.sensorId; // VAADITTU JOKAISESSA PYYNNÖSSÄ
    if (!sensorId) {
      throw new CustomError(400, { message: "Sensorin tunniste vaaditaan" });
    }

    const foundLimits = await dynamodb.send(
      new QueryCommand({
        TableName: limitsTableName,
        KeyConditionExpression: "sensorId = :sensorId",
        ExpressionAttributeValues: {
          ":sensorId": sensorId,
        },
      }),
    );
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(foundLimits.Items),
    };
  } catch (error) {
    return handleError(error);
  }
};
