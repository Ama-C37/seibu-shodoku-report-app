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

export function buildAiCorrectionPrompt(text: string) {
  return `あなたは害虫害獣駆除の現場施工報告書の作成を支援するアシスタントです。
以下の文章を、お客様に提出する現場施工報告書として自然で丁寧な日本語に添削してください。
事実を追加せず、意味を変えず、簡潔で分かりやすい表現にしてください。
確定的な言い切りは避け、報告者が現場で確認・判断した内容として主体的に記述してください。
報告文の最後には、お客様にも注意や確認にご協力いただく趣旨の一文を、状況や入力内容に応じて自然な形で必ず明記してください。

過去の採用傾向:
${buildAdoptedStyleNotes().map((note) => `- ${note}`).join('\n')}

入力文:
${text}`;
}

export async function correctReportText(text: string) {
  await new Promise((resolve) => window.setTimeout(resolve, 500));

  const normalized = text.trim().replace(/\n{3,}/g, '\n\n');
  const ending =
    '引き続き状況を注視し、必要に応じて周辺環境の確認にご協力いただきながら経過を確認していく必要があると判断されます。';

  if (!normalized) return ending;
  const softerText = normalized
    .replace(/見つけた/g, '確認した')
    .replace(/発見した/g, '確認した')
    .replace(/断定されます/g, '判断されます')
    .replace(/原因です/g, '原因の可能性が考えられます');

  if (normalized.includes('ご協力') || normalized.includes('経過を確認')) {
    return softerText;
  }

  return `${softerText}\n\n${ending}`;
}
