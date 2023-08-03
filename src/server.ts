import cluster, { Worker } from "cluster";
import * as http from "http";
import * as https from "https";
import * as fs from "fs";
import * as path from "path";
import pino from "pino";
import pinoHttp from "pino-http";
import * as process from "process";
import express, { Request, Response, Application } from 'express';
// CUSTOM
import * as iconfig from "./srv-configs/iconfig.ts"
import { RegisterGlobalErrorHandlers } from "./log_intercept_all";
import * as cstLog from "./logger_pino";
//// BACKEND+FRONTEND COMMON LIBS
//import * as demo from "../src-common/demo";
//for (let i = 0; i < 100; i++) {
//   console.log(demo.GetRandomInt(0, 100));
//}


//#region INIT
const basePath: string = path.resolve(".");
if (!fs.existsSync(basePath)) {
   throw new Error(`basePath does not exist: ${basePath}`);
}
const config: iconfig.IServerConfig = iconfig.LoadFromFile(path.resolve("./src/srv-configs/config.json"));
//#endregion

//#region LOGGING
let logger: pino.Logger;
let sourceLogger: pino.Logger | null;

(() => {
   let p: string = path.join(path.resolve("./logs/server.log"));

   if (!fs.existsSync(path.dirname(p)))
      throw new Error(`Logs folder does not exist: ${path.dirname(p)}`);
   sourceLogger = cstLog.CreateLogger(p, "debug", "\b \tSRCNOTSET");

   let name = "MAIN";
   if (!cluster.isPrimary) {
      console.log(`NOT MAIN: WID: ${process.env.wid}`);
      if (process.env.wid != null)
         name = `CHILD-${process.env.wid}`;
      else
         name = `CHILD`;
   }
   if (sourceLogger == null) {
      throw new Error("Source Logger null");
   }
   logger = sourceLogger.child({ name: `\b \t${name}` });

   // Check logger
   if (logger == null
      || typeof logger.info !== "function"
      || typeof logger.warn !== "function"
      || typeof logger.error !== "function") {
      throw new Error(`Logger not created properly ${logger}`);
   }
})();

RegisterGlobalErrorHandlers(logger); // ERROS THAT OCCUR UP TO THIS POINT ARE NOT GUARANTEED TO BE CAUGHT
//#endregion


if (cluster.isPrimary) {
   masterProcess();
} else {
   childProcess()
}
function masterProcess() {
   let workerMap: Map<Worker, number> = new Map<Worker, number>();

   let numCPUs = 1; // or require("os").cpus().length;
   logger.info(`Creating ${numCPUs} ${numCPUs === 1 ? "child" : "children"}`)
   for (let i = 0; i < numCPUs; i++) {
      logger.info(`Creating worker with Worker ID (WID): ${i}`);
      let w: Worker = cluster.fork({ wid: i });
      workerMap.set(w, i);
   }
   cluster.on("exit", function (worker, code, signal) {
      let wid: number | undefined = workerMap.get(worker);
      if (wid === undefined) { throw new Error("Undefined wid property on worker"); }
      logger.info(`Worker ${wid} died`);
      setTimeout(() => {
         cluster.fork({ wid: wid });
      }, 500);
   });
}
function childProcess() {
   if (logger === null) { throw new Error("Logger is null"); }
   const fileMap = {
      public: path.join(basePath, "public", "dist"),
      err404: path.join(basePath, "public", "dist", "404.html")
   }

   const app = express();
   //app.use(pinoHttp({ logger }));

   const logResp = (url: string, p: string) => {
      logger.debug(`"${url}" --> \n   --> Responding With --> "${p}"`);
   }

   app.get("/", (req, res) => res.redirect("/index.html"))

   let tGetLast: number = 0; // used only for appending spaces to separate requests on the console
   app.get('/*', (req, res) => {
      let tNow: number = new Date().getTime();
      let tGetDelta = tNow - tGetLast;
      if (tGetDelta > 1000)
         console.log();
      tGetLast = tNow;

      let p: string = path.join(fileMap.public, req.url);
      if (!fs.existsSync(p) || !fs.statSync(p).isFile()) {
         logger.warn(`INVALID PATH REQ: "${p}"`);
         p = fileMap.err404;
      }
      logResp(req.url, p);
      res.sendFile(p);
   });

   //#region EXPOSE_HTTP
   try {
      const httpServer = http.createServer(app);
      httpServer.listen(config.portHttp);
      logger.info(`Express app exposed to port ${config.portHttp} (HTTP)`);
   } catch (ex) {
      if (ex instanceof Error) {
         logger.error(`Could not start http server - Reason: ${ex.message}`);
      } else {
         throw ex;
      }
   }
   //#endregion

   //#region EXPOS_HTTPS
   try {
      const pkey: string = fs.readFileSync(path.join(basePath, "sslcert", "localhost.key"), "utf-8");
      const cert: string = fs.readFileSync(path.join(basePath, "sslcert", "localhost.cert"), "utf-8");
      const httpsConfig: https.ServerOptions = {
         key: pkey,
         cert: cert
      };
   
      const httpsServer = https.createServer(httpsConfig, app);
      httpsServer.listen(config.portHttps);
      logger.info(`Express app exposed to port ${config.portHttps} (HTTPS)`);
   } catch (ex) {
      if (ex instanceof Error) {
         logger.error(`Could not start https server - Reason: ${ex.message}`);
      } else {
         throw ex;
      }
   }
   //#endregion
}