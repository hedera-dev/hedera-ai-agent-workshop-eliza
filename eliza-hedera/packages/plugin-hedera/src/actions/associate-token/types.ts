import { z } from "zod";
import {hederaAssociateTokenParamsSchema} from "./schema.ts";

export type HederaAssociateTokenParams = z.infer<
    typeof hederaAssociateTokenParamsSchema
>;
