import axios from 'axios';
import type {
  ChatConversation,
  ChatMessage,
  SendMessageRequest,
  CreateConversationRequest,
  FileUploadResponse
} from '../types/chat';

const API_BASE_URL = 'http://localhost:9078/api';

class ChatService {
  private getAuthToken(): string | null {
    const token = localStorage.getItem('access_token');
    console.log('🔐 [ChatService] Retrieving token from localStorage:', token ? `${token.substring(0, 20)}...` : 'NULL');
    return token;
  }

  private getAuthHeaders() {
    const token = this.getAuthToken();
    if (!token) {
      console.error('❌ [ChatService] No authentication token found in localStorage');
      throw new Error('No authentication token found. Please log in.');
    }
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    console.log('📤 [ChatService] Request headers:', {
      'Authorization': `Bearer ${token.substring(0, 20)}...`,
      'Content-Type': 'application/json'
    });
    return headers;
  }

  // Get all conversations for the current user
  async getConversations(): Promise<ChatConversation[]> {
    try {
      console.log('🌐 [ChatService] GET request to:', `${API_BASE_URL}/chat/conversations`);
      const response = await axios.get(`${API_BASE_URL}/chat/conversations`, {
        headers: this.getAuthHeaders()
      });
      console.log('✅ [ChatService] GET conversations response status:', response.status);
      return response.data;
    } catch (error: any) {
      console.error('❌ [ChatService] Error fetching conversations:', error);
      console.error('❌ [ChatService] Error status:', error.response?.status);
      console.error('❌ [ChatService] Error data:', error.response?.data);
      console.error('❌ [ChatService] Request headers sent:', error.config?.headers);
      throw error;
    }
  }

  // Create a new conversation or get existing one
  async createConversation(data: CreateConversationRequest): Promise<ChatConversation> {
    try {
      console.log('Creating conversation with data:', data);
      const response = await axios.post(
        `${API_BASE_URL}/chat/conversations`,
        data,
        {
          headers: this.getAuthHeaders()
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

      // If conversation already exists, get the existing one
      if (error.response?.status === 400) {
        const errorData = error.response?.data;
        // Flask-RESTX abort() returns errors in the 'message' field
        const errorMsg = errorData?.message || errorData?.error || errorData?.msg;
        console.log('Full error data:', errorData);
        console.log('Error message:', errorMsg);

        // Check if it's the "already exists" error
        if (errorMsg && typeof errorMsg === 'string' && errorMsg.toLowerCase().includes('already exists')) {
          console.log('Conversation exists, fetching existing conversations...');
          // Get all conversations and find the one with this participant
          const conversations = await this.getConversations();
          console.log('All conversations:', conversations);

          const existingConv = conversations.find(conv => {
            console.log('Checking conversation:', conv);
            // Filter out the current user to find the other participant
            return conv.participants.some(p => {
              if (data.participant_type === 'user') {
                return p.user_id === data.participant_id;
              } else {
                return p.provider_id === data.participant_id;
              }
            });
          });

          console.log('Found existing conversation:', existingConv);

          if (existingConv) {
            return existingConv;
          }
        }

        // If it's a different 400 error, throw with better context
        throw new Error(`Failed to create conversation: ${errorMsg || 'Unknown error'}`);
      }

      throw error;
    }
  }

  // Get a specific conversation
  async getConversation(conversationId: number): Promise<ChatConversation> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/chat/conversations/${conversationId}`,
        {
          headers: this.getAuthHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  }

  // Get messages for a conversation
  async getMessages(conversationId: number, page: number = 1, perPage: number = 50): Promise<ChatMessage[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/chat/conversations/${conversationId}/messages`,
        {
          headers: this.getAuthHeaders(),
          params: { page, per_page: perPage }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  // Send a message to a conversation
  async sendMessage(conversationId: number, data: SendMessageRequest): Promise<ChatMessage> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/chat/conversations/${conversationId}/messages`,
        data,
        {
          headers: this.getAuthHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Mark a message as read
  async markMessageAsRead(conversationId: number, messageId: number): Promise<void> {
    try {
      await axios.post(
        `${API_BASE_URL}/chat/conversations/${conversationId}/messages/${messageId}/read`,
        {},
        {
          headers: this.getAuthHeaders()
        }
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  // Upload a file for chat attachment
  async uploadFile(file: File): Promise<FileUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = this.getAuthToken();
      const response = await axios.post(
        `${API_BASE_URL}/chat/upload`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // Send a text message (convenience method)
  async sendTextMessage(conversationId: number, body: string): Promise<ChatMessage> {
    return this.sendMessage(conversationId, {
      message_type: 'text',
      body
    });
  }

  // Send a file message (convenience method)
  async sendFileMessage(
    conversationId: number,
    file: File,
    body?: string
  ): Promise<ChatMessage> {
    // First upload the file
    const uploadResult = await this.uploadFile(file);

    if (!uploadResult.success) {
      throw new Error(uploadResult.error || 'File upload failed');
    }

    // Determine message type from MIME type
    let messageType: 'image' | 'video' | 'audio' | 'file' = 'file';
    if (uploadResult.mime_type?.startsWith('image/')) {
      messageType = 'image';
    } else if (uploadResult.mime_type?.startsWith('video/')) {
      messageType = 'video';
    } else if (uploadResult.mime_type?.startsWith('audio/')) {
      messageType = 'audio';
    }

    // Send message with file attachment
    return this.sendMessage(conversationId, {
      message_type: messageType,
      body,
      attachment_path: uploadResult.attachment_path,
      attachment_url: uploadResult.url,
      attachment_mime: uploadResult.mime_type,
      attachment_size: uploadResult.file_size,
      attachment_width: uploadResult.width,
      attachment_height: uploadResult.height,
      attachment_duration_ms: uploadResult.duration_ms,
      thumbnail_path: uploadResult.thumbnail_url
    });
  }
}

export const chatService = new ChatService();
