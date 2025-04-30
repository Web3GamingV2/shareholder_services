/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-19 11:14:22
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-30 14:46:25
 * @FilePath: /sbng_cake/shareholder_services/src/supabase/supabase.service.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { MemoryCacheService } from 'src/memory-cache/memory-cache.service';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private _supabaseAdmin: SupabaseClient;
  private _initializingClients = new Map<string, Promise<SupabaseClient>>();

  get supabaseAdmin() {
    return this._supabaseAdmin;
  }

  private createSupabaseClientId(id: string) {
    const cid = `supabase:client:${id}`;
    return cid;
  }

  constructor(
    @Inject(ConfigService) private readonly config: ConfigService,
    private readonly memoryCache: MemoryCacheService,
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
    return this._createSupabaseAdminClient();
  }

  private async _createSupabaseAdminClient() {
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
    admin = false,
  ) {
    const cacheKey = this.createSupabaseClientId(id);
    const cachedClient = await this.memoryCache.get<SupabaseClient>(cacheKey);
    if (cachedClient) {
      return cachedClient;
    }
    // 若并发请求正在初始化同一个 id，则等待已有 promise 返回
    if (this._initializingClients.has(cacheKey)) {
      return this._initializingClients.get(cacheKey)!;
    }
    const initializingPromise = (async () => {
      try {
        const client = admin
          ? await this._createSupabaseAdminClient()
          : await this._createSupabaseClient();
        await client.auth.setSession({
          access_token: access_token,
          refresh_token: refresh_token,
        });
        await this.memoryCache.set(cacheKey, client, ttl);
        return client;
      } finally {
        this._initializingClients.delete(cacheKey);
      }
    })();
    this._initializingClients.set(cacheKey, initializingPromise);
    const client = await initializingPromise;
    this._initializingClients.delete(cacheKey);
    return client;
  }

  public async clearSupabaseClientCache(id: string) {
    const cacheKey = this.createSupabaseClientId(id);
    await this.memoryCache.delete(cacheKey);
  }

  public async getSupabaseClient(
    id: string,
    ttl = 60 * 60,
    access_token?: string,
    refresh_token?: string,
  ) {
    const cacheKey = this.createSupabaseClientId(id);
    const cachedClient = await this.memoryCache.get<SupabaseClient>(cacheKey);
    if (!cachedClient) {
      return null;
    }
    const session = await cachedClient.auth.getSession();
    const exp = session.data?.session?.expires_at;
    const now = Math.floor(Date.now() / 1000);
    if (exp && exp - now < 300 && access_token && refresh_token) {
      try {
        const { error } = await cachedClient.auth.refreshSession();
        if (error) {
          await this.clearSupabaseClientCache(id);
          return null;
        }
        await this.memoryCache.set(cacheKey, cachedClient, ttl);
      } catch (error) {
        await this.clearSupabaseClientCache(id);
        return null;
      }
    }
    return cachedClient;
  }
}
