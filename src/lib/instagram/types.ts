/**
 * Worker (sinhon-life-api) 가 돌려주는 응답 타입.
 * worker/src/instagram.ts 와 같은 모양이지만 프론트는 worker dependency 없이 자기 타입을 사용.
 */
export type IGMediaType = "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | "REELS";

export interface ArchiveItem {
  id: string;
  media_type: IGMediaType;
  media_url: string | null;
  thumbnail_url: string | null;
  permalink: string;
  caption: string | null;
  timestamp: string;
  tags: string[];
  first_seen_at: string;
}

export interface ArchiveListResponse {
  items: ArchiveItem[];
  limit: number;
  offset: number;
  tag: string | null;
}

export interface ArchiveDetailResponse {
  item: ArchiveItem;
}

export interface ArchiveTagsResponse {
  tags: { tag: string; count: number }[];
}
