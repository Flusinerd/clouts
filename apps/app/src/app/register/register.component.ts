import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { controlsEqualValidator } from '../common/validators/controls-equal';
import { AuthService } from '../state/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, IonicModule, NgOptimizedImage, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  readonly form = new FormGroup(
    {
      firstName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      lastName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.email, Validators.required],
      }),
      displayName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(3)],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)],
      }),
      passwordConfirm: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)],
      }),
    },
    {
      validators: [controlsEqualValidator('password', 'passwordConfirm')],
    }
  );

  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastController);

  async onSubmit() {
    if (this.form.invalid) {
      return;
    }

    try {
      await this.authService.register().mutateAsync(this.form.getRawValue());
    } catch (error) {
      console.error(error);
    }
  }
}
