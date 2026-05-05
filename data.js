// ── 23区リスト ──────────────────────────────────────────────
const WARDS = [
  { id: 'chiyoda',    name: '千代田区' },
  { id: 'chuo',       name: '中央区' },
  { id: 'minato',     name: '港区' },
  { id: 'shinjuku',   name: '新宿区' },
  { id: 'bunkyo',     name: '文京区' },
  { id: 'taito',      name: '台東区' },
  { id: 'sumida',     name: '墨田区' },
  { id: 'koto',       name: '江東区' },
  { id: 'shinagawa',  name: '品川区' },
  { id: 'meguro',     name: '目黒区' },
  { id: 'ota',        name: '大田区' },
  { id: 'setagaya',   name: '世田谷区' },
  { id: 'shibuya',    name: '渋谷区' },
  { id: 'nakano',     name: '中野区' },
  { id: 'suginami',   name: '杉並区' },
  { id: 'toshima',    name: '豊島区' },
  { id: 'kita',       name: '北区' },
  { id: 'arakawa',    name: '荒川区' },
  { id: 'itabashi',   name: '板橋区' },
  { id: 'nerima',     name: '練馬区' },
  { id: 'adachi',     name: '足立区' },
  { id: 'katsushika', name: '葛飾区' },
  { id: 'edogawa',    name: '江戸川区' },
];

// ── ロードマップ（国・東京都共通の手続き・給付金）─────────────
const PHASES = [
  {
    id: 'early',
    name: '妊娠初期',
    period: '〜15週',
    icon: '🌱',
    color: '#86efac',
    activeText: '#166534',
    lightColor: '#f0fdf4',
    todos: [
      {
        title: '妊婦健康診査受診票を受け取る（14回分）',
        where: '母子手帳交付時',
        deadline: '母子手帳受け取り時',
        url: 'https://www.mhlw.go.jp/stf/newpage_26234.html',
      },
    ],
    benefits: [
      {
        name: '妊婦支援給付金',
        amount: 50000,
        tag: '現金',
        note: '妊娠届出後の面接後に受給（国の制度・全区共通）',
        url: 'https://www.mhlw.go.jp/stf/newpage_29529.html',
      },
      {
        name: 'マタニティパス',
        amount: 6000,
        tag: 'ICカード',
        note: '東京都・交通系ICカードへのチャージ（23区共通）',
        url: 'https://www.metro.tokyo.lg.jp/',
      },
      {
        name: '妊婦健診費用補助',
        amount: null,
        tag: '補助',
        note: '14回分の受診票。費用の一部を区が負担（全区共通）',
        url: 'https://www.mhlw.go.jp/stf/newpage_26234.html',
      },
    ],
    cashTotal: 56000,
  },
  {
    id: 'mid',
    name: '妊娠中期',
    period: '16〜27週',
    icon: '🌸',
    color: '#f9a8d4',
    activeText: '#831843',
    lightColor: '#fdf2f8',
    todos: [
      {
        title: '出産育児一時金の申請方式を産院に確認',
        where: '出産予定の医療機関',
        deadline: '早めに確認',
        url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kodomo/kodomo_kosodate/boshi-hoken/sanka-ichiji.html',
      },
      {
        title: '職場へ産休・育休の意向を伝える',
        where: '勤務先',
        deadline: '遅くとも28週頃まで',
        url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000130583.html',
      },
      {
        title: '妊婦健診を継続受診',
        where: '産院',
        deadline: '定期的に',
        url: null,
      },
    ],
    benefits: [
      {
        name: '妊婦健診費用補助（継続）',
        amount: null,
        tag: '補助',
        note: '引き続き受診票を使用（全区共通）',
        url: 'https://www.mhlw.go.jp/stf/newpage_26234.html',
      },
    ],
    cashTotal: 0,
  },
  {
    id: 'late',
    name: '妊娠後期',
    period: '28〜36週',
    icon: '🤰',
    color: '#c4b5fd',
    activeText: '#4c1d95',
    lightColor: '#f5f3ff',
    todos: [
      {
        title: '産休を開始（産前6週前〜任意）',
        where: '勤務先',
        deadline: '出産予定日の42日前〜',
        url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000130583.html',
      },
      {
        title: '育児休業を申請（勤務先）',
        where: '勤務先',
        deadline: '育休開始1ヶ月前まで',
        url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000130583.html',
      },
      {
        title: '出産手当金の申請準備（会社員）',
        where: '勤務先の健康保険組合',
        deadline: '産後に申請',
        url: 'https://www.mhlw.go.jp/bunya/iryouhoken/iryouhoken13/index.html',
      },
    ],
    benefits: [],
    cashTotal: 0,
  },
  {
    id: 'birth',
    name: '出産',
    period: '37週〜',
    icon: '👶',
    color: '#fde68a',
    activeText: '#78350f',
    lightColor: '#fffbeb',
    todos: [
      {
        title: '出産育児一時金を申請（直接支払制度以外の場合）',
        where: '健康保険窓口 or 区役所（国保）',
        deadline: '出産から2年以内',
        url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kodomo/kodomo_kosodate/boshi-hoken/sanka-ichiji.html',
      },
      {
        title: '高額療養費を申請（帝王切開等）',
        where: '健康保険窓口 or 区役所（国保）',
        deadline: '診療翌月〜2年以内',
        url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryouhoken/juuyou/kougakuiryou/index.html',
      },
    ],
    benefits: [
      {
        name: '出産育児一時金',
        amount: 500000,
        tag: '現金',
        note: '国の制度。直接支払制度で医療機関へ直接支給が一般的',
        url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kodomo/kodomo_kosodate/boshi-hoken/sanka-ichiji.html',
      },
      {
        name: '高額療養費',
        amount: null,
        tag: '還付',
        note: '帝王切開等の場合。所得に応じて自己負担上限あり',
        url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryouhoken/juuyou/kougakuiryou/index.html',
      },
    ],
    cashTotal: 500000,
  },
  {
    id: 'postnatal',
    name: '産後',
    period: '〜生後4ヶ月',
    icon: '🍼',
    color: '#6ee7b7',
    activeText: '#064e3b',
    lightColor: '#f0fdf4',
    todos: [
      {
        title: '赤ちゃんファースト（東京都）を申請',
        where: '専用ウェブサイト',
        deadline: '都の案内に従う',
        url: 'https://www.fukushi.metro.tokyo.lg.jp/kodomo/shussan/tokyo_shussankosodateouen',
      },
    ],
    benefits: [
      {
        name: '子育て応援ギフト',
        amount: 100000,
        tag: 'クーポン',
        note: '国の交付金事業。商品カタログから選択（全区共通）',
        url: 'https://www.cfa.go.jp/policies/shussan-kosodate/',
      },
      {
        name: '赤ちゃんファースト（東京都）',
        amount: 100000,
        tag: 'ポイント',
        note: '東京都独自。商品カタログから選択（23区共通）',
        url: 'https://www.fukushi.metro.tokyo.lg.jp/kodomo/shussan/tokyo_shussankosodateouen',
      },
    ],
    cashTotal: 200000,
  },
  {
    id: 'childcare',
    name: '育児期',
    period: '継続',
    icon: '👨‍👩‍👧',
    color: '#93c5fd',
    activeText: '#1e3a5f',
    lightColor: '#eff6ff',
    todos: [
      {
        title: '育児休業給付金を申請（会社員）',
        where: 'ハローワーク（勤務先が代行）',
        deadline: '育休開始後',
        url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000160564.html',
      },
      {
        title: '出産手当金を申請（会社員）',
        where: '勤務先の健康保険組合',
        deadline: '産後56日以降',
        url: 'https://www.mhlw.go.jp/bunya/iryouhoken/iryouhoken13/index.html',
      },
      {
        title: '医療費控除の確定申告',
        where: '税務署 / e-Tax',
        deadline: '翌年2〜3月',
        url: 'https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1120.htm',
      },
    ],
    benefits: [
      {
        name: '児童手当',
        amount: null,
        tag: '毎月',
        note: '3歳未満：月1.5万円 / 3歳以上：月1万円〜（国の制度）',
        url: 'https://www.cfa.go.jp/policies/jidoteate/',
      },
      {
        name: '育児休業給付金',
        amount: null,
        tag: '変動',
        note: '給与の67%（最初の180日）→50%（以降）。雇用保険から',
        url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000160564.html',
      },
      {
        name: '出産手当金',
        amount: null,
        tag: '変動',
        note: '産前42日〜産後56日。標準報酬日額の2/3',
        url: 'https://www.mhlw.go.jp/bunya/iryouhoken/iryouhoken13/index.html',
      },
    ],
    cashTotal: 0,
  },
];


// ── 区ごとの固有データ ──────────────────────────────────────
// todos[phaseId]: 区役所手続きなど区固有のやること（PHASES共通todoの前に表示）
// benefits[phaseId]: 区独自の給付金（PHASES共通給付金に追加表示）
// simBenefits: シミュレーターに加算する区独自給付金
const WARD_DATA = {
  katsushika: {
    todos: {
      early: [
        { title: '妊娠届を提出・母子手帳を受け取る', where: '区役所・区民事務所', deadline: 'なるべく早めに', url: 'https://www.city.katsushika.lg.jp/kenkou/1000050/1001803/1014924.html' },
        { title: 'ゆりかご面接を予約・受ける', where: '各健康センター', deadline: 'なるべく早めに', url: 'https://www.city.katsushika.lg.jp/kenkou/1000050/1001803/1014924.html' },
        { title: 'マタニティパスを申請（交通費6,000円分）', where: '母子手帳交付時に同時申請', deadline: '母子手帳受け取り時', url: 'https://www.city.katsushika.lg.jp/kenkou/1000050/1001803/1015907.html' },
      ],
      birth: [
        { title: '出生届を提出', where: '区役所・区民事務所', deadline: '出生から14日以内（必須）', url: 'https://www.city.katsushika.lg.jp/kurashi/1000049/1001693/' },
      ],
      postnatal: [
        { title: 'こんにちは赤ちゃん訪問を受ける', where: '自宅（訪問）', deadline: '生後4ヶ月まで', url: 'https://www.city.katsushika.lg.jp/kenkou/1000050/1001803/' },
        { title: '児童手当を申請', where: '区役所 子育て応援課 / マイナポータル', deadline: '出生月末まで', url: 'https://www.city.katsushika.lg.jp/kosodate/1000056/1002336/1002411.html' },
        { title: 'かつしか出産応援給付金を申請', where: '子育て応援課（児童手当と同時申請可）', deadline: '出生から1年以内', url: 'https://www.city.katsushika.lg.jp/kenkou/1000050/1001803/1031538.html' },
        { title: '子育て応援ギフトを申請', where: 'こんにちは赤ちゃん訪問後にオンライン申請', deadline: '生後4ヶ月まで', url: 'https://www.city.katsushika.lg.jp/kenkou/1000050/1001803/1030902.html' },
        { title: '産後ケアサービスを予約（希望時）', where: '青戸保健センター 03-3602-1284', deadline: '産後1年以内', url: 'https://www.city.katsushika.lg.jp/kenkou/1000050/1001803/1030308/1020863.html' },
      ],
      childcare: [
        { title: '保育園申込（希望時）', where: '区役所 保育課 03-5654-8278', deadline: '年度により異なる（要確認）', url: 'https://www.city.katsushika.lg.jp/kosodate/1000056/1002333/1036720.html' },
      ],
    },
    benefits: {
      early: [
        { name: '妊娠子育て応援券', amount: 10000, tag: 'クーポン', note: 'ゆりかご面接後に配布（葛飾区）', url: 'https://www.city.katsushika.lg.jp/kenkou/1000050/1001803/1030902.html' },
      ],
      postnatal: [
        { name: 'かつしか出産応援給付金', amount: 50000, tag: '現金', note: '葛飾区独自。児童1人あたり', url: 'https://www.city.katsushika.lg.jp/kenkou/1000050/1001803/1031538.html' },
        { name: '産後ケアサービス', amount: null, tag: 'サービス', note: '基本無料。宿泊最大7日、通所・訪問最大7回', url: 'https://www.city.katsushika.lg.jp/kenkou/1000050/1001803/1030308/1020863.html' },
      ],
    },
    simBenefits: [
      { name: '妊娠子育て応援券（葛飾区）', amount: 10000 },
      { name: 'かつしか出産応援給付金', amount: 50000 },
    ],
  },
  minato: {
    todos: {
      early: [
        { title: '妊娠届を提出・母子手帳を受け取る', where: '区役所・保健所', deadline: 'なるべく早めに', url: 'https://www.city.minato.tokyo.jp/chiikihoken/kenko/ninshin/ninshin/ninshin.html' },
        { title: 'マタニティパスを申請', where: '母子手帳交付時に申請', deadline: '母子手帳受け取り時', url: 'https://www.city.minato.tokyo.jp/chiikihoken/kenko/ninshin/ninshin/ninshin.html' },
      ],
      birth: [
        { title: '出生届を提出', where: '区役所', deadline: '出生から14日以内（必須）', url: 'https://www.city.minato.tokyo.jp/seikatsu/todoke/shusshou.html' },
      ],
      postnatal: [
        { title: '児童手当を申請', where: '区役所 子ども課', deadline: '出生月末まで', url: 'https://www.city.minato.tokyo.jp/jidoteate/index.html' },
        { title: '出産費用助成金を申請（港区独自）', where: '区役所 子ども家庭支援部', deadline: '出産後1年以内', url: 'https://www.city.minato.tokyo.jp/kodomokyufu/kenko/ninshin/shussan/jose.html' },
        { title: '子育て応援ギフトを申請', where: '訪問後にオンライン申請', deadline: '生後4ヶ月まで', url: 'https://www.city.minato.tokyo.jp/' },
      ],
    },
    benefits: {
      postnatal: [
        { name: '出産費用助成金（港区）', amount: 310000, tag: '現金', note: '港区独自。単胎31万円・双胎29万円/人', url: 'https://www.city.minato.tokyo.jp/kodomokyufu/kenko/ninshin/shussan/jose.html' },
      ],
    },
    simBenefits: [
      { name: '出産費用助成金（港区）', amount: 310000 },
    ],
  },
  setagaya: {
    todos: {
      early: [
        { title: '妊娠届を提出・母子手帳を受け取る', where: '区役所・出張所・保健センター', deadline: 'なるべく早めに', url: 'https://www.city.setagaya.lg.jp/02244/1185.html' },
        { title: 'マタニティパスを申請', where: '母子手帳交付時に申請', deadline: '母子手帳受け取り時', url: 'https://www.city.setagaya.lg.jp/02244/1185.html' },
      ],
      birth: [
        { title: '出生届を提出', where: '区役所', deadline: '出生から14日以内（必須）', url: 'https://www.city.setagaya.lg.jp/mokuji/kurashi/001/002/002/d00178484.html' },
      ],
      postnatal: [
        { title: '児童手当を申請', where: '区役所 子ども・若者部', deadline: '出生月末まで', url: 'https://www.city.setagaya.lg.jp/mokuji/kodomo/001/002/d00006232.html' },
        { title: '出産費助成を申請（世田谷区独自）', where: '各総合支所くみん窓口', deadline: '出産後1年以内', url: 'https://www.city.setagaya.lg.jp/02413/1206.html' },
      ],
    },
    benefits: {
      postnatal: [
        { name: '出産費助成（世田谷区）', amount: 50000, tag: '現金', note: '世田谷区独自。児童1人あたり5万円', url: 'https://www.city.setagaya.lg.jp/02413/1206.html' },
      ],
    },
    simBenefits: [
      { name: '出産費助成（世田谷区）', amount: 50000 },
    ],
  },
  adachi: {
    todos: {
      early: [
        { title: '妊娠届を提出・母子手帳を受け取る', where: '区役所・保健センター', deadline: 'なるべく早めに', url: 'https://www.city.adachi.tokyo.jp/hoken/k-kyoiku/kosodate/ninshin-shussho.html' },
        { title: 'マタニティパスを申請', where: '母子手帳交付時に申請', deadline: '母子手帳受け取り時', url: 'https://www.city.adachi.tokyo.jp/hoken/k-kyoiku/kosodate/ninshin-shussho.html' },
      ],
      birth: [
        { title: '出生届を提出', where: '区役所', deadline: '出生から14日以内（必須）', url: 'https://www.city.adachi.tokyo.jp/koseki/todoke/shussei.html' },
      ],
      postnatal: [
        { title: '児童手当を申請', where: '区役所 子ども支援課', deadline: '出生月末まで', url: 'https://www.city.adachi.tokyo.jp/jidoteate/index.html' },
        { title: '出産費助成を申請（足立区独自）', where: '区役所 子ども支援課', deadline: '出産後1年以内', url: 'https://www.city.adachi.tokyo.jp/oyako/k-kyoiku/kosodate/syussanhi-josei.html' },
      ],
    },
    benefits: {
      postnatal: [
        { name: '出産費助成（足立区）', amount: 100000, tag: '現金', note: '足立区独自。児童1人あたり10万円', url: 'https://www.city.adachi.tokyo.jp/oyako/k-kyoiku/kosodate/syussanhi-josei.html' },
      ],
    },
    simBenefits: [
      { name: '出産費助成（足立区）', amount: 100000 },
    ],
  },
  edogawa: {
    todos: {
      early: [
        { title: '妊娠届を提出・母子手帳を受け取る', where: '区役所・健康サポートセンター', deadline: 'なるべく早めに', url: 'https://www.city.edogawa.tokyo.jp/kosodate/ninshin/index.html' },
        { title: 'マタニティパスを申請', where: '母子手帳交付時に申請', deadline: '母子手帳受け取り時', url: 'https://www.city.edogawa.tokyo.jp/kosodate/ninshin/index.html' },
      ],
      birth: [
        { title: '出生届を提出', where: '区役所', deadline: '出生から14日以内（必須）', url: 'https://www.city.edogawa.tokyo.jp/e049/koseki/todoke/shussei.html' },
      ],
      postnatal: [
        { title: '児童手当を申請', where: '区役所 子育て支援課', deadline: '出生月末まで', url: 'https://www.city.edogawa.tokyo.jp/e049/kosodate/jidoteate/index.html' },
        { title: '乳児養育手当を申請（江戸川区独自）', where: '区役所 子育て支援課', deadline: '出生後すみやかに', url: 'https://www.city.edogawa.tokyo.jp/e049/kosodate/kosodate/teateshien/youiku.html' },
      ],
    },
    benefits: {
      early: [
        { name: 'ぴよママギフト（江戸川区）', amount: 10000, tag: 'クーポン', note: '妊娠届出後に配布（江戸川区）', url: 'https://www.city.edogawa.tokyo.jp/kosodate/ninshin/index.html' },
      ],
      postnatal: [
        { name: '乳児養育手当（江戸川区）', amount: 13000, tag: '毎月', note: '江戸川区独自。月13,000円×最大12ヶ月', url: 'https://www.city.edogawa.tokyo.jp/e049/kosodate/kosodate/teateshien/youiku.html' },
      ],
    },
    simBenefits: [
      { name: 'ぴよママギフト（江戸川区）', amount: 10000 },
      { name: '乳児養育手当（江戸川区・12ヶ月）', amount: 13000 * 12 },
    ],
  },
  nerima: {
    todos: {
      early: [
        { title: '妊娠届を提出・母子手帳を受け取る', where: '区役所・各総合相談窓口', deadline: 'なるべく早めに', url: 'https://www.city.nerima.tokyo.jp/hokenfukushi/hoken/sukoyaka/boshitecho.html' },
        { title: 'マタニティパスを申請', where: '母子手帳交付時に申請', deadline: '母子手帳受け取り時', url: 'https://www.city.nerima.tokyo.jp/hokenfukushi/hoken/sukoyaka/boshitecho.html' },
      ],
      birth: [
        { title: '出生届を提出', where: '区役所', deadline: '出生から14日以内（必須）', url: 'https://www.city.nerima.tokyo.jp/kurashi/todoke/shussei.html' },
      ],
      postnatal: [
        { title: '児童手当を申請', where: '区役所 子育て支援部', deadline: '出生月末まで', url: 'https://www.city.nerima.tokyo.jp/kosodate/teate/jidoteate/index.html' },
      ],
    },
    benefits: {
      postnatal: [
        { name: '産後ケア費用補助（練馬区）', amount: null, tag: 'サービス', note: 'ショートステイ¥7,000〜・デイケア¥1,500/日（練馬区）', url: 'https://www.city.nerima.tokyo.jp/hokenfukushi/hoken/sukoyaka/sango-keajigyou.html' },
      ],
    },
    simBenefits: [],
  },
  itabashi: {
    todos: {
      early: [
        { title: '妊娠届を提出・母子手帳を受け取る', where: '健康福祉センター', deadline: 'なるべく早めに', url: 'https://www.city.itabashi.tokyo.jp/kosodate/ninshin/ninshin/1004062.html' },
        { title: 'マタニティパスを申請', where: '母子手帳交付時に申請', deadline: '母子手帳受け取り時', url: 'https://www.city.itabashi.tokyo.jp/kosodate/ninshin/ninshin/1004062.html' },
      ],
      birth: [
        { title: '出生届を提出', where: '区役所', deadline: '出生から14日以内（必須）', url: 'https://www.city.itabashi.tokyo.jp/koseki/todokeide/1000877.html' },
      ],
      postnatal: [
        { title: '児童手当を申請', where: '区役所 子育て支援課', deadline: '出生月末まで', url: 'https://www.city.itabashi.tokyo.jp/kosodate/teate/jidoteate/index.html' },
      ],
    },
    benefits: {
      postnatal: [
        { name: '産後ドゥーラ支援（板橋区）', amount: null, tag: 'サービス', note: '¥500/時間〜（初回4時間）・上限30時間（板橋区）', url: 'https://www.city.itabashi.tokyo.jp/kosodate/ninshin/ninshin/1049534.html' },
      ],
    },
    simBenefits: [],
  },
  shinjuku: {
    todos: {
      early: [
        { title: '妊娠届を提出・母子手帳を受け取る', where: '区役所・保健センター', deadline: 'なるべく早めに', url: 'https://www.city.shinjuku.lg.jp/fukushi/file02_01_00001.html' },
        { title: 'マタニティパスを申請', where: '母子手帳交付時に申請', deadline: '母子手帳受け取り時', url: 'https://www.city.shinjuku.lg.jp/fukushi/file02_01_00001.html' },
      ],
      birth: [
        { title: '出生届を提出', where: '区役所', deadline: '出生から14日以内（必須）', url: 'https://www.city.shinjuku.lg.jp/seikatsu/shussei.html' },
      ],
      postnatal: [
        { title: '児童手当を申請', where: '区役所 子ども総合センター', deadline: '出生月末まで', url: 'https://www.city.shinjuku.lg.jp/kodomo/jidoteate_01.html' },
      ],
    },
    benefits: {},
    simBenefits: [],
  },
  ota: {
    todos: {
      early: [
        { title: '妊娠届を提出・母子手帳を受け取る', where: '区役所・特別出張所', deadline: 'なるべく早めに', url: 'https://www.city.ota.tokyo.jp/seikatsu/kodomo/shussan/ninsin.html' },
        { title: 'マタニティパスを申請', where: '母子手帳交付時に申請', deadline: '母子手帳受け取り時', url: 'https://www.city.ota.tokyo.jp/seikatsu/kodomo/shussan/ninsin.html' },
      ],
      birth: [
        { title: '出生届を提出', where: '区役所', deadline: '出生から14日以内（必須）', url: 'https://www.city.ota.tokyo.jp/seikatsu/koseki/todokede/shussei.html' },
      ],
      postnatal: [
        { title: '児童手当を申請', where: '区役所 こども家庭部', deadline: '出生月末まで', url: 'https://www.city.ota.tokyo.jp/seikatsu/kodomo/teate/jidoteate.html' },
      ],
    },
    benefits: {},
    simBenefits: [],
  },
  chiyoda: {
    todos: {
      early: [
        { title: '妊娠届を提出・母子手帳を受け取る', where: '区役所', deadline: 'なるべく早めに', url: 'https://www.city.chiyoda.lg.jp/koho/kosodate/kosodate/ninshin/boshitecho.html' },
        { title: 'マタニティパスを申請', where: '母子手帳交付時に申請', deadline: '母子手帳受け取り時', url: 'https://www.city.chiyoda.lg.jp/koho/kosodate/kosodate/ninshin/boshitecho.html' },
      ],
      birth: [
        { title: '出生届を提出', where: '区役所', deadline: '出生から14日以内（必須）', url: 'https://www.city.chiyoda.lg.jp/koho/kurashi/koseki/koseki/todokede.html' },
      ],
      postnatal: [
        { title: '児童手当を申請', where: '区役所', deadline: '出生月末まで', url: 'https://www.city.chiyoda.lg.jp/koho/kosodate/teate/jidoteate/index.html' },
        { title: '出産費用助成を申請（千代田区独自）', where: '区役所', deadline: '出産後1年以内', url: 'https://www.city.chiyoda.lg.jp/koho/kosodate/teate/shussanhiyojosei.html' },
      ],
    },
    benefits: {
      postnatal: [
        { name: '出産費用助成（千代田区）', amount: 310000, tag: '現金', note: '千代田区独自。最大31万円', url: 'https://www.city.chiyoda.lg.jp/koho/kosodate/teate/shussanhiyojosei.html' },
      ],
    },
    simBenefits: [
      { name: '出産費用助成（千代田区）', amount: 310000 },
    ],
  },
  chuo: {
    todos: {
      early: [
        { title: '妊娠届を提出・母子手帳を受け取る', where: '区役所', deadline: 'なるべく早めに', url: 'https://www.city.chuo.lg.jp/a0031/kosodate/shussan/tetyokohu.html' },
        { title: 'マタニティパスを申請', where: '母子手帳交付時に申請', deadline: '母子手帳受け取り時', url: 'https://www.city.chuo.lg.jp/a0031/kosodate/shussan/tetyokohu.html' },
      ],
      birth: [
        { title: '出生届を提出', where: '区役所', deadline: '出生から14日以内（必須）', url: 'https://www.city.chuo.lg.jp/a0012/kurashi/touroku/koseki/syusseitodoke/index.html' },
      ],
      postnatal: [
        { title: '児童手当を申請', where: '区役所', deadline: '出生月末まで', url: 'https://www.city.chuo.lg.jp/a0020/kosodate/kosodate/teatejosei/202409jidouteate.html' },
        { title: '新生児誕生祝品を申請（中央区独自）', where: '区役所', deadline: '出生後すみやかに', url: 'https://www.city.chuo.lg.jp/a0020/kosodate/shussan/shussanshien/kaimonokenn.html' },
      ],
    },
    benefits: {
      postnatal: [
        { name: '新生児誕生祝品（中央区）', amount: 50000, tag: 'クーポン', note: '中央区独自。区内共通買物・食事券5万円分', url: 'https://www.city.chuo.lg.jp/a0020/kosodate/shussan/shussanshien/kaimonokenn.html' },
      ],
    },
    simBenefits: [
      { name: '新生児誕生祝品（中央区）', amount: 50000 },
    ],
  },
  bunkyo: {
    todos: {
      early: [
        { title: '妊娠届を提出・母子手帳を受け取る', where: '区役所', deadline: 'なるべく早めに', url: 'https://www.city.bunkyo.lg.jp/b027/p001524.html' },
        { title: 'マタニティパスを申請', where: '母子手帳交付時に申請', deadline: '母子手帳受け取り時', url: 'https://www.city.bunkyo.lg.jp/b027/p001524.html' },
      ],
      birth: [
        { title: '出生届を提出', where: '区役所', deadline: '出生から14日以内（必須）', url: 'https://www.city.bunkyo.lg.jp/b013/p000251.html' },
      ],
      postnatal: [
        { title: '児童手当を申請', where: '区役所', deadline: '出生月末まで', url: 'https://www.city.bunkyo.lg.jp/b022/p001469/index.html' },
      ],
    },
    benefits: {},
    simBenefits: [],
  },
  taito: {
    todos: {
      early: [
        { title: '妊娠届を提出・母子手帳を受け取る', where: '区役所', deadline: 'なるべく早めに', url: 'https://www.city.taito.lg.jp/kosodatekyouiku/kosodate/mokutei/kenkou_iryou/ninshin/todokede/boshikenkotecho.html' },
        { title: 'マタニティパスを申請', where: '母子手帳交付時に申請', deadline: '母子手帳受け取り時', url: 'https://www.city.taito.lg.jp/kosodatekyouiku/kosodate/mokutei/kenkou_iryou/ninshin/todokede/boshikenkotecho.html' },
      ],
      birth: [
        { title: '出生届を提出', where: '区役所', deadline: '出生から14日以内（必須）', url: 'https://www.city.taito.lg.jp/benri/qa/todokede/qashuseitodoke.html' },
      ],
      postnatal: [
        { title: '児童手当を申請', where: '区役所', deadline: '出生月末まで', url: 'https://www.city.taito.lg.jp/kosodatekyouiku/kosodate/mokutei/teate_josei/teate/jidouteate.html' },
        { title: '出産費用助成を申請（台東区独自）', where: '区役所', deadline: '出産後1年以内', url: 'https://www.city.taito.lg.jp/kosodatekyouiku/kosodate/mokutei/teate_josei/syussanhiyoujyosei.html' },
      ],
    },
    benefits: {
      postnatal: [
        { name: '出産費用助成（台東区）', amount: 50000, tag: '現金', note: '台東区独自。5万円', url: 'https://www.city.taito.lg.jp/kosodatekyouiku/kosodate/mokutei/teate_josei/syussanhiyoujyosei.html' },
      ],
    },
    simBenefits: [
      { name: '出産費用助成（台東区）', amount: 50000 },
    ],
  },
  sumida: {
    todos: {
      early: [
        { title: '妊娠届を提出・母子手帳を受け取る', where: '区役所', deadline: 'なるべく早めに', url: 'https://www.city.sumida.lg.jp/kenko_fukushi/kenko/oyako_kenko/ninshin/ninsintodoke.html' },
        { title: 'マタニティパスを申請', where: '母子手帳交付時に申請', deadline: '母子手帳受け取り時', url: 'https://www.city.sumida.lg.jp/kenko_fukushi/kenko/oyako_kenko/ninshin/ninsintodoke.html' },
      ],
      birth: [
        { title: '出生届を提出', where: '区役所', deadline: '出生から14日以内（必須）', url: 'https://www.city.sumida.lg.jp/faq/kurashi/todokede_syoumei/koseki/30.html' },
      ],
      postnatal: [
        { title: '児童手当を申請', where: '区役所', deadline: '出生月末まで', url: 'https://www.city.sumida.lg.jp/kosodate_kyouiku/kosodate_site/teate_jyosei_shien/teate_zyosei/teate/kodomo-teate.html' },
      ],
    },
    benefits: {
      early: [
        { name: 'こども商品券（墨田区）', amount: 10000, tag: 'クーポン', note: '妊娠届出後に配布（墨田区）', url: 'https://www.city.sumida.lg.jp/kenko_fukushi/kenko/oyako_kenko/syussan_junbi_class/skogift.html' },
      ],
    },
    simBenefits: [
      { name: 'こども商品券（墨田区）', amount: 10000 },
    ],
  },
  koto: {
    todos: {
      early: [
        { title: '妊娠届を提出・母子手帳を受け取る', where: '区役所', deadline: 'なるべく早めに', url: 'https://www.city.koto.lg.jp/261201/kodomo/ninshinshussan/ninshin/6875.html' },
        { title: 'マタニティパスを申請', where: '母子手帳交付時に申請', deadline: '母子手帳受け取り時', url: 'https://www.city.koto.lg.jp/261201/kodomo/ninshinshussan/ninshin/6875.html' },
      ],
      birth: [
        { title: '出生届を提出', where: '区役所', deadline: '出生から14日以内（必須）', url: 'https://www.city.koto.lg.jp/060302/kurashi/jumin/koseki/5061.html' },
      ],
      postnatal: [
        { title: '児童手当を申請', where: '区役所', deadline: '出生月末まで', url: 'https://www.city.koto.lg.jp/281011/kodomo/kosodate/teate/jidouteate.html' },
      ],
    },
    benefits: {},
    simBenefits: [],
  },
  shinagawa: {
    todos: {
      early: [
        { title: '妊娠届を提出・母子手帳を受け取る', where: '区役所', deadline: 'なるべく早めに', url: 'https://www.city.shinagawa.tokyo.jp/PC/kodomo/kodomo-ninnshinn/kodomo-ninnshinn-service/hpg000000783.html' },
        { title: 'マタニティパスを申請', where: '母子手帳交付時に申請', deadline: '母子手帳受け取り時', url: 'https://www.city.shinagawa.tokyo.jp/PC/kodomo/kodomo-ninnshinn/kodomo-ninnshinn-service/hpg000000783.html' },
      ],
      birth: [
        { title: '出生届を提出', where: '区役所', deadline: '出生から14日以内（必須）', url: 'https://www.city.shinagawa.tokyo.jp/PC/procedure/procedure-koseki/procedure-koseki-todokede/hpg000001411.html' },
      ],
      postnatal: [
        { title: '児童手当を申請', where: '区役所', deadline: '出生月末まで', url: 'https://www.city.shinagawa.tokyo.jp/PC/kodomo/kodomo-iryohizyosei/hpg000027168.html' },
      ],
    },
    benefits: {},
    simBenefits: [],
  },
  meguro: {
    todos: {
      early: [
        { title: '妊娠届を提出・母子手帳を受け取る', where: '区役所', deadline: 'なるべく早めに', url: 'https://www.city.meguro.tokyo.jp/chiikihoken/kosodatekyouiku/ninshin/ninshintodoke_mynumber.html' },
        { title: 'マタニティパスを申請', where: '母子手帳交付時に申請', deadline: '母子手帳受け取り時', url: 'https://www.city.meguro.tokyo.jp/chiikihoken/kosodatekyouiku/ninshin/ninshintodoke_mynumber.html' },
      ],
      birth: [
        { title: '出生届を提出', where: '区役所', deadline: '出生から14日以内（必須）', url: 'https://www.city.meguro.tokyo.jp/koseki/kurashi/kosekitodokede/shussei.html' },
      ],
      postnatal: [
        { title: '児童手当を申請', where: '区役所', deadline: '出生月末まで', url: 'https://www.city.meguro.tokyo.jp/kosodatekyouiku/kosodate/shien/teate/shoteate/jidouteate/index.html' },
      ],
    },
    benefits: {},
    simBenefits: [],
  },
  shibuya: {
    todos: {
      early: [
        { title: '妊娠届を提出・母子手帳を受け取る', where: '区役所', deadline: 'なるべく早めに', url: 'https://www.city.shibuya.tokyo.jp/kodomo/ninshin/ninshin-todoke/ninshin_todoke.html' },
        { title: 'マタニティパスを申請', where: '母子手帳交付時に申請', deadline: '母子手帳受け取り時', url: 'https://www.city.shibuya.tokyo.jp/kodomo/ninshin/ninshin-todoke/ninshin_todoke.html' },
      ],
      birth: [
        { title: '出生届を提出', where: '区役所', deadline: '出生から14日以内（必須）', url: 'https://www.city.shibuya.tokyo.jp/kurashi/koseki/koseki-todokede/shussho_todoke.html' },
      ],
      postnatal: [
        { title: '児童手当を申請', where: '区役所', deadline: '出生月末まで', url: 'https://www.city.shibuya.tokyo.jp/kodomo/kodomo-teate-josei/kodomo-teate/jido_t.html' },
        { title: 'ハッピーマザー出産助成金を申請（渋谷区独自）', where: '区役所', deadline: '出産後1年以内', url: 'https://www.city.shibuya.tokyo.jp/kodomo/ninshin/ninshin-teate/happy_josei.html' },
      ],
    },
    benefits: {
      postnatal: [
        { name: 'ハッピーマザー出産助成金（渋谷区）', amount: 100000, tag: '現金', note: '渋谷区独自。最大10万円', url: 'https://www.city.shibuya.tokyo.jp/kodomo/ninshin/ninshin-teate/happy_josei.html' },
      ],
    },
    simBenefits: [
      { name: 'ハッピーマザー出産助成金（渋谷区）', amount: 100000 },
    ],
  },
  nakano: {
    todos: {
      early: [
        { title: '妊娠届を提出・母子手帳を受け取る', where: '区役所', deadline: 'なるべく早めに', url: 'https://www.city.tokyo-nakano.lg.jp/kosodate/kosodatesite_ohirune/nenreibetsu/ninshin/tetsuduki/ninshintodoke.html' },
        { title: 'マタニティパスを申請', where: '母子手帳交付時に申請', deadline: '母子手帳受け取り時', url: 'https://www.city.tokyo-nakano.lg.jp/kosodate/kosodatesite_ohirune/nenreibetsu/ninshin/tetsuduki/ninshintodoke.html' },
      ],
      birth: [
        { title: '出生届を提出', where: '区役所', deadline: '出生から14日以内（必須）', url: 'https://www.city.tokyo-nakano.lg.jp/kurashi/koseki/koseki/syussyotodoke.html' },
      ],
      postnatal: [
        { title: '児童手当を申請', where: '区役所', deadline: '出生月末まで', url: 'https://www.city.tokyo-nakano.lg.jp/kosodate/kosodatesite_ohirune/mokuteki/teate/teate/jidoteate.html' },
      ],
    },
    benefits: {},
    simBenefits: [],
  },
  suginami: {
    todos: {
      early: [
        { title: '妊娠届を提出・母子手帳を受け取る', where: '区役所', deadline: 'なるべく早めに', url: 'https://www.city.suginami.tokyo.jp/s054/1109.html' },
        { title: 'マタニティパスを申請', where: '母子手帳交付時に申請', deadline: '母子手帳受け取り時', url: 'https://www.city.suginami.tokyo.jp/s054/1109.html' },
      ],
      birth: [
        { title: '出生届を提出', where: '区役所', deadline: '出生から14日以内（必須）', url: 'https://www.city.suginami.tokyo.jp/s018/1002.html' },
      ],
      postnatal: [
        { title: '児童手当を申請', where: '区役所', deadline: '出生月末まで', url: 'https://www.city.suginami.tokyo.jp/s053/1142.html' },
      ],
    },
    benefits: {},
    simBenefits: [],
  },
  toshima: {
    todos: {
      early: [
        { title: '妊娠届を提出・母子手帳を受け取る', where: '区役所', deadline: 'なるべく早めに', url: 'https://www.city.toshima.lg.jp/219/kosodate/ninshin/shussanmade/001311.html' },
        { title: 'マタニティパスを申請', where: '母子手帳交付時に申請', deadline: '母子手帳受け取り時', url: 'https://www.city.toshima.lg.jp/219/kosodate/ninshin/shussanmade/001311.html' },
      ],
      birth: [
        { title: '出生届を提出', where: '区役所', deadline: '出生から14日以内（必須）', url: 'https://www.city.toshima.lg.jp/094/tetsuzuki/todokede/todokede/000292.html' },
      ],
      postnatal: [
        { title: '児童手当を申請', where: '区役所', deadline: '出生月末まで', url: 'https://www.city.toshima.lg.jp/261/kosodate/kosodate/teate-jose/017993.html' },
        { title: '出産費用電子クーポンを申請（豊島区独自）', where: '区役所', deadline: '出産後すみやかに', url: 'https://www.city.toshima.lg.jp/219/kosodate/ninshin/shussanmade/syussankosodateouen.html' },
      ],
    },
    benefits: {
      postnatal: [
        { name: '出産費用電子クーポン（豊島区）', amount: 50000, tag: 'クーポン', note: '豊島区独自。子育て用品に使えるクーポン5万円分', url: 'https://www.city.toshima.lg.jp/219/kosodate/ninshin/shussanmade/syussankosodateouen.html' },
      ],
    },
    simBenefits: [
      { name: '出産費用電子クーポン（豊島区）', amount: 50000 },
    ],
  },
  kita: {
    todos: {
      early: [
        { title: '妊娠届を提出・母子手帳を受け取る', where: '区役所', deadline: 'なるべく早めに', url: 'https://www.city.kita.lg.jp/children-edu/pregnancy/1018244/1002779.html' },
        { title: 'マタニティパスを申請', where: '母子手帳交付時に申請', deadline: '母子手帳受け取り時', url: 'https://www.city.kita.lg.jp/children-edu/pregnancy/1018244/1002779.html' },
      ],
      birth: [
        { title: '出生届を提出', where: '区役所', deadline: '出生から14日以内（必須）', url: 'https://www.city.kita.lg.jp/living/registration/1001523/1001558.html' },
      ],
      postnatal: [
        { title: '児童手当を申請', where: '区役所', deadline: '出生月末まで', url: 'https://www.city.kita.lg.jp/children-edu/childcare/1002909/1002919/index.html' },
      ],
    },
    benefits: {},
    simBenefits: [],
  },
  arakawa: {
    todos: {
      early: [
        { title: '妊娠届を提出・母子手帳を受け取る', where: '区役所', deadline: 'なるべく早めに', url: 'https://www.city.arakawa.tokyo.jp/a033/ninshinshussan/shinsei/kenkotecho.html' },
        { title: 'マタニティパスを申請', where: '母子手帳交付時に申請', deadline: '母子手帳受け取り時', url: 'https://www.city.arakawa.tokyo.jp/a033/ninshinshussan/shinsei/kenkotecho.html' },
      ],
      birth: [
        { title: '出生届を提出', where: '区役所', deadline: '出生から14日以内（必須）', url: 'https://www.city.arakawa.tokyo.jp/a010/todokede/koseki/syussan.html' },
      ],
      postnatal: [
        { title: '児童手当を申請', where: '区役所', deadline: '出生月末まで', url: 'https://www.city.arakawa.tokyo.jp/a035/kosodate/teate/jidoteate.html' },
      ],
    },
    benefits: {},
    simBenefits: [],
  },
};

// ── 妊娠カレンダー ──────────────────────────────────────────

const CALENDAR_WEEKS = [
  {
    week: 4,
    trimester: 'first',
    label: '4週',
    babySize: 'ケシ粒（約2mm）',
    babyEmoji: '🌰',
    babyDev: '受精卵が子宮に着床。胎嚢が超音波で見える頃',
    momBody: '生理が来ない。妊娠検査薬が陽性に',
    attention: '飲酒・喫煙を避ける。葉酸サプリを摂取',
    medical: '産婦人科を受診し妊娠を確認',
  },
  {
    week: 6,
    trimester: 'first',
    label: '6週',
    babySize: 'ブルーベリー（約6mm）',
    babyEmoji: '🫐',
    babyDev: '心拍が確認できる。手足の芽が出始める',
    momBody: 'つわりが始まる。眠気・頻尿が増える',
    attention: 'つわりはいつでも来る。水分補給を忘れずに',
    medical: '心拍確認。妊娠確定',
  },
  {
    week: 8,
    trimester: 'first',
    label: '8週',
    babySize: 'ラズベリー（約16mm）',
    babyEmoji: '🍓',
    babyDev: '顔の形・指ができてくる。動き始める',
    momBody: 'つわりがピーク。胸が張る',
    attention: '無理をしない。休める環境を整える',
    medical: '経過観察・超音波検査',
  },
  {
    week: 10,
    trimester: 'first',
    label: '10週',
    babySize: 'イチゴ（約3cm）',
    babyEmoji: '🍓',
    babyDev: '「胎児」と呼ばれる時期に。主要な器官がほぼ完成',
    momBody: 'つわりはまだ続く。子宮が大きくなり下腹部が張ってくる',
    attention: '転倒に注意。お腹を圧迫しない服装に',
    medical: 'NIPT（非侵襲的出生前検査）は10週〜受検可能',
  },
  {
    week: 12,
    trimester: 'first',
    label: '12週',
    babySize: 'ライム（約5〜6cm）',
    babyEmoji: '🍋',
    babyDev: '手足をよく動かす。外性器が発達し始める',
    momBody: '安定期が近づく。つわりが和らぐ人も',
    attention: '母子手帳をもらう頃。妊娠届を出して受け取ろう',
    medical: 'NT（首の厚さ）スクリーニング。初期胎児ドック',
  },
  {
    week: 14,
    trimester: 'first',
    label: '14週',
    babySize: 'レモン（約8〜9cm）',
    babyEmoji: '🍋',
    babyDev: '胎盤が完成。ほぼ完成した人間の形に',
    momBody: 'つわりが落ち着く人が多い。食欲が戻り始める',
    attention: '体重管理を意識しはじめる（増えすぎ・少なすぎに注意）',
    medical: '安定期目前。この頃から動きやすくなる',
  },
  {
    week: 16,
    trimester: 'second',
    label: '16週',
    babySize: 'アボカド（約12cm）',
    babyEmoji: '🥑',
    babyDev: '頭皮に髪の毛が生え始める。表情筋が動く',
    momBody: '経産婦はこの頃から胎動を感じる人も',
    attention: 'マタニティウェア・腹帯を準備し始める',
    medical: '性別がわかる産院も（まだ難しい場合が多い）',
  },
  {
    week: 18,
    trimester: 'second',
    label: '18週',
    babySize: 'サツマイモ（約14cm）',
    babyEmoji: '🍠',
    babyDev: '体が丸みを帯びてくる。聴覚が発達し音を感じる',
    momBody: '初産婦もぼんやり胎動を感じ始める（ポコポコ・クルクル）',
    attention: '声かけ・音楽を聞かせるコミュニケーションを',
    medical: '性別がわかることが多い時期',
  },
  {
    week: 20,
    trimester: 'second',
    label: '20週',
    babySize: 'バナナ（約25cm）',
    babyEmoji: '🍌',
    babyDev: '全身に産毛（胎毛）が生える。寝たり起きたりリズムが生まれる',
    momBody: 'お腹がはっきり大きくなる。腰痛が出始める人も',
    attention: '妊娠中期の山場。無理をせず体を動かすのは良い',
    medical: '中期詳細超音波（胎児の臓器・形態チェック）',
  },
  {
    week: 22,
    trimester: 'second',
    label: '22週',
    babySize: 'パパイヤ（約27cm）',
    babyEmoji: '🫑',
    babyDev: '指紋ができる。肺が急速に発達',
    momBody: '胎動がはっきりわかる。パパも触れてわかることも',
    attention: '早産のリスクに注意。無理な運動を避ける',
    medical: '22週未満は人工妊娠中絶が可能な最終時期',
  },
  {
    week: 24,
    trimester: 'second',
    label: '24週',
    babySize: 'コーン（約30cm）',
    babyEmoji: '🌽',
    babyDev: '体に皮下脂肪がつき始める。まぶたが開閉できる',
    momBody: 'お腹の重みで姿勢が変わる。こむら返りが起きやすい',
    attention: '妊娠糖尿病スクリーニング検査の時期',
    medical: '50g グルコースチャレンジテスト（GCT）',
  },
  {
    week: 28,
    trimester: 'third',
    label: '28週',
    babySize: '茄子（約37cm）',
    babyEmoji: '🍆',
    babyDev: '体重が急増し始める。脳が発達し、音・光に反応',
    momBody: '後期突入。貧血・むくみが出やすい',
    attention: '鉄分をしっかり摂る。入院準備を考え始める',
    medical: '後期血液検査（貧血・感染症チェック）',
  },
  {
    week: 30,
    trimester: 'third',
    label: '30週',
    babySize: 'キャベツ（約40cm）',
    babyEmoji: '🥬',
    babyDev: '骨が硬くなる。羊水の中で練習呼吸をする',
    momBody: '胃が圧迫され食欲が落ちる人も。頻尿が再び増える',
    attention: '逆子の確認時期。ほとんどは自然に直る',
    medical: '逆子チェック（胎位確認）',
  },
  {
    week: 32,
    trimester: 'third',
    label: '32週',
    babySize: 'スイカ（小）（約42cm）',
    babyEmoji: '🍉',
    babyDev: '爪・まつ毛が生える。肺が出生後に備えて成熟',
    momBody: '動くのが辛くなる。動悸・息切れが出ることも',
    attention: '出産に向けた準備（入院バッグ・陣痛アプリなど）を始める',
    medical: '胎児の成長を毎回チェック。逆子は32週でほぼ確定',
  },
  {
    week: 35,
    trimester: 'third',
    label: '35〜36週',
    babySize: 'メロン（約46cm）',
    babyEmoji: '🍈',
    babyDev: 'ほぼ出産時と同じ大きさ。内臓が完成に近づく',
    momBody: '赤ちゃんが下がってきてお腹が軽くなる人も',
    attention: '産前休暇（産前42日前）。入院準備を完成させる',
    medical: 'GBSスクリーニング。毎週健診に変わる産院も',
  },
  {
    week: 37,
    trimester: 'term',
    label: '37週（正期産）',
    babySize: 'スイカ（約48cm）',
    babyEmoji: '🍉',
    babyDev: '正期産。いつ産まれてもOKな成熟度に',
    momBody: '前駆陣痛が来ることも。おしるし・破水に注意',
    attention: '陣痛・破水のサインを把握する。産院の連絡先を確認',
    medical: '毎週健診。いつでも入院できる準備を',
  },
  {
    week: 40,
    trimester: 'term',
    label: '40週（予定日）',
    babySize: 'スイカ（約50cm）',
    babyEmoji: '👶',
    babyDev: 'ついに予定日！でも±2週は正常範囲',
    momBody: '陣痛が来るのを待つ。緊張と楽しみが混じる',
    attention: '陣痛間隔をアプリで計る。落ち着いて対処を',
    medical: '陣痛が規則的に（初産：10分間隔、経産：15分間隔）になったら入院',
  },
];



const TRIMESTER_INFO = {
  first:  { label: '妊娠初期',  weeks: '4〜14週',  color: '#bbf7d0', text: '#166534' },
  second: { label: '妊娠中期',  weeks: '15〜27週', color: '#fbcfe8', text: '#831843' },
  third:  { label: '妊娠後期',  weeks: '28〜36週', color: '#ddd6fe', text: '#4c1d95' },
  term:   { label: '出産期',    weeks: '37週〜',   color: '#fef08a', text: '#78350f' },
};
