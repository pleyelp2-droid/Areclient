import * as memjs from 'memjs';

export class CacheManager {
  private client: any;

  constructor(endpoint: string) {
    this.client = memjs.Client.create(endpoint);
  }

  async set(key: string, value: any, expires: number = 3600) {
    await this.client.set(key, JSON.stringify(value), { expires });
  }

  async get(key: string): Promise<any | null> {
    const { value } = await this.client.get(key);
    return value ? JSON.parse(value.toString()) : null;
  }
}
