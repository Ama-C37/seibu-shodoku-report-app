export async function correctReportText(text: string) {
  await new Promise((resolve) => window.setTimeout(resolve, 500));

  const normalized = text.trim().replace(/\n{3,}/g, '\n\n');
  const ending =
    '引き続き状況を注視し、必要に応じて周辺環境の確認にご協力いただきながら経過を確認していく必要があると判断されます。';

  if (!normalized) return ending;
  if (normalized.includes('ご協力') || normalized.includes('経過を確認')) {
    return normalized;
  }

  return `${normalized}\n\n${ending}`;
}
