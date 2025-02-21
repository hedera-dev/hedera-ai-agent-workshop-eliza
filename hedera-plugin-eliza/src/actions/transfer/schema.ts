import { z } from 'zod';

export const transferDataParamsSchema = z.object({
    amount: z.string(),
    accountId: z.string(),
});
