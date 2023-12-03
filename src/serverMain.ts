import http from "http";
import * as express from "express";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

async function mainExpressAsync(httpPort: number) {
   let lh: () => string = () => `[${new Date().toISOString().slice(0, -1).split('T')[1]}] [ SRV]`;
   const app: express.Express = express.default();
   app.use(express.json({ limit: '50mb' }));

   app.use("/", (req, _, next) => {
      let u: string = req.url.length > 90 ? req.url.slice(0, 87) + "..." : req.url;
      /*console.log(`${lh()} REQ FROM ${req.ip} | URL: ${u}`);*/
      next();
   });

   app.use(express.static("./public/dist"));

   //#region HTTP
   let httpServer: http.Server;
   try {
      httpServer = http.createServer(app);
      httpServer.listen(httpPort);
   } catch (ex) {
      if (ex instanceof Error) {
         console.log(`${lh()} Error: ${ex.message}`);
      } else {
         throw ex;
      }
   }
   console.log(`${lh()} Listening on port ${httpPort}`);
}

async function mainAsync() {
   let configObj: any = JSON.parse(fs.readFileSync("config.json").toString());
   if (!configObj.port.http && typeof (configObj.port.http) != "number")
      throw new Error(`Invalid config.json: port.http is not a number`);
   await mainExpressAsync(configObj.port.http as number); // Start serving frontend files
}
mainAsync();