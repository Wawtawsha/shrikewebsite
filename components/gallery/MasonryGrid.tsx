"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { MasonryPhotoAlbum, type RenderImageProps } from "react-photo-album";
import "react-photo-album/masonry.css";
import { supabase } from "@/lib/supabase";
import { getStorageUrl, fetchUserLikes } from "@/lib/gallery";
import type { GalleryPhoto } from "@/types/gallery";
import { BlurhashPlaceholder } from "./BlurhashPlaceholder";
import { GalleryLightbox } from "./GalleryLightbox";
import { LikeButton } from "./LikeButton";
import { SelectButton } from "./SelectButton";
import { InstantDownloadButton } from "./InstantDownloadButton";
import { useDeviceId } from "@/hooks/useDeviceId";

interface MasonryGridProps {
  initialPhotos: GalleryPhoto[];
  totalCount: number;
  hasMore: boolean;
  eventId: string;
  trackEvent?: (name: string, data?: Record<string, unknown>) => void;
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
  trackEvent,
}: {
  imgProps: RenderImageProps;
  photo: GalleryPhotoAlbumPhoto;
  deviceId: string | null;
  isLiked: boolean;
  onPhotoClick: () => void;
  trackEvent?: (name: string, data?: Record<string, unknown>) => void;
}) {
  const { style, ...rest } = imgProps;
  const fullResUrl = getStorageUrl(photo.galleryPhoto.storage_path);

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
      <div className="photo-action-row">
        <InstantDownloadButton
          photoUrl={fullResUrl}
          filename={photo.galleryPhoto.filename}
          onDownload={() => trackEvent?.("instant_download", { photo_id: photo.galleryPhoto.id })}
        />
        <SelectButton photoId={photo.galleryPhoto.id} />
      </div>
      <LikeButton
        photoId={photo.galleryPhoto.id}
        initialCount={photo.galleryPhoto.like_count}
        isLiked={isLiked}
        deviceId={deviceId}
      />
    </div>
  );
}

export function MasonryGrid({ initialPhotos, totalCount, hasMore, eventId, trackEvent }: MasonryGridProps) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(initialPhotos);
  const [loading, setLoading] = useState(false);
  const [hasMoreState, setHasMoreState] = useState(hasMore);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const deviceId = useDeviceId();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

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
    if (loadingRef.current) return;
    loadingRef.current = true;
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
    loadingRef.current = false;
  }, [photos.length, eventId, totalCount]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMoreState) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "600px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMoreState, loadMore]);

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
        spacing={12}
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
                trackEvent={trackEvent}
              />
            );
          },
        }}
      />

      <div className="gallery-footer">
        <p className="gallery-footer-count">
          Showing {photos.length} of {totalCount} photos
        </p>

        {hasMoreState && (
          <div ref={sentinelRef} style={{ padding: "24px 0", textAlign: "center" }}>
            {loading && <span className="gallery-spinner" style={{ margin: "0 auto" }} />}
          </div>
        )}
      </div>

      <GalleryLightbox
        open={lightboxIndex >= 0}
        index={lightboxIndex}
        slides={slides}
        photos={photos}
        onClose={() => setLightboxIndex(-1)}
        trackEvent={trackEvent}
      />
    </div>
  );
}
