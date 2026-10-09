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

  // Seção "Quem atende você": o corretor ou a corretora desta versão da página.
  // Para outra pessoa, troque nome, foto (imagem quadrada) e parágrafos.
  // mostrar: false deixa a página sem apresentação pessoal.
  quemAtende: {
    mostrar: true,
    nome: 'Vanessa',
    foto: 'assets/vanessa.jpg',
    paragrafos: [
      'Olá! Me chamo Vanessa, sou corretora de planos de saúde e formada em Administração de Empresas.',
      'Gosto de conversar sobre planos de saúde com clareza. Meu trabalho é entender o que é mais importante para você neste momento e orientar a escolha do plano mais adequado para você, sua família ou sua empresa.'
    ]
  },

  // Pixel da Meta (Facebook/Instagram). Ex.: '123456789012345'. Dispara PageView e Lead.
  metaPixel: '',

  // Google Ads. Ex.: id 'AW-1234567890' e conversao 'AW-1234567890/AbCdEfGh'.
  googleAds: {
    id: '',
    conversao: ''
  }
};
