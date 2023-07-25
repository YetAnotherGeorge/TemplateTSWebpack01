import pino from "pino";
import { PrettyOptions } from "pino-pretty";


/**
 * Note, name: `\b \t${VALUE}` can be used to nicely align the log messages since the 
 * log level is not padded by default by pino
 * 
 * @param path It's assumed the directory in which the log file will reside exists
 * @returns pino.Logegr. For changing logging source, ch = logger.child({name: "NEW_NAME"})
 */
export function CreateLogger(path: string, level: string, name: string): pino.Logger {

   // Create Transports - FILE OUTPUT
   let targetFile: pino.TransportTargetOptions<Record<string, any>> = {
      target: "pino/file",
      options: { destination: path },
      level: level
   };
   // Create Transports - PRETTY CONSOLE OUTPUT (TODO: Align LOG LEVEL)
   let prettyOptions: PrettyOptions = {
      colorize: true,
      ignore: "hostname,pid"
   }
   let targetConsole: pino.TransportTargetOptions<Record<string, any>> = {
      target: "pino-pretty",
      level: level,
      options: prettyOptions
   };
   // Transports -> Transports[]
   let transportSettings: pino.TransportMultiOptions<Record<string, any>> = {
      targets: [targetConsole, targetFile]
   };
   // Transports[] -> LoggerOptions

   let loggerOptions: pino.LoggerOptions = {
      name: name,
      level: level,
      crlf: false,
      enabled: true,
      timestamp: pino.stdTimeFunctions.isoTime,
      messageKey: "msg",
      errorKey: "err",
      nestedKey: undefined,
      transport: transportSettings
   };


   let logger: pino.Logger = pino(loggerOptions);
   return logger;
}