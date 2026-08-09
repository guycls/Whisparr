import cleanSceneTitleForSearch from './cleanSceneTitleForSearch';

describe('cleanSceneTitleForSearch', () => {
  it('returns empty string for empty input', () => {
    expect(cleanSceneTitleForSearch('')).toBe('');
  });

  it('removes trailing video extension and quality', () => {
    expect(cleanSceneTitleForSearch('My Scene 1080p.mp4')).toBe('My Scene');
  });

  it('removes trailing quality with separator', () => {
    expect(cleanSceneTitleForSearch('My Scene - 720p')).toBe('My Scene');
  });

  it('removes trailing colon after quality removal', () => {
    expect(cleanSceneTitleForSearch('My Scene 1080p:')).toBe('My Scene');
  });

  it('leaves normal scene titles unchanged', () => {
    expect(cleanSceneTitleForSearch('Normal Scene Title')).toBe('Normal Scene Title');
  });

  it('handles multiple trailing suffixes', () => {
    expect(cleanSceneTitleForSearch('My Scene FHD 1080p.mp4')).toBe('My Scene');
  });

  it('removes spaced quality and extension without dot', () => {
    expect(cleanSceneTitleForSearch('Amateur Boxxx Bitch Real Estate Agent Controlled 4k Mp4'))
      .toBe('Amateur Boxxx Bitch Real Estate Agent Controlled');
  });
});
