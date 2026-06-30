export async function savePdfLocal(reportId: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  return {
    reportId,
    url
  };
}
