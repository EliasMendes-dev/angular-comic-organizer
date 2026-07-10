import { describe, expect, it } from 'vitest';
import { FileExplorer } from './file-explorer';
import { ComicPage } from '../../models/comic-page';

describe('FileExplorer page selection', () => {
  const createComponent = () =>
    new FileExplorer(
      {} as any,
      {
        fileEditions: [],
        activeEditionIds: new Set<number>(),
      } as any,
      {} as any,
      {} as any,
    );

  it('keeps only one page selected per edition at a time', () => {
    const component = createComponent();
    const editionId = 1;
    const firstPage = { id: 10 } as ComicPage;
    const secondPage = { id: 11 } as ComicPage;

    component.togglePageSelection(editionId, firstPage);
    component.togglePageSelection(editionId, secondPage);

    expect(component.isPageSelected(editionId, firstPage)).toBe(false);
    expect(component.isPageSelected(editionId, secondPage)).toBe(true);
  });

  it('selects the previous or next page when navigating with arrow keys', () => {
    const component = createComponent();
    component.fileManagerService.fileEditions = [
      {
        id: 1,
        title: 'Edition 1',
        pages: [
          { id: 10, fileName: '01.jpg' },
          { id: 11, fileName: '02.jpg' },
          { id: 12, fileName: '03.jpg' },
        ],
      },
    ] as any;

    component.togglePageSelection(1, { id: 10 } as ComicPage);
    component.navigatePageSelection(1, 'down');

    expect(component.isPageSelected(1, { id: 11 } as ComicPage)).toBe(true);

    component.navigatePageSelection(1, 'down');
    expect(component.isPageSelected(1, { id: 12 } as ComicPage)).toBe(true);

    component.navigatePageSelection(1, 'up');
    expect(component.isPageSelected(1, { id: 11 } as ComicPage)).toBe(true);
  });
});
