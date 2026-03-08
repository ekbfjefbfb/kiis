import { apiService } from './api.service';

export interface UpdateProfileRequest {
  username?: string;
  full_name?: string;
  phone_number?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar_url: string;
  plan_id: number;
  created_at: string;
}

export interface AvatarUploadResponse {
  url: string;
  key: string;
}

class ProfileService {
  /**
   * Obtener perfil del usuario autenticado
   */
  async getProfile(): Promise<UserProfile> {
    return await apiService.get<UserProfile>('/api/profile/me');
  }

  /**
   * Actualizar perfil del usuario (username, full_name, phone_number)
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    return await apiService.put<UserProfile>('/api/profile/me', data);
  }

  /**
   * Subir avatar de usuario
   */
  async uploadAvatar(file: File): Promise<AvatarUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    return await apiService.post<AvatarUploadResponse>('/api/profile/me/avatar', formData, true);
  }
}

export const profileService = new ProfileService();
