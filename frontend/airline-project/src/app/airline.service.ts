import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AirlineService {
  URL="http://127.0.0.1:5000"

  constructor(private http: HttpClient) { }

  autocompleteAirports(keyword: string): Observable<any> {
    return this.http.post(`${this.URL}/autocomplete`, { keyword });
  }

  // getAirlineRoutes(keyword: any): Observable<any> {
  //   return this.http.post(`${this.URL}/routes`, { keyword });
  // }
  getAirlineRoutes(data: any) {
    const url = `${this.URL}/routes`;
    return this.http.post(url, data);
  }

  autocompleteAirlines(keyword: string): Observable<any> {
    return this.http.post(`${this.URL}/airline`, { keyword });
  }

  // getAirlineRoutesWithAirline(keyword: any): Observable<any> {
  //   return this.http.post(`${this.URL}/airlineCode`, { keyword });
  // }

  getAirlineRoutesWithAirline(data:any){
    const url = `${this.URL}/airlineCode`;
    return this.http.post(url, data);
  }
}
