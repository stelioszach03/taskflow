import { subscribeToLoadingState } from './api';

// Global loading state management
class LoadingService {
  constructor() {
    this.listeners = new Set();
    this.isLoading = false;
    
    // Subscribe to API loading state
    subscribeToLoadingState((loading) => {
      this.setLoading(loading);
    });
  }

  setLoading(loading) {
    this.isLoading = loading;
    this.notifyListeners();
  }

  subscribe(callback) {
    this.listeners.add(callback);
    // Immediately notify the new listener of current state
    callback(this.isLoading);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach(callback => {
      callback(this.isLoading);
    });
  }

  getLoadingState() {
    return this.isLoading;
  }
}

// Create singleton instance
const loadingService = new LoadingService();

export default loadingService;