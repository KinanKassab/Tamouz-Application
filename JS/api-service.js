/* 
===========================================
SCOUTPLUSE - API SERVICE
===========================================

This service handles all API communications with the PHP backend
for reading and writing event data to the JSON file.
*/

/**
 * API Configuration
 * Update these values to match your 000webhost hosting setup
 */
const API_CONFIG = {
    baseUrl: '', // نفس النطاق - لا حاجة لـ baseUrl
    securityToken: 'ScoutPlus(WebApp)',
    endpoints: {
        read: '/read.php',
        write: '/write.php'
    },
    timeout: 10000 // 10 seconds timeout
};

/**
 * API Service Class
 * Handles all communication with the PHP backend
 */
class APIService {
    constructor() {
        this.baseUrl = API_CONFIG.baseUrl;
        this.token = API_CONFIG.securityToken;
        this.endpoints = API_CONFIG.endpoints;
        this.timeout = API_CONFIG.timeout;
    }

    /**
     * Create fetch request with timeout
     */
    async fetchWithTimeout(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const fullUrl = this.baseUrl ? `${this.baseUrl}${url}` : url;
            const response = await fetch(fullUrl, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...options.headers
                }
            });

            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Request timeout - please check your connection');
            }
            throw error;
        }
    }

    /**
     * Read all events from the server
     */
    async readEvents() {
        console.log('📥 Reading events from API...');
        
        try {
            const url = this.endpoints.read;
            console.log(`🔗 API URL: ${url}`);
            
            const response = await this.fetchWithTimeout(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to read events');
            }

            console.log(`✅ Successfully loaded ${result.data.totalEvents} events`);
            return result.data;

        } catch (error) {
            console.error('❌ Error reading events:', error);
            throw new Error(`Failed to load events: ${error.message}`);
        }
    }

    /**
     * Write/Update all events to the server
     */
    async writeEvents(eventsData) {
        console.log('📤 Writing events to API...');
        
        try {
            const url = this.endpoints.write;
            
            const requestData = {
                token: this.token,
                operation: 'update',
                data: {
                    events: eventsData,
                    lastUpdated: new Date().toISOString()
                }
            };

            const response = await this.fetchWithTimeout(url, {
                method: 'POST',
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to write events');
            }

            console.log(`✅ Successfully saved ${result.data.totalEvents} events`);
            return result.data;

        } catch (error) {
            console.error('❌ Error writing events:', error);
            throw new Error(`Failed to save events: ${error.message}`);
        }
    }

    /**
     * Add a new event
     */
    async addEvent(eventData) {
        console.log('➕ Adding new event to API...');
        
        try {
            const url = this.endpoints.write;
            
            const requestData = {
                token: this.token,
                operation: 'add',
                data: eventData
            };

            const response = await this.fetchWithTimeout(url, {
                method: 'POST',
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to add event');
            }

            console.log(`✅ Successfully added event: ${eventData.title}`);
            return result.data;

        } catch (error) {
            console.error('❌ Error adding event:', error);
            throw new Error(`Failed to add event: ${error.message}`);
        }
    }

    /**
     * Delete an event
     */
    async deleteEvent(eventId) {
        console.log(`🗑️ Deleting event ${eventId} from API...`);
        
        try {
            const url = this.endpoints.write;
            
            const requestData = {
                token: this.token,
                operation: 'delete',
                data: { id: eventId }
            };

            const response = await this.fetchWithTimeout(url, {
                method: 'POST',
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to delete event');
            }

            console.log(`✅ Successfully deleted event ${eventId}`);
            return result.data;

        } catch (error) {
            console.error('❌ Error deleting event:', error);
            throw new Error(`Failed to delete event: ${error.message}`);
        }
    }

    /**
     * Test API connection
     */
    async testConnection() {
        console.log('🔍 Testing API connection...');
        
        try {
            const data = await this.readEvents();
            console.log('✅ API connection successful');
            return {
                success: true,
                message: 'API connection successful',
                eventsCount: data.totalEvents || 0
            };
        } catch (error) {
            console.error('❌ API connection failed:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * Get API status and information
     */
    getAPIInfo() {
        return {
            baseUrl: this.baseUrl,
            endpoints: this.endpoints,
            hasToken: !!this.token,
            timeout: this.timeout
        };
    }
}

// Create global API service instance
const apiService = new APIService();

// Make it globally available
window.apiService = apiService;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIService, apiService };
}

console.log('📡 API Service initialized successfully');