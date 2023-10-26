import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AirlineService } from '../airline.service';

interface AirlineData {
  logo: string;
  name: string;
  code: string;
  // Add other properties as needed
}

@Component({
  selector: 'app-airline-routes',
  templateUrl: './airline-routes.component.html',
  styleUrls: ['./airline-routes.component.css']
})
export class AirlineRoutesComponent implements OnInit {
  airlineCode:string='';
  routes : any[] = [];
  airlineData: AirlineData | null = null;
  visibleRoutes = 20;
  searchAlphabet: string = '';
  filteredRoutes: any[] = [];
  originalRoutes: any[] = [];

constructor(private route: ActivatedRoute,private as:AirlineService) { }



ngOnInit() {
  this.route.paramMap.subscribe((params) => {
    this.airlineCode = params.get('airlineCode') || '';
    // console.log('the airline code is ',this.airlineCode)
  })
  const requestData={ airline_code: this.airlineCode }
  // console.log("this is requestData ",requestData)
  this.sendDataToBackend(requestData);
}



showMoreRoutes() {
    this.visibleRoutes += 20;
}

sendDataToBackend(data: any) {
  this.as.getAirlineRoutesWithAirline(data).subscribe((response) => {
    // console.log('this is fetched data ', response);

    if (Array.isArray(response) && response.length > 0) {
      // Routes are available, update this.routes and airlineData
      this.originalRoutes = response;
      this.filteredRoutes = response;
      this.airlineData = response[0].airline;
    } else if ('code' in response) {
      // No routes available, only airline details are present
      this.originalRoutes = [];
      this.filteredRoutes = [];
      this.airlineData = response as AirlineData;
    } else {
      // Handle other cases or errors here
    }
  });
}


filterRoutesByAlphabet() {
  if (!this.searchAlphabet) {
    // If the input field is empty, show all routes
    this.filteredRoutes = this.originalRoutes;
  } else {
    // Use the selected alphabet to filter routes
    this.filteredRoutes = this.originalRoutes.filter((route) => {
      const flyingFromCity = route?.Flying_from?.city || '';
      const flyingToCity = route?.Flying_to?.city || '';
      return (
        flyingFromCity.toLowerCase().startsWith(this.searchAlphabet.toLowerCase()) ||
        flyingToCity.toLowerCase().startsWith(this.searchAlphabet.toLowerCase())
      );
    });
  }
}
}
