/**
 * Safely parse JSON response, handling HTML error pages
 * @param {Response} response - Fetch API response object
 * @returns {Promise<any>} Parsed JSON data
 * @throws {Error} If response is not JSON or parsing fails
 */
export const safeJsonParse = async (response) => {
  const contentType = response.headers.get('content-type');
  
  // Check if response is actually JSON
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(`Expected JSON but received ${contentType || 'unknown content type'}. Response: ${text.substring(0, 200)}`);
  }
  
  try {
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error.message}`);
  }
};

/**
 * Fetch wrapper with automatic JSON parsing and error handling
 * @param {string} url - API endpoint URL
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<any>} Parsed response data
 */
export const fetchJSON = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    
    // Check if response is ok before parsing
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      
      // Try to get error message from JSON if available
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Otherwise, get text response
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`);
    }
    
    return await safeJsonParse(response);
  } catch (error) {
    // Re-throw with more context
    if (error.message.includes('Failed to fetch')) {
      throw new Error(`Network error: Unable to reach ${url}. Please check your connection.`);
    }
    throw error;
  }
};

/**
 * Get backend URLs based on environment
 * @returns {Object} Backend URLs
 */
const getBackendUrls = () => {
  const primary = import.meta.env.VITE_API_URL || 'https://crm.jagalikoota.com/api/v1';
  const secondary = import.meta.env.VITE_API_URL_SECONDARY || 'https://crm.jagalikoota.com/api/v1';
  
  console.log('🌐 Using backends:', { primary, secondary, mode: import.meta.env.MODE });
  
  return { primary, secondary };
};

/**
 * Dual backend sync - makes requests to both backends
 * @param {string} endpoint - API endpoint path (e.g., '/hotel/getAllRestaurants')
 * @param {RequestInit} options - Fetch options
 * @param {boolean} mergeResults - If true, merge results from both backends (for GET requests)
 * @returns {Promise<any>} Parsed response data from primary backend or merged data
 */
export const fetchDualBackend = async (endpoint, options = {}, mergeResults = false) => {
  const { primary, secondary } = getBackendUrls();
  const method = options.method || 'GET';
  
  // For POST requests (create), ensure same _id on both backends
  if (method === 'POST') {
    try {
      // First, create on primary backend
      console.log(`Creating on primary backend: ${primary}${endpoint}`);
      const primaryResult = await fetchJSON(`${primary}${endpoint}`, options);
      
      // Extract the actual data object (handle both formats: direct object or wrapped in data/category)
      const primaryData = primaryResult.category || primaryResult.data || primaryResult;
      const primaryId = primaryData._id;
      
      console.log(`✅ Created on primary with _id: ${primaryId}`);
      
      // Then create on secondary backend with the same _id
      if (primaryId) {
        try {
          // Clone the options and add the _id
          const secondaryOptions = { ...options };
          
          if (options.body instanceof FormData) {
            // Clone FormData
            const newFormData = new FormData();
            for (let [key, value] of options.body.entries()) {
              newFormData.append(key, value);
            }
            // Add the _id from primary
            newFormData.append('_id', primaryId);
            secondaryOptions.body = newFormData;
          } else if (typeof options.body === 'string') {
            // JSON body
            const bodyData = JSON.parse(options.body);
            bodyData._id = primaryId;
            secondaryOptions.body = JSON.stringify(bodyData);
          }
          
          console.log(`Creating on secondary backend with same _id: ${secondary}${endpoint}`);
          await fetchJSON(`${secondary}${endpoint}`, secondaryOptions);
          console.log(`✅ Created on secondary with same _id: ${primaryId}`);
        } catch (error) {
          console.warn(`Failed to sync with secondary backend:`, error.message);
          // Continue even if secondary fails
        }
      }
      
      // Return the actual data object (not the wrapper)
      return primaryData;
    } catch (error) {
      console.error(`Failed to create on primary backend:`, error.message);
      throw error;
    }
  }
  
  // For PUT requests (update), send to both backends sequentially to ensure sync
  if (method === 'PUT') {
    try {
      // First, update on primary backend
      console.log(`Updating on primary backend: ${primary}${endpoint}`);
      const primaryResult = await fetchJSON(`${primary}${endpoint}`, options);
      
      // Extract the actual data object
      const primaryData = primaryResult.category || primaryResult.data || primaryResult;
      
      console.log(`✅ Updated on primary backend`);
      
      // Then update on secondary backend
      try {
        console.log(`Updating on secondary backend: ${secondary}${endpoint}`);
        await fetchJSON(`${secondary}${endpoint}`, options);
        console.log(`✅ Updated on secondary backend`);
      } catch (error) {
        console.warn(`Failed to sync update with secondary backend:`, error.message);
        // Continue even if secondary fails
      }
      
      // Return the actual data object
      return primaryData;
    } catch (error) {
      console.error(`Failed to update on primary backend:`, error.message);
      throw error;
    }
  }
  
  // For other methods (GET, DELETE), send to both simultaneously
  const primaryPromise = fetchJSON(`${primary}${endpoint}`, options)
    .catch(error => {
      console.warn(`Primary backend (${primary}) failed:`, error.message);
      return null;
    });
  
  const secondaryPromise = fetchJSON(`${secondary}${endpoint}`, options)
    .catch(error => {
      console.warn(`Secondary backend (${secondary}) failed:`, error.message);
      return null;
    });
  
  // Wait for both to complete
  const [primaryResult, secondaryResult] = await Promise.all([primaryPromise, secondaryPromise]);
  
  // For GET requests with mergeResults=true, combine data from both backends
  if (method === 'GET' && mergeResults && Array.isArray(primaryResult) && Array.isArray(secondaryResult)) {
    console.log(`📊 Merging results: ${primaryResult.length} from primary + ${secondaryResult.length} from secondary`);
    
    // Merge arrays and remove duplicates based on _id
    const merged = [...primaryResult];
    const primaryIds = new Set(primaryResult.map(item => item._id));
    
    secondaryResult.forEach(item => {
      if (!primaryIds.has(item._id)) {
        merged.push(item);
      }
    });
    
    console.log(`✅ Total merged results: ${merged.length}`);
    return merged;
  }
  
  // For non-GET requests or when not merging, return primary result if successful
  if (primaryResult) {
    // Unwrap response if it's wrapped in { category: ... } or { data: ... }
    if (method === 'PUT' || method === 'DELETE') {
      return primaryResult.category || primaryResult.data || primaryResult;
    }
    return primaryResult;
  }
  
  if (secondaryResult) {
    console.log('⚠️ Using secondary backend result as primary failed');
    // Unwrap response if it's wrapped
    if (method === 'PUT' || method === 'DELETE') {
      return secondaryResult.category || secondaryResult.data || secondaryResult;
    }
    return secondaryResult;
  }
  
  throw new Error('Both backends failed to respond');
};

/**
 * Single backend fetch (uses primary only)
 * @param {string} endpoint - API endpoint path
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<any>} Parsed response data
 */
export const fetchSingleBackend = async (endpoint, options = {}) => {
  const { primary } = getBackendUrls();
  return fetchJSON(`${primary}${endpoint}`, options);
};
