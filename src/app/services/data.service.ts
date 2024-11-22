import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private jsonUrl = 'assets/mock-api-data';

  constructor(private http: HttpClient) {}

  getPatients(): Observable<any[]> {
    return this.http.get<any[]>(this.jsonUrl + '/patients.json');
  }

  getPatient(id: string): Observable<any> {
    return this.http.get<any>(this.jsonUrl + '/patients/' + id + '/summary.json');
  }

  getActivities(): Observable<any[]> {
    return this.http.get<any[]>(this.jsonUrl + '/definitions/activities.json');
  }
}
