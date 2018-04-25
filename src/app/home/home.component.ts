import { Component, OnInit } from '@angular/core';

import { TrentService as DataService } from '../shared/trent.service';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'home',
    templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
    
    projectName: string;

    constructor(protected dataService: DataService
    ) { 
    }

    ngOnInit() { 
        this.projectName = this.dataService.getProjectName();

        this.dataService.data$.subscribe(val => console.log(val));

    }

}