import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule} from '@angular/http';

import { AppComponent }  from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { TrentService } from './shared/trent.service';

@NgModule({
  imports:      [ BrowserModule, FormsModule, HttpModule, AppRoutingModule ],
  declarations: [ AppComponent, AppRoutingModule.components ],
  providers:    [ TrentService ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }