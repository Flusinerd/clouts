import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { injectMutation, injectQuery, injectQueryClient } from '@ngneat/query';
import { PublicUser, UpdateUserRequest } from 'models';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly queryClient = injectQueryClient();
  private readonly query = injectQuery();
  private readonly mutation = injectMutation();
  private readonly toast = inject(ToastController);

  public getUser(id: string) {
    return this.query({
      queryKey: ['user', id] as const,
      queryFn: () => this.http.get<PublicUser>(`/api/users/${id}`),
    });
  }

  public updateUser() {
    return this.mutation({
      mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) => {
        const formData = new FormData();
        for (const key in data) {
          if (data[key as keyof UpdateUserRequest]) {
            formData.append(key, data[key as keyof UpdateUserRequest]);
          }
        }

        const headers = new HttpHeaders();
        headers.append('Content-Type', 'multipart/form-data');

        return this.http.patch<PublicUser>(`/api/users/${id}`, formData, {
          headers,
        });
      },
      onSuccess: async (user) => {
        this.queryClient.invalidateQueries({
          queryKey: ['user', user.id] as const,
        });
        this.queryClient.setQueryData<PublicUser>(['user', user.id], user);
        const toast = await this.toast.create({
          color: 'success',
          message: 'Profile updated successfully!',
          duration: 3000,
        });
        await toast.present();
      },
    });
  }
}
