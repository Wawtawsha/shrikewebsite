export interface GalleryEvent {
  id: string;
  slug: string;
  title: string;
  date: string;
  description: string | null;
  cover_photo_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface GalleryPhoto {
  id: string;
  event_id: string;
  storage_path: string;
  thumb_path: string;
  filename: string;
  width: number;
  height: number;
  blurhash: string | null;
  like_count: number;
  sort_order: number;
  created_at: string;
}

export interface PhotoBatch {
  photos: GalleryPhoto[];
  totalCount: number;
  hasMore: boolean;
}

export interface GalleryComment {
  id: string;
  photo_id: string;
  device_id: string;
  author_name: string;
  body: string;
  is_visible: boolean;
  created_at: string;
}
