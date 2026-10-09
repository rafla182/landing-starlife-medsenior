(function () {
  'use strict';

  var cfg = window.LP_CONFIG || {};

  var UFS = [
    { id: 'ES', nome: 'Espírito Santo', prep: 'no' },
    { id: 'SP', nome: 'São Paulo', prep: 'em' },
    { id: 'RJ', nome: 'Rio de Janeiro', prep: 'no' },
    { id: 'MG', nome: 'Minas Gerais', prep: 'em' },
    { id: 'PR', nome: 'Paraná', prep: 'no' },
    { id: 'RS', nome: 'Rio Grande do Sul', prep: 'no' },
    { id: 'PE', nome: 'Pernambuco', prep: 'em' },
    { id: 'DF', nome: 'Distrito Federal', prep: 'no' }
  ];

  var params = new URLSearchParams(window.location.search);
  var $ = function (sel) { return document.querySelector(sel); };
  var $$ = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };

  function mostrar(sel, visivel) {
    $$(sel).forEach(function (el) { el.hidden = !visivel; });
  }

  /* ---------- Estado (UF) ---------- */

  function ufValida(id) {
    return UFS.filter(function (u) { return u.id === id; })[0];
  }

  var ufAtual = (ufValida((params.get('uf') || '').toUpperCase()) || ufValida(cfg.ufPadrao) || UFS[0]).id;

  function desenharUfs() {
    var caixa = $('#ufs');
    caixa.textContent = '';
    UFS.forEach(function (u) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'uf';
      b.textContent = u.id;
      b.title = u.nome;
      b.setAttribute('aria-label', u.nome);
      b.setAttribute('aria-pressed', String(u.id === ufAtual));
      b.addEventListener('click', function () {
        ufAtual = u.id;
        desenharUfs();
      });
      caixa.appendChild(b);
    });
    var u = ufValida(ufAtual);
    $$('[data-uf-titulo]').forEach(function (el) { el.textContent = u.prep + ' ' + u.nome; });
  }

  /* ---------- Campanha e preço ---------- */

  function campanhaAtiva() {
    var c = cfg.campanha || {};
    if (!c.ativa) return false;
    if (!c.fim) return true;
    // Vale até o fim do dia "fim" no horário de Brasília (UTC-3).
    return Date.now() <= new Date(c.fim + 'T23:59:59-03:00').getTime();
  }

  function aplicarOferta() {
    var c = cfg.campanha || {};
    mostrar('[data-campanha]', campanhaAtiva());
    if (c.fim) {
      var p = c.fim.split('-');
      $$('[data-campanha-fim]').forEach(function (el) { el.textContent = p[2] + '/' + p[1] + '/' + p[0]; });
    }
    var quem = cfg.quemAtende || {};
    mostrar('[data-quem]', !!quem.mostrar);
    $$('[data-quem-foto]').forEach(function (el) {
      if (quem.foto) { el.src = quem.foto; el.alt = quem.nome || ''; el.hidden = false; }
    });
    $$('[data-quem-botao]').forEach(function (el) { if (quem.nome) el.textContent = 'Falar com ' + quem.nome; });
    $$('[data-quem-texto]').forEach(function (el) {
      el.textContent = '';
      (quem.paragrafos || []).forEach(function (t) {
        var p = document.createElement('p');
        p.textContent = t;
        el.appendChild(p);
      });
    });

    var preco = cfg.preco || {};
    mostrar('[data-preco]', !!preco.mostrar);
    $$('[data-preco-valor]').forEach(function (el) { el.textContent = preco.valor || ''; });
    $$('[data-preco-ref]').forEach(function (el) { el.textContent = preco.referencia || ''; });
    $$('[data-preco-nota]').forEach(function (el) { el.textContent = preco.nota || ''; });
  }

  /* ---------- Origem do clique ---------- */

  var origem = 'formulario';
  $$('[data-origem]').forEach(function (el) {
    el.addEventListener('click', function () {
      origem = el.getAttribute('data-origem');
      window.setTimeout(function () { $('#lead-nome').focus({ preventScroll: true }); }, 400);
    });
  });

  /* ---------- Formulário ---------- */

  var form = $('#form-lead');
  var sucesso = $('#form-sucesso');
  var erro = $('#form-erro');
  var nome = $('#lead-nome');
  var fone = $('#lead-fone');

  function mascara(v) {
    var d = String(v).replace(/\D/g, '').slice(0, 11);
    if (d.length < 3) return d.length ? '(' + d : '';
    if (d.length < 8) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(d.length - 4);
  }

  fone.addEventListener('input', function () { fone.value = mascara(fone.value); });

  function falha(campo, msg) {
    erro.textContent = msg;
    erro.hidden = false;
    campo.setAttribute('aria-invalid', 'true');
    campo.focus();
  }

  function limparErro() {
    erro.hidden = true;
    nome.removeAttribute('aria-invalid');
    fone.removeAttribute('aria-invalid');
  }

  function linkWhatsapp(n) {
    var u = ufValida(ufAtual);
    var texto = 'Olá! Sou ' + n + ', de ' + u.nome + '. Quero uma cotação do plano MedSênior.';
    return 'https://wa.me/' + (cfg.whatsapp || '') + '?text=' + encodeURIComponent(texto);
  }

  function gravar(lead) {
    if (!cfg.planilhaUrl) {
      console.warn('planilhaUrl vazio em config.js: o lead não foi gravado na planilha.');
      return;
    }
    var corpo = JSON.stringify(lead);
    // sendBeacon continua o envio mesmo com a página saindo para o WhatsApp.
    var enviado = false;
    if (navigator.sendBeacon) {
      enviado = navigator.sendBeacon(cfg.planilhaUrl, new Blob([corpo], { type: 'text/plain;charset=UTF-8' }));
    }
    if (!enviado) {
      fetch(cfg.planilhaUrl, { method: 'POST', mode: 'no-cors', keepalive: true, body: corpo }).catch(function () {});
    }
  }

  function conversao() {
    var g = cfg.googleAds || {};
    if (g.conversao && typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', { send_to: g.conversao });
    }
    if (cfg.metaPixel && typeof window.fbq === 'function') {
      window.fbq('track', 'Lead');
    }
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    limparErro();

    var n = nome.value.trim().replace(/\s+/g, ' ');
    var digitos = fone.value.replace(/\D/g, '');

    if (n.length < 2) return falha(nome, 'Informe seu nome.');
    if (digitos.length < 10 || digitos.length > 11) return falha(fone, 'Informe o WhatsApp com DDD.');

    var url = linkWhatsapp(n);

    // O campo isca só é preenchido por robôs: nesse caso não grava nem conta conversão.
    if (!form.elements.site.value) {
      gravar({
        nome: n,
        telefone: fone.value,
        uf: ufAtual,
        origem: origem,
        utm_source: params.get('utm_source') || '',
        utm_medium: params.get('utm_medium') || '',
        utm_campaign: params.get('utm_campaign') || '',
        utm_term: params.get('utm_term') || '',
        utm_content: params.get('utm_content') || '',
        gclid: params.get('gclid') || params.get('gbraid') || params.get('wbraid') || params.get('fbclid') || '',
        pagina: window.location.origin + window.location.pathname,
        site: ''
      });
      conversao();
    }

    $$('[data-primeiro-nome]').forEach(function (el) { el.textContent = ', ' + n.split(' ')[0]; });
    $('#link-whatsapp').href = url;
    form.hidden = true;
    sucesso.hidden = false;
    $('#sucesso-titulo').focus();

    // Abre o WhatsApp. Se o navegador bloquear a nova aba, segue na mesma.
    // (Sem 'noopener' no window.open, porque com ele o retorno é sempre null.)
    var aba = window.open(url, '_blank');
    if (aba) {
      aba.opener = null;
    } else if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.location.href = url;
    }
  });

  $('#corrigir').addEventListener('click', function () {
    sucesso.hidden = true;
    form.hidden = false;
    nome.focus();
  });

  /* ---------- Google Ads ---------- */

  function carregarAds() {
    var g = cfg.googleAds || {};
    if (!g.id) return;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(g.id);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', g.id);
  }

  /* ---------- Pixel da Meta ---------- */

  function carregarPixel() {
    if (!cfg.metaPixel || window.fbq) return;
    var n = window.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    window._fbq = n;
    n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(s);
    window.fbq('init', String(cfg.metaPixel));
    window.fbq('track', 'PageView');
  }

  desenharUfs();
  aplicarOferta();
  carregarAds();
  carregarPixel();
})();
