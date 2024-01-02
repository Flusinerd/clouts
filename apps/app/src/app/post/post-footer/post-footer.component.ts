import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-post-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-footer.component.html',
  styleUrl: './post-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostFooterComponent {}
