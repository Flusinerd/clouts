import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { distinctUntilChanged, filter, map, of, switchMap } from 'rxjs';
import { z } from 'zod';
import { BackButtonComponent } from '../back-button/back-button.component';
import { PostComponent } from '../post/post.component';
import { UsersService } from '../state/users/users.service';

const uuidSchema = z.string().uuid();

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    BackButtonComponent,
    NgOptimizedImage,
    IonicModule,
    PostComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  readonly route = inject(ActivatedRoute);
  readonly usersService = inject(UsersService);
  readonly router = inject(Router);

  readonly userId$ = this.route.paramMap.pipe(
    map((params) => params.get('id') ?? undefined),
  );
  readonly userId = toSignal(this.userId$);

  readonly validUserId$ = this.userId$.pipe(
    map((userId) => uuidSchema.safeParse(userId).success),
  );

  readonly user$ = this.userId$.pipe(
    filter((userId): userId is string => userId !== undefined),
    distinctUntilChanged(),
    switchMap((userId) => {
      if (!uuidSchema.safeParse(userId).success) {
        this.router.navigate(['/']);
        return of(undefined);
      }

      return this.usersService
        .getUser(userId)
        .result$.pipe(map((result) => result.data));
    }),
  );
}
