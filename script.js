(function () {
  'use strict';

  var cfg = window.LP_CONFIG || {};

  // Faixas de CEP por estado (Correios). Usadas para saber o estado sem depender de internet.
  var FAIXAS_CEP = [
    [1000, 19999, 'SP'], [20000, 28999, 'RJ'], [29000, 29999, 'ES'], [30000, 39999, 'MG'],
    [40000, 48999, 'BA'], [49000, 49999, 'SE'], [50000, 56999, 'PE'], [57000, 57999, 'AL'],
    [58000, 58999, 'PB'], [59000, 59999, 'RN'], [60000, 63999, 'CE'], [64000, 64999, 'PI'],
    [65000, 65999, 'MA'], [66000, 68899, 'PA'], [68900, 68999, 'AP'], [69000, 69299, 'AM'],
    [69300, 69399, 'RR'], [69400, 69899, 'AM'], [69900, 69999, 'AC'], [70000, 72799, 'DF'],
    [72800, 72999, 'GO'], [73000, 73699, 'DF'], [73700, 76799, 'GO'], [76800, 76999, 'RO'],
    [77000, 77999, 'TO'], [78000, 78899, 'MT'], [79000, 79999, 'MS'], [80000, 87999, 'PR'],
    [88000, 89999, 'SC'], [90000, 99999, 'RS']
  ];

  var ESTADOS = {
    AC: ['Acre', 'no'], AL: ['Alagoas', 'em'], AP: ['Amapá', 'no'], AM: ['Amazonas', 'no'],
    BA: ['Bahia', 'na'], CE: ['Ceará', 'no'], DF: ['Distrito Federal', 'no'], ES: ['Espírito Santo', 'no'],
    GO: ['Goiás', 'em'], MA: ['Maranhão', 'no'], MT: ['Mato Grosso', 'em'], MS: ['Mato Grosso do Sul', 'em'],
    MG: ['Minas Gerais', 'em'], PA: ['Pará', 'no'], PB: ['Paraíba', 'na'], PR: ['Paraná', 'no'],
    PE: ['Pernambuco', 'em'], PI: ['Piauí', 'no'], RJ: ['Rio de Janeiro', 'no'], RN: ['Rio Grande do Norte', 'no'],
    RS: ['Rio Grande do Sul', 'no'], RO: ['Rondônia', 'em'], RR: ['Roraima', 'em'], SC: ['Santa Catarina', 'em'],
    SP: ['São Paulo', 'em'], SE: ['Sergipe', 'em'], TO: ['Tocantins', 'no']
  };

  var params = new URLSearchParams(window.location.search);

  // Página por estado: /go, /go/ ou ?uf=GO. Sem estado = página nacional.
  var ufPagina = (function () {
    var porLink = (params.get('uf') || '').toUpperCase();
    var porCaminho = (window.location.pathname.split('/').filter(Boolean)[0] || '').toUpperCase();
    if (ESTADOS[porLink]) return porLink;
    if (ESTADOS[porCaminho]) return porCaminho;
    var padrao = String(cfg.ufPadrao || '').toUpperCase();
    return ESTADOS[padrao] ? padrao : '';
  })();
  var estadoCfg = (cfg.estados && cfg.estados[ufPagina]) || {};
  if (estadoCfg.whatsapp) cfg.whatsapp = estadoCfg.whatsapp;
  if (estadoCfg.fotoTopo) cfg.fotoTopo = estadoCfg.fotoTopo;
  var $ = function (sel) { return document.querySelector(sel); };
  var $$ = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };

  function mostrar(sel, visivel) {
    $$(sel).forEach(function (el) { el.hidden = !visivel; });
  }

  /* ---------- CEP ---------- */

  function ufDoCep(digitos) {
    if (digitos.length !== 8) return '';
    var n = parseInt(digitos.slice(0, 5), 10);
    for (var i = 0; i < FAIXAS_CEP.length; i++) {
      if (n >= FAIXAS_CEP[i][0] && n <= FAIXAS_CEP[i][1]) return FAIXAS_CEP[i][2];
    }
    return '';
  }

  var local = { cep: '', uf: '', cidade: '' };

  function consultarCidade(digitos) {
    // ViaCEP completa a cidade. Se falhar, o estado já vem da faixa do CEP.
    if (!window.fetch) return;
    fetch('https://viacep.com.br/ws/' + digitos + '/json/')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (local.cep !== digitos || !d || d.erro) return;
        local.cidade = d.localidade || '';
        if (d.uf) local.uf = d.uf;
        mostrarLocal();
      })
      .catch(function () {});
  }

  function mostrarLocal() {
    var ajuda = $('#cep-local');
    ajuda.textContent = local.uf ? (local.cidade ? local.cidade + ' - ' : '') + local.uf : '';
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
    if (quem.mostrar && quem.nomeCompleto) {
      var titulo = quem.titulo || 'Corretor autorizado MedSênior';
      $$('[data-corretor-nome]').forEach(function (el) { el.textContent = quem.nomeCompleto; });
      $$('[data-corretor-titulo]').forEach(function (el) { el.textContent = titulo; });
      $$('[data-corretor-rodape]').forEach(function (el) { el.textContent = quem.nomeCompleto + ' · ' + titulo; });
    }
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
  var email = $('#lead-email');
  var cep = $('#lead-cep');

  function mascara(v) {
    var d = String(v).replace(/\D/g, '').slice(0, 11);
    if (d.length < 3) return d.length ? '(' + d : '';
    if (d.length < 8) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(d.length - 4);
  }

  fone.addEventListener('input', function () { fone.value = mascara(fone.value); });

  $$('input[name="vinculo"]').forEach(function (r) {
    r.addEventListener('change', function () {
      if (!erro.hidden && erro.textContent.indexOf('vínculo') >= 0) limparErro();
    });
  });

  cep.addEventListener('input', function () {
    var d = cep.value.replace(/\D/g, '').slice(0, 8);
    cep.value = d.length > 5 ? d.slice(0, 5) + '-' + d.slice(5) : d;
    if (d === local.cep) return;
    local = { cep: d, uf: ufDoCep(d), cidade: '' };
    mostrarLocal();
    if (local.uf) consultarCidade(d);
  });

  function falha(campo, msg) {
    erro.textContent = msg;
    erro.hidden = false;
    campo.setAttribute('aria-invalid', 'true');
    campo.focus();
  }

  function limparErro() {
    erro.hidden = true;
    [nome, fone, email, cep, $('#lead-aceite')].concat($$('input[name="vinculo"]')).forEach(function (c) { c.removeAttribute('aria-invalid'); });
  }

  function linkWhatsapp(n) {
    var onde = local.cidade ? local.cidade + ' - ' + local.uf : local.uf ? local.uf : 'CEP ' + cep.value;
    var texto = 'Olá! Sou ' + n + ', de ' + onde + '. Quero uma cotação do plano MedSênior.';
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
    if (digitos.length < 10 || digitos.length > 11) return falha(fone, 'Informe o telefone com DDD.');
    var em = email.value.trim();
    if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return falha(email, 'Confira o e-mail ou deixe o campo em branco.');
    if (!ufDoCep(cep.value.replace(/\D/g, ''))) return falha(cep, 'Informe um CEP válido, com 8 números.');
    var vinculo = form.elements.vinculo.value;
    if (!vinculo) return falha(form.querySelector('input[name="vinculo"]'), 'Responda se você possui vínculo com uma empresa ou é MEI.');
    var aceite = $('#lead-aceite');
    if (!aceite.checked) return falha(aceite, 'Para enviar, marque a autorização de contato.');

    var url = linkWhatsapp(n);

    // O campo isca só é preenchido por robôs: nesse caso não grava nem conta conversão.
    if (!form.elements.site.value) {
      gravar({
        nome: n,
        telefone: fone.value,
        email: em,
        cep: cep.value,
        uf: local.uf,
        cidade: local.cidade,
        vinculo: vinculo,
        aceite: 'sim',
        aceite_em: new Date().toISOString(),
        pagina_uf: ufPagina,
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

  /* ---------- Foto do topo ---------- */

  function aplicarEstado() {
    if (!ufPagina) return;
    var e = ESTADOS[ufPagina];
    $$('[data-uf-titulo]').forEach(function (el) { el.textContent = ' ' + e[1] + ' ' + e[0]; });
    document.title = 'Plano de saúde MedSênior ' + e[1] + ' ' + e[0] + ' | Cotação com corretor autorizado';
  }

  function aplicarLogoOperadora() {
    if (cfg.logoOperadora === false) mostrar('[data-logo-operadora]', false);
  }

  function aplicarFotoTopo() {
    var hero = $('[data-hero]');
    if (!hero || !cfg.fotoTopo) return;
    hero.classList.add('banner--foto');
    hero.style.setProperty('--foto-topo', 'url("' + cfg.fotoTopo + '")');
  }

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

  aplicarEstado();
  aplicarFotoTopo();
  aplicarLogoOperadora();
  aplicarOferta();
  carregarAds();
  carregarPixel();
})();
