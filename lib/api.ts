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
// - POST /store_document_vector - Upload document and store vectors (multipart/form-data)
//
// Response Format:
// Database endpoints: { data: [...] }
// Upload endpoint: { message: string, document_id?: string }

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

export interface Email {
  email_id: string;
  subject: string;
  from: string;
  date: string;
  body: string;
  classification_report: {
    predicted_department: string;
    confidence: number;
    all_probabilities: {
      [department: string]: number;
    };
  };
  sentiment_analysis: string;
}

export interface EmailClassificationResult {
  emails: Email[];
  total_emails_in_inbox: number;
}

export interface ReplyResponse {
  tone: string;
  email_body: string;
  email_subject: string;
  tool_instructions: string;
  collection_name: string;
  custom_query_input: string;
  input: string;
  final_response: string;
  tool_outputs: string;
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
  ): Promise<ApiResponse<Record<string, any>[]>> {
    // Map frontend table names to API endpoints
    const endpointMap: { [key: string]: string } = {
      Users: "/db/users",
      Applications: "/db/applications",
      Approvals: "/db/approvals",
      Orders: "/db/orders",
      OrderItems: "/db/order_items",
      Deliveries: "/db/deliveries",
      Documents: "/db/documents",
      AuditLogs: "/db/audit_logs",
    };

    const endpoint = endpointMap[tableName];
    if (!endpoint) {
      throw new Error(`Unknown table: ${tableName}`);
    }

    return this.request<ApiResponse<Record<string, any>[]>>(endpoint);
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
  ): Promise<ApiResponse<Record<string, any>[]>> {
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

  // Upload document and store vectors
  async uploadDocument(
    file: File,
    collectionName: string
  ): Promise<{ message: string; document_id?: string }> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("collection_name", collectionName);

    // Direct fetch call for upload endpoint
    const uploadUrl = `${API_BASE_URL}/store_document_vector`;

    try {
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          // Don't set Content-Type for FormData - let browser set it with boundary
          Authorization: `Basic ${AUTH_TOKEN}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(
          `Upload failed: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`Upload failed for ${uploadUrl}:`, error);
      throw error;
    }
  }

  // Fetch email classification results
  async getEmailClassification(
    userId: string,
    orgId: string,
    offset: number = 0,
    limit: number = 50
  ): Promise<EmailClassificationResult> {
    // Email classification uses a different base URL
    const emailApiBaseUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace("/db", "") ||
      "http://localhost:8000/v1";
    const url = `${emailApiBaseUrl}/email-graph/run`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${AUTH_TOKEN}`,
        },
        body: new URLSearchParams({
          user_id: userId,
          org_id: orgId,
          offset: offset.toString(),
          limit: limit.toString(),
        }).toString(),
      });

      if (!response.ok) {
        throw new Error(
          `Email classification request failed: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`Email classification failed for ${url}:`, error);
      throw error;
    }
  }

  // Generate email reply
  async generateEmailReply(data: {
    email_subject: string;
    email_body: string;
    custom_query_input?: string;
    collection_name?: string;
    tone: string;
    tool_instructions: string;
  }): Promise<ReplyResponse> {
    const replyApiBaseUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace("/db", "") ||
      "http://localhost:8000/v1";
    const url = `${replyApiBaseUrl}/reply-graph/run`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${AUTH_TOKEN}`,
        },
        body: new URLSearchParams({
          email_subject: data.email_subject,
          email_body: data.email_body,
          custom_query_input: data.custom_query_input || "",
          collection_name: data.collection_name || "",
          tone: data.tone,
          tool_instructions: data.tool_instructions,
        }).toString(),
      });

      if (!response.ok) {
        throw new Error(
          `Reply generation failed: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`Reply generation failed for ${url}:`, error);
      throw error;
    }
  }

  // Get available collections
  async getCollections(): Promise<{
    data: Array<{ uuid: string; name: string; cmetadata: any }>;
    message: string;
  }> {
    return this.request<{
      data: Array<{ uuid: string; name: string; cmetadata: any }>;
      message: string;
    }>("/db/collections");
  }

  // Generate simple email reply
  async generateSimpleEmailReply(
    emailText: string
  ): Promise<{ reply: string }> {
    const replyApiBaseUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace("/db", "") ||
      "http://localhost:8000/v1";
    const url = `${replyApiBaseUrl}/email-reply/generate_reply`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${AUTH_TOKEN}`,
        },
        body: new URLSearchParams({
          email_text: emailText,
        }).toString(),
      });

      if (!response.ok) {
        throw new Error(
          `Simple reply generation failed: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`Simple reply generation failed for ${url}:`, error);
      throw error;
    }
  }

  // Run database query
  async runDatabaseQuery(
    userRequest: string
  ): Promise<{ result: { data: any } }> {
    const queryApiBaseUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace("/db", "") ||
      "http://localhost:8000/v1";
    const url = `${queryApiBaseUrl}/db-query/run_query`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${AUTH_TOKEN}`,
        },
        body: new URLSearchParams({
          user_request: userRequest,
        }).toString(),
      });

      if (!response.ok) {
        throw new Error(
          `Database query failed: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`Database query failed for ${url}:`, error);
      throw error;
    }
  }

  // Generate email reply with RAG
  async generateEmailReplyWithRAG(
    emailText: string,
    collectionName: string,
    k: number = 3
  ): Promise<{ reply: string }> {
    const replyApiBaseUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace("/db", "") ||
      "http://localhost:8000/v1";
    const url = `${replyApiBaseUrl}/email-reply/generate_email_with_rag`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${AUTH_TOKEN}`,
        },
        body: new URLSearchParams({
          email_text: emailText,
          collection_name: collectionName,
          k: k.toString(),
        }).toString(),
      });

      if (!response.ok) {
        throw new Error(
          `RAG email generation failed: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`RAG email generation failed for ${url}:`, error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
