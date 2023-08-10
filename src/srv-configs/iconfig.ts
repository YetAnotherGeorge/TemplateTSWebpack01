import * as fs from "fs";

export type IServerConfig = {
   portHttp: number,
   portHttps: number,
   multithread: boolean
}

export function LoadFromFile(path: string, encoding: BufferEncoding = "utf-8"): IServerConfig {
   let fileContents: string = fs.readFileSync(path, encoding);
   let c: IServerConfig = <IServerConfig>JSON.parse(fileContents);
   return c;
}