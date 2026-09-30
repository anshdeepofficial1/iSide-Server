import {config} from "../config.js";
import {storage} from "../storage.js";
import type {SigningProvider} from "./types.js";
export const externalSigner:SigningProvider={
 name:"external",
 ready:Boolean(config.SIGNER_URL&&config.SIGNER_TOKEN),
 async sign(session){
  if(!config.SIGNER_URL||!config.SIGNER_TOKEN)return {status:"failed",error:"External signer is not configured."};
  const inputUrl=await storage.presignDownload(session.inputKey);
  const outputUpload=await storage.presignUpload(session.outputKey);
  const res=await fetch(config.SIGNER_URL.replace(/\/$/,"")+"/v1/sign",{method:"POST",headers:{"content-type":"application/json","authorization":"Bearer "+config.SIGNER_TOKEN},body:JSON.stringify({sessionId:session.id,app:session.app,inputUrl,output:{url:outputUpload.url,method:"PUT",headers:outputUpload.headers}})});
  const body:any=await res.json().catch(()=>({}));
  if(!res.ok)return {status:"failed",error:String(body.error||"External signer failed.")};
  if(body.status==="waiting_for_user")return {status:"waiting_for_signer",message:String(body.message||"Signing requires user action.")};
  if(body.status!=="ready")return {status:"failed",error:String(body.error||"External signer returned an invalid status.")};
  return {status:"ready",outputKey:session.outputKey,installUrl:typeof body.installUrl==="string"?body.installUrl:undefined,signing:body.signing||null};
 }
};
