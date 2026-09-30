import {storage} from "./storage.js";
export type SessionStatus="awaiting_upload"|"processing"|"waiting_for_signer"|"ready"|"failed";
export type SigningInfo={authority?:string;status?:string;expiresAt?:string};
export type SessionRecord={
 id:string;status:SessionStatus;createdAt:string;updatedAt:string;
 app:{name?:string;bundleId?:string;version?:string;build?:string;minIOS?:string;fileName?:string;size?:number};
 updateSource?:unknown;inputKey:string;outputKey:string;signing?:SigningInfo|null;installUrl?:string|null;downloadUrl?:string|null;error?:string|null;
};
const metaKey=(id:string)=>`sessions/${id}/meta.json`;
export async function saveSession(s:SessionRecord){s.updatedAt=new Date().toISOString();await storage.putJson(metaKey(s.id),s)}
export async function loadSession(id:string){return storage.getJson<SessionRecord>(metaKey(id))}
