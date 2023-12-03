
export class Popup {
   private static popupPaneId: string = "i000-popup-pane";
   private static popupPane: HTMLDivElement | null = null;

   private static popupPaneCloseId: string = "i000-popup-pane-close";
   private static popupPaneClose: HTMLDivElement | null = null;

   private static infoClasses: string[] = ["c000-popup-info", "c000-popup-base"];
   private static warnClasses: string[] = ["c000-popup-warn", "c000-popup-base"];
   private static errorClasses: string[] = ["c000-popup-error", "c000-popup-base"];

   private static initialized: boolean = false;
   public static Init(): void {
      if (Popup.initialized) return;

      Popup.popupPane = <HTMLDivElement>document.getElementById(Popup.popupPaneId);
      if (Popup.popupPane == null) throw new Error(`Popup elem with id ${Popup.popupPaneId} not found`);
      Popup.popupPaneClose = <HTMLDivElement>document.getElementById(Popup.popupPaneCloseId);
      if (Popup.popupPaneClose == null) throw new Error(`Poupup close elem with id ${Popup.popupPaneCloseId} not found`);

      Popup.popupPaneClose.addEventListener("click", (e) => {
         e.stopPropagation();
         if (Popup.popupPane!.parentElement != null)
            Popup.popupPane!.remove();
      });

      Popup.popupPane.remove();
      Popup.initialized = true;
   }

   private static lastId: number = 0;
   private static registeredItems: Map<number, HTMLDivElement> = new Map<number, HTMLDivElement>();
   private static RegisterItem(content: string, classList: string[]): { id: number, timeoutBar: HTMLSpanElement } { 
      if (!Popup.initialized) throw new Error("Popup not initialized");

      let p: HTMLDivElement = document.createElement("div");
      p.innerText = content;
      p.classList.add(...classList);
      let timeoutBar: HTMLSpanElement = document.createElement("span");
      timeoutBar.classList.add("c000-popup-timebar");
      p.appendChild(timeoutBar);

      Popup.popupPane!.appendChild(p);

      let id: number = Popup.lastId++;
      Popup.registeredItems.set(id, p);
      if (Popup.popupPane!.parentElement == null) 
         document.body.appendChild(Popup.popupPane!);
      // Scroll to bottom
      Popup.popupPane!.scrollTop = Popup.popupPane!.scrollHeight;
      return { id: id, timeoutBar: timeoutBar };
   }
   private static UnregisterItem(id: number): void {
      if (!Popup.initialized) throw new Error("Popup not initialized");
      if (!Popup.registeredItems.has(id)) throw new Error(`Popup item with id ${id} not found`);

      let p = Popup.registeredItems.get(id)!;
      p.remove();
      Popup.registeredItems.delete(id);

      if (Popup.registeredItems.size == 0)
         Popup.popupPane!.remove();
   }

   private static async ShowPopup(content: string, classes: string[]): Promise<void> {
      Popup.Init();
      let item: { id: number, timeoutBar: HTMLSpanElement } = Popup.RegisterItem(content, classes);

      const stayTimeMs: number = 18_000;
      await new Promise(t => setTimeout(t, stayTimeMs));
      Popup.UnregisterItem(item.id);
   }
   public static async Info(content: string): Promise<void> { Popup.ShowPopup(content, Popup.infoClasses); }
   public static async Warn(content: string): Promise<void> { Popup.ShowPopup(content, Popup.warnClasses); }
   public static async Error(content: string): Promise<void> { Popup.ShowPopup(content, Popup.errorClasses); }
}
export function getElementByIdOrThrow<T extends HTMLElement>(idStr: string): T | never {
   let elem: HTMLElement | null = document.getElementById(idStr);
   if (elem == null) throw new Error(`Element with id ${idStr} not found`);
   return <T>elem;
}
export function downloadJson(data: string, fileName: string) {
   let down: string = "data:text;json;charset=utf-8," + encodeURIComponent(data);

   let downloadAnchor: HTMLAnchorElement = document.createElement("a");
   downloadAnchor.style.display = "none";
   downloadAnchor.setAttribute("href", down);
   downloadAnchor.setAttribute("download", fileName);
   downloadAnchor.click();
}
export function downloadBinaryFromBase64(b64Str: string, fileName: string) {
   let down: string = "data:application/octet-steam;base64," + b64Str;

   let downloadAnchor: HTMLAnchorElement = document.createElement("a");
   downloadAnchor.setAttribute("href", down);
   downloadAnchor.setAttribute("download", fileName);
   downloadAnchor.click();
}
