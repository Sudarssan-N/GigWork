export type UserRole = 'customer' | 'worker' | 'admin'
export type TaskStatus = 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn'
export type BookingStatus = 'pending_payment' | 'paid' | 'in_progress' | 'completed' | 'disputed' | 'refunded'

export interface Profile {
  id: string
  role: UserRole
  full_name: string | null
  email: string | null
  phone: string | null
  avatar_url: string | null
  city: string | null
  latitude?: number | null
  longitude?: number | null
  has_worker_profile?: boolean
  worker_verified?: boolean
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
}

export interface Task {
  id: string
  customer_id: string
  category_id: string
  title: string
  description: string
  address: string
  city: string
  latitude: number | null
  longitude: number | null
  budget_min: number | null
  budget_max: number | null
  scheduled_at: string | null
  duration_hours: number | null
  status: TaskStatus
  created_at: string
  category?: Category
  application_count?: number
}

export interface Application {
  id: string
  task_id: string
  worker_id: string
  proposed_price: number
  message: string | null
  status: ApplicationStatus
  created_at: string
  worker?: Profile
}

export interface Booking {
  id: string
  task_id: string
  application_id: string
  customer_id: string
  worker_id: string
  agreed_price: number
  platform_fee: number
  worker_payout: number
  total_charge: number
  status: BookingStatus
  created_at: string
  task?: Task
}

export interface WorkerProfile {
  id: string
  bio: string | null
  skills: string[]
  hourly_rate: number | null
  verification_status: string
  id_doc_url: string | null
  availability: Record<string, boolean> | null
  rating_avg: number
  rating_count: number
}

export interface AdminStats {
  total_users: number
  total_customers: number
  total_workers: number
  pending_verifications: number
  verified_workers: number
  total_tasks: number
  total_bookings: number
  completed_bookings: number
  platform_revenue: number
}

export interface AdminUser {
  id: string
  role: UserRole
  full_name: string | null
  email: string | null
  phone: string | null
  city: string | null
  created_at: string
}

export interface AdminWorker {
  id: string
  bio: string | null
  skills: string[]
  hourly_rate: number | null
  verification_status: string
  id_doc_url: string | null
  availability: Record<string, boolean> | null
  rating_avg: number
  rating_count: number
  created_at: string
  profile: {
    id: string
    full_name: string | null
    phone: string | null
    city: string | null
    created_at: string
  } | null
}