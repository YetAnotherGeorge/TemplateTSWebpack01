import cluster, { Worker } from "cluster";
import { default as process } from "process";



export interface ILogger {
   error: (str: string) => any
}

export function RegisterGlobalErrorHandlers(logger: ILogger | null | undefined) {
   let header = (): string => {
      return `Process (PID: ${process.pid}, THR_IS_MASTER: ${cluster.isPrimary}) FORCED TO CLOSE.`;
   };
   let log = (str: string): void => {
      //logger?.error(str);
      console.log(str);
   };
   let exit = async (immediate: boolean = false, code: number = 1): Promise<never> => {
      if (!cluster.isPrimary)
         process.disconnect();

      // Without this delay, some loggers MAY NOT CREATE the log file and get to write the error to it.
      const waitBeforeExit = 1000;
      if (!immediate) {
         log(`Exiting in ${waitBeforeExit} ms...`);
         await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      process.exit(code);
   };

   //#region SIGNALS
   // Triggered when signals are received
   let criticalSignals: NodeJS.Signals[] = [
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
   let signalListener: NodeJS.SignalsListener = (sig: NodeJS.Signals): void => {
      log(`${header()} Reason: Received signal ${sig}`);
      exit();
   };
   for (let i = 0; i < criticalSignals.length; i++)
      process.on(criticalSignals[i], signalListener);
   //#endregion

   let exitListener: NodeJS.ExitListener = (code: number): void => {
      log(`${header()} Reason: EXIT (code: ${code})`);
      exit(code === 0, code); // no wait, exit status ok
   };
   process.on("exit", exitListener);

   // Triggered on unchaughtException; NodeJS.UncaughtExceptionOrigin <==> "unchaughtException" | "unhandledRejection";
   let uncaughtExceptionListener: NodeJS.UncaughtExceptionListener = (error: Error, origin: NodeJS.UncaughtExceptionOrigin): void => {
      let msg = `${header()} Reason: [Origin: ${origin}] Uncaught Exception ${error.message}`;
      if (error.stack != null && error.stack.trim().length > 0)
         msg = `${msg}; STACK\n${error.stack}`;
      else
         msg = `${msg}; STACK: NO STACK (${error.stack})`;
      log(msg);
      exit();
   };
   process.on("uncaughtException", uncaughtExceptionListener);

   // Triggered error for promises that don't have rejection handlers
   let unhandledRejectionListener: NodeJS.UnhandledRejectionListener = (reason: unknown, promise: Promise<any>): void => {
      log(`${header()} Reason: Unhandled Rejection ${reason}, promise: ${promise}`);
      exit();
   };
   process.on("unhandledRejection", unhandledRejectionListener);
}
