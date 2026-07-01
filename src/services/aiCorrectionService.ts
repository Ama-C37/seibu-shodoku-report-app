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
  const softerText = normalized
    .replace(/見つけた/g, '確認した')
    .replace(/発見した/g, '確認した')
    .replace(/断定されます/g, '判断されます')
    .replace(/原因です/g, '原因の可能性が考えられます');

  const variants = [
    softerText,
    `${softerText}\n\n上記の内容を確認したうえで、現時点では継続的な経過確認が必要と判断されます。`,
    `現地確認の結果、以下の内容を確認いたしました。\n\n${softerText}`
  ];
  const base = variants[retryIndex % variants.length];
  const hasCustomerRequest = /ご協力|経過を確認|ご確認いただ/.test(base);
  const candidate = hasCustomerRequest ? base : `${base}\n\n${ending}`;

  if (!rejectedTexts.includes(candidate)) {
    return candidate;
  }

  return `${candidate}\n\nなお、前回案とは異なる観点で整理し、今後の状況確認についても継続してご協力いただくことが望ましいと考えられます。`;
}
