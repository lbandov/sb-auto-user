import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = '-hjrtd2t7gq-ew.a.run.app'; // Update this with your actual Cloud Functions base URL
  private http = inject(HttpClient);

  constructor() { }

  addUser(user: Omit<User, 'id'>): Observable<any> {
    return this.http.post(`https://adduser${this.baseUrl}`, user);
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`https://getusers${this.baseUrl}`);
  }

  updateUser(user: User): Observable<any>  {
    return this.http.post(`https://updateuser${this.baseUrl}`, user, { responseType: 'text' });
  }

  deleteUser(id: string): Observable<any>  {
    return this.http.post(`https://deleteuser${this.baseUrl}`, { id }, { responseType: 'text' });
  }
  searchUsers(name: string, role: string): Observable<User[]> {
    // Initialize HttpParams
    let params = new HttpParams();
    if (name) {
      params = params.append('name', name);
    }
    if (role) {
      params = params.append('role', role);
    }

    // Construct the URL with query parameters
    const searchUrl = `https://searchUsers${this.baseUrl}`;

    // Make the GET request with the search parameters
    return this.http.get<User[]>(searchUrl, { params });
  }
}
