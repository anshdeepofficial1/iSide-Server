import {S3Client,PutObjectCommand,GetObjectCommand,HeadObjectCommand} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {config} from "./config.js";

const client=new S3Client({region:config.B2_REGION,endpoint:config.B2_ENDPOINT,credentials:{accessKeyId:config.B2_KEY_ID,secretAccessKey:config.B2_APPLICATION_KEY}});

export const storage={
 async presignUpload(key:string){
  const command=new PutObjectCommand({Bucket:config.B2_BUCKET,Key:key,ContentType:"application/octet-stream"});
  const url=await getSignedUrl(client,command,{expiresIn:config.UPLOAD_URL_TTL_SECONDS});
  return {url,headers:{"content-type":"application/octet-stream"}};
 },
 async presignDownload(key:string){
  return getSignedUrl(client,new GetObjectCommand({Bucket:config.B2_BUCKET,Key:key}),{expiresIn:config.DOWNLOAD_URL_TTL_SECONDS});
 },
 async putJson(key:string,value:unknown){
  await client.send(new PutObjectCommand({Bucket:config.B2_BUCKET,Key:key,Body:JSON.stringify(value),ContentType:"application/json"}));
 },
 async getJson<T>(key:string):Promise<T>{
  const out=await client.send(new GetObjectCommand({Bucket:config.B2_BUCKET,Key:key}));
  if(!out.Body)throw new Error("Object body missing");
  return JSON.parse(await out.Body.transformToString()) as T;
 },
 async head(key:string){return client.send(new HeadObjectCommand({Bucket:config.B2_BUCKET,Key:key}));}
};
