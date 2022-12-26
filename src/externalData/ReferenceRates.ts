import * as Types from "@wpazderski/wallets-types";
import * as xml2js from "xml2js";

import { Fetch } from "../utils/Fetch";





interface RawData {
    stopy_procentowe_archiwum: {
        pozycje: RawEntry[],
    },
}

interface RawEntry {
    $: {
        obowiazuje_od: string;
    };
    pozycja: RawEntryProp[];
}

interface RawEntryProp {
    $: {
        id: string;
        oprocentowanie: string;
    };
}

export class ReferenceRates {
    
    static async fetch(): Promise<Types.data.rates.MonthlyReferenceRate[]> {
        const dataStr = await Fetch.get("https://www.nbp.pl/xml/stopy_procentowe_archiwum.xml");
        const data = await xml2js.parseStringPromise(dataStr) as RawData;
        const rawEntries = data.stopy_procentowe_archiwum.pozycje;
        
        const rates: Types.data.rates.MonthlyReferenceRate[] = [];
        for (const rawEntry of rawEntries) {
            const dateStr = rawEntry.$.obowiazuje_od;
            const refRateProp = rawEntry.pozycja.find(prop => prop.$.id === "ref");
            if (!refRateProp) {
                continue;
            }
            const refRate = parseFloat(refRateProp.$.oprocentowanie.replace(",", "."));
            const [y, m, d] = dateStr.split("-").map(numStr => parseInt(numStr)) as [number, number, number];
            rates.push({
                year: y,
                month: m,
                day: d,
                referenceRate: refRate as Types.data.rates.ReferenceRate,
            });
        }
        rates.sort((a, b) => {
            if (a.year !== b.year) {
                return a.year - b.year;
            }
            if (a.month !== b.month) {
                return a.month - b.month;
            }
            return a.day - b.day;
        });
        return rates;
    }
    
}
