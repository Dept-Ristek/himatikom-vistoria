// src/types/index.ts

// Interface User sesuai database Laravel
export interface User {
  id: number;
  nim: string;
  name: string;
  email: string | null;
  role: 'anggota' | 'alumni' | 'pengurus';
  position: string | null;
  avatar: string | null;
  bio: string | null;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

// Interface Response Login dari API Laravel
export interface LoginResponse {
  status: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

// Interface untuk Error API (jika gagal login)
export interface ApiError {
  message?: string;
  errors?: Record<string, string[]>;
}

// ... tipe yang ada ...

export interface Reply {
  id: number;
  content: string;
  created_at: string;
  user: User;
}

// Update Post interface agar punya replies
export interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  created_at: string;
  user: User;
  replies?: Reply[]; // Tambahkan ini
}

// ... interface lain ...

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image: string | null;
  created_at: string;
}

// ... interface lain ...

export interface Proker {
  id: number;
  name: string;
  description: string;
  department: string;
  start_date: string;
  end_date: string;
}

export interface CommitteePosition {
  id: number;
  proker_id: number;
  name: string;
  quota: number;
  requirements: string;
  status: 'open' | 'closed';
  proker: Proker;
}

export interface CommitteeApplication {
  id: number;
  status: 'pending' | 'accepted' | 'rejected';
  motivation_letter: string;
  user: User;
  position: CommitteePosition;
}


export interface Ticket {
  id: number;
  user_id: number;
  category: string;
  description: string;
  status: 'pending' | 'process' | 'done';
  solution: string | null;
  created_at: string;
  updated_at: string;
  user: User;
}

export interface Ticket {
  id: number;
  user_id: number;
  category: string;
  description: string;
  status: 'pending' | 'process' | 'done';
  solution: string | null;
  created_at: string;
  updated_at: string;
  user: User;
}

export interface NewsArticle {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  category: string;
  user_id: number;
  created_at: string;
  user: User;
}

// ... interface lain ...

export interface Agenda {
  id: number;
  title: string;
  description: string | null;
  qr_code: string;
  start_time: string;
  end_time: string;
  created_at: string;
}

export interface Attendance {
  id: number;
  user_id: number;
  agenda_id: number;
  scanned_at: string;
  user: User;
}

// Committee Forms
export interface CommitteeFormDivision {
  id: number;
  committee_form_id: number;
  name: string;
  quota: number;
  order: number;
}

export interface CommitteeFormQuestion {
  id: number;
  committee_form_id: number;
  question: string;
  type: 'text' | 'textarea' | 'multiple_choice' | 'radio';
  options?: string[];
  required: boolean;
  order: number;
}

export interface CommitteeForm {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  status: 'active' | 'closed';
  open_at: string | null;
  close_at: string | null;
  created_at: string;
  divisions: CommitteeFormDivision[];
  questions: CommitteeFormQuestion[];
}

export interface CommitteeRegistrationAnswer {
  id: number;
  committee_registration_id: number;
  committee_form_question_id: number;
  answer: string;
  question?: CommitteeFormQuestion;
}

export interface CommitteeRegistration {
  id: number;
  user_id: number;
  committee_form_id: number;
  form_id?: number; // Alternative field name
  committee_form_division_id: number;
  division_id?: number; // Alternative field name
  division_ids?: number[]; // Array of selected divisions
  divisions?: CommitteeFormDivision[]; // Array of division objects
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user?: User;
  division?: CommitteeFormDivision;
  answers: CommitteeRegistrationAnswer[];
}