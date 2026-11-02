import param from './param';

const absUrlRegex = /^(https?:)?\/\//i;

function isRelative(url) {
  return !absUrlRegex.test(url);
}

function enhance(promise) {
  const ajaxPromise = {
    then(onFulfilled, onRejected) {
      return enhance(promise.then(onFulfilled, onRejected));
    },

    catch(onRejected) {
      return enhance(promise.catch(onRejected));
    },

    finally(onFinally) {
      return enhance(promise.finally(onFinally));
    },

    done(onFulfilled) {
      promise.then((value) => {
        onFulfilled(value);
      }, () => {});

      return ajaxPromise;
    },

    fail(onRejected) {
      promise.then(undefined, (error) => {
        onRejected(error);
      });

      return ajaxPromise;
    },

    always(onFinally) {
      promise.finally(onFinally);

      return ajaxPromise;
    }
  };

  return ajaxPromise;
}

function appendQuery(url, query) {
  if (!query) {
    return url;
  }

  return `${url}${url.includes('?') ? '&' : '?'}${query}`;
}

function parseBody(text, dataType) {
  if (!text) {
    return undefined;
  }

  if (dataType === 'json') {
    return JSON.parse(text);
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return text;
  }
}

export default function createAjaxRequest(originalAjaxOptions) {
  const ajaxOptions = { ...originalAjaxOptions };
  const controller = new AbortController();
  let aborted = false;
  let complete = false;

  function abortRequest() {
    if (!complete) {
      aborted = true;
      controller.abort();
    }
  }

  const method = (ajaxOptions.method || 'GET').toUpperCase();
  let url = ajaxOptions.url;
  const headers = { ...(ajaxOptions.headers || {}) };

  if (isRelative(url)) {
    url = window.Whisparr.apiRoot + url;
    headers['X-Api-Key'] = window.Whisparr.apiKey;
  }

  const hasBody = method !== 'GET' && method !== 'HEAD';
  let body = null;
  const { data } = ajaxOptions;

  if (data != null && !hasBody) {
    const query = typeof data === 'string' ? data : param(data, !!ajaxOptions.traditional);
    url = appendQuery(url, query);
  } else if (data != null && hasBody) {
    body = typeof data === 'string' ? data : JSON.stringify(data);
  }

  let { contentType } = ajaxOptions;

  if (
    contentType == null &&
    ajaxOptions.dataType === 'json' &&
    (method === 'PUT' || method === 'POST' || method === 'DELETE')
  ) {
    contentType = 'application/json';
  }

  if (contentType && body != null) {
    headers['Content-Type'] = contentType;
  } else if (body != null && typeof data !== 'string' && contentType == null) {
    headers['Content-Type'] = 'application/json';
  }

  const nativeRequest = new Promise((resolve, reject) => {
    fetch(url, {
      method,
      headers,
      body: body == null ? undefined : body,
      signal: controller.signal
    }).then(async(response) => {
      complete = true;
      const text = await response.text();
      let parsed = null;

      try {
        parsed = parseBody(text, ajaxOptions.dataType);
      } catch (error) {
        reject({
          status: response.status,
          aborted: false,
          responseJSON: undefined,
          responseText: text
        });

        return;
      }

      if (!response.ok) {
        reject({
          status: response.status,
          aborted: false,
          responseJSON: parsed && typeof parsed === 'object' ? parsed : undefined,
          responseText: text
        });

        return;
      }

      resolve(parsed);
    }).catch((error) => {
      complete = true;

      reject({
        status: 0,
        aborted: aborted || error.name === 'AbortError',
        responseJSON: undefined,
        message: error && error.message
      });
    });
  });

  // Fire-and-forget callers (for example shutdown) should not surface
  // an unhandled rejection. .fail() still observes the same rejection.
  nativeRequest.catch(() => {});

  const request = enhance(nativeRequest);

  return {
    request,
    abortRequest
  };
}
