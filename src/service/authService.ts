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
        const errorData = await response.json().catch(() => ({}));

        // Handle specific error cases
        if (response.status === 401) {
          throw new Error(errorData.message || 'Invalid email or password. Please check your credentials.');
        } else if (response.status === 404) {
          throw new Error('User account not found. Please check your email or register as a new user.');
        } else if (response.status === 403) {
          throw new Error(errorData.message || 'Your account is not active. Please contact support.');
        } else if (response.status === 400) {
          throw new Error(errorData.message || 'Invalid login credentials. Please check your email and password.');
        }

        throw new Error(errorData.message || `Login failed with status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unable to connect to the server. Please check your internet connection.');
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
        const errorData = await response.json().catch(() => ({}));

        // Handle specific error cases
        if (response.status === 401) {
          throw new Error(errorData.message || 'Invalid email or password. Please check your provider credentials.');
        } else if (response.status === 404) {
          throw new Error('Provider account not found. Please check your email or register as a new provider.');
        } else if (response.status === 403) {
          throw new Error(errorData.message || 'Your provider account is not active or pending approval. Please contact support.');
        } else if (response.status === 400) {
          throw new Error(errorData.message || 'Invalid login credentials. Please check your email and password.');
        }

        throw new Error(errorData.message || `Provider login failed with status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unable to connect to the server. Please check your internet connection.');
    }
  }

  async registerUser(userData: UserRegisterRequest, files?: {
    idFront?: File;
    idBack?: File;
  }): Promise<UserAuthResponse> {
    try {
      console.log('=== USER REGISTRATION DEBUG START ===');
      console.log('📝 [AuthService] registerUser called');
      console.log('📝 [AuthService] URL:', `${this.baseUrl}${API_CONFIG.ENDPOINTS.USER_REGISTER}`);
      console.log('📝 [AuthService] User data:', userData);
      console.log('📝 [AuthService] Files provided:', {
        hasIdFront: !!files?.idFront,
        hasIdBack: !!files?.idBack,
        idFrontName: files?.idFront?.name,
        idBackName: files?.idBack?.name,
        idFrontSize: files?.idFront?.size,
        idBackSize: files?.idBack?.size
      });

      let response;

      if (files && (files.idFront || files.idBack)) {
        console.log('📤 [AuthService] Using FormData (files present)');
        // Use FormData when files are present
        const formData = new FormData();

        // Add all text fields
        Object.entries(userData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            console.log(`  ➕ Adding field: ${key} = ${value}`);
            formData.append(key, value.toString());
          }
        });

        // Add files
        if (files.idFront) {
          console.log('  ➕ Adding id_front file:', files.idFront.name);
          formData.append('id_front', files.idFront);
        }
        if (files.idBack) {
          console.log('  ➕ Adding id_back file:', files.idBack.name);
          formData.append('id_back', files.idBack);
        }

        console.log('📤 [AuthService] FormData keys:', Array.from(formData.keys()));

        response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.USER_REGISTER}`, {
          method: 'POST',
          body: formData,
        });
      } else {
        console.log('📤 [AuthService] Using JSON (no files)');
        console.log('📤 [AuthService] JSON body:', JSON.stringify(userData, null, 2));

        // Use JSON when no files
        response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.USER_REGISTER}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
      }

      console.log('📥 [AuthService] Response status:', response.status);
      console.log('📥 [AuthService] Response ok:', response.ok);

      if (!response.ok) {
        console.error('❌ [AuthService] Registration failed with status:', response.status);
        const errorText = await response.text();
        console.error('❌ [AuthService] Error response body (raw):', errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
          console.error('❌ [AuthService] Error response body (parsed):', errorData);
        } catch (e) {
          console.error('❌ [AuthService] Could not parse error response as JSON');
          errorData = { message: errorText || 'User registration failed' };
        }

        console.log('=== USER REGISTRATION DEBUG END (FAILED) ===');
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ [AuthService] Registration successful:', data);
      console.log('=== USER REGISTRATION DEBUG END (SUCCESS) ===');
      return data;
    } catch (error) {
      console.error('❌ [AuthService] Exception during registration:', error);
      console.log('=== USER REGISTRATION DEBUG END (EXCEPTION) ===');
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
    console.log('💾 [AuthService] Storing auth data...');
    console.log('💾 [AuthService] Token to store:', authResponse.access_token ? `${authResponse.access_token.substring(0, 20)}...` : 'UNDEFINED/NULL');

    localStorage.setItem('access_token', authResponse.access_token);

    if ('user' in authResponse) {
      localStorage.setItem('user', JSON.stringify(authResponse.user));
      localStorage.setItem('userType', 'user');
      console.log('💾 [AuthService] Stored as user type');
    } else if ('provider' in authResponse) {
      localStorage.setItem('user', JSON.stringify(authResponse.provider));
      localStorage.setItem('userType', 'provider');
      console.log('💾 [AuthService] Stored as provider type');
    }

    localStorage.setItem('isAuthenticated', 'true');
    console.log('✅ [AuthService] Auth data stored successfully');
    console.log('✅ [AuthService] Verify stored token:', localStorage.getItem('access_token') ? `${localStorage.getItem('access_token')!.substring(0, 20)}...` : 'NOT FOUND');
  }

  getStoredUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getStoredUserType(): string | null {
    return localStorage.getItem('userType');
  }

  getStoredToken(): string | null {
    const token = localStorage.getItem('access_token');
    console.log('🔑 [AuthService] getStoredToken called, token found:', token ? `${token.substring(0, 20)}...` : 'NULL');
    return token;
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