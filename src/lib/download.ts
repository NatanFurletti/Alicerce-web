/**
 * Oferece um texto como arquivo para download, sem servidor no meio.
 *
 * O link temporário com `download` é a forma padrão de o navegador salvar um conteúdo
 * gerado no próprio front. A URL do Blob é liberada logo depois, para não reter a
 * memória do arquivo enquanto a página estiver aberta.
 */
export function downloadTextFile(
  filename: string,
  content: string,
  type = 'text/csv;charset=utf-8',
): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  // Liberar no mesmo tick pode cancelar o download em alguns navegadores.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
