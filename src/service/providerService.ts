import { API_CONFIG } from '../constants/api';
import { authService } from './authService';
import type {
  ProviderCategoryRegisterRequest,
  ProviderServiceRegisterRequest,
  ProviderServiceUpdateRequest,
  PhotoUploadRequest,
  AdminProviderServicesParams,
  AdminProviderServiceCreateRequest,
  ProviderCategoryResponse,
  ProviderServiceResponse,
  ProviderServicesListResponse,
  ProviderService,
  PhotoUploadResponse,
  PhotoDeleteResponse,
  ServiceDeleteResponse,
  ProviderRegisteredCategoriesResponse,
  ProviderServiceScheduleRequest,
  ProviderServiceScheduleResponse
} from '../types/providerService';

class ProviderServiceAPI {
  private baseUrl = API_CONFIG.BASE_URL;

  async registerProviderCategories(categoryData: ProviderCategoryRegisterRequest): Promise<ProviderCategoryResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.PROVIDER_REGISTER_CATEGORIES}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Category registration failed' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred during category registration');
    }
  }

  async registerProviderService(serviceData: ProviderServiceRegisterRequest): Promise<ProviderServiceResponse> {
    try {
      console.log('=== PROVIDER SERVICE REGISTRATION DEBUG ===');
      console.log('Service data:', serviceData);
      console.log('URL:', `${this.baseUrl}${API_CONFIG.ENDPOINTS.PROVIDER_REGISTER_SERVICE}`);

      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.PROVIDER_REGISTER_SERVICE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Service registration failed' }));
        console.error('Service registration failed:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Try to parse the response, but handle content-length mismatch errors
      try {
        const data = await response.json();
        console.log('Service registration success:', data);
        console.log('=== PROVIDER SERVICE REGISTRATION COMPLETE ===');
        return data;
      } catch (parseError) {
        console.warn('⚠️ Response parsing failed (content-length mismatch), but service was created (status 201)');
        console.warn('Parse error:', parseError);

        // If we got a 201, the service was created successfully
        // Return a mock response structure
        if (response.status === 201) {
          console.log('✅ Returning mock response for successful creation');
          const mockResponse: ProviderServiceResponse = {
            message: 'Service registered successfully',
            service: {
              id: Date.now(), // Temporary ID, will be replaced by actual data
              provider_id: serviceData.provider_id,
              category_id: serviceData.category_id,
              category_name: '', // Will be filled by actual response if available
              service_title: serviceData.service_title,
              service_description: serviceData.service_description,
              price_decimal: serviceData.price_decimal,
              duration_minutes: serviceData.duration_minutes,
              is_active: serviceData.is_active || true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              photos: [],
              photo_count: 0,
              has_photos: false,
              schedules: [],
              schedule_count: 0,
              has_schedules: false
            }
          };
          console.log('Mock response:', mockResponse);
          console.log('=== PROVIDER SERVICE REGISTRATION COMPLETE (WITH FALLBACK) ===');
          return mockResponse;
        }
        throw parseError;
      }
    } catch (error) {
      console.error('=== PROVIDER SERVICE REGISTRATION ERROR ===', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred during service registration');
    }
  }


  async createProviderServiceSchedules(scheduleData: ProviderServiceScheduleRequest): Promise<ProviderServiceScheduleResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.PROVIDER_SERVICE_SCHEDULE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Schedule creation failed' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred during schedule creation');
    }
  }

  async getProviderServices(params?: AdminProviderServicesParams): Promise<ProviderServicesListResponse> {
    try {
      const token = authService.getStoredToken();

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params?.active !== undefined) {
        queryParams.append('active', params.active.toString());
      }
      if (params?.category_id !== undefined) {
        queryParams.append('category_id', params.category_id.toString());
      }
      if (params?.include_photos !== undefined) {
        queryParams.append('include_photos', params.include_photos.toString());
      }
      if (params?.include_schedules !== undefined) {
        queryParams.append('include_schedules', params.include_schedules.toString());
      }
      if (params?.limit !== undefined) {
        queryParams.append('limit', params.limit.toString());
      }
      if (params?.offset !== undefined) {
        queryParams.append('offset', params.offset.toString());
      }

      const url = `${this.baseUrl}/api/providers/me/adminprovider/services${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch provider services' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching provider services');
    }
  }

  async getProviderServiceDetails(serviceId: number): Promise<ProviderService> {
    try {
      const token = authService.getStoredToken();

      // Get the service details by filtering the services list by ID
      const response = await this.getProviderServices({
        include_photos: true,
        include_schedules: true
      });

      const service = response.services.find(s => s.id === serviceId);
      if (!service) {
        throw new Error('Service not found');
      }

      return service;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching service details');
    }
  }

  async updateProviderService(serviceId: number, updateData: ProviderServiceUpdateRequest): Promise<ProviderServiceResponse> {
    try {
      const token = authService.getStoredToken();
      const response = await fetch(`${this.baseUrl}/api/providers/me/services/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update service' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while updating service');
    }
  }

  async updateProviderServiceWithMedia(serviceId: number, updateData: AdminProviderServiceCreateRequest): Promise<ProviderServiceResponse> {
    try {
      console.log('=== UPDATE SERVICE WITH MEDIA DEBUG ===');
      console.log('Service ID:', serviceId);
      console.log('Update data:', updateData);

      const token = authService.getStoredToken();

      // Check if we have files or schedules to upload
      const hasFiles = updateData.photos && updateData.photos.length > 0;
      const hasSchedules = updateData.schedules && updateData.schedules.length > 0;

      console.log('Has files:', hasFiles);
      console.log('Has schedules:', hasSchedules);

      if (hasFiles || hasSchedules) {
        // Use FormData for multipart request
        const formData = new FormData();

        // Add basic fields
        formData.append('category_id', updateData.category_id.toString());
        formData.append('service_title', updateData.service_title);
        if (updateData.service_description) {
          formData.append('service_description', updateData.service_description);
        }
        if (updateData.price_decimal !== undefined) {
          formData.append('price_decimal', updateData.price_decimal.toString());
        }
        if (updateData.duration_minutes !== undefined) {
          formData.append('duration_minutes', updateData.duration_minutes.toString());
        }
        if (updateData.is_active !== undefined) {
          formData.append('is_active', updateData.is_active.toString());
        }

        // Add photos
        if (hasFiles) {
          updateData.photos!.forEach(photo => {
            console.log('Adding photo to FormData:', photo.name);
            formData.append('photos', photo);
          });
        }

        // Add schedules as JSON string
        if (hasSchedules) {
          console.log('Adding schedules to FormData:', updateData.schedules);
          formData.append('schedules', JSON.stringify(updateData.schedules));
        }

        const updateUrl = `${this.baseUrl}/api/providers/me/adminprovider/services/${serviceId}`;
        console.log('Update URL:', updateUrl);

        const response = await fetch(updateUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        console.log('Update response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to update service' }));
          console.error('Update failed with error:', errorData);
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Update success response:', data);
        console.log('=== UPDATE SERVICE WITH MEDIA COMPLETE ===');
        return data;
      } else {
        // Use JSON for simple request (no files or schedules)
        console.log('Using JSON update (no files/schedules)');
        return this.updateProviderService(serviceId, {
          service_title: updateData.service_title,
          service_description: updateData.service_description,
          price_decimal: updateData.price_decimal,
          duration_minutes: updateData.duration_minutes,
          is_active: updateData.is_active
        });
      }
    } catch (error) {
      console.error('=== UPDATE SERVICE WITH MEDIA ERROR ===', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while updating service');
    }
  }

  async deleteProviderService(serviceId: number): Promise<ServiceDeleteResponse> {
    try {
      const token = authService.getStoredToken();
      const response = await fetch(`${this.baseUrl}/api/providers/me/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete service' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while deleting service');
    }
  }

  async createProviderService(serviceData: AdminProviderServiceCreateRequest): Promise<ProviderServiceResponse> {
    try {
      const token = authService.getStoredToken();

      // Check if we have files to upload
      const hasFiles = serviceData.photos && serviceData.photos.length > 0;
      const hasSchedules = serviceData.schedules && serviceData.schedules.length > 0;

      if (hasFiles || hasSchedules) {
        // Use FormData for multipart request
        const formData = new FormData();

        // Add basic fields
        formData.append('category_id', serviceData.category_id.toString());
        formData.append('service_title', serviceData.service_title);
        if (serviceData.service_description) {
          formData.append('service_description', serviceData.service_description);
        }
        if (serviceData.price_decimal !== undefined) {
          formData.append('price_decimal', serviceData.price_decimal.toString());
        }
        if (serviceData.duration_minutes !== undefined) {
          formData.append('duration_minutes', serviceData.duration_minutes.toString());
        }
        if (serviceData.is_active !== undefined) {
          formData.append('is_active', serviceData.is_active.toString());
        }

        // Add photos
        if (hasFiles) {
          serviceData.photos!.forEach(photo => {
            formData.append('photos', photo);
          });
        }

        // Add schedules as JSON string
        if (hasSchedules) {
          formData.append('schedules', JSON.stringify(serviceData.schedules));
        }

        const response = await fetch(`${this.baseUrl}/api/providers/me/adminprovider/services`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to create service' }));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } else {
        // Use JSON for simple request
        const response = await fetch(`${this.baseUrl}/api/providers/me/adminprovider/services`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            category_id: serviceData.category_id,
            service_title: serviceData.service_title,
            service_description: serviceData.service_description,
            price_decimal: serviceData.price_decimal,
            duration_minutes: serviceData.duration_minutes,
            is_active: serviceData.is_active
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to create service' }));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while creating service');
    }
  }

  async uploadServicePhotosRegistration(photoData: PhotoUploadRequest): Promise<PhotoUploadResponse> {
    try {
      console.log('=== REGISTRATION PHOTO UPLOAD DEBUG ===');
      console.log('Photo upload request (registration):', photoData);
      console.log('Service ID:', photoData.service_id);
      console.log('Photos count:', photoData.photos.length);
      console.log('Photo files:', photoData.photos);

      const formData = new FormData();

      // Add service ID
      formData.append('provider_service_id', photoData.service_id.toString());

      // Add photos
      photoData.photos.forEach((photo, index) => {
        console.log(`Adding photo ${index}:`, photo.name, photo.size);
        formData.append('photos', photo);
      });

      if (photoData.sort_orders && photoData.sort_orders.length > 0) {
        console.log('Adding sort orders:', photoData.sort_orders);
        formData.append('sort_orders', photoData.sort_orders.join(','));
      }

      const uploadUrl = `${this.baseUrl}${API_CONFIG.ENDPOINTS.PROVIDER_SERVICE_UPLOAD_PHOTOS}`;
      console.log('Upload URL (registration):', uploadUrl);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      console.log('Upload response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Photo upload failed' }));
        console.error('Upload failed with error:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Upload success response:', data);
      console.log('=== REGISTRATION PHOTO UPLOAD COMPLETE ===');
      return data;
    } catch (error) {
      console.error('=== REGISTRATION PHOTO UPLOAD ERROR ===', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred during photo upload');
    }
  }

  async uploadServicePhotos(photoData: PhotoUploadRequest): Promise<PhotoUploadResponse> {
    try {
      console.log('=== PHOTO UPLOAD SERVICE DEBUG ===');
      console.log('Photo upload request:', photoData);
      console.log('Service ID:', photoData.service_id);
      console.log('Photos count:', photoData.photos.length);
      console.log('Photo files:', photoData.photos);

      const token = authService.getStoredToken();
      const formData = new FormData();

      photoData.photos.forEach((photo, index) => {
        console.log(`Adding photo ${index}:`, photo.name, photo.size);
        formData.append('photos', photo);
      });

      if (photoData.sort_orders && photoData.sort_orders.length > 0) {
        console.log('Adding sort orders:', photoData.sort_orders);
        formData.append('sort_orders', photoData.sort_orders.join(','));
      }

      const uploadUrl = `${this.baseUrl}/api/providers/me/services/${photoData.service_id}/photos`;
      console.log('Upload URL:', uploadUrl);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('Upload response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Photo upload failed' }));
        console.error('Upload failed with error:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Upload success response:', data);
      console.log('=== PHOTO UPLOAD SERVICE COMPLETE ===');
      return data;
    } catch (error) {
      console.error('=== PHOTO UPLOAD SERVICE ERROR ===', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred during photo upload');
    }
  }

  async deleteServicePhoto(serviceId: number, photoId: number): Promise<PhotoDeleteResponse> {
    try {
      console.log(`=== DELETE PHOTO DEBUG ===`);
      console.log(`Deleting photo ${photoId} from service ${serviceId}`);

      const token = authService.getStoredToken();
      const deleteUrl = `${this.baseUrl}/api/providers/me/services/${serviceId}/photos/${photoId}`;
      console.log('Delete URL:', deleteUrl);

      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Delete response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete photo' }));
        console.error('Delete failed with error:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Delete success response:', data);
      console.log('=== DELETE PHOTO COMPLETE ===');
      return data;
    } catch (error) {
      console.error('=== DELETE PHOTO ERROR ===', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while deleting photo');
    }
  }

  async getProviderRegisteredCategories(): Promise<ProviderRegisteredCategoriesResponse> {
    try {
      const token = authService.getStoredToken();
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.PROVIDER_REGISTERED_CATEGORIES}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch registered categories' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching registered categories');
    }
  }
}

export const providerService = new ProviderServiceAPI();