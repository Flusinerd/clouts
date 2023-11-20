import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { injectQuery } from '@ngneat/query';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private query = injectQuery();

  constructor() {}

  getSession() {
    return this.query({
      queryKey: ['session'] as const,
      queryFn: () => this.http.get('/api/sessions'),
    });
  }
}
