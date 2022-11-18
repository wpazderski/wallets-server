import * as Types from "@wpazderski/wallets-types";

import { Fetch } from "../utils/Fetch";

export class ExchangeRates {
    
    static async fetch(): Promise<{ [currencyKey: string]: Types.data.currency.ExchangeRate }> {
        interface RawResult {
            rates: {
                [currencyKey: string]: Types.data.currency.ExchangeRate;
            };
        }
        const dataStr = await Fetch.get("https://api.exchangerate.host/latest?base=EUR");
        const data = JSON.parse(dataStr) as RawResult;
        const exchangeRates = data.rates;
        return exchangeRates;
    }
    
}
