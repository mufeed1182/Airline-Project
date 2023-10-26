import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OnewayComponent } from './oneway/oneway.component';
import { RoundtripComponent } from './roundtrip/roundtrip.component';
import { HttpClientModule } from '@angular/common/http';
import { AirlineRoutesComponent } from './airline-routes/airline-routes.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    OnewayComponent,
    RoundtripComponent,
    AirlineRoutesComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
