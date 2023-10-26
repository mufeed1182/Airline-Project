import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { OnewayComponent } from './oneway/oneway.component';
import { RoundtripComponent } from './roundtrip/roundtrip.component';
import { AirlineRoutesComponent } from './airline-routes/airline-routes.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'oneway', component: OnewayComponent },
  {path:'roundtrip',component:RoundtripComponent},
  {path:'airlineRoutes',component:AirlineRoutesComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
