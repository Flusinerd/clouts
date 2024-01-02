import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-post-header',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, IonicModule],
  templateUrl: './post-header.component.html',
  styleUrl: './post-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostHeaderComponent {
  @Input({ required: true })
  profileId!: string;

  @Input({ required: true })
  profileName!: string;
}
