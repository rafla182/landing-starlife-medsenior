# Landing StarLife Saúde · MedSênior

Landing page da Vanessa, corretora da StarLife Saúde, para captação de cotações de planos MedSênior.
Site estático (HTML, CSS e JavaScript puros), sem build.

## Como funciona

1. Todos os botões da página levam ao mesmo formulário (nome, WhatsApp e estado).
2. Ao enviar, o lead é gravado em uma Planilha Google e a corretora recebe um e-mail de aviso.
3. Em seguida o WhatsApp abre com a mensagem pronta.

Os leads vão para o WhatsApp, a planilha e o e-mail da Vanessa, não para os canais gerais da corretora.

Só entra na planilha quem preenche o formulário, e todo mundo que vai para o WhatsApp passa por ele.

## Arquivos

| Arquivo | O que é |
| --- | --- |
| `index.html` | A página |
| `styles.css` | Estilos |
| `script.js` | Formulário, estados, campanha, envio do lead |
| `config.js` | **Configuração do dia a dia** (WhatsApp, planilha, campanha, preço, Google Ads) |
| `privacidade.html` | Política de privacidade (rascunho) |
| `apps-script/Code.gs` | Código que roda na Planilha Google e recebe os leads |

## Rodar localmente

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

## Configuração (`config.js`)

- `whatsapp`: número que recebe os contatos, com 55 + DDD, só dígitos.
- `planilhaUrl`: URL do Web App do Apps Script (abaixo). Vazio = o lead não é gravado.
- `ufPadrao`: estado marcado por padrão. Um link com `?uf=SP` abre a página já em São Paulo,
  útil para ter uma URL por campanha do Google Ads.
- `campanha`: `ativa` liga o selo e a faixa de carência zero; depois de `fim` eles somem sozinhos.
- `preco`: bloco "a partir de". Só ligar com valor real e contratável, e preencher a referência.
- `quemAtende`: apresentação de quem atende (nome, foto e parágrafos). A página é um modelo genérico:
  para outra pessoa da corretora, basta trocar esses dados e o `whatsapp`. A versão atual usa a Vanessa como exemplo.
- `metaPixel`: ID do Pixel da Meta. Dispara `PageView` ao abrir e `Lead` quando o formulário é enviado.
- `googleAds`: `id` da conta e rótulo de `conversao`, disparada quando o formulário é enviado.

Tudo em `config.js` é público para quem abre a página. Não colocar senhas ali.

## Planilha e e-mail de aviso

1. Criar uma Planilha Google na conta da corretora.
2. Em **Extensões → Apps Script**, colar o conteúdo de `apps-script/Code.gs`.
3. Em **Configurações do projeto → Propriedades do script**, criar `EMAIL_AVISO` com o e-mail
   que deve receber os avisos.
4. **Implantar → Nova implantação → App da Web**, executar como "Eu" e acesso "Qualquer pessoa".
5. Copiar a URL terminada em `/exec` para `planilhaUrl` em `config.js`.

A aba `Leads` é criada no primeiro envio, com as colunas: data/hora, nome, telefone, UF,
origem do clique, parâmetros do anúncio (utm e ID do clique do Google ou da Meta) e página.

Ao alterar `Code.gs`, é preciso criar uma nova versão da implantação para a mudança valer.

## Publicação

Qualquer hospedagem estática serve (GitHub Pages, Netlify, Vercel, Cloudflare Pages).
Para Google Ads, usar domínio próprio com HTTPS.

## Pendências antes de publicar

- [ ] Valores e regras das campanhas para o bloco "a partir de" (a cliente vai enviar)
- [ ] Aprovação da Aline (versão de exemplo com a Vanessa)
- [ ] Trocar `assets/vanessa.jpg` pela foto original (a atual foi recortada de um card e tem baixa resolução)
- [ ] Revisar a política de privacidade antes de publicar
- [ ] Criar a planilha e preencher `planilhaUrl`
- [ ] Preencher `metaPixel` e testar o evento Lead (a cliente anuncia na Meta; Google Ads ainda não tem conta)
- [ ] Domínio

## Cuidados

- O site é da corretora, não da operadora: manter essa identificação no topo e no rodapé.
- A campanha de carência zero vale para contratos assinados até 31/10/2026. Depois disso,
  atualizar `campanha` e os textos da faixa e do rodapé em `index.html`.
