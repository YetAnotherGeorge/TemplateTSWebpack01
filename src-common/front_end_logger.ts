// WARNING: THIS FILE WILL BE SHARED BY BOTH NODE.JS SERVER AND FRONTEND

import { AJAX_RESULT_OK, AJAX_RESULT_ERR, AJAX_GET, AJAX_POST } from "./ajax_custom"


export interface IPrimitiveValues_FELogMEssage {
   timestamp: number,
   source: string, 
   messageType: number, 
   message: string
}
export enum FELogMessageType { Info, Warning, Error };
/**
 * Frontend log message
 */
export class FELogMessage {
   public readonly timestamp: number;
   public readonly source: string;
   public readonly messageType: FELogMessageType;
   public readonly message: string;

   public get Timestamp(): number { return this.timestamp; }
   public get TimestampLocaleISO(): string {
      let s: string = new Date(this.timestamp).toLocaleString("sv");
      s = s + '.' + (this.timestamp % 1000).toString();
      return s;
   }
   public get Source(): string { return this.source; }
   public get MessageType(): FELogMessageType { return this.messageType; }
   public get MessageTypeString() { return FELogMessageType[this.messageType]; }
   public get Message() { return this.message; }

   constructor(timestamp: number, source: string, messageType: FELogMessageType, message: string) {
      this.timestamp = timestamp;
      this.source = source;
      this.messageType = messageType;
      this.message = message;
   }
   public toStringDefault(): string {
      let typeStr: string = "";
      switch (this.messageType) {
         case FELogMessageType.Info: typeStr = "INFO"; break;
         case FELogMessageType.Warning: typeStr = "WARN"; break;
         case FELogMessageType.Error: typeStr = " ERR"; break;
      }

      let msg: string = `[${this.TimestampLocaleISO}]: [${this.source}]: [${typeStr}]: ${this.message}`;
      return msg;
   }
   public toJson(): string {
      return JSON.stringify(this);
   }

   public static FromArgs(args: { timestamp?: number, source?: string, messageType: FELogMessageType, message: string }): FELogMessage {
      let timestamp: number = args.timestamp == undefined ? new Date().getTime() : args.timestamp;
      let source: string = args.source == undefined ? "NO_SOURCE_SET" : args.source;
      let messageType: FELogMessageType = args.messageType;
      let message: string = args.message;
      return new FELogMessage(timestamp, source, messageType, message);
   }

   public static FromPrimitiveValues(v: IPrimitiveValues_FELogMEssage): FELogMessage {
      let timestamp: number = v.timestamp;
      let source: string = v.source;
      let messageType: FELogMessageType = v.messageType;
      let message: string = v.message;

      let logMessageInstance: FELogMessage = FELogMessage.FromArgs({
         timestamp: timestamp,
         source: source,
         messageType: messageType,
         message: message
      });
      return logMessageInstance;
   }
   public static FromJSON(str: string): FELogMessage {

      let argsDict = <{ timestamp?: number, source?: string, messageType: FELogMessageType, message: string }>JSON.parse(str);
      return FELogMessage.FromArgs(argsDict);
   }
}


export class FELogger {
   private uid: number;
   private busy: boolean;

   private pathGetUid: string;
   private pathPostLogs: string;

   constructor(args: { pathGetUid: string, pathPostLogs: string } ) {
      this.uid = -1;
      this.busy = false;
      this.pathGetUid = args.pathGetUid;
      this.pathPostLogs = args.pathPostLogs;
   }

   private async log(msg: string, type: FELogMessageType) {
      let timestamp: number = new Date().getTime();

      while (this.busy)
         await new Promise(t => setTimeout(t, 5));
      this.busy = true;

      if (this.uid === -1) {
         let r: AJAX_RESULT_OK = await AJAX_GET(this.pathGetUid);
         this.uid = parseInt(r.responseText);
      }

      let logMessageObj: FELogMessage = FELogMessage.FromArgs({
         timestamp: timestamp,
         source: `FE-UID-${this.uid.toString()}`,
         messageType: type,
         message: msg
      });

      // Send Via AJAX POST AS MESSAGE BODY
      // If app.use(express.json({ limit: '50mb' })); is used, the req.body will contain the 
      // actual object, not a json string
      let r: AJAX_RESULT_OK = await AJAX_POST(this.pathPostLogs, logMessageObj.toJson());
      if (r.status != 200) {
         console.error(`Log message not sent to server: ${JSON.stringify(r)}`);
      }
      this.busy = false;
   }

   public info(msg: string): void {
      let tnow: Date = new Date();
      let tnowStr: string = `[${tnow.toLocaleString("sv")}.${tnow.getTime() % 1000}]:`;
      console.info(`${tnowStr} ${msg}`);
      this.log(msg, FELogMessageType.Info);
   }
   public warn(msg: string): void {
      let tnow: Date = new Date();
      let tnowStr: string = `[${tnow.toLocaleString("sv")}.${tnow.getTime() % 1000}]:`;
      console.warn(`${tnowStr} ${msg}`);
      this.log(msg, FELogMessageType.Warning);
   }
   public error(msg: string): void {
      let tnow: Date = new Date();
      let tnowStr: string = `[${tnow.toLocaleString("sv")}.${tnow.getTime() % 1000}]:`;
      console.error(`${tnowStr} ${msg}`);
      this.log(msg, FELogMessageType.Error);
   }
}