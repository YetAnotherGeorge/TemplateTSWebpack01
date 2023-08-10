// WARNING: THIS FILE WILL BE SHARED BY BOTH NODE.JS SERVER AND FRONTEND


/**
 * Open Event (Open since anyone can call the trigger function)
 */
export class OEvent {
   private eventListeners: (() => void)[];
   constructor() {
      this.eventListeners = [];
   }

   /**
    * Subscribe to event
    * @param cb
    */
   subscribeToEvent(cb: () => void) {
      this.eventListeners.push(cb);
   }
   /**
    * Subscribe to event and call provided function (cb)
    * @param cb
    */
   subscribeToEventAndCall(cb: () => void) {
      cb();
      this.eventListeners.push(cb);
   }
   /**
    * Trigger event and call all event listeners
    */
   fire() {
      for (let i = 0; i < this.eventListeners.length; i++) {
         this.eventListeners[i]();
      }
   }
}

/**
 * Open Event (With Args) (Open since anyone can call the trigger function)
 */
export class OEventArg<TArg> {
   private eventListeners: ((args: TArg) => void)[];
   constructor() {
      this.eventListeners = [];
   }

   /**
    * Subscribe to event
    * @param cb
    */
   subscribeToEvent(cb: (arg: TArg) => void) {
      this.eventListeners.push(cb);
   }
   /**
    * Subscribe to event and call provided function with initial args: cb(initialArg)
    * @param initialArg
    * @param cb
    */
   subscribeToEventAndCall(initialArg: TArg, cb: (args: TArg) => void) {
      cb(initialArg);
      this.eventListeners.push(cb);
   }
   /**
    * Trigger event and call all event listeners
    * @param arg
    */
   fire(arg: TArg) {
      for (let i = 0; i < this.eventListeners.length; i++) {
         this.eventListeners[i](arg);
      }
   }
}

/**
* Open Event (With Args) (Open since anyone can call the trigger function)
*/
export class OEventArgs2<TArg, KArg> {
   private eventListeners: ((arg1: TArg, arg2: KArg) => void)[];
   constructor() {
      this.eventListeners = [];
   }

   /**
    * Subscribe to event
    * @param cb
    */
   subscribeToEvent(cb: (arg1: TArg, arg2: KArg) => void) {
      this.eventListeners.push(cb);
   }
   /**
    * Trigger event and call all event listeners
    * @param arg
    */
   fire(arg1: TArg, arg2: KArg) {
      for (let i = 0; i < this.eventListeners.length; i++) {
         this.eventListeners[i](arg1, arg2);
      }
   }
}


//#region STAGGERED_EVENTS
export interface IMissedCounterValue {
   GetCount(): number;
}
class MissedCounter implements IMissedCounterValue {
   private count: number;
   constructor() {
      this.count = 0;
   }
   public GetCount() {
      return this.count;
   }
   public Increase(by: number) {
      this.count += by;
   }
   public Reset() {
      this.count = 0;
   }
}
/**
 * Open Event (With Args) (Open since anyone can call the trigger function)
 */
export class OEventArgStaggered<TArg> {
   private eventListeners: ((arg1: TArg, missedCount: IMissedCounterValue) => void)[];
   private staggerDelay: number;
   private fireTimeout: NodeJS.Timeout | null;
   private missedCounter: MissedCounter;
   constructor(staggerDelay: number) {
      this.eventListeners = [];
      this.staggerDelay = staggerDelay;
      this.fireTimeout = null;
      this.missedCounter = new MissedCounter();
   }

   /**
    * Subscribe to event
    * @param cb
    */
   subscribeToEvent(cb: (arg1: TArg, missedCount: IMissedCounterValue) => void) {
      this.eventListeners.push(cb);
   }
   /**
    * Trigger event and call all event listeners
    * @param arg
    */
   fire(arg: TArg) {
      if (this.fireTimeout == null) {
         this.missedCounter.Reset();
         this.fireTimeout = setTimeout(() => {
            for (let i = 0; i < this.eventListeners.length; i++)
               this.eventListeners[i](arg, <IMissedCounterValue>this.missedCounter);
            this.fireTimeout = null;
         }, this.staggerDelay);
      } else {
         this.missedCounter.Increase(1);
      }
   }
}
/**
 * 
 */
export class OEventArgs2Staggered<TArg, KArg> {
   private eventListeners: ((arg1: TArg, arg2: KArg, missedCount: IMissedCounterValue) => void)[];
   private staggerDelay: number;
   private fireTimeout: NodeJS.Timeout | null;
   private missedCounter: MissedCounter;
   constructor(staggerDelay: number) {
      this.eventListeners = [];
      this.staggerDelay = staggerDelay;
      this.fireTimeout = null;
      this.missedCounter = new MissedCounter();
   }

   /**
    * Subscribe to event
    * @param cb
    */
   subscribeToEvent(cb: (arg1: TArg, arg2: KArg, missedCount: IMissedCounterValue) => void) {
      this.eventListeners.push(cb);
   }
   /**
    * Trigger event and call all event listeners
    * @param arg
    */
   fire(arg1: TArg, arg2: KArg) {
      if (this.fireTimeout == null) {
         this.missedCounter.Reset();
         this.fireTimeout = setTimeout(() => {
            for (let i = 0; i < this.eventListeners.length; i++)
               this.eventListeners[i](arg1, arg2, <IMissedCounterValue>this.missedCounter);
            this.fireTimeout = null;
         }, this.staggerDelay);
      } else {
         this.missedCounter.Increase(1);
      }
   }
}

//#endregion