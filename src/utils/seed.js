// 演示数据：取自设计示例（知知的「日本 · 关西之旅」、圣托里尼 / 冰岛 / 巴厘岛 / 秘鲁回忆等）。
// 仅在首次打开（本地无数据）时写入一次，可在「设置」里清空或重新导入。
import { placeholderImage } from './placeholder'
import { buildPresetDestinations } from '../data/attractions'

// 静态资源路径：自动适配部署子路径（GitHub Pages 项目页部署在 /仓库名/ 下）
const asset = (p) => import.meta.env.BASE_URL + p

// 关西行程的 7 天日期
const K = ['2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10', '2026-10-11']

export function buildSeedData() {
  const trips = [
    {
      id: 'trip-kansai',
      name: '日本 · 关西之旅',
      startDate: K[0],
      endDate: K[6],
      destinations: ['大阪', '京都', '奈良', '神户'],
      budget: 12000,
      coverImage: asset('demo/hero.jpg'),
      status: 'planned',
      notes: '第一次去关西：清水寺、伏见稻荷、奈良小鹿一个都不能少。提前买好 ICOCA 卡和关西周游券。',
      createdAt: '2026-08-01T08:00:00.000Z',
    },
    {
      id: 'trip-yunnan',
      name: '云南 · 大理丽江',
      startDate: '2026-05-01',
      endDate: '2026-05-06',
      destinations: ['大理', '丽江'],
      budget: 8000,
      coverImage: placeholderImage('mountain', '大理', 'green'),
      status: 'done',
      notes: '苍山洱海，风花雪月。环海西路骑行是全程高光。',
      createdAt: '2026-03-10T08:00:00.000Z',
    },
    {
      id: 'trip-sanya',
      name: '三亚 · 椰风海韵',
      startDate: '2026-02-10',
      endDate: '2026-02-14',
      destinations: ['三亚'],
      budget: 9000,
      coverImage: placeholderImage('sea', '三亚', 'blue'),
      status: 'done',
      notes: '错峰过年，海水依旧温柔。',
      createdAt: '2026-01-05T08:00:00.000Z',
    },
    {
      id: 'trip-bali',
      name: '巴厘岛 · 乌布与海岸',
      startDate: '2025-07-10',
      endDate: '2025-07-16',
      destinations: ['巴厘岛', '乌鲁瓦图'],
      budget: 15000,
      coverImage: asset('demo/m4.jpg'),
      status: 'done',
      notes: '乌布梯田 + 悬崖日落，SPA 值得每天一次。',
      createdAt: '2025-05-20T08:00:00.000Z',
    },
    {
      id: 'trip-santorini',
      name: '希腊 · 圣托里尼',
      startDate: '2024-09-01',
      endDate: '2024-09-08',
      destinations: ['圣托里尼', '雅典'],
      budget: 22000,
      coverImage: asset('demo/m2.jpg'),
      status: 'done',
      notes: '蓝顶教堂和爱琴海日落，照片拍一万张都不够。',
      createdAt: '2024-06-15T08:00:00.000Z',
    },
    {
      id: 'trip-iceland',
      name: '冰岛 · 极光追逐',
      startDate: '2024-01-26',
      endDate: '2024-02-02',
      destinations: ['雷克雅未克', '维克'],
      budget: 30000,
      coverImage: asset('demo/m3.jpg'),
      status: 'done',
      notes: '极光爆发的那晚，全车人都在尖叫。冰岛贵但值。',
      createdAt: '2023-11-01T08:00:00.000Z',
    },
    {
      id: 'trip-peru',
      name: '秘鲁 · 马丘比丘',
      startDate: '2023-11-08',
      endDate: '2023-11-16',
      destinations: ['库斯科', '马丘比丘'],
      budget: 35000,
      coverImage: asset('demo/m5.jpg'),
      status: 'done',
      notes: '印加古道徒步 4 天，此生难忘。',
      createdAt: '2023-08-22T08:00:00.000Z',
    },
  ]

  // ---- 日程（DayPlan）----
  const dayPlans = [
    // 关西 7 天
    ...K.map((date, i) => ({ id: `day-k${i + 1}`, tripId: 'trip-kansai', date, note: '' })),
    // 云南 3 天示例
    { id: 'day-y1', tripId: 'trip-yunnan', date: '2026-05-01', note: '' },
    { id: 'day-y2', tripId: 'trip-yunnan', date: '2026-05-02', note: '' },
    { id: 'day-y3', tripId: 'trip-yunnan', date: '2026-05-03', note: '' },
  ]

  // ---- 行程项（ItineraryItem）----
  const item = (id, dayPlanId, time, title, location, type, note, imageUrl, order) => ({
    id,
    dayPlanId,
    time,
    title,
    location,
    type,
    note,
    imageUrl,
    order,
  })
  const itineraryItems = [
    // D1 大阪
    item('it-k101', 'day-k1', '09:30', '抵达关西机场 → 酒店', '南海电车 · 难波', '交通', '提前在网上买好 ICOCA & HARUKA 套票', '', 0),
    item('it-k102', 'day-k1', '14:00', '大阪城公园', '大阪 · 中央区', '景点', '天守阁登顶看全景', asset('demo/spot1.jpg'), 1),
    item('it-k103', 'day-k1', '17:30', '心斋桥 & 道顿堀', '大阪 · 中央区', '购物', '格力高招牌打卡，蟹道乐要排队', asset('demo/spot2.jpg'), 2),
    item('it-k104', 'day-k1', '19:30', '梅田蓝天大厦夜景', '大阪 · 北区', '游玩', '空中庭园展望台看夜景', asset('demo/spot3.jpg'), 3),
    // D2 京都
    item('it-k201', 'day-k2', '08:30', '清水寺', '京都 · 东山区', '景点', '赶早人少，音羽瀑布许愿', asset('demo/m1.jpg'), 0),
    item('it-k202', 'day-k2', '11:00', '二年坂 · 三年坂漫步', '京都 · 东山区', '游玩', '和服体验店集中在这一带', '', 1),
    item('it-k203', 'day-k2', '14:00', '伏见稻荷大社', '京都 · 伏见区', '景点', '千本鸟居，爬到四辻即可', '', 2),
    item('it-k204', 'day-k2', '18:30', '先斗町晚餐', '京都 · 中京区', '美食', '试试汤豆腐和抹茶甜品', '', 3),
    // D3 奈良
    item('it-k301', 'day-k3', '09:00', '奈良公园喂小鹿', '奈良 · 奈良市', '游玩', '鹿仙贝 200 円一份，喂完举手示意', '', 0),
    item('it-k302', 'day-k3', '13:00', '东大寺', '奈良 · 奈良市', '景点', '大佛殿是世界最大木造建筑', '', 1),
    item('it-k303', 'day-k3', '16:00', '兴福寺 & 猿泽池', '奈良 · 奈良市', '景点', '', '', 2),
    // D4 神户
    item('it-k401', 'day-k4', '10:00', '北野异人馆', '神户 · 中央区', '景点', '风见鸡馆值得进去', '', 0),
    item('it-k402', 'day-k4', '12:30', '神户牛午餐', '神户 · 三宫', '美食', 'Mouriya 需要预约', '', 1),
    item('it-k403', 'day-k4', '18:00', '神户港夜景', '神户 · 中央区', '游玩', '摩天轮 + Marinoa 购物', '', 2),
    // D5 USJ
    item('it-k501', 'day-k5', '08:00', '环球影城 USJ 全天', '大阪 · 此花区', '游玩', '超级任天堂世界早起排队，快速通行券提前买', '', 0),
    // D6 岚山
    item('it-k601', 'day-k6', '09:30', '岚山竹林小径', '京都 · 右京区', '景点', '从 JR 嵯峨岚山站步行 10 分钟', '', 0),
    item('it-k602', 'day-k6', '11:00', '天龙寺', '京都 · 右京区', '景点', '曹源池庭园是精华', '', 1),
    item('it-k603', 'day-k6', '15:00', '岚电 & 渡月桥', '京都 · 右京区', '交通', '复古岚电回市区', '', 2),
    // D7 返程
    item('it-k701', 'day-k7', '10:00', '临空奥特莱斯', '大阪 · 泉佐野市', '购物', '行李可以先寄存机场', '', 0),
    item('it-k702', 'day-k7', '16:30', '关西机场返程', '大阪', '交通', '预留 3 小时办理退税和登机', '', 1),
    // 云南 3 天
    item('it-y101', 'day-y1', '12:00', '大理古城慢逛', '大理 · 古城', '游玩', '人民路的小店和洱海门', placeholderImage('city', '大理古城', 'gold'), 0),
    item('it-y102', 'day-y1', '18:00', '古城墙看日落', '大理 · 古城', '景点', '', '', 1),
    item('it-y201', 'day-y2', '09:30', '环海西路骑行', '大理 · 洱海', '游玩', '租电动车，喜洲镇吃破酥粑粑', placeholderImage('sea', '洱海', 'blue'), 0),
    item('it-y202', 'day-y2', '15:00', '喜洲古镇', '大理 · 喜洲', '景点', '稻田拍照绝佳', '', 1),
    item('it-y301', 'day-y3', '10:00', '丽江古城 & 狮子山', '丽江 · 古城', '游玩', '万古楼俯瞰全城', placeholderImage('mountain', '丽江', 'purple'), 0),
  ]

  // ---- 花费（Expense）----
  const exp = (id, tripId, category, amount, date, note) => ({ id, tripId, category, amount, date, note })
  const expenses = [
    // 关西（预付）
    exp('ex-k1', 'trip-kansai', '交通', 4800, '2026-08-02', '往返机票（含税）'),
    exp('ex-k2', 'trip-kansai', '住宿', 2600, '2026-08-02', '大阪酒店 2 晚预付'),
    // 云南
    exp('ex-y1', 'trip-yunnan', '交通', 1800, '2026-04-12', '往返机票'),
    exp('ex-y2', 'trip-yunnan', '住宿', 2400, '2026-05-01', '古城民宿 4 晚'),
    exp('ex-y3', 'trip-yunnan', '交通', 400, '2026-05-02', '电动车租赁 2 天'),
    exp('ex-y4', 'trip-yunnan', '餐饮', 1500, '2026-05-04', '全程餐饮'),
    exp('ex-y5', 'trip-yunnan', '景点', 800, '2026-05-05', '苍山索道 + 玉龙雪山'),
    exp('ex-y6', 'trip-yunnan', '购物', 700, '2026-05-06', '鲜花饼 & 手信'),
    // 三亚
    exp('ex-s1', 'trip-sanya', '交通', 2600, '2026-02-10', '往返机票'),
    exp('ex-s2', 'trip-sanya', '住宿', 3200, '2026-02-10', '亚龙湾酒店 4 晚'),
    exp('ex-s3', 'trip-sanya', '餐饮', 1400, '2026-02-12', '海鲜加工 & 餐饮'),
    exp('ex-s4', 'trip-sanya', '景点', 600, '2026-02-13', '蜈支洲岛门票'),
    exp('ex-s5', 'trip-sanya', '购物', 400, '2026-02-14', '免税店小件'),
    // 巴厘岛
    exp('ex-b1', 'trip-bali', '交通', 6500, '2025-06-10', '往返机票'),
    exp('ex-b2', 'trip-bali', '住宿', 3800, '2025-07-10', '乌布别墅 + 海边酒店'),
    exp('ex-b3', 'trip-bali', '餐饮', 1800, '2025-07-12', '脏鸭餐 & 金巴兰海鲜'),
    exp('ex-b4', 'trip-bali', '景点', 900, '2025-07-14', '圣泉寺 + 情人节悬崖'),
    exp('ex-b5', 'trip-bali', '购物', 800, '2025-07-16', '精油 & 手工艺品'),
    // 圣托里尼
    exp('ex-t1', 'trip-santorini', '交通', 12800, '2024-07-01', '国际段 + 圣托里尼机票'),
    exp('ex-t2', 'trip-santorini', '住宿', 5600, '2024-09-01', '悬崖酒店 5 晚'),
    exp('ex-t3', 'trip-santorini', '餐饮', 1600, '2024-09-03', '海鲜 & 酒庄'),
    exp('ex-t4', 'trip-santorini', '景点', 600, '2024-09-05', '火山岛游船'),
    exp('ex-t5', 'trip-santorini', '购物', 400, '2024-09-07', '橄榄油制品'),
    // 冰岛（超支示例）
    exp('ex-i1', 'trip-iceland', '交通', 16800, '2023-12-01', '往返机票 + 租车 7 天'),
    exp('ex-i2', 'trip-iceland', '住宿', 9200, '2024-01-26', '沿途 Guesthouse 7 晚'),
    exp('ex-i3', 'trip-iceland', '餐饮', 3200, '2024-01-28', '冰岛物价感人'),
    exp('ex-i4', 'trip-iceland', '景点', 1500, '2024-01-30', '冰川徒步 + 蓝湖温泉'),
    exp('ex-i5', 'trip-iceland', '购物', 800, '2024-02-01', '羊毛围巾'),
    // 秘鲁
    exp('ex-p1', 'trip-peru', '交通', 21000, '2023-09-01', '国际段机票 + 印加古道许可'),
    exp('ex-p2', 'trip-peru', '住宿', 7400, '2023-11-08', '库斯科 & 温泉镇酒店'),
    exp('ex-p3', 'trip-peru', '餐饮', 2600, '2023-11-12', '含徒步团餐'),
    exp('ex-p4', 'trip-peru', '景点', 1800, '2023-11-10', '马丘比丘门票 + 导览'),
    exp('ex-p5', 'trip-peru', '购物', 400, '2023-11-15', '羊驼毛织物'),
  ]

  // ---- 目的地库 ----
  const destinations = [
    { id: 'dest-kyoto', name: '京都', country: '日本', city: '京都', status: 'visited', bestSeason: '3-5月 / 10-11月', rating: 5, imageUrl: asset('demo/m1.jpg'), note: '还想再去的地方，秋天看红叶。', createdAt: '2025-02-01T08:00:00.000Z' },
    { id: 'dest-osaka', name: '大阪', country: '日本', city: '大阪', status: 'visited', bestSeason: '3-5月 / 10-11月', rating: 4, imageUrl: asset('demo/spot2.jpg'), note: '吃喝购物的快乐老家。', createdAt: '2025-02-01T08:00:00.000Z' },
    { id: 'dest-nara', name: '奈良', country: '日本', city: '奈良', status: 'visited', bestSeason: '4月 / 11月', rating: 4, imageUrl: placeholderImage('temple', '奈良', 'green'), note: '小鹿会鞠躬，也会抢鹿仙贝。', createdAt: '2025-02-01T08:00:00.000Z' },
    { id: 'dest-dali', name: '大理', country: '中国', city: '大理', status: 'visited', bestSeason: '3-5月', rating: 5, imageUrl: placeholderImage('mountain', '大理', 'green'), note: '环海西路骑行，风超舒服。', createdAt: '2026-05-10T08:00:00.000Z' },
    { id: 'dest-lijiang', name: '丽江', country: '中国', city: '丽江', status: 'visited', bestSeason: '4-5月 / 9-10月', rating: 4, imageUrl: placeholderImage('mountain', '丽江', 'purple'), note: '古城商业化了些，狮子山日落值回票价。', createdAt: '2026-05-10T08:00:00.000Z' },
    { id: 'dest-sanya', name: '三亚', country: '中国', city: '三亚', status: 'visited', bestSeason: '10-3月', rating: 4, imageUrl: placeholderImage('sea', '三亚', 'blue'), note: '国内海岛的舒适区。', createdAt: '2026-02-20T08:00:00.000Z' },
    { id: 'dest-bali', name: '巴厘岛', country: '印度尼西亚', city: '巴厘岛', status: 'visited', bestSeason: '4-10月', rating: 4, imageUrl: asset('demo/m4.jpg'), note: '乌布和海岸完全两种玩法。', createdAt: '2025-08-01T08:00:00.000Z' },
    { id: 'dest-santorini', name: '圣托里尼', country: '希腊', city: '圣托里尼', status: 'visited', bestSeason: '6-9月', rating: 5, imageUrl: asset('demo/m2.jpg'), note: '伊亚落日，全世界最好的谢幕。', createdAt: '2024-09-15T08:00:00.000Z' },
    { id: 'dest-reykjavik', name: '雷克雅未克', country: '冰岛', city: '雷克雅未克', status: 'visited', bestSeason: '11-3月（极光）', rating: 5, imageUrl: asset('demo/m3.jpg'), note: '极光、冰川、黑沙滩，外星地貌。', createdAt: '2024-02-10T08:00:00.000Z' },
    { id: 'dest-cusco', name: '库斯科', country: '秘鲁', city: '库斯科', status: 'visited', bestSeason: '5-9月', rating: 4, imageUrl: asset('demo/m5.jpg'), note: '印加文明的入口，海拔 3400m。', createdAt: '2023-11-20T08:00:00.000Z' },
    { id: 'dest-tokyo', name: '东京', country: '日本', city: '东京', status: 'want', bestSeason: '3-4月 / 11月', rating: 0, imageUrl: placeholderImage('city', '东京', 'blue'), note: '想看目黑川夜樱。', createdAt: '2026-08-01T08:00:00.000Z' },
    { id: 'dest-dunhuang', name: '敦煌', country: '中国', city: '敦煌', status: 'want', bestSeason: '5-6月 / 9-10月', rating: 0, imageUrl: placeholderImage('desert', '敦煌', 'gold'), note: '莫高窟 A 类票要提前 30 天抢。', createdAt: '2026-08-01T08:00:00.000Z' },
    { id: 'dest-daocheng', name: '稻城亚丁', country: '中国', city: '稻城', status: 'want', bestSeason: '9-10月', rating: 0, imageUrl: placeholderImage('mountain', '稻城亚丁', 'green'), note: '牛奶海徒步需要一整天，量力而行。', createdAt: '2026-08-01T08:00:00.000Z' },
    { id: 'dest-yili', name: '伊犁', country: '中国', city: '伊犁', status: 'want', bestSeason: '6-8月', rating: 0, imageUrl: placeholderImage('mountain', '伊犁', 'purple'), note: '薰衣草和草原，6 月中最佳。', createdAt: '2026-08-01T08:00:00.000Z' },
  ]

  // ---- 行李清单：模板 + 关西行程清单 ----
  const packTemplates = [
    { id: 'tpl-general', name: '通用旅行', createdAt: '2026-01-01T08:00:00.000Z' },
    { id: 'tpl-beach', name: '海岛游', createdAt: '2026-01-01T08:00:00.000Z' },
  ]
  const tplItem = (id, templateId, name) => ({ id, templateId, tripId: null, name, checked: false })
  const tripPackItem = (id, name, checked) => ({ id, templateId: null, tripId: 'trip-kansai', name, checked })
  const packItems = [
    tplItem('pi-01', 'tpl-general', '护照 / 身份证'),
    tplItem('pi-02', 'tpl-general', '机票 / 车票行程单'),
    tplItem('pi-03', 'tpl-general', '充电器 & 充电宝'),
    tplItem('pi-04', 'tpl-general', '转换插头'),
    tplItem('pi-05', 'tpl-general', '相机 & 存储卡'),
    tplItem('pi-06', 'tpl-general', '常用药品'),
    tplItem('pi-07', 'tpl-general', '换洗衣物'),
    tplItem('pi-08', 'tpl-general', '洗漱包'),
    tplItem('pi-09', 'tpl-general', '雨伞'),
    tplItem('pi-10', 'tpl-general', '现金 & 银行卡'),
    tplItem('pi-21', 'tpl-beach', '防晒霜 SPF50+'),
    tplItem('pi-22', 'tpl-beach', '泳衣 & 沙滩裤'),
    tplItem('pi-23', 'tpl-beach', '墨镜 & 遮阳帽'),
    tplItem('pi-24', 'tpl-beach', '浮潜三宝'),
    tplItem('pi-25', 'tpl-beach', '驱蚊液'),
    tplItem('pi-26', 'tpl-beach', '晒后修复啫喱'),
    // 关西已应用的清单（7/11）
    tripPackItem('pk-01', '护照 / 身份证', true),
    tripPackItem('pk-02', '机票 / 车票行程单', true),
    tripPackItem('pk-03', '充电器 & 充电宝', true),
    tripPackItem('pk-04', '转换插头', false),
    tripPackItem('pk-05', '相机 & 存储卡', true),
    tripPackItem('pk-06', '常用药品', true),
    tripPackItem('pk-07', '换洗衣物', true),
    tripPackItem('pk-08', '现金 & 银行卡', true),
    tripPackItem('pk-09', '雨伞', false),
    tripPackItem('pk-10', 'ICOCA 交通卡', false),
    tripPackItem('pk-11', '关西周游券', false),
  ]

  // ---- 旅行回忆（照片墙）----
  const memories = [
    { id: 'mem-y1', tripId: 'trip-yunnan', imageUrl: placeholderImage('sea', '洱海日落', 'blue'), caption: '洱海 · 日落骑行', date: '2026-05-02' },
    { id: 'mem-y2', tripId: 'trip-yunnan', imageUrl: placeholderImage('city', '大理古城', 'gold'), caption: '大理古城的黄昏', date: '2026-05-01' },
    { id: 'mem-y3', tripId: 'trip-yunnan', imageUrl: placeholderImage('mountain', '苍山远眺', 'green'), caption: '苍山 · 云弄峰', date: '2026-05-03' },
    { id: 'mem-s1', tripId: 'trip-sanya', imageUrl: placeholderImage('sea', '亚龙湾', 'green'), caption: '亚龙湾 · 椰林风', date: '2026-02-12' },
    { id: 'mem-b1', tripId: 'trip-bali', imageUrl: asset('demo/m4.jpg'), caption: '乌鲁瓦图 · 悬崖日落', date: '2025-07-12' },
    { id: 'mem-b2', tripId: 'trip-bali', imageUrl: placeholderImage('sea', '金巴兰海滩', 'orange'), caption: '金巴兰 · 海鲜烧烤', date: '2025-07-14' },
    { id: 'mem-t1', tripId: 'trip-santorini', imageUrl: asset('demo/m2.jpg'), caption: '伊亚小镇 · 爱琴海日落', date: '2024-09-03' },
    { id: 'mem-t2', tripId: 'trip-santorini', imageUrl: placeholderImage('city', '费拉小镇', 'blue'), caption: '费拉 · 蓝顶教堂', date: '2024-09-02' },
    { id: 'mem-t3', tripId: 'trip-santorini', imageUrl: placeholderImage('sea', '火山岛游船', 'gold'), caption: '出海 · 火山岛', date: '2024-09-05' },
    { id: 'mem-i1', tripId: 'trip-iceland', imageUrl: asset('demo/m3.jpg'), caption: '极光之夜', date: '2024-01-28' },
    { id: 'mem-i2', tripId: 'trip-iceland', imageUrl: placeholderImage('aurora', '黑沙滩', 'purple'), caption: '维克 · 黑沙滩', date: '2024-01-30' },
    { id: 'mem-p1', tripId: 'trip-peru', imageUrl: asset('demo/m5.jpg'), caption: '马丘比丘 · 晨雾', date: '2023-11-10' },
    { id: 'mem-p2', tripId: 'trip-peru', imageUrl: placeholderImage('mountain', '印加古道', 'gold'), caption: '印加古道 · 徒第三天', date: '2023-11-11' },
  ]

  // ---- 愿望清单 ----
  const wishlist = [
    { id: 'wish-1', name: '新西兰 · 皇后镇', location: '新西兰', bestSeason: '9-11月', status: 'want', imageUrl: placeholderImage('mountain', '皇后镇', 'blue'), note: '跳伞和瓦卡蒂普湖。', createdAt: '2026-01-01T08:00:00.000Z' },
    { id: 'wish-2', name: '瑞士 · 因特拉肯', location: '瑞士', bestSeason: '6-8月', status: 'want', imageUrl: placeholderImage('mountain', '因特拉肯', 'green'), note: '少女峰门票太贵，先攒钱。', createdAt: '2026-01-01T08:00:00.000Z' },
    { id: 'wish-3', name: '摩洛哥 · 马拉喀什', location: '摩洛哥', bestSeason: '3-5月', status: 'want', imageUrl: placeholderImage('desert', '马拉喀什', 'orange'), note: '撒哈拉三日团要认真挑。', createdAt: '2026-01-01T08:00:00.000Z' },
    { id: 'wish-4', name: '坦桑尼亚 · 塞伦盖蒂', location: '坦桑尼亚', bestSeason: '6-10月', status: 'want', imageUrl: placeholderImage('desert', '塞伦盖蒂', 'gold'), note: '动物大迁徙，人生清单 TOP1。', createdAt: '2026-01-01T08:00:00.000Z' },
    { id: 'wish-5', name: '新疆 · 伊犁环线', location: '中国', bestSeason: '6-8月', status: 'want', imageUrl: placeholderImage('mountain', '伊犁', 'purple'), note: '和目的地库的「伊犁」同一个梦。', createdAt: '2026-01-01T08:00:00.000Z' },
    { id: 'wish-6', name: '马尔代夫 · 一岛一酒店', location: '马尔代夫', bestSeason: '11-4月', status: 'dropped', imageUrl: placeholderImage('sea', '马尔代夫', 'blue'), note: '人多且贵，暂且放弃。', createdAt: '2026-01-01T08:00:00.000Z' },
  ]

  const settings = {
    nickname: '知知',
    tag: '旅行探索者',
    avatar: asset('demo/avatar.jpg'),
    bio: '生活不止眼前的苟且，还有诗和远方的田野。',
  }

  // 追加国内热门/网红/4A-5A 景区预设（按名称去重，演示数据优先）
  const haveNames = new Set(destinations.map((d) => d.name))
  destinations.push(...buildPresetDestinations().filter((p) => !haveNames.has(p.name)))

  return { trips, dayPlans, itineraryItems, destinations, expenses, packTemplates, packItems, memories, wishlist, settings }
}
