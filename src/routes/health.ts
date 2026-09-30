import type {FastifyInstance} from "fastify";
import {config} from "../config.js";
import {signer} from "../signing/index.js";
export async function healthRoutes(app:FastifyInstance){
 app.get("/health",async()=>({ok:true,service:"iSide-Server",storage:"backblaze-b2",bucket:config.B2_BUCKET,signer:{provider:signer.name,ready:signer.ready}}));
 app.get("/v1/capabilities",async()=>({storageReady:true,signingProvider:signer.name,signingReady:signer.ready,maxIpaBytes:config.MAX_IPA_BYTES}));
}
