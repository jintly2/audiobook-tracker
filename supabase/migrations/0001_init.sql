-- ============================================================
-- Audiobook Tracker - 初始化迁移脚本
-- 包含：建表 + RLS 策略 + 种子推荐数据
-- ============================================================

-- 启用 pgcrypto 扩展（用于 gen_random_uuid）
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. audiobook_records 表 — 用户听书记录
-- ============================================================
CREATE TABLE IF NOT EXISTS audiobook_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- 启用 RLS
ALTER TABLE audiobook_records ENABLE ROW LEVEL SECURITY;

-- RLS 策略：用户只能操作自己的记录
DROP POLICY IF EXISTS "audiobook_records_select_own" ON audiobook_records;
CREATE POLICY "audiobook_records_select_own"
ON audiobook_records FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "audiobook_records_insert_own" ON audiobook_records;
CREATE POLICY "audiobook_records_insert_own"
ON audiobook_records FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "audiobook_records_update_own" ON audiobook_records;
CREATE POLICY "audiobook_records_update_own"
ON audiobook_records FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "audiobook_records_delete_own" ON audiobook_records;
CREATE POLICY "audiobook_records_delete_own"
ON audiobook_records FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================
-- 2. recommendations 表 — 推荐数据
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

-- 启用 RLS
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- RLS 策略：所有人可读（包括未登录用户），仅 service_role 可写
DROP POLICY IF EXISTS "recommendations_select_all" ON recommendations;
CREATE POLICY "recommendations_select_all"
ON recommendations FOR SELECT
USING (true);

-- ============================================================
-- 3. 种子数据 — 推荐内容
-- ============================================================

-- 先检查是否已有种子数据，避免重复插入
DO $$
DECLARE
  seed_count INTEGER;
BEGIN
  SELECT count(*) INTO seed_count FROM recommendations WHERE source_type = 'seed';
  
  IF seed_count = 0 THEN
    -- 猫耳-广播剧
    INSERT INTO recommendations (title, platform, category, voice_actors, original_work, synopsis, source_type, sort_order) VALUES
    ('魔道祖师', 'missevan', 'audio_drama', '路知行（魏无羡）× 魏超（蓝忘机）', '墨香铜臭', '玄幻仙侠：前世家主魏无羡死后重生，与含光君蓝忘机重逢，携手追查陈年诡案、守护天下苍生。', 'seed', 1),
    ('撒野', 'missevan', 'audio_drama', '倒霉死勒（蒋丞）× 涅槃（顾飞）', '巫哲', '校园成长：两个少年在钢厂小城里互相救赎、彼此成全的双向奔赴。', 'seed', 2),
    ('默读', 'missevan', 'audio_drama', '杨天翔（费渡）× 刘琮（骆闻舟）', 'Priest', '刑侦悬疑：在连环命案背后，费渡与骆闻舟联手剥开层层黑暗真相。', 'seed', 3),
    ('杀破狼', 'missevan', 'audio_drama', '阿杰（顾昀）× 杨天翔（长庚）', 'Priest', '权谋机甲：乱世大梁，长庚与顾昀权谋相携、共守家国。', 'seed', 4),
    ('天官赐福', 'missevan', 'audio_drama', '苏尚卿（谢怜）× 陈张太康（花城）', '墨香铜臭', '玄幻：仙乐太子谢怜三次飞升，与绝境鬼王花城相遇相守。', 'seed', 5),
    ('将进酒', 'missevan', 'audio_drama', '姜广涛（沈兰舟）× 袁铭喆（萧驰野）', '唐酒卿', '古风权谋：乱世争霸，中博王萧驰野与沈兰舟结盟问鼎天下。', 'seed', 6),
    ('针锋对决', 'missevan', 'audio_drama', '绿竹（顾青裴）× 逆鳞无伤（原炀）', '水千丞', '现代：高冷总裁与兵痞少爷明争暗斗、针锋相对的相爱相杀。', 'seed', 7),
    ('小蘑菇', 'missevan', 'audio_drama', '孙路路（安折）× 阿杰（陆沨）', '一十四洲', '末世科幻：地磁消失、异种入侵，小蘑菇安折与审判官陆沨的末世之恋。', 'seed', 8),
    ('吞海', 'missevan', 'audio_drama', '郑希（步重华）× 陈张太康（吴雩）', '淮上', '缉毒刑侦：跨国贩毒暗网大案，步重华与吴雩在黑暗中彼此救赎。', 'seed', 9),
    ('二哈和他的白猫师尊', 'missevan', 'audio_drama', '商桐（墨燃）× 卡修（楚晚宁）', '肉包不吃肉', '仙侠：墨燃重生悔悟，救赎如白猫般的师尊楚晚宁。', 'seed', 10),
    ('奇洛李维斯回信', 'missevan', 'audio_drama', '陈张太康（赵声阁）× 郑希（陈挽）', '清明谷雨', '现代暗恋：暗恋与回应的双向奔赴。', 'seed', 11),
    ('偷偷藏不住', 'missevan', 'audio_drama', '浮梦若薇（桑稚）× 轩ZONE（段嘉许）', '竹已', '现代言情：她是段嘉许无法言说的心事，也是他珍藏的宝藏。', 'seed', 12),

    -- 猫耳-有声剧
    ('三体（全六季）', 'missevan', 'audiobook', '729声工场制作', '刘慈欣', '科幻史诗：地球文明与三体文明跨越星海的对抗与黑暗森林法则。', 'seed', 1),
    ('鬼吹灯系列', 'missevan', 'audiobook', '青雪演播', '天下霸唱', '悬疑盗墓：摸金校尉深入古墓、机关暗器与奇闻异事的惊险旅程。', 'seed', 2),
    ('二哈和他的白猫师尊（有声剧）', 'missevan', 'audiobook', '谷江山（墨燃）× 三石（楚晚宁）', '肉包不吃肉', '仙侠：师徒之间跨越前世的救赎与守护。', 'seed', 3),
    ('门生故旧', 'missevan', 'audiobook', '陈张太康等', '', '现代情感悬疑：沈衍名与季誉之间纠缠多年的过往与秘密。', 'seed', 4),
    ('初三的六一儿童节', 'missevan', 'audiobook', '蛇蝎点点', '', '热血救赎：热血、精英、强强碰撞的群像故事。', 'seed', 5),
    ('理想型', 'missevan', 'audiobook', '苏尚卿、凌飞等', 'Snoofy', '现代恋爱：关于理想型与现实的心动日常。', 'seed', 6),
    ('日出风来', 'missevan', 'audiobook', '云惟一（沈风来）× 马正阳（林出）', '春日夏禾', '现代：逐光而行的双向奔赴。', 'seed', 7),
    ('尾钩', 'missevan', 'audiobook', '左岸', '', '现代：猫耳FM、野声文化联合出品的付费有声剧。', 'seed', 8),
    ('不良执念清除师', 'missevan', 'audiobook', '蒲一永主役', '', '现代灵异治愈：能看见执念的少年替人解开心结的故事。', 'seed', 9),

    -- 漫播-广播剧
    ('人鱼陷落', 'manbo', 'audio_drama', '张福正（白楚年）× 马正阳（兰波）', '麟潜', 'ABO末世：变异生物横行的末世，白楚年与最强人鱼兰波相爱相杀、彼此守护。', 'seed', 1),
    ('靡言', 'manbo', 'audio_drama', '文森（摩川）× 金弦（柏胤）', '回南雀', '民俗都市：清冷神性的摩川与珠宝设计师柏胤的宿命纠葛。', 'seed', 2),
    ('皇恩浩荡', 'manbo', 'audio_drama', '史泽鲲（贺怀翎）× 刘思岑（祝云璟）', '白芥子', '古风甜宠：淮安侯世子与皇太子之间宠溺与守护的日常。', 'seed', 3),
    ('江山许你', 'manbo', 'audio_drama', '赵毅（梁祯）× 羊仔（祝云瑄）', '', '古风权谋：漫播人气会员剧。', 'seed', 4),
    ('星期天的病人', 'manbo', 'audio_drama', '文森 × 刘思岑', '', '现代：少年音与美人音碰撞的禁忌心动。', 'seed', 5),
    ('Endless Echoes（欲言难止）', 'manbo', 'audio_drama', '史泽鲲（陆赫扬）× 胡良伟（许则）', '麦香鸡呢', '双A暗恋、破镜重圆。', 'seed', 6),
    ('这位alpha身残志坚', 'manbo', 'audio_drama', '三碗过岗', '', 'ABO末世：第一军团少将白历的身残志坚传奇。', 'seed', 7),
    ('安慰剂效应', 'manbo', 'audio_drama', '咸鱼定理', '', '漫播与729声工场联合出品，现代。', 'seed', 8),
    ('提灯映桃花', 'manbo', 'audio_drama', '', '淮上', '神魔：上古战场，凤凰明王与大魔之恋。', 'seed', 9),
    ('大珰', 'manbo', 'audio_drama', '', '童子', '古风权谋：宦官群像与庙堂风云。', 'seed', 10),
    ('壹号身份管理局', 'manbo', 'audio_drama', '', '', '科幻单元剧：共19集包含7个单元短剧，漫播会员剧。', 'seed', 11),
    ('相欺', 'manbo', 'audio_drama', '', '', '现代情感：漫播独家播出。', 'seed', 12),

    -- 漫播-有声剧
    ('囚于永夜', 'manbo', 'audiobook', '张福正（顾昀迟）× 孙路路（温然）', '麦香鸡呢', 'ABO先婚后爱：温然被植入腺体后与高匹配度Alpha顾昀迟的双向救赎。', 'seed', 1),
    ('小潭山没有天文台', 'manbo', 'audiobook', '史泽鲲（谭又明）× 徐宇隆（沈宗年）', '', '现代：爱里长大的小太阳与阴郁腹黑少年的暗恋守候。', 'seed', 2),
    ('欲言难止（有声剧）', 'manbo', 'audiobook', '顺子 × 倒霉死勒', '麦香鸡呢', '双A酸涩暗恋、破镜重圆。', 'seed', 3),
    ('奇洛李维斯回信（有声剧）', 'manbo', 'audiobook', '徐宇隆（沈宗年）× 史泽鲲（谭又明）', '清明谷雨', '现代暗恋：与《小潭山没有天文台》同世界观的追爱故事。', 'seed', 4),
    ('丙丁神通（有声剧）', 'manbo', 'audiobook', '史泽鲲 × 孙路路', '', '漫播出品。', 'seed', 5),
    ('区区（有声剧）', 'manbo', 'audiobook', '孙睿扬 × 袁铭喆', '', '漫播出品。', 'seed', 6),
    ('忏悔地（有声剧）', 'manbo', 'audiobook', '袁铭喆 × 顺子', '', '漫播出品，共73集。', 'seed', 7),
    ('少爷归家（广播短剧）', 'manbo', 'audiobook', '', '', '漫播出品。', 'seed', 8),
    ('二哈和他的白猫师尊（漫播有声剧）', 'manbo', 'audiobook', '谷江山（墨燃）× 三石（楚晚宁）', '肉包不吃肉', '仙侠：猫耳、漫播均有上架。', 'seed', 9);
  END IF;
END $$;
