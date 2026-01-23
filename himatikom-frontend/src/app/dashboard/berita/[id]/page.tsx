'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { apiUrl } from '@/lib/api';

interface NewsArticle {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  category: string;
  user: {
    id: number;
    name: string;
    nim: string;
  };
  images?: Array<{
    id: number;
    filename: string;
    url: string;
    order: number;
  }>;
  created_at: string;
  updated_at: string;
}

export default function NewsDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetch(apiUrl(`/api/news/${id}`), {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Article not found');
        return res.json();
      })
      .then(data => {
        if (data.status) setArticle(data.data);
        else throw new Error(data.message);
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to load article');
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="bg-white rounded border border-gray-200 p-6 text-center">
        <i className="fas fa-exclamation-circle text-4xl text-red-400 mb-3"></i>
        <p className="text-gray-700 font-medium mb-3">{error || 'Berita tidak ditemukan'}</p>
        <Link
          href="/dashboard/berita"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Kembali ke Berita <i className="fas fa-arrow-left ml-1"></i>
        </Link>
      </div>
    );
  }

  const hasMultipleImages = article.images && article.images.length > 1;
  const displayImages = article.images && article.images.length > 0 ? article.images : [];
  const currentImage = displayImages.length > 0 ? displayImages[currentImageIndex] : null;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/dashboard/berita"
          className="text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center gap-1"
        >
          <i className="fas fa-arrow-left"></i> Kembali
        </Link>
        <span className="text-[11px] font-bold text-blue-600 uppercase bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
          {article.category}
        </span>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        {/* Image Section */}
        {currentImage && (
          <div className="relative bg-gray-100 overflow-hidden group">
            {/* Image Height: 400px on desktop, 240px on mobile */}
            <div className="relative h-60 md:h-96 flex items-center justify-center">
              <img
                src={currentImage.url}
                alt={article.title}
                className="w-full h-full object-cover"
              />

              {/* Navigation Arrows */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={() =>
                      setCurrentImageIndex(
                        (prev) => (prev - 1 + displayImages.length) % displayImages.length
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition opacity-0 group-hover:opacity-100"
                    title="Gambar sebelumnya"
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <button
                    onClick={() =>
                      setCurrentImageIndex((prev) => (prev + 1) % displayImages.length)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition opacity-0 group-hover:opacity-100"
                    title="Gambar berikutnya"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>

                  {/* Image Counter */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {currentImageIndex + 1} / {displayImages.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Grid */}
            {hasMultipleImages && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex gap-2 overflow-x-auto">
                {displayImages.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-14 h-14 rounded border-2 overflow-hidden transition ${
                      idx === currentImageIndex
                        ? 'border-blue-500'
                        : 'border-gray-300 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt={`${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content Section */}
        <div className="px-4 md:px-6 py-5 md:py-6 space-y-4">
          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
            {article.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 pb-4 border-b border-gray-200">
            <span className="font-medium">{article.user.name}</span>
            <span className="text-gray-300">•</span>
            <span>{new Date(article.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            {article.created_at !== article.updated_at && (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-xs text-gray-400">Diedit {new Date(article.updated_at).toLocaleDateString('id-ID')}</span>
              </>
            )}
          </div>

          {/* Content */}
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
            {article.content}
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="text-center">
        <Link
          href="/dashboard/berita"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          <i className="fas fa-arrow-left"></i> Kembali ke Daftar Berita
        </Link>
      </div>
    </div>
  );
}
