import { App } from "@wpazderski/kvapi-server";

import { ExternalData } from "./api";
import { ExternalDataManager } from "./externalData/ExternalDataManager";

App.create().then(async app => {
    const externalDataManager = new ExternalDataManager(app);
    await externalDataManager.init();
    new ExternalData(app, externalDataManager);
    return app.start();
});
