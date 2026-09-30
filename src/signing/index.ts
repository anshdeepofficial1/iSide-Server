import {config} from "../config.js";
import {disabledSigner} from "./disabled.js";
import {externalSigner} from "./external.js";
export const signer=config.SIGNING_PROVIDER==="external"?externalSigner:disabledSigner;
