// utils/api.ts - FIXED VERSION WITH PATCH METHOD

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
}

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
  private readonly defaultTimeout = 10000; // 10 seconds
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  private createApiError(message: string, status?: number, code?: string, originalError?: unknown): ApiError {
    const error = new Error(message) as ApiError;
    error.status = status;
    error.code = code;
    error.originalError = originalError;
    return error;
  }

  private getAuthHeaders(skipAuth = false): Record<string, string> {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 API Client - Auth headers preparation:', { skipAuth });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // ✅ FIX: Only add token if NOT skipping auth AND token exists
    if (!skipAuth) {
      try {
        const token = localStorage.getItem('token');
        
        if (process.env.NODE_ENV === 'development') {
          console.log('🔐 API Client - Token check:', {
            hasToken: !!token,
            tokenLength: token?.length,
            tokenPreview: token ? `${token.substring(0, 10)}...` : 'none'
          });
        }

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Token added to Authorization header');
          }
        } else {
          console.warn('⚠️ No token found in localStorage for API request');
        }
      } catch (error) {
        console.error('❌ Error accessing localStorage:', error);
        // Continue without token rather than failing completely
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 Skipping auth for this request (login/register)');
      }
    }

    if (process.env.NODE_ENV === 'development') {
      headers['X-Development-Mode'] = 'true';
      headers['X-Client-Type'] = 'browser';
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
          
          // Rate limiting
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
              // Process next items in queue
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
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        requestFn: async () => {
          try {
            return await this.executeRequestWithRetry(requestFn, endpoint, config);
          } catch (error) {
            throw error; // Re-throw to be caught by the promise chain
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
          console.warn(`🔄 Retry attempt ${attempt}/${maxRetries} for ${endpoint} after ${backoffDelay}ms`);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
        }

        return await requestFn();
      } catch (error) {
        lastError = error as ApiError;
        
        // Only retry on specific errors
        const shouldRetry = this.shouldRetryRequest(error, attempt, maxRetries);
        if (!shouldRetry) {
          break;
        }
        
        console.warn(`Retrying ${endpoint} (attempt ${attempt + 1}/${maxRetries + 1})`);
      }
    }

    throw lastError!;
  }

  private shouldRetryRequest(error: unknown, attempt: number, maxRetries: number): boolean {
    if (attempt >= maxRetries) return false;

    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Retry on network-related errors
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

  private async handleResponse(response: Response, endpoint: string): Promise<any> {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📨 API Response ${response.status}: ${endpoint}`);
    }

    let responseData;
    
    try {
      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else if (response.status === 204) {
        // No content
        return null;
      } else {
        const text = await response.text();
        responseData = text || null;
      }
    } catch (parseError) {
      console.error('❌ Failed to parse response:', parseError);
      throw this.createApiError(
        `Failed to parse response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
        response.status,
        'PARSE_ERROR',
        parseError
      );
    }

    if (!response.ok) {
      // ✅ FIX: Preserve the original server error message
      const serverMessage = responseData?.error || responseData?.message || response.statusText;
      
      // Handle specific HTTP status codes with server messages
      switch (response.status) {
        case 401:
          // Use server message if available, otherwise fallback
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
        case 502:
        case 503:
        case 504:
          throw this.createApiError(
            serverMessage || 'Service temporarily unavailable. Please try again later.',
            response.status,
            'SERVICE_UNAVAILABLE',
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
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 GET ${endpoint}`, { headers, url, skipAuth: config.skipAuth });
      }
      
      const response = await this.fetchWithTimeout(url, {
        method: 'GET',
        headers,
        timeout: config.timeout,
      });
      
      return this.handleResponse(response, endpoint);
    }, endpoint, config);
  }

  async post(endpoint: string, data: any, config: RequestConfig = {}) {
    return this.queuedRequest(async () => {
      const headers = this.getAuthHeaders(config.skipAuth);
      const url = `${this.baseUrl}${endpoint}`;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`📝 POST ${endpoint}`, { 
          headers, 
          data: data ? '***' : 'null', 
          url, 
          skipAuth: config.skipAuth 
        });
      }
      
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        headers,
        body: data ? JSON.stringify(data) : undefined,
        timeout: config.timeout,
      });
      
      return this.handleResponse(response, endpoint);
    }, endpoint, config);
  }

  async put(endpoint: string, data: any, config: RequestConfig = {}) {
    return this.queuedRequest(async () => {
      const headers = this.getAuthHeaders(config.skipAuth);
      const url = `${this.baseUrl}${endpoint}`;
      
      const response = await this.fetchWithTimeout(url, {
        method: 'PUT',
        headers,
        body: data ? JSON.stringify(data) : undefined,
        timeout: config.timeout,
      });
      
      return this.handleResponse(response, endpoint);
    }, endpoint, config);
  }

  // ✅ ADDED: PATCH method for status updates
  async patch(endpoint: string, data: any, config: RequestConfig = {}) {
    return this.queuedRequest(async () => {
      const headers = this.getAuthHeaders(config.skipAuth);
      const url = `${this.baseUrl}${endpoint}`;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔧 PATCH ${endpoint}`, { 
          headers, 
          data: data ? '***' : 'null', 
          url, 
          skipAuth: config.skipAuth 
        });
      }
      
      const response = await this.fetchWithTimeout(url, {
        method: 'PATCH',
        headers,
        body: data ? JSON.stringify(data) : undefined,
        timeout: config.timeout,
      });
      
      return this.handleResponse(response, endpoint);
    }, endpoint, config);
  }

  async delete(endpoint: string, config: RequestConfig = {}) {
    return this.queuedRequest(async () => {
      const headers = this.getAuthHeaders(config.skipAuth);
      const url = `${this.baseUrl}${endpoint}`;
      
      const response = await this.fetchWithTimeout(url, {
        method: 'DELETE',
        headers,
        timeout: config.timeout,
      });
      
      return this.handleResponse(response, endpoint);
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
      
      // Small delay between batch requests
      if (index < requests.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    return results;
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
    // Reject all pending requests
    this.requestQueue.forEach(item => {
      item.reject(this.createApiError('Request cancelled due to queue clearance'));
    });
    
    this.requestQueue = [];
    this.activeRequests = 0;
    this.processing = false;
    this.retryCounts.clear();
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health', { timeout: 5000, skipAuth: true });
      return true;
    } catch {
      return false;
    }
  }
}

// Create and export API instance
export const api = new ApiClient(API_BASE_URL);

// Development mode enhancements
if (process.env.NODE_ENV === 'development') {
  let requestCount = 0;
  
  // Wrap methods for better logging
  const wrapWithLogging = <T extends any[]>(
    originalMethod: (...args: T) => Promise<any>,
    methodName: string
  ) => {
    return async function(...args: T) {
      requestCount++;
      const start = performance.now();
      const endpoint = args[0] as string;
      
      try {
        const result = await originalMethod.apply(api, args);
        const duration = performance.now() - start;
        console.log(`✅ API ${methodName.toUpperCase()} ${endpoint} completed in ${duration.toFixed(2)}ms (Request #${requestCount})`);
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        console.error(`❌ API ${methodName.toUpperCase()} ${endpoint} failed after ${duration.toFixed(2)}ms:`, error);
        throw error;
      }
    };
  };

  // Apply logging to all methods
  api.get = wrapWithLogging(api.get.bind(api), 'get');
  api.post = wrapWithLogging(api.post.bind(api), 'post');
  api.put = wrapWithLogging(api.put.bind(api), 'put');
  api.patch = wrapWithLogging(api.patch.bind(api), 'patch');
  api.delete = wrapWithLogging(api.delete.bind(api), 'delete');

  // Periodic queue monitoring
  setInterval(() => {
    const stats = api.getQueueStats();
    if (stats.queueSize > 0 || stats.activeRequests > 0) {
      console.log(`📊 API Queue Stats: ${stats.queueSize} waiting, ${stats.activeRequests} active, processing: ${stats.isProcessing}`);
    }
  }, 30000); // Reduced frequency to 30 seconds
}

// Export types for external use
export type { ApiError, RequestConfig };
export default api;