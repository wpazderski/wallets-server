import * as KvapiServer from "@wpazderski/kvapi-server";
import * as KvapiTypes from "@wpazderski/kvapi-types";
import * as Types from "@wpazderski/wallets-types";

import { ArrayUtils } from "../utils/ArrayUtils";
import { Deferred } from "../utils/Deferred";
import { CryptoCurrencies } from "./CryptoCurrencies";
import { CryptocurrencyExchangeRates } from "./CryptocurrencyExchangeRates";
import { Currencies } from "./Currencies";
import { ExchangeRates } from "./ExchangeRates";
import { InflationRates } from "./InflationRates";
import { Market } from "./Market";
import { ReferenceRates } from "./ReferenceRates";

interface CachedExternalData {
    externalData: Types.api.externalData.ExternalData;
    cachedTickers: Types.data.market.Ticker[];
    lastTickersReset: number;
    createdTimestamp: number;
}

export class ExternalDataManager {
    
    static readonly EXTERNAL_DATA_MANAGER_DB_KEY = "wallets-external-data" as KvapiTypes.data.entry.Key;
    static readonly TICKERS_RESET_INTERVAL: number = 365 * 86400 * 1000;
    
    
    
    
    
    private db: KvapiServer.db.Db;
    private cachedExternalData: CachedExternalData | null = null;
    private fetchDataDeferred: Deferred<void> | null = null;
    
    constructor(private app: KvapiServer.App) {
        this.db = this.app.mainDb;
    }
    
    async init(): Promise<void> {
        let data: KvapiTypes.data.entry.Value | null = null;
        if (await this.db.has(ExternalDataManager.EXTERNAL_DATA_MANAGER_DB_KEY)) {
            data = await this.db.read(ExternalDataManager.EXTERNAL_DATA_MANAGER_DB_KEY);
        }
        if (data) {
            this.cachedExternalData = JSON.parse(data);
            if (!this.cachedExternalData) {
                await this.fetchData([]);
            }
        }
        else {
            await this.fetchData([]);
        }
    }
    
    async getExternalData(cacheMaxLifetime: number, tickers: Types.data.market.Ticker[]): Promise<Types.api.externalData.ExternalData> {
        if (!this.cachedExternalData || this.cachedExternalData.createdTimestamp < (Date.now() - cacheMaxLifetime) || !this.doesCachedDataContainAllTickers(tickers)) {
            await this.fetchData(tickers);
        }
        
        const data = { ...this.cachedExternalData!.externalData };
        data.tickerData = data.tickerData.filter(tickerData => tickers.includes(tickerData.ticker));
        return data;
    }
    
    private async fetchData(tickers: Types.data.market.Ticker[]): Promise<void> {
        if (this.fetchDataDeferred) {
            return this.fetchDataDeferred.getPromise();
        }
        const now = Date.now() as KvapiTypes.Timestamp;
        this.fetchDataDeferred = new Deferred();
        const cachedTickers = this.cachedExternalData ? this.cachedExternalData.cachedTickers : [];
        if (this.cachedExternalData && this.cachedExternalData.lastTickersReset < (Date.now() - ExternalDataManager.TICKERS_RESET_INTERVAL)) {
            cachedTickers.length = 0;
            this.cachedExternalData.lastTickersReset = now;
        }
        const allTickers = ArrayUtils.omitDuplicates([...tickers, ...cachedTickers]);
        try {
            const externalData: Types.api.externalData.ExternalData = {
                currencies: await Currencies.fetch(),
                cryptocurrencies: await CryptoCurrencies.fetch(),
                exchangeRates: await ExchangeRates.fetch(),
                cryptocurrencyExchangeRates: await CryptocurrencyExchangeRates.fetch(),
                monthlyInflationRates: await InflationRates.fetch(),
                monthlyReferenceRates: await ReferenceRates.fetch(),
                tickerData: await Market.fetch(allTickers),
                lastUpdateTimestamp: now,
            };
            if (this.cachedExternalData && this.cachedExternalData) {
                this.mergeExternalData(this.cachedExternalData.externalData, externalData);
            }
            this.cachedExternalData = {
                externalData,
                cachedTickers: allTickers,
                lastTickersReset: this.cachedExternalData ? this.cachedExternalData.lastTickersReset : now,
                createdTimestamp: now,
            };
            await this.db.write(ExternalDataManager.EXTERNAL_DATA_MANAGER_DB_KEY, JSON.stringify(this.cachedExternalData) as KvapiTypes.data.entry.Value);
            this.fetchDataDeferred.resolve();
        }
        catch (e) {
            this.fetchDataDeferred.reject(e);
            this.fetchDataDeferred = null;
            throw e;
        }
        this.fetchDataDeferred = null;
    }
    
    private mergeExternalData(oldData: Types.api.externalData.ExternalData, newData: Types.api.externalData.ExternalData): void {
        this.mergeExternalDataCurrenciesArray(oldData.currencies, newData.currencies);
        this.mergeExternalDataObject(oldData.exchangeRates, newData.exchangeRates);
        this.mergeExternalDataObject(oldData.cryptocurrencyExchangeRates, newData.cryptocurrencyExchangeRates);
    }
    
    private mergeExternalDataCurrenciesArray(oldData: Types.data.currency.Currency[], newData: Types.data.currency.Currency[]): void {
        for (const currency of oldData) {
            if (!newData.find(item => item.id === currency.id)) {
                newData.push(currency);
            }
        }
    }
    
    private mergeExternalDataObject(oldData: { [key: string]: any }, newData: { [key: string]: any }): void {
        for (const key in oldData) {
            if (!newData[key]) {
                newData[key] = oldData[key];
            }
        }
    }
    
    private doesCachedDataContainAllTickers(tickers: Types.data.market.Ticker[]): boolean {
        if (!this.cachedExternalData) {
            return false;
        }
        for (const ticker of tickers) {
            if (!this.cachedExternalData.cachedTickers.includes(ticker)) {
                return false;
            }
        }
        return true;
    }
    
}
