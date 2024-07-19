export interface CinnabarMeta {
  dataVersion: number;
  files: CinnabarMetaFile[];
  version: CinnabarMetaVersion;
}

export interface CinnabarMetaVersion {
  latest: string;
  timestamp: number;
}

export interface CinnabarMetaParsedVersion {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
  prereleaseNumber?: number;
}

export interface CinnabarMetaFile {
  path: string;
  type: string;
}

export interface CinnabarMetaGitLogItem {
  hash: string;
  message: string;
}
