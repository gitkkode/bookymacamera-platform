import { Directive } from '@angular/core';

/** Adds the global `.reveal` class; the fade-in itself is pure CSS (see styles.css). */
@Directive({
  selector: '[appReveal]',
  standalone: true,
  host: {
    class: 'reveal',
  },
})
export class RevealDirective {}
