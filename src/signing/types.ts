import type {SessionRecord,SigningInfo} from "../session.js";
export type SignResult=
 | {status:"ready";outputKey:string;installUrl?:string;signing?:SigningInfo|null}
 | {status:"waiting_for_signer";message:string}
 | {status:"failed";error:string};
export interface SigningProvider{readonly name:string;readonly ready:boolean;sign(session:SessionRecord):Promise<SignResult>}
