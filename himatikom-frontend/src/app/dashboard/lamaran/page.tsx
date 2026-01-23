'use client';

import React, { useState, useEffect } from 'react';
import { apiUrl } from '@/lib/api';

interface CommitteeDivision {
  id: number;
  name: string;
  quota: number;
}

interface CommitteeQuestion {
  id: number;
  question: string;
  type: 'text' | 'textarea' | 'multiple_choice' | 'radio';
  required: boolean;
  options?: string[];
}

interface CommitteeForm {
  id: number;
  name: string;
  description?: string;
  divisions: CommitteeDivision[];
  questions: CommitteeQuestion[];
  created_at: string;
  updated_at: string;
}

interface CommitteeRegistration {
  id: number;
  form_id: number;
  user_id: number;
  division_id: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  answers: Array<{
    id: number;
    question_id: number;
    answer: string;
  }>;
}

type FormAnswer = {
  question_id: number;
  answer: string;
};

export default function LamarPanitiaPage() {
  const [forms, setForms] = useState<CommitteeForm[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<CommitteeRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<CommitteeForm | null>(null);
  const [selectedDivisions, setSelectedDivisions] = useState<CommitteeDivision[]>([]);
  const [formAnswers, setFormAnswers] = useState<FormAnswer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
        const [formsRes, regsRes] = await Promise.all([
          fetch(apiUrl('/api/committee-forms'), {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(apiUrl('/api/committee-forms/my-registrations'), {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        const formsData = await formsRes.json();
        const regsData = await regsRes.json();

        if (formsData.status) setForms(formsData.data);
        if (regsData.status) setMyRegistrations(regsData.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getRegistrationStatus = (formId: number, divisionId: number) => {
    const reg = myRegistrations.find(
      r => r.form_id === formId && r.division_id === divisionId
    );
    return reg;
  };

  const getFormRegistrationStatus = (formId: number) => {
    return myRegistrations.filter(r => r.form_id === formId).length > 0;
  };

  const getFirstRegistrationAnswers = (formId: number) => {
    const firstReg = myRegistrations.find(r => r.form_id === formId);
    if (!firstReg) return null;
    
    return firstReg.answers.reduce((acc, ans) => {
      acc[ans.question_id] = ans.answer;
      return acc;
    }, {} as Record<number, string>);
  };

  const handleApplyClick = (form: CommitteeForm) => {
    // Allow opening form for new registrations
    // User can open form even if they have 1 registration (to add 2nd division)
    // Button will be disabled only when they have 2 registrations
    const registrationCount = myRegistrations.filter(r => r.form_id === form.id).length;
    
    if (registrationCount >= 2) {
      // Already registered to max divisions, prevent opening
      return;
    }

    setSelectedForm(form);
    setSelectedDivisions([]);
    setFormAnswers(form.questions.map(q => ({ question_id: q.id, answer: '' })));
    setIsFormOpen(true);
  };

  const toggleDivisionSelection = (division: CommitteeDivision) => {
    setSelectedDivisions(prev => {
      // Check if already selected
      const isSelected = prev.find(d => d.id === division.id);
      
      if (isSelected) {
        // Remove if already selected
        return prev.filter(d => d.id !== division.id);
      } else {
        // Add if not exceeding limit
        if (prev.length < 2) {
          return [...prev, division];
        } else {
          alert('Maksimal 2 divisi yang bisa dipilih');
          return prev;
        }
      }
    });
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setFormAnswers(prev =>
      prev.map(a => a.question_id === questionId ? { ...a, answer } : a)
    );
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForm || selectedDivisions.length === 0) return;

    // Validate required questions
    const unansweredRequired = selectedForm.questions.filter(q =>
      q.required && !formAnswers.find(a => a.question_id === q.id)?.answer
    );

    if (unansweredRequired.length > 0) {
      alert('Harap isi semua pertanyaan yang wajib diisi');
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem('access_token');

    try {
      // Submit all selected divisions at once with single answer set
      const res = await fetch(apiUrl('/api/committee-forms/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          form_id: selectedForm.id,
          division_ids: selectedDivisions.map(d => d.id),
          answers: formAnswers,
        }),
      });

      const data = await res.json();

      if (data.status) {
        alert(`Pendaftaran berhasil! Terdaftar ke ${selectedDivisions.length} divisi.`);
        setIsFormOpen(false);
        
        // Refresh registrations
        const regsRes = await fetch(apiUrl('/api/committee-forms/my-registrations'), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const regsData = await regsRes.json();
        if (regsData.status) setMyRegistrations(regsData.data);
      } else {
        alert(`Gagal mendaftar: ${data.message}`);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Koneksi gagal';
      alert('Terjadi kesalahan koneksi: ' + errorMsg);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
      case 'approved':
        return 'bg-green-100 text-green-700 border border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-700 border border-red-300';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Menunggu Seleksi';
      case 'approved':
        return 'Diterima';
      case 'rejected':
        return 'Ditolak';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat formulir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Lamar Panitia</h1>
        <p className="text-gray-500 mt-1">Pilih formulir dan divisi yang ingin Anda ikuti</p>
      </div>

      {/* Forms List */}
      {forms.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
          <i className="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 font-medium">Belum ada formulir pendaftaran</p>
          <p className="text-gray-400 text-sm mt-1">Silakan cek kembali nanti</p>
        </div>
      ) : (
        <div className="space-y-4">
          {forms.map(form => (
            <div
              key={form.id}
              className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
            >
              {/* Form Header */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">{form.name}</h2>
                    {form.description && (
                      <p className="text-gray-600 text-sm">{form.description}</p>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p className="font-medium">{form.divisions.length} Divisi</p>
                    <p className="text-xs">{form.questions.length} Pertanyaan</p>
                  </div>
                </div>
              </div>

              {/* Divisions */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase">Divisi yang Tersedia</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {form.divisions.map(division => {
                    const hasRegistration = myRegistrations.some(
                      r => r.form_id === form.id && r.division_id === division.id
                    );

                    return (
                      <div
                        key={division.id}
                        className={`border rounded-lg p-4 transition ${hasRegistration ? 'bg-green-50 border-green-200' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-800">{division.name}</h4>
                            <p className="text-xs text-gray-500 mt-1">Kuota: {division.quota} orang</p>
                          </div>
                          {hasRegistration && (
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-300">
                              <i className="fas fa-check mr-1"></i>Terdaftar
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
                {myRegistrations.filter(r => r.form_id === form.id).length >= 2 ? (
                  <button
                    disabled
                    className="px-6 py-2 bg-gray-300 text-gray-600 text-sm font-semibold rounded-lg cursor-not-allowed inline-flex items-center gap-2"
                  >
                    <i className="fas fa-check-circle"></i>
                    Sudah Mendaftar ke 2 Divisi
                  </button>
                ) : (
                  <button
                    onClick={() => handleApplyClick(form)}
                    className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition inline-flex items-center gap-2"
                  >
                    <i className="fas fa-edit"></i>
                    {myRegistrations.filter(r => r.form_id === form.id).length === 1
                      ? 'Tambah Divisi (1/2)'
                      : 'Daftar Form Ini'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Registration Modal */}
      {isFormOpen && selectedForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 border-b border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{selectedForm.name}</h2>
                  <p className="text-blue-100 text-sm mt-1">Pilih maksimal 2 divisi untuk didaftarkan</p>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="text-blue-100 hover:text-white transition"
                >
                  <i className="fas fa-times text-2xl"></i>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {selectedForm.description && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-900 text-sm">{selectedForm.description}</p>
                </div>
              )}

              <form onSubmit={handleSubmitRegistration} className="space-y-6">
                {/* Division Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-800">
                    Pilih Divisi
                    <span className="text-red-500 ml-1">*</span>
                    <span className="text-gray-500 font-normal text-xs ml-2">
                      ({selectedDivisions.length}/2 dipilih)
                    </span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedForm.divisions.map(division => {
                      // Check if already registered to this division
                      const alreadyRegistered = myRegistrations.some(
                        r => r.form_id === selectedForm.id && r.division_id === division.id
                      );

                      return (
                        <button
                          key={division.id}
                          type="button"
                          onClick={() => !alreadyRegistered && toggleDivisionSelection(division)}
                          disabled={alreadyRegistered}
                          className={`p-4 border-2 rounded-lg text-left transition ${
                            alreadyRegistered
                              ? 'border-green-300 bg-green-50 cursor-not-allowed opacity-60'
                              : selectedDivisions.find(d => d.id === division.id)
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-300 bg-white hover:border-gray-400'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-800">{division.name}</p>
                              <p className="text-xs text-gray-500">Kuota: {division.quota} orang</p>
                              {alreadyRegistered && (
                                <p className="text-xs text-green-600 mt-1">✓ Sudah Terdaftar</p>
                              )}
                            </div>
                            {!alreadyRegistered && selectedDivisions.find(d => d.id === division.id) && (
                              <i className="fas fa-check-circle text-blue-600 text-lg"></i>
                            )}
                            {alreadyRegistered && (
                              <i className="fas fa-check-circle text-green-600 text-lg"></i>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {selectedDivisions.length === 0 && (
                    <p className="text-sm text-red-500">Pilih minimal 1 divisi</p>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t-2 border-gray-200 pt-6"></div>

                {/* Form Questions */}
                <div className="space-y-6">
                  <h3 className="text-sm font-semibold text-gray-800">Jawab Pertanyaan Berikut</h3>
                  {selectedForm.questions.map((question, idx) => {
                    const answer = formAnswers.find(a => a.question_id === question.id)?.answer || '';

                    return (
                      <div key={question.id} className="space-y-3">
                        <label className="block">
                          <span className="text-sm font-semibold text-gray-800">
                            {idx + 1}. {question.question}
                            {question.required && <span className="text-red-500 ml-1">*</span>}
                          </span>
                        </label>

                        {question.type === 'text' && (
                          <input
                            type="text"
                            value={answer}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            placeholder="Jawab di sini..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            required={question.required}
                          />
                        )}

                        {question.type === 'textarea' && (
                          <textarea
                            value={answer}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            placeholder="Jawab di sini..."
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                            required={question.required}
                          />
                        )}

                        {question.type === 'radio' && (
                          <div className="space-y-2">
                            {question.options?.map((option, optIdx) => (
                              <label key={optIdx} className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`question_${question.id}`}
                                  value={option}
                                  checked={answer === option}
                                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                  className="w-4 h-4 text-blue-600"
                                  required={question.required && !answer}
                                />
                                <span className="text-gray-700 text-sm">{option}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {question.type === 'multiple_choice' && (
                          <div className="space-y-2">
                            {question.options?.map((option, optIdx) => (
                              <label key={optIdx} className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  value={option}
                                  checked={answer.includes(option)}
                                  onChange={(e) => {
                                    const answers = answer.split('|').filter(Boolean);
                                    if (e.target.checked) {
                                      answers.push(option);
                                    } else {
                                      answers.splice(answers.indexOf(option), 1);
                                    }
                                    handleAnswerChange(question.id, answers.join('|'));
                                  }}
                                  className="w-4 h-4 text-blue-600 rounded"
                                />
                                <span className="text-gray-700 text-sm">{option}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || selectedDivisions.length === 0}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner animate-spin"></i>
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check"></i>
                        Kirim Pendaftaran ({selectedDivisions.length} Divisi)
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}