/**
 * 文档管理 API 服务
 * 对接文控系统的 4 个核心接口
 */

export interface MarkdownDocument {
  id: string;
  name: string;
  content: string;
  description?: string;
  tags: string[];
  uploadDate: string;
  fileSize: number;
  collectionId: string;
}

export interface QAItem {
  id: string;
  question: string;
  answer: string;
  tags?: string[];
  relevanceScore?: number;
}

export interface AskResponse {
  answer: string;
  sourceDocuments?: string[];
  confidence?: number;
}

export interface QueryResponse {
  results: Array<{
    id: string;
    content: string;
    relevanceScore: number;
  }>;
}

export interface GetQAListParams {
  collectionId?: string;
  tags?: string[];
  keyword?: string;
  limit?: number;
  offset?: number;
}

export interface GetMarkdownListParams {
  collectionId?: string;
  tags?: string[];
  keyword?: string;
  limit?: number;
  offset?: number;
}

class DocumentApiService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/documents') {
    this.baseUrl = baseUrl;
  }

  /**
   * 1. 问 (Ask) - 提问接口
   * 向文档库提问，基于文档内容生成答案
   */
  async ask(question: string, options?: {
    collectionId?: string;
    modelId?: string;
    maxResults?: number;
  }): Promise<AskResponse> {
    const response = await fetch(`${this.baseUrl}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        ...options
      }),
    });

    if (!response.ok) {
      throw new Error(`提问失败: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 2. 查 (Query) - 查询接口
   * 在文档库中搜索相关内容
   */
  async query(query: string, options?: {
    collectionId?: string;
    maxResults?: number;
    threshold?: number;
  }): Promise<QueryResponse> {
    const response = await fetch(`${this.baseUrl}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        ...options
      }),
    });

    if (!response.ok) {
      throw new Error(`查询失败: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 3. 有哪些 QA (Get QA List) - 获取 QA 列表接口
   * 获取文档库中的所有问答对
   */
  async getQAList(params?: GetQAListParams): Promise<{
    items: QAItem[];
    total: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.collectionId) queryParams.append('collectionId', params.collectionId);
    if (params?.keyword) queryParams.append('keyword', params.keyword);
    if (params?.tags) params.tags.forEach(tag => queryParams.append('tags', tag));
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const response = await fetch(`${this.baseUrl}/qa?${queryParams.toString()}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`获取 QA 列表失败: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 4. 有哪些 Markdown 文档 (Get Markdown List) - 获取 Markdown 文档列表接口
   * 获取文档库中的所有 Markdown 文档
   */
  async getMarkdownList(params?: GetMarkdownListParams): Promise<{
    items: MarkdownDocument[];
    total: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.collectionId) queryParams.append('collectionId', params.collectionId);
    if (params?.keyword) queryParams.append('keyword', params.keyword);
    if (params?.tags) params.tags.forEach(tag => queryParams.append('tags', tag));
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const response = await fetch(`${this.baseUrl}/markdown?${queryParams.toString()}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`获取 Markdown 列表失败: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 获取单个 Markdown 文档的完整内容
   */
  async getMarkdownContent(docId: string): Promise<{
    id: string;
    name: string;
    content: string;
  }> {
    const response = await fetch(`${this.baseUrl}/markdown/${docId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`获取文档内容失败: ${response.statusText}`);
    }

    return response.json();
  }
}

// 导出单例实例
export const documentApi = new DocumentApiService();

// 导出类型
export type { MarkdownDocument, QAItem, AskResponse, QueryResponse, GetQAListParams, GetMarkdownListParams };