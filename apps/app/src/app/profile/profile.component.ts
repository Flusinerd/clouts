import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { map, of, switchMap } from 'rxjs';
import { BackButtonComponent } from '../back-button/back-button.component';
import { UsersService } from '../state/users/users.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, BackButtonComponent, NgOptimizedImage, IonicModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  readonly route = inject(ActivatedRoute);
  readonly usersService = inject(UsersService);

  readonly userId$ = this.route.paramMap.pipe(
    map((params) => params.get('id') ?? undefined),
  );
  readonly userId = toSignal(this.userId$);

  readonly user$ = this.userId$.pipe(
    switchMap((userId) => {
      if (userId === undefined) {
        return of(undefined);
      } else {
        return this.usersService
          .getUser(userId)
          .result$.pipe(map((result) => result.data));
      }
    }),
  );
}
