<!--
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-13 23:58:49
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-22 18:47:26
 * @FilePath: /shareholder_services/README.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->

```sql
DELETE FROM supabase_migrations.schema_migrations WHERE version = '20250418075725';

DROP TABLE IF EXISTS public.profiles;
DROP TYPE IF EXISTS public.wallet_type;
-- 如果你之前尝试创建了 handle_new_user 函数和触发器，也一并清理
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

```
