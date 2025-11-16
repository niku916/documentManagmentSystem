import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UploadService {
  // adjust base url if different; while developing we use proxy (see instructions)
  private base = '/api';

  constructor(private http: HttpClient) {}

  uploadFile(file: File, meta: { catId: string; subCatId?: string; applNo?: string }): Observable<any> {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('catId', meta.catId);
    if (meta.subCatId) fd.append('subCatId', meta.subCatId);
    if (meta.applNo) fd.append('applNo', meta.applNo);

    return this.http.post(`${this.base}/upload`, fd, { observe: 'events', reportProgress: true })
      .pipe(map((event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress) {
          const percent = Math.round((event.loaded / (event.total || 1)) * 100);
          return { type: 'progress', percent };
        } else if (event.type === HttpEventType.Response) {
          return { type: 'response', body: event.body };
        }
        return { type: 'unknown' };
      }));
  }
}
