import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { from } from 'rxjs/observable/from';
import { of } from 'rxjs/observable/of';
import { interval } from 'rxjs/observable/interval';
import { Subject } from 'rxjs/Subject';
import { tap, flatMap, map, shareReplay, groupBy, toArray, take, switchMap, mergeMap, scan, pairwise, filter, delay } from "rxjs/operators";

type Update = {
    updateId: number
    stops: Stop[]
}

type Stop = {
    stopId: number
    buses: Bus[]
}

type Bus = {
    id: number
    est: number
}

@Injectable()
export class TrentService {
    public dataSubject$: Subject<Bus>;
    public data$: Observable<Stop>;
    
    constructor() {
        this.dataSubject$ = new Subject<Bus>();

        this.getData();

    }

    getData() {
        let interface$ = interval(2000).pipe(
            take(3),
            switchMap(i => {
                return fromPromise(fetch(`/assets/test-data/trent.${i}.json`)).pipe(
                    flatMap(data => fromPromise<Update[]>(data.json())),
                    flatMap(updArr => from(updArr)),
                    flatMap(upd => from(upd.stops)),
                )
            })
        );

        this.data$ = interface$.pipe(
            groupBy(data => data.stopId),
            flatMap(upd$ => upd$.pipe(
                pairwise(),
                map<[Stop, Stop], any>(([prev, cur]) => {
                    let curBuses = cur.buses.map(bus => bus.id);
                    let prevBuses = prev.buses.map(bus => bus.id);
                    let passed = prevBuses.filter(prevBusId => !curBuses.includes(prevBusId))

                    return passed.map(id => {
                        return {
                            stopId: cur.stopId,
                            busId: id,
                        };
                    });
                }),
                filter(passed => passed.length > 0),
            ))
        );
    }
    
    getProjectName() {
        return 'Angular Bare Bones';
    }

}