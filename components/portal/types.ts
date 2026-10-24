export interface BusinessEntity {
  id: string;
  name: string;
  email?: string;
  company_name?: string;
  created_at?: string;
  status?: string;
}

export interface Client extends BusinessEntity {
  id: string;
  name: string;
  email: string;
  company_name: string;
}

export interface Project extends BusinessEntity {
  id: string;
  user_id: string;
  client_name: string; // This matches name in Client
  company_name?: string;
  name: string;
  type: string;
  status: string;
  progress: number;
  budget: string;
  drive_link: string;
  next_milestone: string;
  next_milestone_date: string;
  documents?: ProjectDoc[];
  milestones?: Milestone[];
}

export interface Lead extends BusinessEntity {
  id: string;
  email: string;
  name: string;
  service_type: string;
  package_name?: string;
  status: string;
  created_at: string;
  message: string;
  budget?: string;
  /** Kolumna D1 `leads.company` (get_leads robi SELECT *). */
  company?: string | null;
  /** Starsze rekordy/inne źródła mogły nieść `company_name` — fallback. */
  company_name?: string;
  phone?: string | null;
  website?: string | null;
  source?: string | null;
  source_url?: string | null;
  current_step: number;
  details?: string;
  service_interest?: string;
}

export interface MetricLog {
  metric_name: string;
  metric_value: number | null;
  page_url: string | null;
  device_type: string | null;
  created_at: string;
}

/** Wiersz `averages` z admin/get_performance_stats (GROUP BY metric_name, device_type). */
export interface MetricAverage {
  metric_name: string;
  device_type?: string | null;
  avg_value: number | null;
  count: number;
}

/** Kontrakt admin/get_performance_stats (wcześniej UI czytał nieistniejące summary/logs). */
export interface PerformanceData {
  averages?: MetricAverage[];
  recent?: MetricLog[];
  sample_size?: number;
}

export interface ProjectDoc {
  id: string;
  name: string;
  file_path: string;
  type: 'invoice' | 'document';
  subtype: string;
  created_at: string;
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description: string;
  due_date: string;
  status: 'pending' | 'accepted' | 'corrections';
  feedback: string;
}

export type MilestoneStatus = Milestone['status'];

export interface Message {
  id: string;
  content: string;
  sender_type: 'client' | 'admin';
  created_at: string;
  is_read?: string | number;
}

export interface Conversation {
  id: string;
  name: string;
  email: string;
  company_name: string;
  unread_count: number;
}
