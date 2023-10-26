import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AirlineService } from '../airline.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  selectedFlightType: string = 'one-way';
  flyingFromInput: string = '';
  flyingFromCode:string=''; 
  flyingToInput: string = '';
  flyingToCode:string='';
  departingDate: string = '';
  travelClass: string[] = [];
  returningDate: string = '';
  airlineUp:string='';
  airlineDown:string='';
  airlineUpCode:string='';
  airlineCode:string='';
  flyingFromSuggestions: any[] = [];
  flyingToSuggestions: any[] = [];
  todayDate: string = new Date().toISOString().split('T')[0];
  airlineDownSuggestions:any[]=[];
  airlineUpSuggestions:any[]=[];

  constructor(private router: Router,private as:AirlineService) { 
  }

  ngOnInit(): void {
  }

  onFlightTypeChange(type: string) {
    this.selectedFlightType = type;
    
  }
  showFlights() {
    let routeTo: string;
    const fromPlace=this.flyingFromInput
    const from = this.flyingFromCode;
    const toPlace=this.flyingToInput;
    const to = this.flyingToCode;
    const dDate = this.departingDate;
    const TravelClass = this.travelClass.join(',');
    const rDate = this.returningDate;
    const air=this.airlineCode;
  
    switch (this.selectedFlightType) {
      case 'one-way':
        routeTo = '/oneway';
        break;
      case 'roundtrip':
        routeTo = '/roundtrip';
        break;
  
      default:
        routeTo='/home';
        break;
    }
      if((fromPlace===''|| toPlace==='' || dDate==='' )&& this.selectedFlightType==='one-way'){
        alert("Flying From, Flying To and Departure date are required")
    }else if((fromPlace===''|| toPlace==='' || dDate===''||rDate==='') && this.selectedFlightType==='roundtrip'){
      alert("Flying From, Flying To, Departure date and Return date are required")
    }else{
    this.router.navigate([routeTo, { fromPlace,from,toPlace, to ,dDate,TravelClass,rDate,air}]);
  }
  
  }

  autocompleteAirports(keyword: string, inputField: string) {
    if (keyword.length >= 3) {
      // console.log(`Autocompleting airports for ${inputField}: ${keyword}`);
      this.as.autocompleteAirports(keyword).subscribe(
        (response) => {
          // console.log(`Received autocomplete response for ${inputField}:`, response);
          if (inputField === 'flyingFrom') {
            this.flyingFromSuggestions = response.matching_airports;
          } else if (inputField === 'flyingTo') {
            this.flyingToSuggestions = response.matching_airports;
          }else if(inputField==='flyingToMultiName'){
            this.flyingToSuggestions = response.matching_airports;
          }
        },
        (error) => {
          console.error('Autocomplete error:', error);
        }
      );
    } else {
      // Clear suggestions if input is less than 3 characters
      if (inputField === 'flyingFrom') {
        this.flyingFromSuggestions = [];
      } else if (inputField === 'flyingTo') {
        this.flyingToSuggestions = [];
      }
    }
  }

  autoCompleteAirlines(keyword:string,inputField: string){
    if(keyword.length>=1){
    // console.log("the airline keyword is"+keyword);
    this.as.autocompleteAirlines(keyword).subscribe((response)=>{
      // console.log('recieved responses are',response);
      if(inputField==='airlineUp'){
      this.airlineUpSuggestions=response.matching_airlines;
    }else if(inputField==='airlineDown'){
      this.airlineDownSuggestions=response.matching_airlines;
    }
    },
    (error)=>{
      console.error("Autocomplete erroe",error)
    }
    )
  }else{
    if(inputField==='airlineUp'){
      this.airlineUpSuggestions=[];
    }else if(inputField==='airlineDown'){
      this.airlineDownSuggestions=[];
    }
  }
}

  searchAirlines(airlines:any,inputField:string){
    // console.log('selected airports :' , airlines)
    if(inputField==='airlineUp'){
    this.airlineUp=airlines.name;
    this.airlineCode=airlines.code;
    this.airlineUpSuggestions=[];
  }else if(inputField==='airlineDown'){
    this.airlineDown=airlines.name;
    this.airlineCode=airlines.code;
    this.airlineDownSuggestions=[];

  }
  }

  selectAirport(airport: any, inputField: string) {
    // console.log(`Selected airport for ${inputField}:`, airport);
    // Set the selected airport in the input field
    if (inputField === 'flyingFrom') {
      this.flyingFromInput = airport.name;
      this.flyingFromCode=airport.code;
      this.flyingFromSuggestions = [];
    } else if (inputField === 'flyingTo') {
      this.flyingToInput = airport.name;
      this.flyingToCode=airport.code;
      this.flyingToSuggestions = [];
    }
  }

  onTravelClassChange(travelClassValue: string) {
    if (this.travelClass.includes(travelClassValue)) {
      // If the value is already in the array, remove it
      this.travelClass = this.travelClass.filter(tc => tc !== travelClassValue);
    } else {
      // If the value is not in the array, add it
      this.travelClass.push(travelClassValue);
    }
  }
  
  showRoutesWithAirlineCode(){
    const airlineCode=this.airlineCode;
    this.router.navigate(["/airlineRoutes", { airlineCode}]);
  }

}
