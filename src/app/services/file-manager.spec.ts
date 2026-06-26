import { describe, expect, it } from 'vitest';
import { mapBackendEditionsToExplorerModel } from './file-manager';

describe('mapBackendEditionsToExplorerModel', () => {
  it('maps backend editions into explorer-ready items with page selection state', () => {
    const result = mapBackendEditionsToExplorerModel([
      {
        id: 1,
        title: 'Temp Edition',
        pages: [
          { id: 10, fileName: '01.jpg', imagePath: '/tmp/01.jpg', pageNumber: 1 },
          { id: 11, fileName: '02.jpg', imagePath: '/tmp/02.jpg', pageNumber: 2 },
        ],
      },
    ] as any);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Temp Edition');
    expect(result[0].pages[0].selected).toBe(false);
    expect(result[0].pages[1].selected).toBe(false);
  });

  it('sorts editions with natural numeric ordering', () => {
    const result = mapBackendEditionsToExplorerModel([
      { id: 3, title: 'Flsh Abslt #10 (2025) (DarkseidClub)', pages: [] },
      { id: 2, title: 'Flsh Abslt #2 (2025) (DarkseidClub)', pages: [] },
      { id: 1, title: 'Flsh Abslt #1 (2025) (DarkseidClub)', pages: [] },
    ] as any);

    expect(result.map((edition) => edition.title)).toEqual([
      'Flsh Abslt #1 (2025) (DarkseidClub)',
      'Flsh Abslt #2 (2025) (DarkseidClub)',
      'Flsh Abslt #10 (2025) (DarkseidClub)',
    ]);
  });
});
