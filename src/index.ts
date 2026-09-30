import Fastify from "fastify";
import cors from "@fastify/cors";
import {config} from "./config.js";
import {healthRoutes} from "./routes/health.js";
import {signingRoutes} from "./routes/signing.js";

const app=Fastify({logger:true,bodyLimit:1024*1024});
await app.register(cors,{
 origin:(origin,cb)=>{if(!origin||config.origins.includes(origin))return cb(null,true);cb(new Error("Origin not allowed"),false)},
 methods:["GET","POST","OPTIONS"],
 allowedHeaders:["content-type","authorization"]
});
await app.register(healthRoutes);
await app.register(signingRoutes);
app.setErrorHandler((error,_req,reply)=>{app.log.error(error);reply.code(500).send({error:"Internal server error."})});
await app.listen({port:config.PORT,host:config.HOST});
