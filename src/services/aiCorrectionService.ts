import { findAdoptedAiCorrections } from '../repositories/aiCorrectionRepository';

function buildAdoptedStyleNotes() {
  const examples = findAdoptedAiCorrections(3);
  if (examples.length === 0) {
    return [
      'お客様に提出する丁寧な文体にする',
      '確定的な言い切りを避け、現場で確認・判断した内容として記述する',
      '最後にお客様への注意・確認協力を促す一文を入れる'
    ];
  }

  return examples.map((example) => `過去に採用された表現例: ${example.adoptedText.slice(0, 120)}`);
}

const styleRules = [
  'お客様へ提出する報告書としてふさわしい丁寧な文章にする',
  '口語的な表現を避け、判断されます、考えられます、推測されます、可能性が考えられます等を用いる',
  '現場で確認できた事実と、そこから考えられる推測・判断を明確に区別する',
  '提案はあくまで提案として記載し、最終判断はお客様に委ねる表現にする',
  '基本構成は、本日実施した作業、点検結果、結果から考えられること、今後の注意点・提案の順にする',
  '配置、喫食、捕獲、閉塞、侵入経路、生息、痕跡、活動状況、経過を観察などのPCO業界用語は適切に残す',
  '同じ語尾や同じ言葉の繰り返しを避ける',
  '因果関係を明確にし、なぜそう判断したのか、なぜ提案するのかが伝わる文章にする',
  '季節要因を必要に応じて考察へ反映する',
  '必要以上に不安を煽らず、可能性があります、注意が必要です、引き続き経過を観察する必要があります等に留める',
  '一文を長くしすぎず、お客様が知りたい内容を優先する',
  '可能な場合は、本日、対象害虫・害獣の防除作業を実施いたしました、に近い導入から始める'
];

function retryInstruction(retryIndex: number) {
  if (retryIndex === 1) {
    return '前回案とは異なる構成で、より簡潔かつお客様に伝わりやすい文章にしてください。';
  }
  if (retryIndex === 2) {
    return '前回案とは異なる表現で、より丁寧でやわらかい言い回しにしてください。';
  }
  return 'これまでの案とは異なる文章構成・語尾・注意喚起文を使って再添削してください。';
}

export function buildAiCorrectionPrompt(text: string, retryIndex = 0, rejectedTexts: string[] = []) {
  return `あなたは害虫害獣駆除の現場施工報告書の作成を支援するアシスタントです。
以下の文章を、お客様に提出する現場施工報告書として自然で丁寧な日本語に添削してください。
事実を追加せず、意味を変えず、簡潔で分かりやすい表現にしてください。
確定的な言い切りは避け、報告者が現場で確認・判断した内容として主体的に記述してください。
報告文の最後には、お客様にも注意や確認にご協力いただく趣旨の一文を、状況や入力内容に応じて自然な形で必ず明記してください。

石橋様向け報告書スタイル:
${styleRules.map((rule) => `- ${rule}`).join('\n')}

過去の採用傾向:
${buildAdoptedStyleNotes().map((note) => `- ${note}`).join('\n')}

${retryIndex > 0 ? `再添削条件:\n- ${retryInstruction(retryIndex)}` : ''}
${rejectedTexts.length > 0 ? `避ける添削案:\n${rejectedTexts.map((item) => `- ${item.slice(0, 120)}`).join('\n')}` : ''}

入力文:
${text}`;
}

export async function correctReportText(text: string, retryIndex = 0, rejectedTexts: string[] = []) {
  await new Promise((resolve) => window.setTimeout(resolve, 500));

  const normalized = text.trim().replace(/\n{3,}/g, '\n\n');
  const endings = [
    '引き続き状況を注視し、必要に応じて周辺環境の確認にご協力いただきながら経過を確認していく必要があると判断されます。',
    '今後も発生状況に変化がないかご確認いただき、気になる点がございましたら早めにご相談いただくことが望ましいと考えられます。',
    '再発防止のため、周辺環境の変化や痕跡の有無について、お客様にも継続してご確認いただくことが重要と考えられます。'
  ];
  const ending = endings[retryIndex % endings.length];

  if (!normalized) return ending;

  const politeText = normalized
    .replace(/急に/g, '急激に')
    .replace(/もったいない/g, '有効活用が望ましい')
    .replace(/するといいと思います/g, 'することをおすすめいたします')
    .replace(/した方がいい/g, 'することをご検討ください')
    .replace(/したほうがいい/g, 'することをご検討ください')
    .replace(/だと思います/g, 'と考えられます')
    .replace(/と思います/g, 'と考えられます')
    .replace(/です。/g, 'です。');

  const softerText = politeText
    .replace(/見つけた/g, '確認した')
    .replace(/発見した/g, '確認した')
    .replace(/断定されます/g, '判断されます')
    .replace(/原因です/g, '原因の可能性が考えられます')
    .replace(/必ず再発します/g, '再発する可能性があります')
    .replace(/駆除完了です/g, '一時的に駆除が完了していると判断されます');

  const month = new Date().getMonth() + 1;
  const seasonalNote =
    month >= 6 && month <= 9
      ? '夏季は屋外での活動が増える傾向があり、建物内での活動や喫食量が一時的に変動する可能性が考えられます。'
      : month === 12 || month <= 2
        ? '冬季は建物内へ侵入する可能性が高まるため、足音や痕跡の有無について継続して確認する必要があると考えられます。'
        : '';

  const hasStructure = /作業|点検|結果|考察|提案|注意点/.test(softerText);
  const structuredText = hasStructure
    ? softerText
    : `本日、対象害虫・害獣の防除作業を実施いたしました。\n\n点検結果として、${softerText}\n\n上記の状況から、現場環境や活動状況を踏まえ、継続的な経過確認が必要と考えられます。`;

  const variants = [
    structuredText,
    `${structuredText}\n\n${seasonalNote}`.trim(),
    `現地確認の結果、以下の内容を確認いたしました。\n\n${structuredText}`
  ];
  const base = variants[retryIndex % variants.length];
  const hasCustomerRequest = /ご協力|経過を確認|ご確認いただ/.test(base);
  const candidate = hasCustomerRequest ? base : `${base}\n\n${ending}`;

  if (!rejectedTexts.includes(candidate)) {
    return candidate;
  }

  return `${candidate}\n\nなお、前回案とは異なる観点で整理し、今後の状況確認についても継続してご協力いただくことが望ましいと考えられます。`;
}
