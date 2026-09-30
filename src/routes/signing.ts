import {randomUUID} from "node:crypto";
import type {FastifyInstance} from "fastify";
import {z} from "zod";
import {config} from "../config.js";
import {requireApiToken} from "../auth.js";
import {storage} from "../storage.js";
import {loadSession,saveSession,type SessionRecord} from "../session.js";
import {signer} from "../signing/index.js";

const createSchema=z.object({
 app:z.object({
  name:z.string().optional(),bundleId:z.string().optional(),version:z.string().optional(),build:z.string().optional(),minIOS:z.string().optional(),fileName:z.string().optional(),size:z.number().optional()
 }).passthrough(),
 updateSource:z.unknown().optional().nullable()
});
const completeSchema=z.object({sessionId:z.string().uuid()});

async function processSession(id:string){
 const session=await loadSession(id);
 try{
  const result=await signer.sign(session);
  if(result.status==="ready"){
   session.status="ready";
   session.signing=result.signing||null;
   session.installUrl=result.installUrl||null;
   session.downloadUrl=await storage.presignDownload(result.outputKey);
   session.error=null;
  }else if(result.status==="waiting_for_signer"){
   session.status="waiting_for_signer";session.error=result.message;
  }else{
   session.status="failed";session.error=result.error;
  }
 }catch(e:any){session.status="failed";session.error=e?.message||"Signing failed."}
 await saveSession(session);
}

export async function signingRoutes(app:FastifyInstance){
 app.post("/v1/signing/session",{preHandler:requireApiToken},async(req,reply)=>{
  const parsed=createSchema.safeParse(req.body);
  if(!parsed.success)return reply.code(400).send({error:"Invalid request.",details:parsed.error.flatten()});
  const id=randomUUID(),inputKey=`sessions/${id}/input.ipa`,outputKey=`sessions/${id}/signed.ipa`,now=new Date().toISOString();
  const session:SessionRecord={id,status:"awaiting_upload",createdAt:now,updatedAt:now,app:parsed.data.app,updateSource:parsed.data.updateSource??null,inputKey,outputKey,signing:null,installUrl:null,downloadUrl:null,error:null};
  await saveSession(session);
  const upload=await storage.presignUpload(inputKey);
  return {sessionId:id,uploadUrl:upload.url,uploadMethod:"PUT",uploadHeaders:upload.headers,expiresIn:config.UPLOAD_URL_TTL_SECONDS};
 });

 app.post("/v1/signing/complete",{preHandler:requireApiToken},async(req,reply)=>{
  const parsed=completeSchema.safeParse(req.body);
  if(!parsed.success)return reply.code(400).send({error:"sessionId is required."});
  let session:SessionRecord;
  try{session=await loadSession(parsed.data.sessionId)}catch{return reply.code(404).send({error:"Signing session not found."})}
  let head;
  try{head=await storage.head(session.inputKey)}catch{return reply.code(400).send({error:"IPA upload has not completed yet."})}
  const size=Number(head.ContentLength||0);
  if(!size)return reply.code(400).send({error:"Uploaded IPA is empty."});
  if(size>config.MAX_IPA_BYTES){session.status="failed";session.error="IPA exceeds server size limit.";await saveSession(session);return reply.code(413).send({error:session.error,maxBytes:config.MAX_IPA_BYTES})}
  session.status="processing";session.error=null;await saveSession(session);
  void processSession(session.id);
  return {status:"processing",sessionId:session.id,signerReady:signer.ready};
 });

 app.get("/v1/signing/status",{preHandler:requireApiToken},async(req,reply)=>{
  const id=z.string().uuid().safeParse((req.query as any)?.sessionId);
  if(!id.success)return reply.code(400).send({error:"sessionId is required."});
  let session:SessionRecord;
  try{session=await loadSession(id.data)}catch{return reply.code(404).send({error:"Signing session not found."})}
  return {sessionId:session.id,status:session.status,installUrl:session.installUrl||undefined,downloadUrl:session.downloadUrl||undefined,signing:session.signing||undefined,error:session.error||undefined,app:session.app};
 });
}
