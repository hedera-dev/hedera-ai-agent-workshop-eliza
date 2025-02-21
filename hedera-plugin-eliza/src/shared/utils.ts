import { HederaNetworkType } from "./types.ts";
import { z } from "zod";

export function convertTimestampToUTC(timestamp: string): string {
    const [seconds, nanos] = timestamp.split(".").map(Number);
    const milliseconds = Math.round(nanos / 1_000_000); // Convert nanoseconds to milliseconds
    return new Date(seconds * 1000 + milliseconds).toISOString();
}

export const generateHashscanUrl = (
    txHash: string,
    networkType: HederaNetworkType
) => {
    return `https://hashscan.io/${networkType}/tx/${txHash}`;
};

export function convertStringToTimestamp(input: string): number {
    const date = new Date(input);

    if (isNaN(date.getTime())) {
        throw new Error("Invalid date format");
    }

    const timestamp = date.getTime();

    return parseFloat((timestamp / 1000).toFixed(6));
}

// Custom preprocess to handle string "true"/"false" to boolean values
export const castToBoolean = z.preprocess((val) => {
    if (typeof val === 'string') {
        if (val.toLowerCase() === 'true') return true;
        if (val.toLowerCase() === 'false') return false;
        else return false; // false is default
    }
    return val; // Return the value as is if it's not a string
}, z.boolean());

// Custom preprocess to handle LLMs extracting mistakes
// Sometimes null values are returned as strings and require parsing
export const castToNull = (value: any) => (value === "null" ? null : value);

