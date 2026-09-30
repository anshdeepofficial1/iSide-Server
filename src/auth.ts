import type { FastifyReply,FastifyRequest } from "fastify";
import { timingSafeEqual } from "node:crypto";
import { config } from "./config.js";
function sameSecret(a:string,b:string){const aa=Buffer.from(a),bb=Buffer.from(b);return aa.length===bb.length&&timingSafeEqual(aa,bb)}
export async function requireApiToken(req:FastifyRequest,reply:FastifyReply){
 const h=req.headers.authorization||"";const token=h.startsWith("Bearer ")?h.slice(7):"";
 if(!token||!sameSecret(token,config.ISIDE_API_TOKEN))return reply.code(401).send({error:"Unauthorized"});
}
