export interface CinnabarMeta {
  dataVersion: number;
  files?: CinnabarMetaFile[];
  repo?: CinnabarMetaRepo;
  updateChangelog?: boolean;
  version: CinnabarMetaVersion;
}

export interface CinnabarMetaVersion {
  latest: string;
  latestNext?: string;
  timestamp: number;
}

export interface CinnabarMetaParsedVersion {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
  prereleaseNumber?: number;
}

export interface CinnabarMetaRepo {
  type: "github";
  value: string;
}

export interface CinnabarMetaFile {
  path: string;
  type: string;
  updateBuild?: boolean;
}

export interface CinnabarMetaGitLogItem {
  hash: string;
  message: string;
}
