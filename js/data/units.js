/**
 * Real Grammar for Creative Communication（Unit 1-15）のメタ情報と文法解説データ。
 * 教科書スキャン（英語-01〜33）および授業スライド（IMG_5433〜5640）の解説部分を構造化したもの。
 *
 * grammar の各セクションは以下のいずれか（複数可）を持つ:
 *   heading : 見出し（必須）
 *   body    : 補足説明テキスト（任意）
 *   table   : { headers: string[], rows: string[][] }（任意）
 *   notes   : 注記の配列 string[]（任意）
 */
const UNITS = [
  {
    id: 1,
    title: '名詞句（概論）Nouns',
    subtitle: 'The amount of gasoline we use is increasing year by year.',
    subtitleJa: '名詞家の女王蜂と働き蜂 ―― 中心の名詞が名詞句の特性を決める',
    themes: ['名詞句', '中心の名詞', '複合名詞句'],
    accent: '#6366f1',
    grammar: [
      {
        heading: '① 名詞句の構造',
        body: '名詞句は〔冠詞｜形容詞｜短い分詞｜中心の名詞｜関係詞節・前置詞句・不定詞・分詞等〕の構造をもつ（例: the / blue / car / in the garage）。',
        notes: [
          '中心の名詞が可算名詞の単数なら、何らかの冠詞類が必要（by car などは例外）。',
          '後ろから中心の名詞を修飾する不定詞・前置詞句などは「形容詞的用法」。',
        ],
      },
      {
        heading: '② 複合名詞句',
        body: '中心の名詞の前に名詞が来ることがある（例: the bus stops）。前置の名詞は形容詞代わりなので原則複数形にしない。',
      },
      {
        heading: '③ 名詞句の特性は中心の名詞が決める',
        notes: [
          '中心の名詞 stops が複数 → 名詞句全体も複数扱い。',
          '×My family is 5 people. → There are 5 people in my family.',
          '×The number of applicants exceeded 300 people. → … exceeded 300.',
        ],
      },
    ],
  },
  {
    id: 2,
    title: '冠詞 Articles',
    subtitle: 'This is the only apple left in this season.',
    subtitleJa: 'たくさんの意味を覚えるな ―― 定冠詞 the と不定冠詞 a 中心',
    themes: ['a / an', 'the', '限定'],
    accent: '#0ea5e9',
    grammar: [
      {
        heading: '① 不定冠詞 a(n)',
        body: '中心の名詞が可算名詞の単数で、後の限定が弱い場合に使用。He bought a car yesterday.',
      },
      {
        heading: '② 定冠詞 the を使う主な場面',
        table: {
          headers: ['場面', '例'],
          rows: [
            ['前出のものを繰り返す', 'I have a car. The car is nice.'],
            ['指差し', 'Open the window.'],
            ['世界に1つ', 'the tallest man in the world / the second chapter'],
            ['前の形容詞で限定', 'the last train / the same proposal'],
            ['後ろから限定', 'the report (which) he handed in yesterday'],
            ['固有名詞的', 'the United Nations'],
          ],
        },
        notes: ['固有名詞は原則無冠詞: Gate 21 / President Tanaka。'],
      },
    ],
  },
  {
    id: 3,
    title: '形容詞 Adjectives',
    subtitle: 'These are some of the questions frequently asked by customers.',
    subtitleJa: '名詞家の働き蜂 ―― 名詞を修飾する／補語になる',
    themes: ['名詞修飾', '前置詞句', '分詞', 'SVC / SVOC'],
    accent: '#f59e0b',
    grammar: [
      {
        heading: '① 名詞句の中で名詞を修飾',
        notes: [
          '前置詞句: Those books on the table are mine.',
          '後置の分詞: a friend living in America / questions frequently asked',
          '前置の分詞: a sleeping dog / Excited citizens',
          '形容詞的用法の不定詞: a book to read in the train',
          '関係詞: a friend who lives in Osaka',
        ],
      },
      {
        heading: '② 補語の位置（SVC / SVOC）',
        notes: [
          'SVC: He is clever. / She became tall.（C が主語を説明）',
          'SVOC: He made his wife happy.（his wife = happy）',
        ],
      },
    ],
  },
  {
    id: 4,
    title: '前置詞 Prepositions',
    subtitle: 'Go down this street until you see a post office on your left.',
    subtitleJa: '名詞句のわがままを叶えてあげる ―― 単体で置けない位置で動詞の力を借りる',
    themes: ['自動詞の後ろ', '受け身', 'wh移動'],
    accent: '#10b981',
    grammar: [
      {
        heading: '① 前置詞が現れる場面',
        notes: [
          '自動詞の後ろ: He went to the town.',
          '受け身文: This town is visited by many people.',
          '動詞の名詞化: destruction of the city',
          '不定詞の主語: It is important for us to study hard.',
          'SVOO以外でモノを置く: I gave a present to him.',
        ],
      },
      {
        heading: '② 注意点',
        notes: [
          'どの前置詞かは意味で決まる。',
          '前置詞の後ろに名詞句が無い → wh移動を疑う: What are you looking for?',
          '前置詞は名詞句相手。副詞は相手にしない: ×I went to abroad.',
        ],
      },
    ],
  },
  {
    id: 5,
    title: '不定詞と動名詞 Infinitive & Gerunds',
    subtitle: 'I have many things to do before this evening.',
    subtitleJa: '基本原則の応用編 ―― 名詞的・形容詞的・副詞的用法',
    themes: ['名詞的用法', '形容詞的用法', '副詞的用法', '動名詞'],
    accent: '#ec4899',
    grammar: [
      {
        heading: '① 名詞的用法（名詞句の位置）',
        notes: [
          '主語: To study abroad is my dream.',
          '他動詞の目的語: I like to swim in the river.',
          'SVCのC: My dream is to become a lawyer.',
          '同じ位置に動名詞も: I love watching TV. / I look forward to seeing you.',
        ],
      },
      {
        heading: '② 形容詞的・副詞的用法',
        notes: [
          '形容詞的: I have many things to do.',
          '副詞的: I went there to buy it. / too short to reach it',
        ],
      },
      {
        heading: '③ 目的語に注意する動詞',
        notes: [
          'enjoy は動名詞: I enjoy watching TV.（×enjoy to watch）',
          'remember to do（これから）/ remember doing（した）で意味が変わる。',
        ],
      },
    ],
  },
  {
    id: 6,
    title: '分詞構文 Participle Constructions',
    subtitle: 'Covered with snow, Mt. Fuji looked so beautiful.',
    subtitleJa: 'わからなければ無理に使うな ―― 接続詞・主語を削除し -ing 形に',
    themes: ['-ing 分詞構文', '過去分詞', '慣用表現'],
    accent: '#8b5cf6',
    grammar: [
      {
        heading: '① -ing 形の分詞構文',
        body: '接続詞と主語を削除し、動詞を -ing 形に。When he entered the room, … → Entering the room, …',
        notes: ['主語が異なる場合は残す。分詞構文部分は動詞を修飾するので副詞的で、比較的自由に動ける。'],
      },
      {
        heading: '② 過去分詞の分詞構文',
        body: 'be動詞も削除。When he was asked …, → Asked …, he said nothing. 解釈時は接続詞＋主語＋be動詞を補う。',
      },
      {
        heading: '③ 慣用表現',
        notes: ['Judging from / Compared to / Talking of / weather permitting / frankly speaking など。'],
      },
    ],
  },
  {
    id: 7,
    title: '関係代名詞節 Relative Pronouns',
    subtitle: 'This is the house whose color I love.',
    subtitleJa: '日本語にはない？ ―― 接続詞＋代名詞の働き',
    themes: ['who(m)', 'whose', 'which / that', '前置詞'],
    accent: '#ef4444',
    grammar: [
      {
        heading: '① 関係代名詞とは',
        body: '「関係」＝文をつなぐ接続詞、「代名詞」＝2回目の同じ名詞句に代わる。主格・所有格・目的格に格変化する。',
      },
      {
        heading: '② 派生',
        notes: [
          'I saw the man (whom) she loves.（目的格は省略可）',
          'I met a man whose name I don\'t remember.（所有格 whose は省略不可）',
          'the house which I live in / in which I live（前置詞は残すか前に出す）',
          '主節の主格関係代名詞は省略不可: the man who met Mary',
        ],
      },
    ],
  },
  {
    id: 8,
    title: '形容詞的分詞 (1) Participles',
    subtitle: 'A woman carrying a briefcase entered the park.',
    subtitleJa: '名詞の後の分詞 ―― 中心の名詞を後ろから修飾',
    themes: ['後置の -ing', '後置の過去分詞', '関係詞との対応'],
    accent: '#0d9488',
    grammar: [
      {
        heading: '① 名詞句の中の形容詞的分詞',
        notes: [
          '-ing 形: I have a friend living in Tokyo.',
          '過去分詞: the questions frequently asked by our clients',
        ],
      },
      {
        heading: '② 関係代名詞との対応',
        notes: [
          'a friend living in Tokyo ＝ a friend who lives in Tokyo',
          'questions frequently asked ＝ questions that are frequently asked',
        ],
      },
    ],
  },
  {
    id: 9,
    title: '形容詞的分詞 (2) Participles',
    subtitle: 'You look frightened. / Snakes are frightening.',
    subtitleJa: 'be動詞の後ろや名詞の前に！ ―― 過去分詞 vs -ing',
    themes: ['過去分詞', '-ing', '判定法'],
    accent: '#d946ef',
    grammar: [
      {
        heading: '① 過去分詞と -ing の使い分け',
        body: 'まず過去分詞（受け身文）で試し、能動文に戻して意味を確認。おかしければ -ing。',
        notes: [
          'The event was exciting.（×Someone excited the event → -ing）',
          'He was excited.（Something excited him → 過去分詞でOK）',
          'He is interesting.（意味が変わる → -ing）',
        ],
      },
      {
        heading: '② 目安',
        notes: ['主語が人・動物なら過去分詞、モノなら -ing（例外も多い）。'],
      },
    ],
  },
  {
    id: 10,
    title: '副詞 Adverbs',
    subtitle: 'He works very hard to earn a lot of money.',
    subtitleJa: 'いろいろなものを相手にする八方美人 ―― 動詞・形容詞・副詞・文を修飾',
    themes: ['副詞', '副詞節', '語形（-ly）'],
    accent: '#6366f1',
    grammar: [
      {
        heading: '① 副詞とは',
        notes: [
          '動詞を修飾: He speaks slowly.',
          '形容詞を修飾: He is very kind.',
          '他の副詞を修飾: He speaks very slowly.',
        ],
      },
      {
        heading: '② 副詞の家族と特徴',
        notes: [
          '副詞節・分詞構文・副詞的前置詞句・副詞的用法の不定詞。',
          '節の中で比較的自由に動ける。however / then も（接続）副詞。',
        ],
      },
    ],
  },
  {
    id: 11,
    title: '関係副詞節 Relative Adverbs',
    subtitle: 'This is the university where I graduated.',
    subtitleJa: '前置詞不要でお手軽 ―― where / when / why / how',
    themes: ['where', 'when', 'why', 'how'],
    accent: '#0ea5e9',
    grammar: [
      {
        heading: '① 関係副詞とは',
        body: '「関係」＝接続詞、「副詞」＝副詞句（前置詞＋名詞）に代わる。前置詞ごと消えるのが関係代名詞との違い。',
      },
      {
        heading: '② 作り方の例',
        notes: [
          'This is the country. + My mother was born in the country. → … the country where my mother was born.',
          'the reason why … / the time when … / the way how …（how か the way 一方を省略）',
        ],
      },
    ],
  },
  {
    id: 12,
    title: '受け身文 Passive Sentences',
    subtitle: 'The consumption tax was introduced by Mr. Takeshita.',
    subtitleJa: '投げられた側が主役 ―― be動詞＋過去分詞（形容詞扱い）',
    themes: ['be＋過去分詞', 'by / with', '時制'],
    accent: '#f59e0b',
    grammar: [
      {
        heading: '① 受け身文の作り方',
        notes: [
          '動詞を過去分詞に（「〜される」）＝形容詞扱い → 述部に be動詞が必要。',
          'やられたものを主語（subject）位置に。',
          '後ろに名詞句を置くには前置詞（by など、意味で決まる）。',
        ],
      },
      {
        heading: '② 注意',
        notes: [
          'Snow covers the ground. → The ground is covered with snow.',
          'have の後ろの過去分詞は「〜される」意味を持たず目的語をとれる: I have seen him twice.',
        ],
      },
    ],
  },
  {
    id: 13,
    title: 'be動詞 be Verb',
    subtitle: 'He got involved in the case. / He looks so excited.',
    subtitleJa: '意外と知らない本当の姿 ―― 「イコール」の意味と SVC',
    themes: ['SVC', 'become / get / sound', '受け身との関係'],
    accent: '#10b981',
    grammar: [
      {
        heading: '① be動詞＝「イコール」',
        notes: [
          'Tom is a doctor.（Tom = a doctor）/ Susan is ill.（Susan = ill）',
          'これらは SVC で S = C が成り立つ。',
        ],
      },
      {
        heading: '② SVC に使える動詞・受け身との関係',
        notes: [
          'become / get（イコールへ変化）, sound（イコールのように聞こえる）。',
          '受け身も be＋過去分詞で SVC: He was killed by Mary.（He = killed by Mary）',
        ],
      },
    ],
  },
  {
    id: 14,
    title: '時制 (1) Tense',
    subtitle: 'I lived in France from 1992 to 1996.',
    subtitleJa: '動物にはわからない昔の話 ―― 過去形と現在完了形',
    themes: ['過去形', '現在完了形', '時間表現'],
    accent: '#8b5cf6',
    grammar: [
      {
        heading: '① 過去形',
        body: '過去の特定の時点を表す時間表現とともに使う。yesterday / two years ago / from 2001 to 2005。',
        notes: ['現在につながらなくてよい。死んだ人には原則過去形: He wrote three books in his life.'],
      },
      {
        heading: '② 現在完了形',
        body: '「今より前」が中心話題。ぼかされた時間表現（起点・終点が不明確）とともに。',
        notes: [
          'I have lived here since 1999.（今も住んでいる）',
          'for a long time は現在完了でも過去形でも使える。',
        ],
      },
    ],
  },
  {
    id: 15,
    title: '時制 (2) Tense',
    subtitle: 'Many new bridges are being built.',
    subtitleJa: 'わかるまで練習しよう ―― 助動詞・進行形・完了形の組み立て',
    themes: ['助動詞', '進行形', '完了形', '受け身'],
    accent: '#ef4444',
    grammar: [
      {
        heading: '① 助動詞を入れる（後ろは原形）',
        notes: [
          'He comes here. → He will come here.',
          'The book is read … → The book will be read …',
        ],
      },
      {
        heading: '② 進行形（be＋-ing）',
        notes: [
          'He plays the violin. → He is playing the violin.',
          'Many new houses are built. → Many new houses are being built.',
        ],
      },
      {
        heading: '③ 完了形（have＋過去分詞）',
        notes: [
          'He is in jail. → He has been in jail (since …).',
          'He is working hard. → He has been working hard.',
        ],
      },
    ],
  },
];
