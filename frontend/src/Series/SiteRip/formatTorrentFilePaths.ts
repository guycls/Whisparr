export function formatTorrentFilePaths(filePaths: string[]): string {
  if (!filePaths.length) {
    return '';
  }

  if (filePaths.length === 1) {
    return filePaths[0];
  }

  return `${filePaths[0]} +${filePaths.length - 1}`;
}
