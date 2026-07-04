export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  author: string | null;
  image: string | null;
  language: string;
  category: string[];
  published: string;
}

export interface NewsAPIResponse {
  status: string;
  news: NewsArticle[];
  page: number;
  next_cursor?: string;
}
