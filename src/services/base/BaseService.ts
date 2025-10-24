import { ErrorHandler } from './ErrorHandler';

/**
 * 모든 Service 클래스의 기본 클래스
 *
 * 공통 에러 처리 로직을 제공
 */
export abstract class BaseService {
  /**
   * 에러를 ServiceError로 변환하여 throw
   */
  protected handleError(error: unknown): never {
    throw ErrorHandler.handleError(error);
  }

  /**
   * 네트워크 에러 확인
   */
  protected isNetworkError(error: unknown): boolean {
    return ErrorHandler.isNetworkError(error);
  }

  /**
   * 인증 에러 확인
   */
  protected isAuthError(error: unknown): boolean {
    return ErrorHandler.isAuthError(error);
  }
}
