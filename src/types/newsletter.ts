export interface Newsletter {
  id: string;
  subject: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sent';
  scheduled_for: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewsletterFormData extends Omit<Newsletter, 'id' | 'created_at' | 'updated_at' | 'sent_at'> {
  id?: string;
  sent_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface NewsletterMetrics {
  id: string;
  subject: string;
  sent_at: string;
  total_subscribers: number;
  sent_count: number;
  delivered_count: number;
  failed_count: number;
  open_rate: number;
} 