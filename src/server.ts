import cluster, { Worker } from "cluster";
import * as util from "util";
import * as http from "http";
import * as https from "https";
import * as fs from "fs";
import * as path from "path";
import pino from "pino";
import pinoHttp from "pino-http";
import * as process from "process";
import * as express from "express";
// CUSTOM
import * as iconfig from "./srv-configs/iconfig"
import { RegisterGlobalErrorHandlers } from "./log_intercept_all";
import * as cstLog from "./logger_pino";
//#region BACKEND_FRONTEND_COMMON_LIBS
import { AUPaths } from "../src-common/au_paths"
import { FELogMessage, FELogMessageType, IPrimitiveValues_FELogMEssage } from "../src-common/front_end_logger";
//#endregion

//#region NOTE_ON_JSON_SERIALIZATION
// Since JS does not have a good way of recursively converting a json string to
// an instance of a class, JSON serialization is done via the following method:
//
//    interface IPrimitiveValues_ClassName {
//       prop0: IPrimitiveValues_SubclassName,
//       prop1: number,
//       prop2: string | null
//       ...
//    }
//    class ClassName {
//       prop0: SubclassName;
//       prop1: number;
//       prop2: string | null;
//       
//       public ToPrimitiveValues(): IPrimitiveValues_ClassName { ... }
//       public static FromPrimitiveValues(v: IPrimitiveValues_ClassName): ClassName { ... }
//    }
//
// For converting such an object to json, use obj.ToPrimitiveValues, since the FromPrimitiveValues() method will ignore unknown fields
// Modifying the types of a class does become more difficult:
//    -> IPrimitiveValues_ClassName
//    -> Inside Class Body (member definitions)
//    -> Inside toString() method 
//    -> In FromPrimitiveValues static method
//
//#endregion

//#region INIT
const config: iconfig.IServerConfig = iconfig.LoadFromFile(path.resolve("./src/srv-configs/config.json"));
//#endregion

//#region LOGGING
let logger: pino.Logger;
let sourceLogger: pino.Logger;

function GetChildLogger(childSource: string): pino.Logger {
   return sourceLogger.child({ name: `\b \t${childSource}` });
}
// Initialize logger
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
   logger = GetChildLogger(name);

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

if (config.multithread) {
   if (cluster.isPrimary) {
      masterProcess();
   } else {
      childProcess()
   }
} else {
   logger.warn("Multithreading disabled.");
   childProcess();
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

   const app = express.default();
   app.use(express.json({ limit: '50mb' }));

   // LOG ALL REQUESTS
   app.use("/", (req, res, next) => {
      if (req.url.startsWith(AUPaths.LoggingMessage)) {
         next();
         return;
      }

      let urlStr: string = req.url;
      if (urlStr.length > 90)
         urlStr = urlStr.slice(0, 87) + "..."

      logger.info(`REQ FROM ${req.ip} | URL: ${urlStr}`);
      next();
   })

   // CLIENT REQUESTED LOGGER UID
   let loggerUID: number = 5000;
   app.get(AUPaths.LoggingUid, (req, res) => {
      res.send(loggerUID.toString());
      logger.info(`RESP TO ${req.ip} REQUEST -> ${loggerUID.toString()}`);
      loggerUID++;
   });

   // RECEIVED LOG MESSAGE FROM CLIENT
   app.post(AUPaths.LoggingMessage, (req, res) => {
      let logObj: IPrimitiveValues_FELogMEssage | null | undefined = req.body;
      if (typeof logObj == "object" && logObj != null && logObj != undefined) {
         try {
            let l: FELogMessage = FELogMessage.FromPrimitiveValues(logObj);
            switch (logObj.messageType) {
               case FELogMessageType.Info:
                  logger.info(l.toStringDefault());
                  break;
               case FELogMessageType.Warning:
                  logger.warn(l.toStringDefault());
                  break;
               case FELogMessageType.Error:
                  logger.warn(l.toStringDefault());
                  break;
               default:
                  throw new Error(`Unknown FELogMessageType: ${typeof l.messageType}`)
            }
         } catch (ex) {
            if (ex instanceof Error) {
               logger.warn(`Could not parse string to FELogMessage: reason: ${ex.message}`);
            } else {
               logger.warn(`Try catch did not catch error: ${typeof (ex)}`);
            }
         }
      } else {
         logger.info(`Received invalid data of type ${typeof logObj}`);
      }
      res.sendStatus(200);
   })


   //#region RETURN_FILES
   app.get("/", (_, res) => res.redirect("/index.html"));
   const fileMap = {
      public: path.resolve("./public/dist"),
      err404: path.resolve("./public/dist/404.html")
   }
   let tGetLast: number = 0; // used only for appending spaces to separate requests on the console
   app.get('/*', (req, res) => {
      let tNow: number = new Date().getTime();
      let tGetDelta = tNow - tGetLast;
      if (tGetDelta > 1000)
         console.log();
      tGetLast = tNow;

      let u: string = decodeURIComponent(req.url);
      if (u.includes("..")) {
         logger.warn(`Security warning: ${req.ip} may have attempted to escape out of the public directory; requested url: \"${req.url}\": `
            + `RAW HEADERS: ${JSON.stringify(req.rawHeaders)}`);
         res.end();
         return;
      }
      // u may at any point contain a chain of "../../", path.join will allow 
      // the request to escape out of fileMap.public in that case although it 
      // seems that double dots are stripped by express before this point ??
      let p: string = path.join(fileMap.public, u);
      if (!fs.existsSync(p) || !fs.statSync(p).isFile()) {
         logger.warn(`INVALID PATH REQ, NO SUCH MATCHING FILE: "${p}"`);
         p = fileMap.err404;
         logger.debug(`Responding With --> "${p}"`);
      }
      res.sendFile(p);
   });
   //#endregion

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
      const pkey: string = fs.readFileSync(path.join(".", "sslcert", "localhost.key"), "utf-8");
      const cert: string = fs.readFileSync(path.join(".", "sslcert", "localhost.cert"), "utf-8");
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