import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface PageSeoInput {
  title: string;
  description: string;
  path?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  private readonly siteName = 'BookMyCamera';
  private readonly defaultTitle = 'BookMyCamera — Professional Photography On Demand';

  setPage({ title, description, path }: PageSeoInput): void {
    const fullTitle = title.includes(this.siteName) ? title : `${title} | ${this.siteName}`;
    this.title.setTitle(fullTitle || this.defaultTitle);

    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });

    if (path != null && path.length > 0) {
      const normalized = path.startsWith('/') ? path : `/${path}`;
      this.meta.updateTag({ property: 'og:url', content: normalized });
    }
  }
}
