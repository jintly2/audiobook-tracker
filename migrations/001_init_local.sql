-- ============================================================
-- Audiobook Tracker - 本地 PostgreSQL 初始化脚本
-- 包含：建表 + 种子推荐数据
-- ============================================================

-- 启用 pgcrypto 扩展（用于 gen_random_uuid）
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. users 表 — 用户
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. audiobook_records 表 — 用户听书记录
-- ============================================================
CREATE TABLE IF NOT EXISTS audiobook_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  current_episode INTEGER NOT NULL DEFAULT 0,
  total_episodes INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  record_date DATE NOT NULL,
  rating INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'listening',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_audiobook_records_user_id ON audiobook_records(user_id);
CREATE INDEX IF NOT EXISTS idx_audiobook_records_record_date ON audiobook_records(record_date);
CREATE INDEX IF NOT EXISTS idx_audiobook_records_status ON audiobook_records(status);

-- updated_at 自动更新触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_audiobook_records_updated_at ON audiobook_records;
CREATE TRIGGER update_audiobook_records_updated_at
BEFORE UPDATE ON audiobook_records
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 3. recommendations 表 — 推荐数据
-- ============================================================
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  platform VARCHAR(20) NOT NULL,
  category VARCHAR(20) NOT NULL,
  voice_actors TEXT,
  original_work TEXT,
  synopsis TEXT,
  cover_url TEXT,
  source_type VARCHAR(10) NOT NULL DEFAULT 'seed',
  external_id VARCHAR(100),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_recommendations_platform ON recommendations(platform);
CREATE INDEX IF NOT EXISTS idx_recommendations_category ON recommendations(category);

-- ============================================================
-- 4. 种子数据 — 推荐内容
-- ============================================================
DO $$
DECLARE
  seed_count INTEGER;
BEGIN
  SELECT count(*) INTO seed_count FROM recommendations WHERE source_type = 'seed';
  
  IF seed_count = 0 THEN
    INSERT INTO recommendations (title, platform, category, voice_actors, original_work, synopsis, source_type, sort_order) VALUES
    ('魔道祖师', 'missevan', 'audio_drama', '路知行（魏无羡）× 魏超（蓝忘机）', '墨香铜臭', '玄幻仙侠：前世家主魏无羡死后重生，与含光君蓝忘机重逢，携手追查陈年诡案、守护天下苍生。', 'seed', 1),
    ('撒野', 'missevan', 'audio_drama', '倒霉死勒（蒋丞）× 涅槃（顾飞）', '巫哲', '校园成长：两个少年在钢厂小城里互相救赎、彼此成全的双向奔赴。', 'seed', 2),
    ('默读', 'missevan', 'audio_drama', '杨天翔（费渡）× 刘琮（骆闻舟）', 'Priest', '刑侦悬疑：在连环命案背后，费渡与骆闻舟联手剥开层层黑暗真相。', 'seed', 3),
    ('杀破狼', 'missevan', 'audio_drama', '阿杰（顾昀）× 杨天翔（长庚）', 'Priest', '权谋机甲：乱世大梁，长庚与顾昀权谋相携、共守家国。', 'seed', 4),
    ('天官赐福', 'missevan', 'audio_drama', '苏尚卿（谢怜）× 陈张太康（花城）', '墨香铜臭', '玄幻：仙乐太子谢怜三次飞升，与绝境鬼王花城相遇相守。', 'seed', 5),
    ('将进酒', 'missevan', 'audio_drama', '姜广涛（沈兰舟）× 袁铭喆（萧驰野）', '唐酒卿', '古风权谋：乱世争霸，中博王萧驰野与沈兰舟结盟问鼎天下。', 'seed', 6),
    ('三体（全六季）', 'missevan', 'audiobook', '729声工场制作', '刘慈欣', '科幻史诗：地球文明与三体文明跨越星海的对抗与黑暗森林法则。', 'seed', 1),
    ('鬼吹灯系列', 'missevan', 'audiobook', '青雪演播', '天下霸唱', '悬疑盗墓：摸金校尉深入古墓、机关暗器与奇闻异事的惊险旅程。', 'seed', 2),
    ('人鱼陷落', 'manbo', 'audio_drama', '张福正（白楚年）× 马正阳（兰波）', '麟潜', 'ABO末世：变异生物横行的末世，白楚年与最强人鱼兰波相爱相杀、彼此守护。', 'seed', 1),
    ('靡言', 'manbo', 'audio_drama', '文森（摩川）× 金弦（柏胤）', '回南雀', '民俗都市：清冷神性的摩川与珠宝设计师柏胤的宿命纠葛。', 'seed', 2),
    ('囚于永夜', 'manbo', 'audiobook', '张福正（顾昀迟）× 孙路路（温然）', '麦香鸡呢', 'ABO先婚后爱：温然被植入腺体后与高匹配度Alpha顾昀迟的双向救赎。', 'seed', 1),
    ('小潭山没有天文台', 'manbo', 'audiobook', '史泽鲲（谭又明）× 徐宇隆（沈宗年）', '', '现代：爱里长大的小太阳与阴郁腹黑少年的暗恋守候。', 'seed', 2);
  END IF;
END $$;
