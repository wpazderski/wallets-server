import * as KvapiServer from "@wpazderski/kvapi-server";
import * as Types from "@wpazderski/wallets-types";

import { ExternalDataManager } from "../externalData/ExternalDataManager";

export class ExternalData implements KvapiServer.api.ApiEndpointGroup {
    
    constructor(private app: KvapiServer.App, private externalDataManager: ExternalDataManager) {
        this.app.api.registerEndpoint("post", "external-data", (_params, req) => this.getExternalData(req as Types.api.externalData.GetExternalDataRequest), "authorized");
    }
    
    private async getExternalData(request: Types.api.externalData.GetExternalDataRequest): Promise<Types.api.externalData.GetExternalDataResponse> {
        const externalData = await this.externalDataManager.getExternalData(request.cacheMaxLifetime, request.tickers);
        return {
            ...externalData,
        };
    }
    
}
