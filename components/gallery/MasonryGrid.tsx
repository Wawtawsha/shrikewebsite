"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { MasonryPhotoAlbum, type RenderImageProps } from "react-photo-album";
import "react-photo-album/masonry.css";
import { supabase } from "@/lib/supabase";
import { getStorageUrl, fetchUserLikes } from "@/lib/gallery";
import type { GalleryPhoto } from "@/types/gallery";
import { BlurhashPlaceholder } from "./BlurhashPlaceholder";
import { GalleryLightbox } from "./GalleryLightbox";
import { LikeButton } from "./LikeButton";
import { useDeviceId } from "@/hooks/useDeviceId";

interface MasonryGridProps {
  initialPhotos: GalleryPhoto[];
  totalCount: number;
  hasMore: boolean;
  eventId: string;
}

interface GalleryPhotoAlbumPhoto {
  src: string;
  width: number;
  height: number;
  key: string;
  galleryPhoto: GalleryPhoto;
}

function toAlbumPhotos(photos: GalleryPhoto[]): GalleryPhotoAlbumPhoto[] {
  return photos.map((photo) => ({
    src: getStorageUrl(photo.thumb_path),
    width: photo.width,
    height: photo.height,
    key: photo.id,
    galleryPhoto: photo,
  }));
}

function ImageWithPlaceholder({
  imgProps,
  photo,
  deviceId,
  isLiked,
  onPhotoClick,
}: {
  imgProps: RenderImageProps;
  photo: GalleryPhotoAlbumPhoto;
  deviceId: string | null;
  isLiked: boolean;
  onPhotoClick: () => void;
}) {
  const { style, ...rest } = imgProps;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onPhotoClick}
      onKeyDown={(e) => { if (e.key === "Enter") onPhotoClick(); }}
      style={{ position: "relative", width: "100%", height: "100%", cursor: "pointer" }}
    >
      {photo.galleryPhoto.blurhash && (
        <BlurhashPlaceholder
          blurhash={photo.galleryPhoto.blurhash}
          width={photo.galleryPhoto.width}
          height={photo.galleryPhoto.height}
        />
      )}
      <img
        {...rest}
        style={{ ...style, display: "block", width: "100%", height: "100%", position: "relative", zIndex: 1 }}
        loading="lazy"
        decoding="async"
      />
      <LikeButton
        photoId={photo.galleryPhoto.id}
        initialCount={photo.galleryPhoto.like_count}
        isLiked={isLiked}
        deviceId={deviceId}
      />
    </div>
  );
}

export function MasonryGrid({ initialPhotos, totalCount, hasMore, eventId }: MasonryGridProps) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(initialPhotos);
  const [loading, setLoading] = useState(false);
  const [hasMoreState, setHasMoreState] = useState(hasMore);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const deviceId = useDeviceId();

  useEffect(() => {
    if (!deviceId) return;
    fetchUserLikes(eventId, deviceId).then(setUserLikes);
  }, [deviceId, eventId]);

  const albumPhotos = useMemo(() => toAlbumPhotos(photos), [photos]);

  const slides = useMemo(
    () =>
      photos.map((photo) => ({
        src: getStorageUrl(photo.storage_path),
        width: photo.width,
        height: photo.height,
      })),
    [photos]
  );

  const loadMore = useCallback(async () => {
    setLoading(true);
    const offset = photos.length;
    const limit = 50;

    const { data, error } = await supabase
      .from("photos")
      .select("*")
      .eq("event_id", eventId)
      .order("sort_order", { ascending: true })
      .range(offset, offset + limit - 1);

    if (!error && data) {
      setPhotos((prev) => [...prev, ...(data as GalleryPhoto[])]);
      setHasMoreState(offset + limit < totalCount);
    }
    setLoading(false);
  }, [photos.length, eventId, totalCount]);

  return (
    <div>
      <MasonryPhotoAlbum
        photos={albumPhotos}
        columns={(containerWidth) => {
          if (containerWidth < 480) return 2;
          if (containerWidth < 768) return 3;
          if (containerWidth < 1200) return 4;
          return 5;
        }}
        spacing={8}
        defaultContainerWidth={1200}
        render={{
          image: (props, context) => {
            const photo = context.photo as GalleryPhotoAlbumPhoto;
            return (
              <ImageWithPlaceholder
                imgProps={props}
                photo={photo}
                deviceId={deviceId}
                isLiked={userLikes.has(photo.galleryPhoto.id)}
                onPhotoClick={() => setLightboxIndex(context.index)}
              />
            );
          },
        }}
      />

      <div className="text-center mt-8">
        <p className="text-muted text-sm mb-4">
          Showing {photos.length} of {totalCount} photos
        </p>

        {hasMoreState && (
          <button
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 text-base font-medium text-white transition-colors w-full sm:w-auto"
            style={{
              backgroundColor: "var(--color-accent)",
              minHeight: "48px",
              minWidth: "48px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-accent-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-accent)";
            }}
          >
            {loading && <span className="gallery-spinner" />}
            {loading ? "Loading..." : "See more photos"}
          </button>
        )}
      </div>

      <GalleryLightbox
        open={lightboxIndex >= 0}
        index={lightboxIndex}
        slides={slides}
        onClose={() => setLightboxIndex(-1)}
      />
    </div>
  );
}
