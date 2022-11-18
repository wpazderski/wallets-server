import * as Types from "@wpazderski/wallets-types";

import { Fetch } from "../utils/Fetch";

export class Currencies {
    
    static async fetch(): Promise<Types.data.currency.Currency[]> {
        interface RawResult {
            symbols: {
                [id: string]: { code: Types.data.currency.Id; description: Types.data.currency.Name; };
            };
        }
        const dataStr = await Fetch.get("https://api.exchangerate.host/symbols");
        const data = JSON.parse(dataStr) as RawResult;
        const currencies: Types.data.currency.Currency[] = [];
        for (const id in data.symbols) {
            const currency = data.symbols[id]!;
            currencies.push({
                id: currency.code,
                name: currency.description,
            });
        }
        return currencies;
    }
    
}
