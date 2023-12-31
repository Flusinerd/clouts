import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Camera, CameraResultType, Photo } from '@capacitor/camera';
import { IonicModule } from '@ionic/angular';
import { map } from 'rxjs';
import { BackButtonComponent } from '../../back-button/back-button.component';
import { formHasChanges } from '../../common/operators/form-has-changes';
import { UsersService } from '../../state/users/users.service';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    NgOptimizedImage,
    ReactiveFormsModule,
    BackButtonComponent,
  ],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditProfileComponent {
  readonly changeDetector = inject(ChangeDetectorRef);

  readonly form = new FormGroup({
    firstName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    lastName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    displayName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    bio: new FormControl<string | null>(null, {
      validators: [Validators.maxLength(160)],
    }),
    location: new FormControl<string | null>(null, {
      validators: [Validators.maxLength(60)],
    }),
    bannerPicture: new FormControl<File | undefined>(undefined),
    profilePicture: new FormControl<File | undefined>(undefined),
  });

  private readonly usersService = inject(UsersService);
  readonly userId = 'f40eb085-0043-486b-ae56-9f440ac8a480';

  private user = this.usersService.getUser(this.userId).result;
  private user$ = this.usersService
    .getUser(this.userId)
    .result$.pipe(map((x) => x.data));
  private updateUser = this.usersService.updateUser();

  readonly hasChanges$ = this.form.valueChanges.pipe(
    formHasChanges(this.user$),
  );

  readonly bannerPictureUri = signal<string | undefined>(undefined);
  readonly profilePictureUri = signal<string | undefined>(undefined);

  constructor() {
    effect(() => {
      const { data } = this.user();

      if (!data) {
        return;
      }

      this.form.patchValue({
        firstName: data.firstName,
        lastName: data.lastName,
        displayName: data.displayName,
        bio: data.bio,
        location: data.location,
      });

      this.changeDetector.markForCheck();
    });
  }

  async onSubmit() {
    await this.updateUser.mutateAsync({
      id: this.userId,
      data: this.form.value,
    });

    this.form.controls.bannerPicture.setValue(undefined);
    this.form.controls.profilePicture.setValue(undefined);
    this.bannerPictureUri.set(undefined);
    this.profilePictureUri.set(undefined);

    this.changeDetector.markForCheck();
  }

  async takePicture(source: 'banner' | 'profile') {
    let image: Photo;
    try {
      image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
      });
    } catch (err) {
      console.error(err);
      return;
    }

    const imageUrl = image.webPath;
    if (!imageUrl) {
      return;
    }

    const blob = await fetch(imageUrl).then((r) => r.blob());
    const file = new File([blob], 'image.jpg', {
      type: 'image/jpeg',
    });

    if (source === 'banner') {
      this.form.patchValue({ bannerPicture: file });
      this.bannerPictureUri.set(imageUrl);
    } else {
      this.form.patchValue({ profilePicture: file });
      this.profilePictureUri.set(imageUrl);
    }

    this.changeDetector.markForCheck();
  }
}
