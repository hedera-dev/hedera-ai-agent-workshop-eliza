import { z } from "zod";

export const pendingAirdropsParams = z.object({
    accountId: z.string().nullable(),
});
