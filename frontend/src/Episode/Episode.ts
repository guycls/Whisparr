import ModelBase from 'App/ModelBase';
import { EpisodeFile } from 'EpisodeFile/EpisodeFile';
import Series, { Image } from 'Series/Series';

export interface Actor {
  tpdbId: number;
  name: string;
  character: string;
  gender: string;
}

interface Episode extends ModelBase {
  seriesId: number;
  tvdbId: number;
  episodeFileId: number;
  seasonNumber: number;
  episodeNumber: number;
  releaseDate?: string;
  airDate: string;
  airDateUtc?: string;
  actors: Actor[];
  lastSearchTime?: string;
  runtime: number;
  absoluteEpisodeNumber?: number;
  sceneSeasonNumber?: number;
  sceneEpisodeNumber?: number;
  sceneAbsoluteEpisodeNumber?: number;
  overview: string;
  title: string;
  episodeFile?: EpisodeFile;
  hasFile: boolean;
  monitored: boolean;
  grabbed?: boolean;
  unverifiedSceneNumbering: boolean;
  endTime?: string;
  grabDate?: string;
  seriesTitle?: string;
  series?: Series;
  images?: Image[];
}

export default Episode;
