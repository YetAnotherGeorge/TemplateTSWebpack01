
export namespace OpenEvents {
   export type EventListener = (() => void);
   export type EventListenerNullable = EventListener | null;
   /**
    * Event provider, uses void callbacks that return void
    */
   export class OEvent {
      private eventListeners: EventListenerNullable[];
      public constructor() {
         this.eventListeners = [];
      }

      private verifyId(id: number): void | never {
         if (id < 0 || id > this.eventListeners.length)
            throw new Error(`Invalid id provided: ${id}`);
         if (this.eventListeners[id] == null)
            throw new Error(`No valid item at id: ${id}`);
      }
      /**
       * Checks if the provided id still registered to a valid event listener
       * @param id
       */
      public checkId(id: number): boolean {
         return (this.eventListeners[id] !== undefined && this.eventListeners[id] !== null);
      }
      /**
       * 
       * @param listener
       * @returns unique subscriber id
       */
      public subscribeToEvent(listener: EventListener) {
         if (typeof listener != "function")
            throw new Error(`Expected a function. Provided type: ${typeof listener}`);
         let id = this.eventListeners.length;
         this.eventListeners.push(listener);
         return id;
      }
      /**
       * Call function with specified id 
       * @param id provided by subscribeToEvent
       */
      public callEventListener(id: number): void | never {
         this.verifyId(id);
         let l = <EventListener>this.eventListeners[id];
         l();
      }
      /**
       * 
       * @param id provided by subscribeToEvent
       */
      public unsubscribeFromEvent(id: number): void | never {
         this.verifyId(id);
         this.eventListeners[id] = null;
      }
      /**
       * Trigger event (call all non deleted event listeners)
       */
      public fire(): void {
         for (let i = 0; i < this.eventListeners.length; i++) {
            let l: EventListenerNullable = this.eventListeners[i];
            if (l != null) {
               l();
            }
         }
      }
   }


   export type EventListenerArgs<TArg0, TArg1, TArg2, TArg3, TArg4, TArg5> = (a0: TArg0, a1: TArg1, a2: TArg2, a3: TArg3, a4: TArg4, a5: TArg5) => void;
   export type EventListenerArgsNullable<TArg0, TArg1, TArg2, TArg3, TArg4, TArg5> = EventListenerArgs<TArg0, TArg1, TArg2, TArg3, TArg4, TArg5> | null;
   /**
    * Event provider, allows up to 6 generic arguments
    */
   export class OEventArgs<TArg0, TArg1 = undefined, TArg2 = undefined, TArg3 = undefined, TArg4 = undefined, TArg5 = undefined> {
      private eventListeners: EventListenerArgsNullable<TArg0, TArg1, TArg2, TArg3, TArg4, TArg5>[];
      public constructor() {
         this.eventListeners = [];
      }

      private verifyId(id: number): void | never {
         if (id < 0 || id > this.eventListeners.length)
            throw new Error(`Invalid id provided: ${id}`);
         if (this.eventListeners[id] == null)
            throw new Error(`No vaild item at id: ${id}`);
      }

      private getArgs(a0: TArg0, a1?: TArg1, a2?: TArg2, a3?: TArg3, a4?: TArg4, a5?: TArg5): any[] {
         let a = [a0, a1, a2, a3, a4, a5];

         if (a1 === undefined)
            return a.slice(0, 1);
         else if (a2 === undefined)
            return a.slice(0, 2);
         else if (a3 === undefined)
            return a.slice(0, 3);
         else if (a4 === undefined)
            return a.slice(0, 4);
         else if (a5 === undefined)
            return a.slice(0, 5);
         return a;
      }
      /**
       * 
       * @param listener
       * @returns unique subscriber id
       */
      public subscribeToEvent(listener: EventListenerArgs<TArg0, TArg1, TArg2, TArg3, TArg4, TArg5>) {
         if (typeof listener != "function")
            throw new Error(`Expected a function. Provided type: ${typeof listener}`);
         let id = this.eventListeners.length;
         this.eventListeners.push(listener);
         return id;
      }
      /**
       * Checks if the provided id still registered to a valid event listener
       * @param id
       */
      public checkId(id: number): boolean {
         return (this.eventListeners[id] !== undefined && this.eventListeners[id] !== null);
      }
      /**
       * Call function with specified id 
       * @param id provided by subscribeToEvent
       */
      public callEventListener(id: number, a0: TArg0, a1?: TArg1, a2?: TArg2, a3?: TArg3, a4?: TArg4, a5?: TArg5): void | never {
         this.verifyId(id);
         let l = <EventListenerArgs<TArg0, TArg1, TArg2, TArg3, TArg4, TArg5>>this.eventListeners[id];

         let args: any[] = this.getArgs(a0, a1, a2, a3, a4, a5);
         (l as any)(...args);
      }
      /**
       * 
       * @param id provided by subscribeToEvent
       */
      public unsubscribeFromEvent(id: number): void | never {
         this.verifyId(id);
         delete this.eventListeners[id];
         this.eventListeners[id] = null;
         console.log(`UNSUBSCRIBED ${id}`);
      }
      /**
       * Trigger event (call all non deleted event listeners)
       */
      public fire(a0: TArg0, a1?: TArg1, a2?: TArg2, a3?: TArg3, a4?: TArg4, a5?: TArg5): void {
         let args: any[] = this.getArgs(a0, a1, a2, a3, a4, a5);

         for (let i = 0; i < this.eventListeners.length; i++) {
            let l: EventListenerArgsNullable<TArg0, TArg1, TArg2, TArg3, TArg4, TArg5> = this.eventListeners[i];
            if (l != null) {
               (l as any)(...args);
            }
         }
      }
   }
}