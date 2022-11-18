import * as http from "http";
import * as https from "https";

import { Deferred } from "./Deferred";

export class Fetch {
    
    static get(url: string): Promise<string> {
        const deferred = new Deferred<string>();
        (url.startsWith("https://") ? https : http).get(url, resp => {
            let data = "";
            resp.on("data", dataChunk => {
                data += dataChunk;
            });
            resp.on("end", () => {
                deferred.resolve(data);
            });
        })
        .on("error", err => {
            deferred.reject(err);
        });
        return deferred.getPromise();
    }
    
}
