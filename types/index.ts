// Central type definitions for the UCIC website

export interface SiteContent {
  id: string
  key: string
  value: string | null
  value_json: Record<string, unknown> | null
  content_type: 'text' | 'html' | 'json'
  label: string | null
  updated_at: string
}

export interface SiteStat {
  id: string
  label: string
  value: string
  icon: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  name: string
  role: string
  bio: string | null
  photo_url: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Experience {
  id: string
  title: string
  description: string | null
  year: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface TimelineItem {
  id: string
  year: string
  title: string
  description: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export type RegistrationMode = 'none' | 'internal' | 'external'

export interface Event {
  id: string
  title: string
  slug: string
  description: string | null
  date: string | null
  end_date: string | null
  location: string | null
  cover_image_url: string | null
  capacity: number | null
  deadline: string | null
  is_published: boolean
  registration_mode: RegistrationMode
  external_registration_url: string | null
  one_submission_per_email: boolean
  email_field_id: string | null
  created_at: string
  updated_at: string
}

export type FieldType =
  | 'short_text'
  | 'long_text'
  | 'email'
  | 'phone'
  | 'number'
  | 'date'
  | 'dropdown'
  | 'radio'
  | 'checkboxes'
  | 'yes_no'
  | 'file_upload'
  | 'section_header'

export interface FieldOption {
  id: string
  label: string
}

export interface FormField {
  id: string
  event_id: string
  field_type: FieldType
  label: string
  help_text: string | null
  placeholder: string | null
  required: boolean
  options: FieldOption[] | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Registration {
  id: string
  event_id: string
  answers: Record<string, unknown>
  submitted_email: string | null
  created_at: string
}

export interface ContentMap {
  [key: string]: string
}
