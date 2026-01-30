export interface Client {
  id: string;
  name: string;
  email: string;
  company_name: string;
}

export interface MetricValue {
  desktop: number;
  mobile: number;
}

export interface MetricLog {
  metric_name: string;
  metric_value: number;
  page_url: string;
  device_type: string;
  created_at: string;
}

export interface PerformanceData {
  summary: {
    lcp: MetricValue;
    cls: MetricValue;
    inp: MetricValue;
    ttfb: MetricValue;
    sample_size: number;
  };
  logs: MetricLog[];
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

export interface Project {
  id: string;
  user_id: string;
  client_name: string;
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

export interface Lead {
  id: string;
  email: string;
  name: string;
  service_type: string;
  package_name?: string;
  status: string;
  created_at: string;
  message: string;
  budget?: string;
  company?: string;
  current_step: number;
  details?: string;
}

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
