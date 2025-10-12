export interface ChatActor {
  id: number;
  actor_type: 'user' | 'provider';
  user_id?: number;
  provider_id?: number;
  name: string;
  email: string;
}

export interface ChatMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_name: string;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'system';
  body?: string;
  attachment_path?: string;
  attachment_url?: string;
  attachment_mime?: string;
  attachment_size?: number;
  attachment_duration_ms?: number;
  attachment_width?: number;
  attachment_height?: number;
  thumbnail_path?: string;
  created_at: string;
  is_read: boolean;
}

export interface ChatConversation {
  id: number;
  is_group: boolean;
  title?: string;
  participants: ChatActor[];
  last_message?: ChatMessage;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface SendMessageRequest {
  message_type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'system';
  body?: string;
  attachment_path?: string;
  attachment_url?: string;
  attachment_mime?: string;
  attachment_size?: number;
  attachment_duration_ms?: number;
  attachment_width?: number;
  attachment_height?: number;
  thumbnail_path?: string;
}

export interface CreateConversationRequest {
  participant_id: number;
  participant_type: 'user' | 'provider';
  is_group?: boolean;
  title?: string;
}

export interface FileUploadResponse {
  success: boolean;
  url?: string;
  attachment_path?: string;
  filename?: string;
  original_filename?: string;
  mime_type?: string;
  file_size?: number;
  width?: number;
  height?: number;
  duration_ms?: number;
  thumbnail_url?: string;
  error?: string;
}
