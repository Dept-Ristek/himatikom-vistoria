'use client';

import React, { useState, useEffect } from 'react';
import { apiUrl } from '@/lib/api';
import { CommitteeForm, CommitteeRegistration, User } from '@/types';

export default function RekrutmenPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [forms, setForms] = useState<CommitteeForm[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modes
  const [mode, setMode] = useState<'list' | 'create' | 'edit' | 'registrations'>('list');
  const [selectedForm, setSelectedForm] = useState<CommitteeForm | null>(null);
  const [registrations, setRegistrations] = useState<CommitteeRegistration[]>([]);
  
  // Create Form State
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [divisions, setDivisions] = useState<Array<{ name: string; quota: number }>>([{ name: '', quota: 1 }]);
  const [questions, setQuestions] = useState<Array<{ question: string; type: 'text' | 'textarea' | 'multiple_choice' | 'radio'; required: boolean; options: string[] }>>([{ question: '', type: 'text', required: true, options: [] }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch user & forms
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    // Get current user
    fetch(apiUrl('/api/auth/me'), {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.status) setCurrentUser(data.data);
    });

    // Get forms
    void fetchForms(token as string);
  }, []);

  // Monitor mode changes
  useEffect(() => {
    console.log('Mode changed to:', mode);
  }, [mode]);

  const fetchForms = async (token: string) => {
    try {
      console.log('Fetching forms with token:', token);
      const res = await fetch(apiUrl('/api/committee-forms'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      console.log('Forms response:', data);
      if (data.status) {
        setForms(data.data);
      } else {
        console.error('Forms API error:', data.message);
      }
    } catch (err) {
      console.error('Fetch forms error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Token tidak ditemukan');
      setIsSubmitting(false);
      return;
    }

    try {
      const isEdit = mode === 'edit' && selectedForm;
      const url = isEdit 
        ? apiUrl(`/api/committee-forms/${selectedForm.id}`)
        : apiUrl('/api/committee-forms');
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formName,
          description: formDescription,
          divisions: divisions.filter(d => d.name),
          questions: questions.filter(q => q.question)
        })
      });

      const data = await res.json();
      if (data.status) {
        alert(isEdit ? 'Form berhasil diupdate!' : 'Form berhasil dibuat!');
        setFormName('');
        setFormDescription('');
        setDivisions([{ name: '', quota: 1 }]);
        setQuestions([{ question: '', type: 'text', required: true, options: [] }]);
        setSelectedForm(null);
        setMode('list');
        void fetchForms(token);
      } else {
        alert(data.message || (isEdit ? 'Gagal mengupdate form' : 'Gagal membuat form'));
      }
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterForm = async (e: React.FormEvent) => {
    e.preventDefault();
  };

  const fetchRegistrations = async (formId: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    
    try {
      const res = await fetch(apiUrl(`/api/committee-forms/${formId}/registrations`), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status) setRegistrations(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (registrationId: number, newStatus: 'pending' | 'approved' | 'rejected') => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Token tidak ditemukan');
      return;
    }
    
    try {
      const res = await fetch(apiUrl(`/api/committee-forms/registrations/${registrationId}/status`), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (data.status && selectedForm) {
        await fetchRegistrations(selectedForm.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRegistration = async (registrationId: number, userName: string, divisionName: string) => {
    if (!confirm(`Hapus pendaftaran ${userName} dari divisi ${divisionName}? Tindakan ini tidak dapat dibatalkan.`)) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Token tidak ditemukan');
      return;
    }

    try {
      const res = await fetch(apiUrl(`/api/committee-forms/registrations/${registrationId}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      
      if (data.status) {
        alert(data.message || 'Pendaftaran berhasil dihapus');
        if (selectedForm) {
          await fetchRegistrations(selectedForm.id);
        }
      } else {
        // Handle both 404 and other error responses
        alert(data.message || 'Gagal menghapus pendaftaran');
      }
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleEditForm = (form: CommitteeForm) => {
    setSelectedForm(form);
    setFormName(form.name);
    setFormDescription(form.description || '');
    setDivisions(form.divisions.map(d => ({ name: d.name, quota: d.quota })));
    setQuestions(form.questions.map(q => ({ question: q.question, type: q.type as any, required: q.required, options: q.options || [] })));
    setMode('edit');
  };

  const handleDeleteForm = async (formId: number) => {
    if (!confirm('Hapus form ini? Tindakan ini tidak dapat dibatalkan.')) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Token tidak ditemukan');
      return;
    }

    try {
      const res = await fetch(apiUrl(`/api/committee-forms/${formId}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (data.status) {
        alert('Form berhasil dihapus!');
        void fetchForms(token);
      } else {
        alert(data.message || 'Gagal menghapus form');
      }
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Panitia</h1>
            <p className="text-xs text-gray-500 mt-0.5">Kelola form pendaftaran panitia</p>
          </div>
          <button
            type="button"
            onClick={() => {
              console.log('Buat Form clicked, current mode:', mode);
              console.log('Setting mode to: create');
              setMode('create');
              console.log('Mode state updated');
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition flex items-center gap-2 cursor-pointer"
          >
            <i className="fas fa-plus"></i> Buat Form
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* LIST FORMS */}
        {mode === 'list' && (
          <div className="space-y-4">
            <div className="space-y-3">
              {forms.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <i className="fas fa-inbox text-3xl text-gray-300 mb-2 block"></i>
                  <p className="text-sm text-gray-600">Belum ada form panitia</p>
                </div>
              ) : (
                forms.map(form => (
                  <div key={form.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{form.name}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{form.description}</p>
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">{form.divisions.length}</span> divisi • <span className="font-medium">{form.questions.length}</span> pertanyaan
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedForm(form);
                            fetchRegistrations(form.id);
                            setMode('registrations');
                          }}
                          className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-medium rounded transition"
                          title="Lihat Pendaftaran"
                        >
                          <i className="fas fa-list"></i>
                        </button>
                        <button
                          onClick={() => handleEditForm(form)}
                          className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium rounded transition"
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteForm(form.id)}
                          className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded transition"
                          title="Hapus"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* CREATE/EDIT FORM */}
        {(mode === 'create' || mode === 'edit') && (
          <div className="space-y-4">
            <button
              onClick={() => {
                setMode('list');
                setSelectedForm(null);
                setFormName('');
                setFormDescription('');
                setDivisions([{ name: '', quota: 1 }]);
                setQuestions([{ question: '', type: 'text', required: true, options: [] }]);
              }}
              className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded border border-gray-200"
            >
              ← Kembali
            </button>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {mode === 'create' ? 'Buat Form Panitia' : 'Edit Form Panitia'}
              </h2>
              <form onSubmit={handleCreateForm} className="space-y-4">
              {/* Form Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Form</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Misal: Panitia Workshop 2026"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi (Opsional)</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Jelaskan form ini..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              {/* Divisions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Divisi</label>
                <div className="space-y-2">
                  {divisions.map((div, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={div.name}
                        onChange={(e) => {
                          const newDivisions = [...divisions];
                          newDivisions[idx].name = e.target.value;
                          setDivisions(newDivisions);
                        }}
                        placeholder="Nama divisi"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                      <input
                        type="number"
                        min="0"
                        value={div.quota}
                        onChange={(e) => {
                          const newDivisions = [...divisions];
                          newDivisions[idx].quota = parseInt(e.target.value) || 0;
                          setDivisions(newDivisions);
                        }}
                        placeholder="Kuota"
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setDivisions(divisions.filter((_, i) => i !== idx))}
                        className="px-2 py-2 text-red-600 hover:bg-red-50 rounded text-xs"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setDivisions([...divisions, { name: '', quota: 1 }])}
                  className="mt-2 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded border border-blue-200"
                >
                  + Tambah Divisi
                </button>
              </div>

              {/* Questions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pertanyaan</label>
                <div className="space-y-3">
                  {questions.map((q, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-3 space-y-2">
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => {
                          const newQuestions = [...questions];
                          newQuestions[idx].question = e.target.value;
                          setQuestions(newQuestions);
                        }}
                        placeholder="Pertanyaan..."
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                      
                      <div className="flex gap-2">
                        <select
                          value={q.type}
                          onChange={(e) => {
                            const newQuestions = [...questions];
                            newQuestions[idx].type = e.target.value as any;
                            setQuestions(newQuestions);
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                        >
                          <option value="text">Text</option>
                          <option value="textarea">Textarea</option>
                          <option value="multiple_choice">Multiple Choice</option>
                          <option value="radio">Radio</option>
                        </select>
                        
                        <label className="flex items-center gap-1 text-sm">
                          <input
                            type="checkbox"
                            checked={q.required}
                            onChange={(e) => {
                              const newQuestions = [...questions];
                              newQuestions[idx].required = e.target.checked;
                              setQuestions(newQuestions);
                            }}
                          />
                          Wajib
                        </label>

                        <button
                          type="button"
                          onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}
                          className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-xs"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>

                      {/* Options for multiple_choice and radio */}
                      {(q.type === 'multiple_choice' || q.type === 'radio') && (
                        <div className="mt-2 pt-2 border-t border-gray-100 space-y-2">
                          <label className="block text-xs font-medium text-gray-600">Opsi Pilihan:</label>
                          {(q.options || []).map((opt, optIdx) => (
                            <div key={optIdx} className="flex gap-2">
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  const newQuestions = [...questions];
                                  if (!newQuestions[idx].options) newQuestions[idx].options = [];
                                  newQuestions[idx].options[optIdx] = e.target.value;
                                  setQuestions(newQuestions);
                                }}
                                placeholder="Opsi..."
                                className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newQuestions = [...questions];
                                  newQuestions[idx].options = newQuestions[idx].options.filter((_, i) => i !== optIdx);
                                  setQuestions(newQuestions);
                                }}
                                className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-xs"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const newQuestions = [...questions];
                              if (!newQuestions[idx].options) newQuestions[idx].options = [];
                              newQuestions[idx].options.push('');
                              setQuestions(newQuestions);
                            }}
                            className="text-xs text-blue-600 hover:bg-blue-50 rounded px-2 py-1"
                          >
                            + Tambah Opsi
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setQuestions([...questions, { question: '', type: 'text', required: true, options: [] }])}
                  className="mt-2 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded border border-blue-200"
                >
                  + Tambah Pertanyaan
                </button>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setMode('list');
                    setSelectedForm(null);
                    setFormName('');
                    setFormDescription('');
                    setDivisions([{ name: '', quota: 1 }]);
                    setQuestions([{ question: '', type: 'text', required: true, options: [] }]);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : (mode === 'edit' ? 'Update Form' : 'Buat Form')}
                </button>
              </div>
            </form>
            </div>
          </div>
        )}

        {/* REGISTRATIONS LIST */}
        {mode === 'registrations' && selectedForm && (
          <div className="space-y-4">
            <button
              onClick={() => {
                setMode('list');
                setSelectedForm(null);
                setRegistrations([]);
              }}
              className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded border border-gray-200"
            >
              ← Kembali
            </button>

            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">{selectedForm.name}</h2>
              <p className="text-sm text-gray-600">{selectedForm.description}</p>
            </div>

            {/* Registrations */}
            {registrations.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Belum ada pendaftaran</p>
              </div>
            ) : (
              <div className="space-y-3">
                {registrations.map((reg) => {
                  // Get divisions from division_ids array if available, otherwise use single division
                  const divisionIds = reg.division_ids || [reg.division_id];
                  const divisions = reg.divisions || [reg.division];

                  return (
                    <div key={reg.id} className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{reg.user?.name}</h4>
                          <p className="text-xs text-gray-600">{reg.user?.nim}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Divisi: <span className="font-medium">
                              {divisions.map((d: any) => d.name).join(', ')}
                            </span>
                          </p>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          reg.status === 'approved' ? 'bg-green-100 text-green-700' :
                          reg.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {reg.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Answers - Show once for all divisions */}
                      {reg.answers && reg.answers.length > 0 && (
                        <div className="text-xs text-gray-600 space-y-1 pt-2 border-t border-gray-100">
                          {reg.answers.map((ans: any) => (
                            <div key={ans.id}>
                              <span className="font-medium">{ans.question?.question}:</span> {ans.answer}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        {reg.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(reg.id, 'approved')}
                              className="flex-1 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-medium rounded"
                            >
                              Terima
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(reg.id, 'rejected')}
                              className="flex-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded"
                            >
                              Tolak
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteRegistration(reg.id, reg.user?.name || 'Unknown', divisions.map((d: any) => d.name).join(', '))}
                          className="flex-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded"
                          title="Hapus Pendaftaran"
                        >
                          <i className="fas fa-trash mr-1"></i>Hapus
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}