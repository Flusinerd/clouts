import { CommonModule, IMAGE_CONFIG, NgOptimizedImage } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { IonicSlides } from '@ionic/angular';
import { PostFooterComponent } from './post-footer/post-footer.component';
import { PostHeaderComponent } from './post-header/post-header.component';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    PostHeaderComponent,
    PostFooterComponent,
  ],
  templateUrl: './post.component.html',
  styleUrl: './post.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    {
      provide: IMAGE_CONFIG,
      useValue: {
        disableImageLazyLoadWarning: true,
      },
    },
  ],
})
export class PostComponent {
  readonly swiperModules = [IonicSlides];
}
