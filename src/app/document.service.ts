import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private base = '/api';

  constructor(private http: HttpClient) {}

  postListOfDocument(dmsRequest: string): Observable<any> {
    let tokenToSend = dmsRequest || '';
    try {
      if (tokenToSend.includes('%25')) {
        tokenToSend = decodeURIComponent(tokenToSend);
      }
      tokenToSend = tokenToSend.trim();
    } catch (e) {
      tokenToSend = dmsRequest;
    }

    const params = new HttpParams().set('dmsRequest', tokenToSend);
    return this.http.post<any>(`${this.base}/getListOfDocument`, null, { params });
  }
}
