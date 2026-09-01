// Utilitário de download no navegador.
// Centraliza o padrão de baixar um Blob criando um link temporário.
export function baixarBlob(nome, blob) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nome
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
