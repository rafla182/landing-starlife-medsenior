# Landing do corretor · MedSênior

Landing page de corretor autorizado MedSênior para captação de cotações. A página é genérica e
direciona para o atendimento do corretor configurado (hoje, a Vanessa Rodrigues).
Site estático (HTML, CSS e JavaScript puros), sem build.

## Como funciona

1. Todos os botões da página levam ao mesmo formulário (nome, telefone, e-mail opcional, CEP e vínculo com empresa).
2. Ao enviar, o lead é gravado em uma Planilha Google e a corretora recebe um e-mail de aviso.
3. Em seguida o WhatsApp abre com a mensagem pronta.

Os leads vão para o WhatsApp, a planilha e o e-mail do corretor da página.

Só entra na planilha quem preenche o formulário, e todo mundo que vai para o WhatsApp passa por ele.

## Arquivos

| Arquivo | O que é |
| --- | --- |
| `index.html` | A página |
| `styles.css` | Estilos |
| `script.js` | Formulário, CEP, campanha, envio do lead |
| `config.js` | **Configuração do dia a dia** (WhatsApp, planilha, campanha, preço, Google Ads) |
| `privacidade.html` | Política de privacidade (rascunho) |
| `assets/og-medsenior.jpg` | Prévia do link no WhatsApp (1200×630), versão genérica |
| `assets/og-vanessa-v2.jpg` | Prévia com a foto da Vanessa, para quando `quemAtende.mostrar` for `true` |
| `assets/topo.jpg` | Foto de fundo do topo (provisória) |
| `assets/foto-*.jpg` | Fotos das seções "O que o plano oferece" e da campanha |
| `_redirects` | Rotas do Netlify para as páginas por estado |
| `apps-script/Code.gs` | Código que roda na Planilha Google e recebe os leads |

## Rodar localmente

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

## Configuração (`config.js`)

- `whatsapp`: número que recebe os contatos, com 55 + DDD, só dígitos.
- `planilhaUrl`: URL do Web App do Apps Script (abaixo). Vazio = o lead não é gravado.
- `fotoTopo`: foto de fundo do topo (imagem larga). Vazio = fundo verde liso.
- O estado vem do CEP digitado (faixas dos Correios, sem lista fixa de estados atendidos). A cidade é
  completada pelo ViaCEP quando disponível; se o ViaCEP falhar, o lead segue só com o estado.
- `campanha`: `ativa` liga o selo e a faixa de carência zero; depois de `fim` eles somem sozinhos.
- `preco`: bloco "a partir de". Só ligar com valor real e contratável, e preencher a referência.
- `quemAtende`: quem atende os leads. Com `mostrar: false` (padrão) a página é genérica, sem nome
  nem foto, e os leads vão para o `whatsapp` configurado. Com `mostrar: true`, o nome aparece no topo
  e no rodapé e entra a seção "Quem atende você". Para outro corretor, troque esses dados e o `whatsapp`.
  O nome do corretor fica sempre na política de privacidade, porque a LGPD exige identificar o responsável.
- `metaPixel`: ID do Pixel da Meta. Dispara `PageView` ao abrir e `Lead` quando o formulário é enviado.
- `googleAds`: `id` da conta e rótulo de `conversao`, disparada quando o formulário é enviado.

Tudo em `config.js` é público para quem abre a página. Não colocar senhas ali.

## Páginas por estado

A mesma página serve a todos os estados. `/go` (ou `/go/`, ou `?uf=GO`) mostra
"Plano de saúde MedSênior em Goiás" no título; sem sigla, a página é nacional. Funciona para as
27 siglas sem editar nada. Em `config.js`, `estados` permite dar a um estado WhatsApp e foto próprios.

Nos anúncios, segmente cada campanha por região e use o link do estado correspondente,
por exemplo `https://SEU-DOMINIO/go?utm_source=meta&utm_campaign=goias`. A planilha registra
de qual página do estado veio cada lead. As rotas dependem do arquivo `_redirects` (Netlify).

A prévia do WhatsApp (`og:*`) é a mesma para todos os estados, porque os robôs não executam JavaScript.

## Planilha e e-mail de aviso

1. Criar uma Planilha Google na conta da corretora.
2. Em **Extensões → Apps Script**, colar o conteúdo de `apps-script/Code.gs`.
3. Em **Configurações do projeto → Propriedades do script**, criar `EMAIL_AVISO` com o e-mail
   que deve receber os avisos.
4. **Implantar → Nova implantação → App da Web**, executar como "Eu" e acesso "Qualquer pessoa".
5. Copiar a URL terminada em `/exec` para `planilhaUrl` em `config.js`.

A aba `Leads` é criada no primeiro envio, com as colunas: data/hora, nome, telefone, e-mail, CEP,
cidade, UF, vínculo com empresa, origem do clique, parâmetros do anúncio (utm e ID do clique do Google ou da Meta) e página.

Ao alterar `Code.gs`, é preciso criar uma nova versão da implantação para a mudança valer.

## Publicação

Qualquer hospedagem estática serve (GitHub Pages, Netlify, Vercel, Cloudflare Pages).
Para Google Ads, usar domínio próprio com HTTPS.

## Pendências antes de publicar

- [ ] Valores e regras das campanhas para o bloco "a partir de" (a cliente vai enviar)
- [ ] Aprovação da Aline (versão de exemplo com a Vanessa)
- [ ] Revisar a política de privacidade antes de publicar
- [ ] Criar a planilha e preencher `planilhaUrl`
- [ ] Preencher `metaPixel` e testar o evento Lead (a cliente anuncia na Meta; Google Ads ainda não tem conta)
- [ ] Domínio definitivo (hoje a página está em `landing-starlife-medsenior.netlify.app`). Ao trocar,
  atualizar `og:url` e `og:image` em `index.html`

## Cuidados

- A página é do corretor e não pode ter a identidade visual da corretora (StarLife).
- Não é o site da operadora: manter "corretora autorizada MedSênior" no topo e o aviso no rodapé.
- A campanha de carência zero vale para contratos assinados até 31/10/2026. Depois disso,
  atualizar `campanha` e os textos da faixa e do rodapé em `index.html`.
