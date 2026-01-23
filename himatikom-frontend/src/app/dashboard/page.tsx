'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User } from '@/types';
import { apiUrl } from '@/lib/api';

interface Agenda {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  type?: 'pengurus' | 'semua';
}

interface NewsArticle {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  category: string;
  user: {
    name: string;
  };
  created_at: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Fetch user
      fetch(apiUrl('/api/auth/me'), {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.status) setUser(data.data);
        });

      // Fetch agendas
      fetch(apiUrl('/api/agendas'), {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.status && data.data) {
            // Filter berdasarkan role & type
            let filtered = data.data;
            if (user?.role !== 'pengurus') {
              filtered = filtered.filter((a: Agenda) => a.type === 'semua');
            }
            // Sort by start_time
            const sorted = filtered.sort((a: Agenda, b: Agenda) =>
              new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
            );
            setAgendas(sorted.slice(0, 4));
          }
        });

      // Fetch news
      fetch(apiUrl('/api/news'), {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.status && data.data) {
            setNews(data.data.slice(0, 3));
          }
        })
        .finally(() => setLoading(false));
    }
  }, [user?.role]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleString('id-ID', { month: 'short' }),
      time: date.toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Halo, {user?.name || 'User'} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">Ringkasan aktivitas terbaru Anda</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Agenda Section */}
          <div className="bg-white rounded border border-gray-200">
            <div className="px-4 md:px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-sm md:text-base font-bold text-gray-900">Agenda Terdekat</h2>
              <Link href="/dashboard/agenda" className="text-xs font-medium text-blue-600 hover:text-blue-700">
                Lihat Semua <i className="fas fa-arrow-right ml-1"></i>
              </Link>
            </div>

            <div className="divide-y divide-gray-200">
              {agendas.length === 0 ? (
                <div className="px-4 md:px-5 py-6 text-center text-gray-500 text-sm">
                  Tidak ada agenda tersedia
                </div>
              ) : (
                agendas.map((agenda) => {
                  const { day, month, time } = formatDate(agenda.start_time);
                  return (
                    <Link
                      key={agenda.id}
                      href={`/dashboard/agenda/${agenda.id}`}
                      className="px-4 md:px-5 py-3 hover:bg-gray-50 transition block group"
                    >
                      <div className="flex items-start gap-3">
                        {/* Date */}
                        <div className="bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded text-center min-w-[55px] flex-shrink-0">
                          <div className="text-[10px] font-bold uppercase">{month}</div>
                          <div className="text-lg font-bold">{day}</div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600">
                            {agenda.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            <i className="far fa-clock mr-1"></i>{time}
                          </p>
                        </div>
                        <i className="fas fa-chevron-right text-gray-300 group-hover:text-blue-600 text-xs flex-shrink-0 mt-0.5"></i>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          {/* News Section */}
          <div className="bg-white rounded border border-gray-200">
            <div className="px-4 md:px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-sm md:text-base font-bold text-gray-900">Berita Terbaru</h2>
              <Link href="/dashboard/berita" className="text-xs font-medium text-blue-600 hover:text-blue-700">
                Lihat Semua <i className="fas fa-arrow-right ml-1"></i>
              </Link>
            </div>

            <div className="divide-y divide-gray-200">
              {news.length === 0 ? (
                <div className="px-4 md:px-5 py-6 text-center text-gray-500 text-sm">
                  Belum ada berita
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 md:p-5">
                  {news.map((article) => (
                    <Link
                      key={article.id}
                      href={`/dashboard/berita/${article.id}`}
                      className="group flex flex-col rounded border border-gray-200 overflow-hidden hover:shadow-md hover:border-gray-300 transition"
                    >
                      {/* Image */}
                      <div className="h-32 bg-gray-100 overflow-hidden flex-shrink-0">
                        {article.image_url ? (
                          <img
                            src={article.image_url}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <i className="fas fa-image text-gray-400 text-2xl"></i>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-3 flex-1 flex flex-col">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">
                            {article.category}
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 mb-2">
                          {article.title}
                        </h3>
                        <p className="text-[11px] text-gray-600 line-clamp-2 mb-2 flex-grow">
                          {article.content}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(article.created_at).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}