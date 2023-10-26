import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AirlineService } from '../airline.service';

@Component({
  selector: 'app-oneway',
  templateUrl: './oneway.component.html',
  styleUrls: ['./oneway.component.css']
})
export class OnewayComponent implements OnInit {
  fromPlace: string = '';
  fromCode: string = '';
  toCode: string = '';
  toPlace: string = '';
  deDate:string='';
  TravelClass:string[]=[];
  airline:string='';
  reDate:string='';
  flightRoutes: any[] = [];

  searchAirline: string = '';
  filteredRoutes: any[] = [];
  originalRoutes: any[] = [];

  constructor(private route: ActivatedRoute,private as:AirlineService) { }

  ngOnInit(): void {
  
    // Subscribe to route parameters
  this.route.paramMap.subscribe((params) => {
    // Get the 'from' and 'to' values from route parameters
    this.fromPlace = params.get('fromPlace') || '';
    this.toPlace = params.get('toPlace') || '';
    this.fromCode = params.get('from') || '';
    this.toCode = params.get('to') || '';
    this.deDate = params.get('dDate') || '';
    const travelClassParam = params.get('TravelClass');
    this.TravelClass = travelClassParam ? travelClassParam.split(',') : [];

    this.reDate = params.get('rDate') || '';
    this.airline = params.get('air') || '';

    const requestData:any = {
      routes: [
        {
          date: this.deDate,
          departure: this.fromCode,
          arrival: this.toCode,
        },
      ],
    };
    
    if (this.TravelClass.length > 0) {
      requestData.class = this.TravelClass;
    }
    
    if (this.airline !== "") {
      requestData.airlines = [this.airline];
    }
    
    this.sendDataToBackend(requestData);
    // console.log('this is sendData', requestData);
    
    this.filteredRoutes = this.flightRoutes;
    // Now you can use these values in your component
    

    // Send the data to the backend API using your service
    
    
  });
  this.filteredRoutes = this.flightRoutes.slice();
}

sendDataToBackend(data: any) {
  // Assuming your service has a method for making POST requests to your API
  this.as.getAirlineRoutes(data).subscribe(
    (response) => {
      // Handle the response from the backend API if needed
      // console.log('API Response:', response);

      this.flightRoutes = []; // Initialize the flightRoutes array

      if (Array.isArray(response)) {
        // Iterate through each route in the response
        response.forEach((route: any) => {
          if (Array.isArray(route.results)) {
            route.results.forEach((result: any) => {
              const airline = result.Airline || {};
              this.flightRoutes.push({
                airlineName: airline.name || 'N/A',
                airlineCode: result.airline_code || 'N/A',
                airlineLogo: airline.logo || 'N/A',
                isLowCost: airline.is_lowcost === 1,
                departureDate: route.date || 'N/A',
                duration:result.common_duration|| 'N/A'
              });
            });
          }
          
        });
      } else {
        // Handle the case where the response is not an array
        console.error('API Response is not an array.');
      }
      this.originalRoutes = this.flightRoutes;
      this.filteredRoutes = this.flightRoutes.slice();
    },
    (error) => {
      // Handle errors if the request fails
      console.error('API Error:', error);
    }
  );
}
filterRoutesByAirline() {
  if (!this.searchAirline) {
    // If the airline name input field is empty, show all routes
    this.filteredRoutes = this.originalRoutes;
  } else {
    // Filter by airline name
    this.filteredRoutes = this.originalRoutes.filter((route) => {
      const airlineName = route.airlineName || '';
      return airlineName.toLowerCase().startsWith(this.searchAirline.toLowerCase());
    });
  }
}

}
