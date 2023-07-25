"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateLogger = void 0;
const pino_1 = __importDefault(require("pino"));
/**
 * Note, name: `\b \t${VALUE}` can be used to nicely align the log messages since the
 * log level is not padded by default by pino
 *
 * @param path It's assumed the directory in which the log file will reside exists
 * @returns pino.Logegr. For changing logging source, ch = logger.child({name: "NEW_NAME"})
 */
function CreateLogger(path, level, name) {
    // Create Transports - FILE OUTPUT
    let targetFile = {
        target: "pino/file",
        options: { destination: path },
        level: level
    };
    // Create Transports - PRETTY CONSOLE OUTPUT (TODO: Align LOG LEVEL)
    let prettyOptions = {
        colorize: true,
        ignore: "hostname,pid"
    };
    let targetConsole = {
        target: "pino-pretty",
        level: level,
        options: prettyOptions
    };
    // Transports -> Transports[]
    let transportSettings = {
        targets: [targetConsole, targetFile]
    };
    // Transports[] -> LoggerOptions
    let loggerOptions = {
        name: name,
        level: level,
        crlf: false,
        enabled: true,
        timestamp: pino_1.default.stdTimeFunctions.isoTime,
        messageKey: "msg",
        errorKey: "err",
        nestedKey: undefined,
        transport: transportSettings
    };
    let logger = (0, pino_1.default)(loggerOptions);
    return logger;
}
exports.CreateLogger = CreateLogger;
//# sourceMappingURL=logger_pino.js.map