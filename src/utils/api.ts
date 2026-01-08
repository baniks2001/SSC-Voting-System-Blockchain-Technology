// utils/api.ts - ENHANCED VERSION WITH TOAST NOTIFICATIONS AND FORMDATA SUPPORT

// ✅ UPDATED: Use environment variable with fallback
const API_BASE_URL = import.meta.env.VITE_API_URL ? 
  `${import.meta.env.VITE_API_URL}/api` : 
  'http://192.168.1.4:5000/api';

// Types for better type safety
interface ApiError extends Error {
  status?: number;
  code?: string;
  originalError?: unknown;
}

interface QueueItem {
  requestFn: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

interface RequestConfig {
  timeout?: number;
  retryCount?: number;
  skipAuth?: boolean;
  showLoading?: boolean;
  successMessage?: string;
  errorMessage?: string;
  isFormData?: boolean;
}

// Toast manager for API notifications
class ToastManager {
  private static instance: ToastManager;
  private toastCallback: ((type: 'success' | 'error' | 'warning' | 'info', message: string) => void) | null = null;

  private constructor() {}

  static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  setCallback(callback: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void) {
    this.toastCallback = callback;
  }

  showToast(type: 'success' | 'error' | 'warning' | 'info', message: string) {
    if (this.toastCallback) {
      this.toastCallback(type, message);
    } else {
      console.log(`Toast [${type}]: ${message}`);
    }
  }
}

export const toastManager = ToastManager.getInstance();

class ApiClient {
  private baseUrl: string;
  private requestQueue: QueueItem[] = [];
  private processing = false;
  private readonly maxConcurrent = 3;
  private activeRequests = 0;
  private lastRequestTime = 0;
  private readonly minRequestInterval = 200;
  private retryCounts = new Map<string, number>();
  private readonly maxRetries = 2;
  private readonly defaultTimeout = 10000;
  private pendingRequests = new Set<string>();
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private createApiError(message: string, status?: number, code?: string, originalError?: unknown): ApiError {
    const error = new Error(message) as ApiError;
    error.status = status;
    error.code = code;
    error.originalError = originalError;
    return error;
  }

  private getAuthHeaders(skipAuth = false, isFormData = false): Record<string, string> {
    const headers: Record<string, string> = {};

    // Don't set Content-Type for FormData - let browser set it with boundary
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    if (!skipAuth) {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }
    }

    return headers;
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.requestQueue.length === 0) return;
    
    this.processing = true;
    
    try {
      while (this.requestQueue.length > 0 && this.activeRequests < this.maxConcurrent) {
        const queueItem = this.requestQueue.shift();
        if (queueItem) {
          this.activeRequests++;
          
          const now = Date.now();
          const timeSinceLastRequest = now - this.lastRequestTime;
          if (timeSinceLastRequest < this.minRequestInterval) {
            await new Promise(resolve => 
              setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
            );
          }

          this.lastRequestTime = Date.now();
          
          queueItem.requestFn()
            .then(queueItem.resolve)
            .catch(queueItem.reject)
            .finally(() => {
              this.activeRequests--;
              setTimeout(() => this.processQueue(), 0);
            });
        }
      }
    } finally {
      this.processing = false;
    }
  }

  private async queuedRequest<T>(
    requestFn: () => Promise<T>, 
    endpoint: string, 
    config: RequestConfig = {}
  ): Promise<T> {
    const requestId = `${Date.now()}-${Math.random()}`;
    
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        requestFn: async () => {
          try {
            return await this.executeRequestWithRetry(requestFn, endpoint, config);
          } catch (error) {
            throw error;
          }
        },
        resolve,
        reject
      });
      
      if (!this.processing) {
        setTimeout(() => this.processQueue(), 0);
      }
    });
  }

  private async executeRequestWithRetry<T>(
    requestFn: () => Promise<T>,
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const maxRetries = config.retryCount ?? this.maxRetries;
    let lastError: ApiError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const backoffDelay = Math.pow(2, attempt) * 1000;
          console.warn(`Retry attempt ${attempt}/${maxRetries} for ${endpoint} after ${backoffDelay}ms`);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
        }

        return await requestFn();
      } catch (error) {
        lastError = error as ApiError;
        
        const shouldRetry = this.shouldRetryRequest(error, attempt, maxRetries);
        if (!shouldRetry) {
          break;
        }
      }
    }

    throw lastError!;
  }

  private shouldRetryRequest(error: unknown, attempt: number, maxRetries: number): boolean {
    if (attempt >= maxRetries) return false;

    const errorMessage = error instanceof Error ? error.message : String(error);
    
    const retryableErrors = [
      'network',
      'timeout',
      'connection',
      'failed to fetch',
      'rate limit',
      '429',
      '502',
      '503',
      '504'
    ];

    return retryableErrors.some(retryableError => 
      errorMessage.toLowerCase().includes(retryableError.toLowerCase())
    );
  }

  private async fetchWithTimeout(
    url: string, 
    options: RequestInit & { timeout?: number } = {}
  ): Promise<Response> {
    const { timeout = this.defaultTimeout, ...fetchOptions } = options;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });
      return response;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw this.createApiError(`Request timeout after ${timeout}ms`, 408, 'TIMEOUT', error);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async handleResponse(response: Response, endpoint: string, config: RequestConfig): Promise<any> {
    let responseData;
    
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else if (response.status === 204) {
        return null;
      } else {
        const text = await response.text();
        responseData = text || null;
      }
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      throw this.createApiError(
        `Failed to parse response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
        response.status,
        'PARSE_ERROR',
        parseError
      );
    }

    if (!response.ok) {
      const serverMessage = responseData?.error || responseData?.message || response.statusText;
      
      // Show error toast if configured
      if (config.errorMessage) {
        toastManager.showToast('error', config.errorMessage);
      } else {
        toastManager.showToast('error', serverMessage || `Request failed: ${response.status}`);
      }

      switch (response.status) {
        case 401:
          const authMessage = serverMessage || 'Authentication required. Please log in again.';
          throw this.createApiError(
            authMessage,
            401,
            'UNAUTHORIZED',
            responseData
          );
        case 403:
          throw this.createApiError(
            serverMessage || 'Access forbidden. You do not have permission.',
            403,
            'FORBIDDEN',
            responseData
          );
        case 404:
          throw this.createApiError(
            serverMessage || `Resource not found: ${endpoint}`,
            404,
            'NOT_FOUND',
            responseData
          );
        case 429:
          throw this.createApiError(
            serverMessage || 'Rate limit exceeded. Please try again later.',
            429,
            'RATE_LIMITED',
            responseData
          );
        case 500:
          throw this.createApiError(
            serverMessage || 'Internal server error. Please try again later.',
            500,
            'SERVER_ERROR',
            responseData
          );
        default:
          throw this.createApiError(
            serverMessage || `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            `HTTP_${response.status}`,
            responseData
          );
      }
    }

    // Show success toast if configured
    if (config.successMessage) {
      toastManager.showToast('success', config.successMessage);
    } else if (response.status >= 200 && response.status < 300) {
      // Auto success message for common operations
      const method = endpoint.includes('get') ? 'fetched' : 
                    endpoint.includes('post') ? 'created' :
                    endpoint.includes('put') || endpoint.includes('patch') ? 'updated' :
                    endpoint.includes('delete') ? 'deleted' : 'processed';
      toastManager.showToast('success', `Operation completed successfully`);
    }

    // Handle success response format
    if (responseData && typeof responseData === 'object') {
      if (responseData.success !== undefined) {
        return responseData.data !== undefined ? responseData.data : responseData;
      }
    }

    return responseData;
  }

  async get(endpoint: string, config: RequestConfig = {}) {
    return this.queuedRequest(async () => {
      const headers = this.getAuthHeaders(config.skipAuth);
      const url = `${this.baseUrl}${endpoint}`;
      
      toastManager.showToast('info', `Fetching ${endpoint.replace('/', '')}...`);
      
      const response = await this.fetchWithTimeout(url, {
        method: 'GET',
        headers,
        timeout: config.timeout,
      });
      
      return this.handleResponse(response, endpoint, config);
    }, endpoint, config);
  }

  async post(endpoint: string, data: any, config: RequestConfig = {}) {
    return this.queuedRequest(async () => {
      const isFormData = config.isFormData || data instanceof FormData;
      const headers = this.getAuthHeaders(config.skipAuth, isFormData);
      const url = `${this.baseUrl}${endpoint}`;
      
      toastManager.showToast('info', `Creating ${endpoint.replace('/', '')}...`);
      
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        headers,
        body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
        timeout: config.timeout,
      });
      
      return this.handleResponse(response, endpoint, config);
    }, endpoint, config);
  }

  async put(endpoint: string, data: any, config: RequestConfig = {}) {
    return this.queuedRequest(async () => {
      const isFormData = config.isFormData || data instanceof FormData;
      const headers = this.getAuthHeaders(config.skipAuth, isFormData);
      const url = `${this.baseUrl}${endpoint}`;
      
      toastManager.showToast('info', `Updating ${endpoint.replace('/', '')}...`);
      
      const response = await this.fetchWithTimeout(url, {
        method: 'PUT',
        headers,
        body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
        timeout: config.timeout,
      });
      
      return this.handleResponse(response, endpoint, config);
    }, endpoint, config);
  }

  async patch(endpoint: string, data: any, config: RequestConfig = {}) {
    return this.queuedRequest(async () => {
      const isFormData = config.isFormData || data instanceof FormData;
      const headers = this.getAuthHeaders(config.skipAuth, isFormData);
      const url = `${this.baseUrl}${endpoint}`;
      
      toastManager.showToast('info', `Updating ${endpoint.replace('/', '')}...`);
      
      const response = await this.fetchWithTimeout(url, {
        method: 'PATCH',
        headers,
        body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
        timeout: config.timeout,
      });
      
      return this.handleResponse(response, endpoint, config);
    }, endpoint, config);
  }

  async delete(endpoint: string, config: RequestConfig = {}) {
    return this.queuedRequest(async () => {
      const headers = this.getAuthHeaders(config.skipAuth);
      const url = `${this.baseUrl}${endpoint}`;
      
      toastManager.showToast('info', `Deleting ${endpoint.replace('/', '')}...`);
      
      const response = await this.fetchWithTimeout(url, {
        method: 'DELETE',
        headers,
        timeout: config.timeout,
      });
      
      return this.handleResponse(response, endpoint, config);
    }, endpoint, config);
  }

  async batch(requests: Array<{method: string, endpoint: string, data?: any, config?: RequestConfig}>) {
    const results = [];
    
    for (const [index, req] of requests.entries()) {
      try {
        let result;
        switch (req.method.toLowerCase()) {
          case 'get':
            result = await this.get(req.endpoint, req.config);
            break;
          case 'post':
            result = await this.post(req.endpoint, req.data, req.config);
            break;
          case 'put':
            result = await this.put(req.endpoint, req.data, req.config);
            break;
          case 'patch':
            result = await this.patch(req.endpoint, req.data, req.config);
            break;
          case 'delete':
            result = await this.delete(req.endpoint, req.config);
            break;
          default:
            throw this.createApiError(`Unsupported method: ${req.method}`);
        }
        results.push({ success: true, data: result });
      } catch (error) {
        results.push({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error',
          endpoint: req.endpoint,
          index 
        });
      }
      
      if (index < requests.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    return results;
  }

  // File upload helper method
  async uploadFile(endpoint: string, file: File, additionalData: Record<string, any> = {}, config: RequestConfig = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    // Append additional data to form
    Object.entries(additionalData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });
    
    return this.post(endpoint, formData, { ...config, isFormData: true });
  }

  // Upload multiple files helper
  async uploadFiles(endpoint: string, files: File[], additionalData: Record<string, any> = {}, config: RequestConfig = {}) {
    const formData = new FormData();
    
    // Append all files
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });
    
    // Append additional data to form
    Object.entries(additionalData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });
    
    return this.post(endpoint, formData, { ...config, isFormData: true });
  }

  // Utility methods
  getQueueStats() {
    return {
      queueSize: this.requestQueue.length,
      activeRequests: this.activeRequests,
      maxConcurrent: this.maxConcurrent,
      isProcessing: this.processing
    };
  }

  clearQueue() {
    this.requestQueue.forEach(item => {
      item.reject(this.createApiError('Request cancelled due to queue clearance'));
    });
    
    this.requestQueue = [];
    this.activeRequests = 0;
    this.processing = false;
    this.retryCounts.clear();
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health', { timeout: 5000, skipAuth: true });
      return true;
    } catch {
      return false;
    }
  }

  // Helper to check if we're connected to the API
  async checkConnection(): Promise<{ connected: boolean; latency?: number }> {
    try {
      const startTime = Date.now();
      await this.get('/health', { timeout: 3000, skipAuth: true });
      const latency = Date.now() - startTime;
      return { connected: true, latency };
    } catch (error) {
      return { connected: false };
    }
  }

  // Add request interceptors for debugging/analytics
  addRequestInterceptor(interceptor: (endpoint: string, config: RequestConfig) => void) {
    // This can be extended to add request interceptors
    console.log('Request interceptor added:', interceptor);
  }

  // Add response interceptors for debugging/analytics
  addResponseInterceptor(interceptor: (response: any, endpoint: string, config: RequestConfig) => void) {
    // This can be extended to add response interceptors
    console.log('Response interceptor added:', interceptor);
  }

  // Download file helper
  async downloadFile(endpoint: string, config: RequestConfig = {}): Promise<Blob> {
    return this.queuedRequest(async () => {
      const headers = this.getAuthHeaders(config.skipAuth);
      const url = `${this.baseUrl}${endpoint}`;
      
      const response = await this.fetchWithTimeout(url, {
        method: 'GET',
        headers,
        timeout: config.timeout,
      });
      
      if (!response.ok) {
        throw this.createApiError(`Download failed: ${response.statusText}`, response.status);
      }
      
      return response.blob();
    }, endpoint, config);
  }

  // Stream response helper (for large files or streaming data)
  async streamResponse(endpoint: string, onData: (chunk: any) => void, config: RequestConfig = {}) {
    return this.queuedRequest(async () => {
      const headers = this.getAuthHeaders(config.skipAuth);
      const url = `${this.baseUrl}${endpoint}`;
      
      const response = await this.fetchWithTimeout(url, {
        method: 'GET',
        headers,
        timeout: config.timeout,
      });
      
      if (!response.ok) {
        throw this.createApiError(`Stream failed: ${response.statusText}`, response.status);
      }
      
      const reader = response.body?.getReader();
      if (!reader) {
        throw this.createApiError('Response body is not readable');
      }
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          onData(value);
        }
      } finally {
        reader.releaseLock();
      }
      
      return { success: true, message: 'Stream completed' };
    }, endpoint, config);
  }
}

// Create and export API instance
export const api = new ApiClient(API_BASE_URL);

// Export types for external use
export type { ApiError, RequestConfig };
export default api;