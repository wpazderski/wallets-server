import * as Types from "@wpazderski/wallets-types";

import { Fetch } from "../utils/Fetch";

export class InflationRates {
    
    static async fetch(): Promise<Types.data.rates.MonthlyInflationRate[]> {
        const dataStr = await Fetch.get("https://stat.gov.pl/download/gfx/portalinformacyjny/pl/defaultstronaopisowa/4741/1/1/miesieczne_wskazniki_cen_towarow_i_uslug_konsumpcyjnych_od_1982_roku.csv");
        const rates = dataStr
            .split("\n")
            .filter(line => line.includes("konsumpcyjnych;Polska;Analogiczny miesi"))
            .map(line => line.split(";"))
            .filter(parts => parts[5] !== "")
            .map(parts => ({
                year: parseInt(parts[3]!),
                month: parseInt(parts[4]!),
                inflationRate: parseFloat(parts[5]!.replace(",", ".")) - 100 as Types.data.rates.InflationRate,
            }) as Types.data.rates.MonthlyInflationRate)
            .sort((a, b) => {
                if (a.year !== b.year) {
                    return a.year - b.year;
                }
                return a.month - b.month;
            });
        return rates;
    }
    
}
