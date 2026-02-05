import type { Result } from '../../utils/result';
import type { NetworkError } from '../errors/network.error';

export interface HttpRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

export interface HttpResponse<T = unknown> {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: T;
}

export interface IHttpClient {
  request<T>(req: HttpRequest): Promise<Result<HttpResponse<T>, NetworkError>>;
}
