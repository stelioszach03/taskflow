import { useState, useEffect, useCallback, useRef } from 'react';
import { isCancelError, createCancelableRequest } from '../services/api';
import toast from 'react-hot-toast';

/**
 * Custom hook for making API calls with loading state, error handling, and cancellation
 * @param {Function} apiFunction - The API function to call
 * @param {Object} options - Options for the hook
 * @param {boolean} options.immediate - Whether to call the API immediately on mount
 * @param {Array} options.dependencies - Dependencies for immediate calls
 * @param {Function} options.onSuccess - Callback on successful API call
 * @param {Function} options.onError - Callback on API error
 * @param {boolean} options.showErrorToast - Whether to show error toast (default: true)
 */
export const useApiCall = (apiFunction, options = {}) => {
  const {
    immediate = false,
    dependencies = [],
    onSuccess,
    onError,
    showErrorToast = true,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cancelTokenRef = useRef(null);

  // Cancel any pending request when component unmounts
  useEffect(() => {
    return () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('Component unmounted');
      }
    };
  }, []);

  // Execute the API call
  const execute = useCallback(async (...args) => {
    try {
      // Cancel any previous request
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('New request initiated');
      }

      // Create new cancel token
      const { token, cancel } = createCancelableRequest();
      cancelTokenRef.current = { cancel };

      setLoading(true);
      setError(null);

      // Add cancel token to arguments if the API function supports it
      const result = await apiFunction(...args, token);

      setData(result);
      setLoading(false);

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (err) {
      if (!isCancelError(err)) {
        setError(err);
        setLoading(false);

        if (showErrorToast && err.response?.data?.message) {
          toast.error(err.response.data.message);
        }

        if (onError) {
          onError(err);
        }
      }
      throw err;
    }
  }, [apiFunction, onSuccess, onError, showErrorToast]);

  // Reset state
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data,
    loading,
    error,
    execute,
    reset,
    cancel: () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('Request cancelled by user');
      }
    },
  };
};

/**
 * Custom hook for making multiple API calls in parallel
 * @param {Array<Function>} apiFunctions - Array of API functions to call
 * @param {Object} options - Options for the hook
 */
export const useParallelApiCalls = (apiFunctions, options = {}) => {
  const { onSuccess, onError, showErrorToast = true } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const cancelTokensRef = useRef([]);

  // Cancel all pending requests when component unmounts
  useEffect(() => {
    return () => {
      cancelTokensRef.current.forEach(({ cancel }) => {
        cancel('Component unmounted');
      });
    };
  }, []);

  // Execute all API calls in parallel
  const execute = useCallback(async (argsArray = []) => {
    try {
      // Cancel any previous requests
      cancelTokensRef.current.forEach(({ cancel }) => {
        cancel('New request initiated');
      });
      cancelTokensRef.current = [];

      setLoading(true);
      setErrors([]);

      // Create cancel tokens for all requests
      const cancelTokens = apiFunctions.map(() => createCancelableRequest());
      cancelTokensRef.current = cancelTokens;

      // Execute all API calls in parallel
      const promises = apiFunctions.map((apiFunc, index) => {
        const args = argsArray[index] || [];
        const { token } = cancelTokens[index];
        return apiFunc(...args, token);
      });

      const results = await Promise.allSettled(promises);

      // Process results
      const successfulResults = [];
      const failedResults = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfulResults[index] = result.value;
        } else {
          if (!isCancelError(result.reason)) {
            failedResults[index] = result.reason;
            if (showErrorToast && result.reason.response?.data?.message) {
              toast.error(result.reason.response.data.message);
            }
          }
        }
      });

      setData(successfulResults);
      setErrors(failedResults);
      setLoading(false);

      if (onSuccess && failedResults.filter(Boolean).length === 0) {
        onSuccess(successfulResults);
      }

      if (onError && failedResults.filter(Boolean).length > 0) {
        onError(failedResults);
      }

      return { data: successfulResults, errors: failedResults };
    } catch (err) {
      setLoading(false);
      throw err;
    }
  }, [apiFunctions, onSuccess, onError, showErrorToast]);

  // Reset state
  const reset = useCallback(() => {
    setData([]);
    setErrors([]);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    errors,
    execute,
    reset,
    cancel: () => {
      cancelTokensRef.current.forEach(({ cancel }) => {
        cancel('Request cancelled by user');
      });
    },
  };
};

export default useApiCall;