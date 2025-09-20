import { API_CONFIG } from '../constants/api';
import type { 
  LoginRequest, 
  UserRegisterRequest, 
  ProviderRegisterRequest,
  UserAuthResponse,
  ProviderAuthResponse,
  AuthResponse 
} from '../types/auth';

class AuthService {
  private baseUrl = API_CONFIG.BASE_URL;

  async loginUser(credentials: LoginRequest): Promise<UserAuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.USER_LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'User login failed' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred during user login');
    }
  }

  async loginProvider(credentials: LoginRequest): Promise<ProviderAuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.PROVIDER_LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Provider login failed' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred during provider login');
    }
  }

  async registerUser(userData: UserRegisterRequest, files?: {
    idFront?: File;
    idBack?: File;
  }): Promise<UserAuthResponse> {
    try {
      let response;
      
      if (files && (files.idFront || files.idBack)) {
        // Use FormData when files are present
        const formData = new FormData();
        
        // Add all text fields
        Object.entries(userData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });
        
        // Add files
        if (files.idFront) {
          formData.append('id_front', files.idFront);
        }
        if (files.idBack) {
          formData.append('id_back', files.idBack);
        }
        
        response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.USER_REGISTER}`, {
          method: 'POST',
          body: formData,
        });
      } else {
        // Use JSON when no files
        response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.USER_REGISTER}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'User registration failed' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred during user registration');
    }
  }

  async registerProvider(providerData: ProviderRegisterRequest, files?: {
    birIdFront?: File;
    birIdBack?: File;
    businessPermit?: File;
    imageLogo?: File;
  }): Promise<ProviderAuthResponse> {
    try {
      let response;
      
      if (files && (files.birIdFront || files.birIdBack || files.businessPermit || files.imageLogo)) {
        // Use FormData when files are present
        const formData = new FormData();
        
        // Add all text fields
        Object.entries(providerData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });
        
        // Add files
        if (files.birIdFront) {
          formData.append('bir_id_front', files.birIdFront);
        }
        if (files.birIdBack) {
          formData.append('bir_id_back', files.birIdBack);
        }
        if (files.businessPermit) {
          formData.append('business_permit', files.businessPermit);
        }
        if (files.imageLogo) {
          formData.append('image_logo', files.imageLogo);
        }
        
        response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.PROVIDER_REGISTER}`, {
          method: 'POST',
          body: formData,
        });
      } else {
        // Use JSON when no files
        response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.PROVIDER_REGISTER}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(providerData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Provider registration failed' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred during provider registration');
    }
  }

  storeAuthData(authResponse: AuthResponse): void {
    localStorage.setItem('access_token', authResponse.access_token);
    
    if ('user' in authResponse) {
      localStorage.setItem('user', JSON.stringify(authResponse.user));
      localStorage.setItem('userType', 'user');
    } else if ('provider' in authResponse) {
      localStorage.setItem('user', JSON.stringify(authResponse.provider));
      localStorage.setItem('userType', 'provider');
    }
    
    localStorage.setItem('isAuthenticated', 'true');
  }

  getStoredUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getStoredUserType(): string | null {
    return localStorage.getItem('userType');
  }

  getStoredToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    return localStorage.getItem('isAuthenticated') === 'true';
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userType');
  }
}

export const authService = new AuthService();