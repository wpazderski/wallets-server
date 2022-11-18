import * as Types from "@wpazderski/wallets-types";

import { Fetch } from "../utils/Fetch";

export class Market {
    
    static async fetch(tickers: Types.data.market.Ticker[]): Promise<Types.data.market.TickerData[]> {
        const urlSafeTickers = tickers.map(ticker => encodeURIComponent(ticker) as Types.data.market.Ticker);
        const url = `https://finance.yahoo.com/quotes/${urlSafeTickers.join(",")}/view/v1`;
        const dataStr = await Fetch.get(url);
        const marketData: Types.data.market.TickerData[] = [];
        for (const match of dataStr.matchAll(/data\-symbol="([^"]+)"[^>]+data-field="regularMarketPrice"[^>]+value="([0-9\.]+)"/g)) {
            const ticker = match[1] as Types.data.market.Ticker;
            if (!tickers.includes(ticker)) {
                continue;
            }
            const value = parseFloat(match[2]!) as Types.data.market.Value;
            const idx = marketData.findIndex(item => item.ticker === ticker);
            if (idx >= 0) {
                marketData[idx]!.value = value;
            }
            else {
                marketData.push({ ticker, value });
            }
        }
        return marketData;
    }
    
}
