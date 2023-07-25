"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterGlobalErrorHandlers = void 0;
const cluster_1 = __importDefault(require("cluster"));
const process = require("process");
function RegisterGlobalErrorHandlers(logger) {
    let header = () => {
        return `Process (PID: ${process.pid}, THR_IS_MASTER: ${cluster_1.default.isPrimary}) FORCED TO CLOSE.`;
    };
    let log = (str) => {
        if (logger != null) {
            try {
                logger.error(str);
            }
            catch (ex) {
                if (ex instanceof Error)
                    console.log(`Could not log fatal error message via logger; REASON: ${ex.message} ${ex.stack}`);
                else
                    console.log(`EX object unknown: ${ex}`);
            }
        }
        console.log(str);
    };
    let exit = async (immediate = false, code = 1) => {
        if (!cluster_1.default.isPrimary)
            process.disconnect();
        // Without this delay, some loggers MAY NOT CREATE the log file and get to write the error to it.
        const waitBeforeExit = 1000;
        if (!immediate) {
            log(`Exitting in ${waitBeforeExit} ms...`);
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        process.exit(code);
    };
    //#region SIGNALS
    // Triggred when signals are received
    let criticalSignals = [
        "SIGKILL",
        "SIGABRT",
        "SIGTERM",
        "SIGINT",
        "SIGQUIT",
        "SIGFPE",
        "SIGILL",
        "SIGSEGV",
        "SIGUSR1",
        "SIGUSR2"
    ];
    let signalListener = (sig) => {
        log(`${header()} Reason: Received signal ${sig}`);
        exit();
    };
    for (let i = 0; i < criticalSignals.length; i++)
        process.on(criticalSignals[i], signalListener);
    //#endregion
    let exitListener = (code) => {
        log(`${header()} Reason: EXIT (code: ${code})`);
        exit(code === 0, code); // no wait, exit status ok
    };
    process.on("exit", exitListener);
    // Triggered on unchaughtException; NodeJS.UncaughtExceptionOrigin <==> "unchaughtException" | "unhandledRejection";
    let uncaughtExceptionListener = (error, origin) => {
        let msg = `${header()} Reason: [Origin: ${origin}] Unchaught Exception ${error.message}`;
        if (error.stack != null && error.stack.trim().length > 0)
            msg = `${msg}; STACK\n${error.stack}`;
        else
            msg = `${msg}; STACK: NO STACK (${error.stack})`;
        log(msg);
        exit();
    };
    process.on("uncaughtException", uncaughtExceptionListener);
    // Triggered error for promises that don't have rejection handlers
    let unhandledRejectionListener = (reason, promise) => {
        log(`${header()} Reason: Unhandled Rejection ${reason}, promise: ${promise}`);
        exit();
    };
    process.on("unhandledRejection", unhandledRejectionListener);
}
exports.RegisterGlobalErrorHandlers = RegisterGlobalErrorHandlers;
//# sourceMappingURL=log_intercept_all.js.map