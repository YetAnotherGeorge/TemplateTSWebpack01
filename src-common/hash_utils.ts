// WARNING: THIS FILE WILL BE SHARED BY BOTH NODE.JS SERVER AND FRONTEND
//#region BACKEND_FRONTEND_COMMON_LIBS
import { OEventArg, OEventArgs2, OEventArgs2Staggered } from "./open_events"
//#endregion

export function GetStringHash(str: string): number {
   if (str === null) return 10001;
   else if (str === undefined) return 10002;

   var hash = 0,
      i, chr;
   if (str.length === 0) return hash;
   for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
   }
   return hash;
}


/**
 * Hash cannot be changed once the object is completely initialized
 */
export interface IStaticHash {
   GetHash(): number; 
}

export type UpdatedHash = number; 
export type NewComponentHash = number;
/**
 * Hash may change but an event will be fired when that happens
 */
export interface IDynamicHash {
   HashChangedEvent(): OEventArgs2<UpdatedHash, NewComponentHash> | OEventArgs2Staggered<UpdatedHash, NewComponentHash>;
   GetHash(): void;
}