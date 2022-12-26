import * as Types from "@wpazderski/wallets-types";

import { Fetch } from "../utils/Fetch";





export class CryptoCurrencies {
    
    static async fetch(): Promise<Types.data.cryptocurrency.CryptoCurrency[]> {
        type RawResult = Array<{
            symbol: string,
            name: string;
        }>;
        const dataStr = await Fetch.get("https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur");
        const data = JSON.parse(dataStr) as RawResult;
        const cryptocurrencies: Types.data.cryptocurrency.CryptoCurrency[] = [];
        for (const item of data) {
            cryptocurrencies.push({
                id: item.symbol.toUpperCase() as Types.data.cryptocurrency.Id,
                name: item.name as Types.data.cryptocurrency.Name,
            });
        }
        return cryptocurrencies;
    }
    
}
