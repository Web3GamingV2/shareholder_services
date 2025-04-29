/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-19 11:14:22
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-29 23:11:27
 * @FilePath: /sbng_cake/shareholder_services/src/supabase/supabase.service.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private _supabaseAdmin: SupabaseClient;
  private _initializingClients = new Map<string, Promise<SupabaseClient>>();

  get supabaseAdmin() {
    return this._supabaseAdmin;
  }

  constructor(
    @Inject(ConfigService) private readonly config: ConfigService,
    private readonly cache: CacheService,
  ) {}

  onModuleInit() {
    this.createSupabaseAdminClient().then((client) => {
      this._supabaseAdmin = client;
    });
  }

  private async createSupabaseAdminClient() {
    if (this._supabaseAdmin) {
      return this._supabaseAdmin;
    }
    const supabaseUrl = this.config.get<string>('SUPABASE_URL');
    const supabaseServiceKey = this.config.get<string>('SUPABASE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase URL or Service Role Key not configured.');
    }
    return createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  private async _createSupabaseClient() {
    const supabaseUrl = this.config.get<string>('SUPABASE_URL');
    const supabaseServiceKey = this.config.get<string>('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase URL or Service Role Key not configured.');
    }
    return createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  public async createSupabaseClient(
    id: string,
    ttl: number,
    access_token: string,
    refresh_token?: string,
  ) {
    const cacheKey = `supabase:client:${id}`;
    const cachedClient = await this.cache.getCache<SupabaseClient>(cacheKey);
    if (cachedClient) {
      return cachedClient;
    }
    const client = await this._createSupabaseClient();
    await client.auth.setSession({
      access_token: access_token,
      refresh_token: refresh_token,
    });
    await this.cache.setCache(cacheKey, client, ttl); // 缓存有效期为 7 天
    return client;
  }

  public async clearSupabaseClientCache(id: string) {
    const cacheKey = `supabase:client:${id}`;
    await this.cache.deleteCache(cacheKey);
  }

  public async getSupabaseClient(
    id: string,
    ttl = 60 * 60,
    access_token?: string,
    refresh_token?: string,
  ) {
    const cacheKey = `supabase:client:${id}`;
    const cachedClient = await this.cache.getCache(cacheKey);
    if (cachedClient) {
      return cachedClient;
    }
    // 若并发请求正在初始化同一个 id，则等待已有 promise 返回
    if (this._initializingClients.has(id)) {
      return this._initializingClients.get(id)!;
    }

    if (!access_token) return null;

    const initializingPromise = (async () => {
      const client = await this.createSupabaseClient(
        id,
        ttl,
        access_token,
        refresh_token,
      );
      this._initializingClients.delete(id);
      return client;
    })();

    this._initializingClients.set(id, initializingPromise);
    return initializingPromise;
  }
}
