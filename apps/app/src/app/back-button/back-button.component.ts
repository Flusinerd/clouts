import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Input,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './back-button.component.html',
  styleUrl: './back-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackButtonComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  @Input()
  color: 'primary' | 'neutral' = 'primary';

  @Input()
  defaultHref: string | string[] | undefined;

  readonly canGoBack = signal<boolean>(false);

  ngOnInit() {
    this.router.events
      .pipe(debounceTime(50), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.canGoBack.set(
          this.router.getCurrentNavigation()?.previousNavigation !==
            undefined || this.defaultHref !== undefined,
        );
      });
  }

  public goBack() {
    // Check if the user can go back
    const canGoBack =
      this.router.getCurrentNavigation()?.previousNavigation !== undefined;

    // If the user can go back, then go back
    if (canGoBack) {
      this.router.navigate(['..']);
    } else if (this.defaultHref !== undefined) {
      if (typeof this.defaultHref === 'string') {
        this.router.navigate([this.defaultHref]);
      } else {
        this.router.navigate(this.defaultHref);
      }
    }
  }
}
