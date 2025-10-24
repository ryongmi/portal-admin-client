/**
 * 폼 검증 유틸리티 함수들
 */

// 이메일 검증 정규식
export const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

// 비밀번호 검증 정규식 (최소 8자, 대소문자, 숫자, 특수문자 포함)
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// 전화번호 검증 정규식 (한국 형식)
export const PHONE_REGEX = /^01[016789]-?\d{3,4}-?\d{4}$/;

// URL 검증 정규식
export const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;

/**
 * 일반적인 검증 규칙들
 */
export const validationRules = {
  // 필수 입력
  required: (fieldName: string): { required: string } => ({
    required: `${fieldName}을(를) 입력해주세요`,
  }),

  // 이메일
  email: {
    required: '이메일을 입력해주세요',
    pattern: {
      value: EMAIL_REGEX,
      message: '올바른 이메일 형식을 입력해주세요',
    },
  },

  // 비밀번호
  password: {
    required: '비밀번호를 입력해주세요',
    minLength: {
      value: 8,
      message: '비밀번호는 최소 8자 이상이어야 합니다',
    },
    pattern: {
      value: PASSWORD_REGEX,
      message: '비밀번호는 대소문자, 숫자, 특수문자를 포함해야 합니다',
    },
  },

  // 비밀번호 확인
  confirmPassword: (password: string): { required: string; validate: (value: string) => string | boolean } => ({
    required: '비밀번호 확인을 입력해주세요',
    validate: (value: string): string | boolean =>
      value === password || '비밀번호가 일치하지 않습니다',
  }),

  // 이름
  name: {
    required: '이름을 입력해주세요',
    minLength: {
      value: 2,
      message: '이름은 최소 2자 이상이어야 합니다',
    },
    maxLength: {
      value: 50,
      message: '이름은 최대 50자까지 입력 가능합니다',
    },
  },

  // 전화번호
  phone: {
    pattern: {
      value: PHONE_REGEX,
      message: '올바른 전화번호 형식을 입력해주세요 (예: 010-1234-5678)',
    },
  },

  // URL
  url: {
    pattern: {
      value: URL_REGEX,
      message: '올바른 URL 형식을 입력해주세요 (예: https://example.com)',
    },
  },

  // 숫자 범위
  numberRange: (min: number, max: number): { min: { value: number; message: string }; max: { value: number; message: string } } => ({
    min: {
      value: min,
      message: `${min} 이상의 값을 입력해주세요`,
    },
    max: {
      value: max,
      message: `${max} 이하의 값을 입력해주세요`,
    },
  }),

  // 문자열 길이
  stringLength: (min: number, max: number): { minLength: { value: number; message: string }; maxLength: { value: number; message: string } } => ({
    minLength: {
      value: min,
      message: `최소 ${min}자 이상 입력해주세요`,
    },
    maxLength: {
      value: max,
      message: `최대 ${max}자까지 입력 가능합니다`,
    },
  }),
};

// 서버 에러 타입 정의
type ServerError = string[] | Record<string, string | string[]> | string | null | undefined;

/**
 * 서버 에러를 폼 에러로 변환
 */
export function mapServerErrorsToFormErrors(serverErrors: ServerError): Record<string, { message: string }> {
  const formErrors: Record<string, { message: string }> = {};

  if (!serverErrors) return formErrors;

  // 서버에서 오는 에러 형식에 따라 처리
  if (Array.isArray(serverErrors)) {
    // 배열 형태의 에러 메시지
    serverErrors.forEach((error, index) => {
      formErrors[`error_${index}`] = { message: error };
    });
  } else if (typeof serverErrors === 'object') {
    // 객체 형태의 에러 메시지 (필드별)
    Object.keys(serverErrors).forEach((field) => {
      const errorValue = serverErrors[field];
      if (Array.isArray(errorValue)) {
        formErrors[field] = { message: errorValue.join(', ') };
      } else if (typeof errorValue === 'string') {
        formErrors[field] = { message: errorValue };
      }
    });
  } else if (typeof serverErrors === 'string') {
    // 단일 문자열 에러
    formErrors.general = { message: serverErrors };
  }

  return formErrors;
}

/**
 * 폼 에러를 사용자 친화적 메시지로 변환
 */
export function getFormErrorMessage(errors: Record<string, { message?: string }>): string {
  const errorMessages: string[] = [];

  Object.keys(errors).forEach((field) => {
    const error = errors[field];
    if (error?.message) {
      errorMessages.push(error.message);
    }
  });

  if (errorMessages.length === 0) {
    return '입력 데이터를 확인해주세요';
  }

  if (errorMessages.length === 1) {
    return errorMessages[0] || '';
  }

  return `다음 항목을 확인해주세요:\n${errorMessages.map(msg => `• ${msg}`).join('\n')}`;
}

/**
 * 특정 필드의 에러 메시지만 추출
 */
export function getFieldErrorMessage(errors: Record<string, { message?: string }>, fieldName: string): string | undefined {
  const error = errors[fieldName];
  return error?.message;
}

/**
 * 커스텀 검증 함수들
 */
export const customValidators = {
  // 한글만 허용
  koreanOnly: (value: string): string | boolean => {
    const koreanRegex = /^[가-힣\s]*$/;
    return koreanRegex.test(value) || '한글만 입력 가능합니다';
  },

  // 영문과 숫자만 허용
  alphanumericOnly: (value: string): string | boolean => {
    const alphanumericRegex = /^[a-zA-Z0-9]*$/;
    return alphanumericRegex.test(value) || '영문과 숫자만 입력 가능합니다';
  },

  // 특수문자 제외
  noSpecialChars: (value: string): string | boolean => {
    const noSpecialRegex = /^[a-zA-Z0-9가-힣\s]*$/;
    return noSpecialRegex.test(value) || '특수문자는 입력할 수 없습니다';
  },

  // 파일 크기 검증 (바이트 단위)
  fileSize: (maxSize: number): (files: FileList) => string | boolean => (files: FileList): string | boolean => {
    if (!files || files.length === 0) return true;
    const file = files[0];
    return file && file.size <= maxSize || `파일 크기는 ${Math.round(maxSize / 1024 / 1024)}MB 이하여야 합니다`;
  },

  // 파일 형식 검증
  fileType: (allowedTypes: string[]): (files: FileList) => string | boolean => (files: FileList): string | boolean => {
    if (!files || files.length === 0) return true;
    const file = files[0];
    const fileType = file?.type.toLowerCase() || '';
    return allowedTypes.includes(fileType) || `허용된 파일 형식: ${allowedTypes.join(', ')}`;
  },
};

/**
 * 실시간 검증을 위한 디바운스 훅 사용
 */
export function createAsyncValidator(
  validateFn: (value: string) => Promise<boolean | string>,
  delay: number = 500
) {
  let timeoutId: NodeJS.Timeout;

  return (value: string): Promise<boolean | string> => {
    return new Promise((resolve) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        const result = await validateFn(value);
        resolve(result);
      }, delay);
    });
  };
}

export default validationRules;