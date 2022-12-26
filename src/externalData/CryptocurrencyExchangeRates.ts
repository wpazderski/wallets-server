import * as Types from "@wpazderski/wallets-types";

import { Fetch } from "../utils/Fetch";





export class CryptocurrencyExchangeRates {
    
    static async fetch(): Promise<{ [cryptocurrencyId: string]: Types.data.currency.ExchangeRate }> {
        type RawResult = Array<{
            symbol: string,
            current_price: number;
        }>;
        const dataStr = await Fetch.get("https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur");
        const data = JSON.parse(dataStr) as RawResult;
        const exchangeRates: { [cryptocurrencyId: string]: Types.data.currency.ExchangeRate } = {};
        for (const item of data) {
            exchangeRates[item.symbol.toUpperCase()] = item.current_price as Types.data.currency.ExchangeRate;
        }
        return exchangeRates;
    }
    
}
