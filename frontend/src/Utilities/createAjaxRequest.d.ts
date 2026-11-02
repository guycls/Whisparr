export interface AjaxError {
  status: number;
  aborted?: boolean;
  responseJSON?:
    | {
        message?: string;
        [key: string]: unknown;
      }
    | Array<{
        propertyName?: string;
        errorMessage?: string;
        isWarning?: boolean;
        message?: string;
      }>;
  responseText?: string;
  message?: string;
}

export interface AjaxRequest<T = any> extends Promise<T> {
  done(onFulfilled: (value: T) => void): AjaxRequest<T>;
  fail(onRejected: (error: AjaxError) => void): AjaxRequest<T>;
  always(onFinally: () => void): AjaxRequest<T>;
}

interface AjaxOptions {
  url: string;
  method?: string;
  data?: unknown;
  dataType?: string;
  contentType?: string;
  traditional?: boolean;
  headers?: Record<string, string>;
  global?: boolean;
}

export default function createAjaxRequest(options: AjaxOptions): {
  request: AjaxRequest;
  abortRequest: () => void;
};
