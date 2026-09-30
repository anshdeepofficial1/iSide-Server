import "dotenv/config";
import { z } from "zod";

const schema=z.object({
  PORT:z.coerce.number().int().positive().default(8787),
  HOST:z.string().default("0.0.0.0"),
  ISIDE_API_TOKEN:z.string().min(24),
  FRONTEND_ORIGIN:z.string().default("http://localhost:3000"),
  B2_ENDPOINT:z.string().url(),
  B2_REGION:z.string().min(1),
  B2_BUCKET:z.string().min(1),
  B2_KEY_ID:z.string().min(1),
  B2_APPLICATION_KEY:z.string().min(1),
  UPLOAD_URL_TTL_SECONDS:z.coerce.number().int().min(60).max(3600).default(900),
  DOWNLOAD_URL_TTL_SECONDS:z.coerce.number().int().min(60).max(3600).default(900),
  MAX_IPA_BYTES:z.coerce.number().int().positive().default(2147483648),
  SIGNING_PROVIDER:z.enum(["disabled","external"]).default("disabled"),
  SIGNER_URL:z.string().optional().default(""),
  SIGNER_TOKEN:z.string().optional().default("")
});
const parsed=schema.safeParse(process.env);
if(!parsed.success){console.error("Invalid environment configuration:",parsed.error.flatten().fieldErrors);process.exit(1)}
export const config={...parsed.data,origins:parsed.data.FRONTEND_ORIGIN.split(",").map(x=>x.trim()).filter(Boolean)};
