"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cluster_1 = __importDefault(require("cluster"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const process = __importStar(require("process"));
const express = require("express");
// CUSTOM
const log_intercept_all_1 = require("./log_intercept_all");
const cstLog = __importStar(require("./logger_pino"));
//// BACKEND+FRONTEND COMMON LIBS
//import * as demo from "../src-common/demo";
//for (let i = 0; i < 100; i++) {
//   console.log(demo.GetRandomInt(0, 100));
//}
//#region INIT
const basePath = path.resolve(".");
if (!fs.existsSync(basePath)) {
    throw new Error(`basePath does not exist: ${basePath}`);
}
//#endregion
//#region LOGGING
let logger;
const sourceLogger = cstLog.CreateLogger(`/logs/server.log`, "debug", "\b \tSRCNOTSET");
logger = (() => {
    let name = "MAIN";
    if (cluster_1.default.isWorker) {
        if (process.env.wid != null)
            name = `CHILD-${process.env.wid}`;
        else
            name = `CHILD`;
    }
    return sourceLogger.child({ name: `\b \t${name}` });
})();
// Check logger
if (logger == null
    || typeof logger.info !== "function"
    || typeof logger.warn !== "function"
    || typeof logger.error !== "function") {
    throw new Error(`Logger not created properly ${logger}`);
}
(0, log_intercept_all_1.RegisterGlobalErrorHandlers)(logger); // ERROS THAT OCCUR UP TO THIS POINT ARE NOT GUARANTEED TO BE CAUGHT
//#endregion
console.log("logging this instead of running anything");
//if (require.main === module) {
//   if (cluster.isPrimary) {
//      masterProcess();
//   } else {
//      childProcess()
//   }
//} else {
//   childProcess()
//}
function masterProcess() {
    let workerMap = new Map();
    let numCPUs = 1; // or require("os").cpus().length;
    logger.info(`Creating ${numCPUs} ${numCPUs === 1 ? "child" : "children"}`);
    for (let i = 0; i < numCPUs; i++) {
        let w = cluster_1.default.fork({ wid: i });
        workerMap.set(w, i);
    }
    cluster_1.default.on("exit", function (worker, code, signal) {
        let wid = workerMap.get(worker);
        if (wid === undefined) {
            throw new Error("Undefined wid property on worker");
        }
        logger.info(`Worker ${wid} died`);
        setTimeout(() => {
            cluster_1.default.fork({ wid: wid });
        }, 500);
    });
}
function childProcess() {
    if (logger === null) {
        throw new Error("Logger is null");
    }
    const TEST_PORT = 3002;
    const fileMap = {
        public: path.join(basePath, "public", "dist"),
        err404: path.join(basePath, "public", "dist", "404.html")
    };
    const app = express();
    //app.use(pinoHttp({ logger }));
    const logResp = (url, p) => {
        logger.debug(`"${url}" --> \n   --> Responding With --> "${p}"`);
    };
    let tGetLast = 0; // used only for appending spaces to separate requests on the console
    app.get('/*', (req, res) => {
        let tNow = new Date().getTime();
        let tGetDelta = tNow - tGetLast;
        if (tGetDelta > 1000)
            console.log();
        tGetLast = tNow;
        let p = path.join(fileMap.public, req.url);
        if (!fs.existsSync(p) || !fs.statSync(p).isFile()) {
            logger.warn(`INVALID PATH REQ: "${p}"`);
            p = fileMap.err404;
        }
        logResp(req.url, p);
        res.sendFile(p);
    });
    app.listen(TEST_PORT, () => {
        logger.info(`Server is running on port ${TEST_PORT}`);
    });
}
//# sourceMappingURL=server.js.map