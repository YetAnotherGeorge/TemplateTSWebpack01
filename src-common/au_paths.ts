// WARNING: THIS FILE WILL BE SHARED BY BOTH NODE.JS SERVER AND FRONTEND

/** Agreed upon paths 
 * Paths used for sending log messages to the backend from the frontend
 */
export class AUPaths{
   //#region LOGGING
   /**
    * Each frontend client may request a unique uid which it will send back to the
    * server so that client logs may be differentiated
    * (Not secure)
    */
   public static readonly LoggingUid: string = "/api/log/get_uid_for_logging";

   /**
    * Frontend clients may send log messages to this address in the format
    * LoggingMessage; Message JSON is passed as the requests's body
    */
   public static readonly LoggingMessage: string = "/api/log/message" // ?message=....

   // TODO: Delete if not needed
   // public static readonly LoggingMessageKeyName: string = "msg";
   //#endregion

   //#region TRANSPORTS
   /**
    * Get everything related to transports
    */
   public static readonly TransportsAUEverything: string = "/api/transports/au_everything"

   public static readonly TransportsVehicleUpdateRequest     : string = "/api/transports/update/vehicles";
   public static readonly TransportsDeposUpdateRequest       : string = "/api/transports/update/depos";
   public static readonly TransportsHeadquartersUpdateRequest: string = "/api/transports/update/headquarters";
   //#endregion
}