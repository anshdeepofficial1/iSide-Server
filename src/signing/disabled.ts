import type {SigningProvider} from "./types.js";
export const disabledSigner:SigningProvider={
 name:"disabled",ready:false,
 async sign(){return {status:"waiting_for_signer",message:"Storage/session backend is connected, but no authorized native signing provider is configured."}}
};
