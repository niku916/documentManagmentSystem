import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  // Angular proxy should map /api -> http://localhost:8181
  private base = '/api';

  constructor(private http: HttpClient) {}

  getListOfDocument(dmsRequest: string): Observable<any> {
    // We send the token as a query param (encoded)
    const url = `${this.base}/getListOfDocument?dmsRequest=${encodeURIComponent(dmsRequest)}`;
    return this.http.get<any>(url);
  }
}
