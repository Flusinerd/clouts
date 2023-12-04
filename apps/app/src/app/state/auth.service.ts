import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { injectMutation, injectQuery } from '@ngneat/query';
import { RegisterRequest, RegisterResponse } from 'models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private query = injectQuery();
  private mutation = injectMutation();

  constructor() {}

  getSession() {
    return this.query({
      queryKey: ['session'] as const,
      queryFn: () => this.http.get('/api/sessions'),
    });
  }

  register() {
    return this.mutation({
      mutationFn: (request: RegisterRequest) =>
        this.http.post<RegisterResponse>('/api/auth/register', request),
    });
  }
}
