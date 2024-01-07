import {
  animate,
  keyframes,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const likeButtonAnimation = trigger('likeButtonAnimation', [
  transition('* => *', [
    animate(
      '0.45s cubic-bezier(.38,0,.58,.88)',
      keyframes([
        style({
          transform: 'scale(1)',
          offset: 0,
        }),
        style({
          transform: 'scale(1.2)',
          offset: 0.25,
        }),
        style({
          transform: 'scale(0.95)',
          offset: 0.5,
        }),
        style({ transform: 'scale(1)', offset: 1 }),
      ]),
    ),
  ]),
]);
