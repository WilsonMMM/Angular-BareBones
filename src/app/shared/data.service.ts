import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { from } from 'rxjs/observable/from';
import { interval } from 'rxjs/observable/interval';
import { Subject } from 'rxjs/Subject';
import { tap, flatMap, map, shareReplay, groupBy, toArray, take, switchMap, mergeMap, scan, pairwise, filter } from "rxjs/operators";

type Data = {
    type: string
    value: number
}

@Injectable()
export class DataService {
    public dataSubject$: Subject<Data>;
    public data$: Observable<Data>;
    
    constructor() {
        this.dataSubject$ = new Subject<Data>();

        let interface$ = interval(2000).pipe(
            take(3),
            switchMap(i => {
                return fromPromise(fetch(`/assets/test-data/data.${i}.json`)).pipe(
                    flatMap(data => fromPromise<Data[]>(data.json())),
                    flatMap(data => from(data)),
                )
            })
        );

        this.data$ = interface$.pipe(
            groupBy(data => data.type),
            flatMap(type$ => type$.pipe(
                pairwise(),
                map<[Data, Data], [Data, number]>(([prev, cur]) => {
                    return [cur, cur.value - prev.value];
                }),
                filter(([cur, valDiff]) => Math.abs(valDiff) > 2),
                map(([cur, valDiff]) => cur),
            ))
        );
    }
    
    getProjectName() {
        return 'Angular Bare Bones';
    }

}