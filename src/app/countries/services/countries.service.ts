import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Country, Region, SmallCountry } from '../interfaces/country.interface';
import { Observable, combineLatest, map, of, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CountriesService {

    constructor(private http: HttpClient) { }

    private baseUrl: string = 'https://restcountries.com/v3.1/'

    private _regions: Region[] = [Region.Africa, Region.America, Region.Asia, Region.Europe, Region.Oceania]

    get regions(): Region[] {
        return [...this._regions]
    }

    getCountriesByRegion(region: Region): Observable<SmallCountry[]> {

        if (!region) return of([]);

        const url: string = `${this.baseUrl}/region/${region}?fields=cca3,name,borders`

        return this.http.get<Country[]>(url)
            .pipe(
                map(countries => countries.map(country => ({
                    name: country.name.common,
                    cca3: country.cca3,
                    borders: country.borders ?? []
                }))),
                // tap( response => console.log({ response}))
            )
    }

    getCountryByAlphaCode(alphaCode: string): Observable<SmallCountry> {
        console.log({ alphaCode })

        const url = `${this.baseUrl}/alpha/${alphaCode}?fields=cca3,name,borders`
        return this.http.get<Country>(url)
            .pipe(
                map(country => ({
                    name: country.name.common,
                    cca3: country.cca3,
                    borders: country.borders ?? []
                }))
            )
    }

    getCountryBordersByCodes(borders: string[]): Observable<SmallCountry[]> {
        if (!borders || borders.length === 0) return of([]);

        const countriesRequests: Observable<SmallCountry>[] = []

        borders.forEach(code => {
            const request = this.getCountryByAlphaCode(code);
            countriesRequests.push(request)
        })

        return combineLatest(countriesRequests)
    }


}
