import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { from } from 'rxjs/observable/from';
import { of } from 'rxjs/observable/of';
import { interval } from 'rxjs/observable/interval';
import { Subject } from 'rxjs/Subject';
import { tap, flatMap, map, shareReplay, groupBy, toArray, take, switchMap, mergeMap, scan, pairwise, filter, delay } from "rxjs/operators";

type Stop = {
    serviceName: string
    stopName: string
    latLongPosition?: string
    latitude?: number
    longitude?: number
    result: Bus[]
}

type Route = {
    uniqueIdentifier: string // "31TB91:91nines",
    serviceName: string // "nines",
    start: number // 20919,
    end: number // 1250,
    stops: number[] // [8309, 8300, 8288, 3033, 3032, 8298, 8294, 8312, 8296, 8286, 3112, 3211, 3223, 3221, 3219, 3182, 3183, 3117]
}

type Bus = {
    uniqueIdentifier: string // "1TB91:91nines",
    serviceName: string // "nines",
    serviceDisplayName: string // "nines 9.1",
    serviceIcon: string // "<img src=\"/resources/res.aspx?p=/DF243034569DC881C3ADBB185E7EF786DCD5BDDD507A1E57/nines-doughnut-updated.png\" width=\"36\" height=\"31\" alt=\"RouteListServiceIcon\" />",
    busIconRaw: string // "/images/icons/bus.png",
    dueIn: string // "15 mins",
    destination: string // "Sutton, Mansfield",
    dueTime: Date // "2018-04-25T12:56:20.7759607+01:00",
    latitude: number // 53.0957,
    longitude: number // -1.38815,
    preciseTime: number // 15.519783333333333,
    ServiceId: number // 28
}

@Injectable()
export class TrentService {
    public dataSubject$: Subject<Bus>;
    public data$: Observable<Stop>;
    
    constructor() {
        this.dataSubject$ = new Subject<Bus>();

        let routes$ = this.getRoutes();

        let stopData$ = routes$.pipe(
            flatMap(route => {
                return from(route.stops).pipe(
                    mergeMap(stopId => {
                        return fromPromise(fetch(`https://www.trentbarton.co.uk/RTILiveTimings.aspx?m=GetRtiFull&service=28&stop=${stopId}`)).pipe(
                            flatMap(data => fromPromise<Route[]>(data.json())),
                            flatMap(dataArr => from(dataArr)),
                        );
                    })
                );
            })
        );

        stopData$.subscribe(
            data => console.log(data)
        );

        this.getData();

    }

    getRoutes() {
        return fromPromise(fetch(`assets/test-data/routes-test.json`)).pipe(
            flatMap(data => fromPromise<Route[]>(data.json())),
            flatMap(dataArr => from(dataArr)),
            shareReplay(1),
        );
    }

    getData() {
        let interface$ = interval(2000).pipe(
            take(3),
            switchMap(i => {
                return fromPromise(fetch(`/assets/test-data/trent.${i}.json`)).pipe(
                    flatMap(data => fromPromise<Stop[]>(data.json())),
                    flatMap(updArr => from(updArr)),
                )
            }),
        );

        this.data$ = interface$.pipe(
            groupBy(stop => stop.stopName),
            flatMap(stop$ => stop$.pipe(
                pairwise(),
                map<[Stop, Stop], any>(([prev, cur]) => {
                    let curBuses = cur.result.map((bus, i) => bus.uniqueIdentifier);
                    let prevBuses = prev.result.map((bus, i) => bus.uniqueIdentifier);

                    curBuses[0]+= 'next';
                    prevBuses[0]+= 'next';

                    let passed = prevBuses.filter(prevBusId => !curBuses.includes(prevBusId))

                    return passed.map(id => {
                        return {
                            stopId: cur.stopName,
                            busId: id,
                        };
                    });
                }),
//                filter(passed => passed.length > 0),
            ))
        );
    }
    
    getProjectName() {
        return 'Angular Bare Bones';
    }

}