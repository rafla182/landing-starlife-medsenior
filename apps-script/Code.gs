/**
 * Recebe os leads da landing, grava na planilha e avisa por e-mail.
 *
 * Este arquivo roda no Google Apps Script, não no site. Ele fica no repositório
 * só para versionamento: para valer, cole o conteúdo no editor do Apps Script
 * da planilha e reimplante (passo a passo no README).
 *
 * O e-mail de aviso fica em Propriedades do script (EMAIL_AVISO), fora do código.
 */

var ABA = 'Leads';
var COLUNAS = [
  'Data/hora', 'Nome', 'Telefone', 'UF', 'Origem do clique',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'gclid', 'Página'
];
var UFS_ACEITAS = ['ES', 'SP', 'RJ', 'MG', 'PR', 'RS', 'PE', 'DF'];

function doPost(e) {
  var trava = LockService.getScriptLock();
  try {
    var d = JSON.parse(e.postData.contents);

    // Campo isca preenchido = robô. Responde ok e não grava.
    if (d.site) return resposta('ok');

    var nome = limpar(d.nome, 80);
    var digitos = String(d.telefone || '').replace(/\D/g, '');
    if (nome.length < 2 || digitos.length < 10 || digitos.length > 11) return resposta('invalido');

    var uf = UFS_ACEITAS.indexOf(String(d.uf)) >= 0 ? String(d.uf) : '';

    trava.waitLock(10000);
    var aba = abaDeLeads();
    aba.appendRow([
      new Date(), nome, limpar(d.telefone, 20), uf, limpar(d.origem, 40),
      limpar(d.utm_source, 100), limpar(d.utm_medium, 100), limpar(d.utm_campaign, 150),
      limpar(d.utm_term, 150), limpar(d.utm_content, 150),
      limpar(d.gclid, 200), limpar(d.pagina, 300)
    ]);
    trava.releaseLock();

    avisar(nome, d.telefone, uf, digitos);
    return resposta('ok');
  } catch (err) {
    console.error(err);
    return resposta('erro');
  }
}

function abaDeLeads() {
  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  var aba = planilha.getSheetByName(ABA) || planilha.insertSheet(ABA);
  if (aba.getLastRow() === 0) {
    aba.appendRow(COLUNAS);
    aba.setFrozenRows(1);
  }
  return aba;
}

function avisar(nome, telefone, uf, digitos) {
  var para = PropertiesService.getScriptProperties().getProperty('EMAIL_AVISO');
  if (!para) return;
  MailApp.sendEmail({
    to: para,
    subject: 'Novo lead MedSênior: ' + nome + (uf ? ' (' + uf + ')' : ''),
    body: 'Nome: ' + nome + '\n' +
      'WhatsApp: ' + limpar(telefone, 20) + '\n' +
      'Estado: ' + (uf || 'não informado') + '\n\n' +
      'Abrir conversa: https://wa.me/55' + digitos + '\n\n' +
      'Planilha: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl()
  });
}

/** Corta o tamanho e impede que o texto vire fórmula na planilha. */
function limpar(valor, max) {
  var s = String(valor == null ? '' : valor).replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function resposta(texto) {
  return ContentService.createTextOutput(texto).setMimeType(ContentService.MimeType.TEXT);
}
