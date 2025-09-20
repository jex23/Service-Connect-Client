export interface ProviderProfile {
  id: number;
  business_name: string;
  full_name: string;
  email: string;
  contact_number: string;
  address?: string;
  bir_id_front?: string;
  bir_id_back?: string;
  business_permit?: string;
  image_logo?: string;
  about?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProviderProfileUpdateRequest {
  business_name?: string;
  full_name?: string;
  address?: string;
  about?: string;
  password?: string;
}

export interface ProviderProfileResponse extends ProviderProfile {
  message?: string;
}

export interface ProviderProfileUpdateResponse extends ProviderProfile {
  message?: string;
  uploaded_files?: {
    bir_id_front?: string;
    bir_id_back?: string;
    business_permit?: string;
    image_logo?: string;
  };
}

export interface ProviderProfileUpdateWithFilesRequest {
  business_name?: string;
  full_name?: string;
  address?: string;
  about?: string;
  password?: string;
  bir_id_front?: File;
  bir_id_back?: File;
  business_permit?: File;
  image_logo?: File;
}

export interface ProviderDocumentUploadRequest {
  provider_id: number;
  document_type: 'image_logo' | 'bir_id_front' | 'bir_id_back' | 'business_permit';
  file: File;
}

export interface ProviderDocumentUploadResponse {
  message: string;
  document_url: string;
  document_type: string;
}

export interface ProviderDeleteResponse {
  message: string;
}

