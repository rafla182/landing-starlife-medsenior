/*
 * Configuração da landing. É o único arquivo que precisa ser editado no dia a dia.
 * Tudo aqui fica visível para quem abre a página: não coloque senhas nem dados internos.
 */
window.LP_CONFIG = {
  // WhatsApp que recebe os contatos, só números, com 55 + DDD.
  whatsapp: '5527995282647',

  // URL do Web App do Google Apps Script (ver README). Vazio = não grava na planilha.
  planilhaUrl: '',

  // Estado marcado quando o link não traz ?uf=XX.
  ufPadrao: 'ES',

  // Campanha: some sozinha depois de "fim" (data no horário de Brasília).
  campanha: {
    ativa: true,
    fim: '2026-10-31'
  },

  // Bloco "a partir de". Só ligue com um valor real e contratável.
  preco: {
    mostrar: false,
    valor: 'R$ 000,00',
    referencia: 'produto, faixa etária e cidade de referência',
    nota: 'Valor de referência para [produto], [faixa etária], [cidade/UF], em [mês/ano].'
  },

  // Google Ads. Ex.: id 'AW-1234567890' e conversao 'AW-1234567890/AbCdEfGh'.
  googleAds: {
    id: '',
    conversao: ''
  }
};
