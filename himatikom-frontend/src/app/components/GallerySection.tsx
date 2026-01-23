'use client';

import React, { useState, useEffect } from 'react';
import { apiUrl, getMediaUrl } from '@/lib/api';

interface GalleryMedia {
  id: number;
  media_url: string;
  media_type: 'image' | 'video';
}

interface Gallery {
  id: number;
  title: string;
  description: string | null;
  thumbnail_url: string;
  media_type: 'image' | 'video';
  featured: boolean;
  media: GalleryMedia[];
}

interface GalleryProps {
  limit?: number;
  onlyFeatured?: boolean;
}

export default function GallerySection({ limit = 6, onlyFeatured = false }: GalleryProps) {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const endpoint = onlyFeatured ? '/api/gallery/featured' : '/api/gallery';
      const res = await fetch(apiUrl(endpoint), {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (data.status && data.data) {
        setGalleries(data.data.slice(0, limit));
      }
    } catch (err) {
      console.error('Error fetching gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (gallery: Gallery) => {
    setSelectedGallery(gallery);
    setCurrentMediaIndex(0);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="inline-block">
            <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-3 block"></i>
            <p className="text-gray-600 text-sm">Memuat galeri...</p>
          </div>
        </div>
      </div>
    );
  }

  if (galleries.length === 0) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {galleries.map((gallery) => (
          <div
            key={gallery.id}
            onClick={() => openModal(gallery)}
            className="group cursor-pointer"
          >
            <div className="relative overflow-hidden rounded-lg bg-gray-200 aspect-square">
              {gallery.media_type === 'video' ? (
                <>
                  <video
                    src={getMediaUrl(gallery.thumbnail_url)}
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      const video = e.target as HTMLVideoElement;
                      video.poster = '/images/himatikom.png';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all flex items-center justify-center">
                    <div className="bg-white/90 p-4 rounded-full">
                      <i className="fas fa-play text-2xl text-blue-600"></i>
                    </div>
                  </div>
                </>
              ) : (
                <img
                  src={getMediaUrl(gallery.thumbnail_url)}
                  alt={gallery.title}
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/himatikom.png';
                  }}
                />
              )}
              {gallery.featured && (
                <div className="absolute top-3 right-3 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <i className="fas fa-star"></i> Featured
                </div>
              )}
            </div>
            <h3 className="mt-3 font-semibold text-gray-900 line-clamp-2 text-sm sm:text-base hover:text-blue-600 transition">
              {gallery.title}
            </h3>
            {gallery.description && (
              <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mt-1">{gallery.description}</p>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && selectedGallery && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="w-full h-full sm:h-auto sm:max-w-4xl sm:max-h-[90vh] relative flex flex-col bg-black rounded-lg overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full transition"
            >
              <i className="fas fa-times text-lg"></i>
            </button>

            {/* Media Display */}
            <div className="flex-1 flex items-center justify-center bg-black min-h-0">
              {selectedGallery.media[currentMediaIndex]?.media_type === 'video' ? (
                <video
                  src={getMediaUrl(selectedGallery.media[currentMediaIndex]?.media_url)}
                  crossOrigin="anonymous"
                  controls
                  autoPlay
                  className="w-full h-full object-contain max-h-[60vh] sm:max-h-[80vh]"
                  onError={(e) => {
                    const video = e.target as HTMLVideoElement;
                    video.poster = '/images/himatikom.png';
                  }}
                />
              ) : (
                <img
                  src={getMediaUrl(selectedGallery.media[currentMediaIndex]?.media_url)}
                  alt={selectedGallery.title}
                  className="w-full h-full object-contain max-h-[60vh] sm:max-h-[80vh]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/himatikom.png';
                  }}
                />
              )}
            </div>

            {/* Info & Controls */}
            <div className="bg-black border-t border-gray-800 p-3 sm:p-4 text-white">
              {/* Title & Description */}
              <h3 className="text-base sm:text-xl font-bold mb-1 sm:mb-2 line-clamp-1">{selectedGallery.title}</h3>
              {selectedGallery.description && (
                <p className="text-xs sm:text-sm text-gray-300 mb-3 sm:mb-4 line-clamp-2">{selectedGallery.description}</p>
              )}
              
              {/* Navigation Controls */}
              {selectedGallery.media.length > 1 && (
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                  {/* Previous Button */}
                  <button
                    onClick={() => setCurrentMediaIndex(Math.max(0, currentMediaIndex - 1))}
                    disabled={currentMediaIndex === 0}
                    className="flex-1 sm:flex-none px-2 sm:px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded transition active:scale-95 text-xs sm:text-sm font-medium"
                  >
                    <i className="fas fa-chevron-left"></i>
                    <span className="hidden sm:inline ml-1">Sebelumnya</span>
                  </button>

                  {/* Counter */}
                  <span className="text-xs sm:text-sm text-gray-400 whitespace-nowrap px-2">
                    {currentMediaIndex + 1} / {selectedGallery.media.length}
                  </span>

                  {/* Next Button */}
                  <button
                    onClick={() => setCurrentMediaIndex(Math.min(selectedGallery.media.length - 1, currentMediaIndex + 1))}
                    disabled={currentMediaIndex === selectedGallery.media.length - 1}
                    className="flex-1 sm:flex-none px-2 sm:px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded transition active:scale-95 text-xs sm:text-sm font-medium"
                  >
                    <span className="hidden sm:inline mr-1">Berikutnya</span>
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}

              {/* Thumbnail Carousel (untuk multiple media) */}
              {selectedGallery.media.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                  {selectedGallery.media.map((media, idx) => (
                    <button
                      key={media.id}
                      onClick={() => setCurrentMediaIndex(idx)}
                      className={`flex-shrink-0 w-12 h-12 rounded border-2 overflow-hidden transition ${
                        idx === currentMediaIndex
                          ? 'border-blue-500 ring-2 ring-blue-500'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      title={`Media ${idx + 1}`}
                    >
                      {media.media_type === 'video' ? (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                          <i className="fas fa-play text-white text-xs"></i>
                        </div>
                      ) : (
                        <img
                          src={getMediaUrl(media.media_url)}
                          alt={`Thumbnail ${idx}`}
                          crossOrigin="anonymous"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/himatikom.png';
                          }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
