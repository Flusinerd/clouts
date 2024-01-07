import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { likeButtonAnimation } from './like-button-animation';

@Component({
  selector: 'app-post-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-footer.component.html',
  styleUrl: './post-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [likeButtonAnimation],
})
export class PostFooterComponent {
  // readonly description$ = signal<string | null>(null);

  liked = false;

  // @Input({ required: true })
  // set description(description: string) {
  //   this.description$.set(description);
  // }
}
