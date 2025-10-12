// Provider types for admin management
export interface Provider {
  id: number;
  business_name: string;
  full_name: string;
  email: string;
  contact_number: string;
  address: string;
  bir_id_front: string | null;
  bir_id_back: string | null;
  business_permit: string | null;
  image_logo: string | null;
  about: string | null;
  is_active: boolean;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string | null;
  updated_at: string | null;
}

export interface UpdateProviderStatusRequest {
  status: 'active' | 'inactive' | 'suspended';
}

export interface UpdateProviderStatusResponse {
  message: string;
  provider: {
    id: number;
    full_name: string;
    email: string;
    status: string;
    is_active: boolean;
  };
}
