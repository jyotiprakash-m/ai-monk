// API utility functions for database operations
//
// Setup Instructions:
// 1. Create a .env.local file in the project root
// 2. Add the following environment variables:
//    NEXT_PUBLIC_API_URL=http://localhost:8000/v1/db
//    NEXT_PUBLIC_API_USERNAME=admin
//    NEXT_PUBLIC_API_PASSWORD=password
// 3. Make sure your backend API server is running on the specified URL
//
// Authentication:
// - Uses Basic Auth with base64 encoded credentials
// - Header: Authorization: Basic <base64-encoded-username:password>
//
// Actual API Endpoints (based on provided curl commands):
// - GET /users - Get users data
// - GET /applications - Get applications data
// - GET /approvals - Get approvals data
// - GET /orders - Get orders data
// - GET /order_items - Get order items data
// - GET /deliveries - Get deliveries data
// - GET /documents - Get documents data
// - GET /audit_logs - Get audit logs data
//
// Response Format:
// { data: [...] }

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/v1/db";

// Basic Auth credentials
const AUTH_USERNAME = process.env.NEXT_PUBLIC_API_USERNAME || "admin";
const AUTH_PASSWORD = process.env.NEXT_PUBLIC_API_PASSWORD || "password";
const AUTH_TOKEN = btoa(`${AUTH_USERNAME}:${AUTH_PASSWORD}`);

export interface ApiResponse<T> {
  data: T;
  total?: number;
  page?: number;
  limit?: number;
}

export interface TableData {
  [key: string]: any;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${AUTH_TOKEN}`,
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${url}:`, error);
      throw error;
    }
  }

  // Fetch table data - direct endpoints based on actual API
  async getTableData(
    tableName: string,
    page: number = 1,
    limit: number = 50
  ): Promise<ApiResponse<TableData[]>> {
    // Map frontend table names to API endpoints
    const endpointMap: { [key: string]: string } = {
      Users: "/users",
      Applications: "/applications",
      Approvals: "/approvals",
      Orders: "/orders",
      OrderItems: "/order_items",
      Deliveries: "/deliveries",
      Documents: "/documents",
      AuditLogs: "/audit_logs",
    };

    const endpoint = endpointMap[tableName];
    if (!endpoint) {
      throw new Error(`Unknown table: ${tableName}`);
    }

    return this.request<ApiResponse<TableData[]>>(endpoint);
  }

  // Get total count for a table (using data length since count endpoint not provided)
  async getTableCount(tableName: string): Promise<{ count: number }> {
    try {
      const data = await this.getTableData(tableName);
      return { count: data.data.length };
    } catch (error) {
      console.warn(`Count not available for ${tableName}, using 0`);
      return { count: 0 };
    }
  }

  // Get table schema/columns (not implemented in current API)
  async getTableSchema(tableName: string): Promise<{ columns: string[] }> {
    // Return empty array since schema endpoint doesn't exist
    console.warn(`Schema endpoint not available for ${tableName}`);
    return { columns: [] };
  }

  // Search table data (not implemented in current API)
  async searchTable(
    tableName: string,
    query: string,
    page: number = 1,
    limit: number = 50
  ): Promise<ApiResponse<TableData[]>> {
    // For now, just return all data (search not implemented)
    console.warn(`Search not implemented, returning all ${tableName} data`);
    return this.getTableData(tableName, page, limit);
  }

  // Get available tables (not implemented in current API)
  async getAvailableTables(): Promise<{ tables: string[] }> {
    // Return hardcoded list based on known endpoints
    return {
      tables: [
        "Users",
        "Applications",
        "Approvals",
        "Orders",
        "OrderItems",
        "Deliveries",
        "Documents",
        "AuditLogs",
      ],
    };
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
