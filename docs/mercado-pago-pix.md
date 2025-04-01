<div><div><h1 id="bookmark_pix">Pix</h1></div><p>Pix é um meio de pagamento eletrônico instantâneo oferecido pelo Banco Central do Brasil a pessoas físicas e jurídicas. Através do Checkout Transparente, é possível oferecer esta opção de pagamento por meio de código QR ou código de pagamento.</p><div class=""><div><div class="andes-message andes-message--accent andes-message--quiet" id=":r11:"><div class="andes-message__border-color--accent"></div><div class="andes-badge andes-badge--pill andes-badge--accent andes-message__badge andes-badge--pill-icon andes-badge--small" id=":r11:-notification"><div aria-hidden="true" class="andes-badge__icon"><svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M15.3906 18.2169V16.7169H13.0937V9.63989H9.24068V11.1399H10.9062V16.7169H8.70337V18.2169H15.3906Z" fill="white"></path><path d="M13.1181 6.87168C13.1181 7.58447 12.5403 8.1623 11.8275 8.1623C11.1147 8.1623 10.5369 7.58447 10.5369 6.87168C10.5369 6.15889 11.1147 5.58105 11.8275 5.58105C12.5403 5.58105 13.1181 6.15889 13.1181 6.87168Z" fill="white"></path></svg></div></div><div class="andes-message__content"><div class="andes-message__title andes-message__title--accent">Importante</div><div class="andes-message__text andes-message__text--accent"><div>Além das opções disponíveis nesta documentação, também é possível integrar <strong>pagamentos com Pix</strong> utilizando o <strong>Brick de Payment</strong>. Veja a documentação <a href="https://www.mercadopago.com.br/developers/pt/docs/checkout-bricks/payment-brick/default-rendering#editor_2" target="_blank" class="custom-link ">
        Renderização padrão
      </a> de Payment para mais detalhes.</div></div></div></div></div></div><p>Para integrar pagamentos via Pix, siga as etapas abaixo, mas caso você já tenha integrado pagamentos via cartão, inicie a integração a partir da etapa <a target="_blank" href="https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-configuration/integrate-with-pix#bookmark_Adicionar_formul%C3%A1rio_de_pagamento" node="[object Object]" class="undefined custom-link ">Adicionar formulário de pagamento</a>.</p><div><h2 id="bookmark_importar_mercadopago.js">Importar MercadoPago.js</h2></div><p>Após a criação das chaves Pix, é preciso realizar a captura de dados para pagamento. Esta captura é feita a partir da inclusão da biblioteca MercadoPago.js em seu projeto, seguida do formulário de pagamento. Utilize o código abaixo para importar a biblioteca MercadoPago.js antes de adicionar o formulário de pagamento.</p><div>  <div class="code-container">
    <div class="code-container__header u-clearfix no-overflow">
      <ul class="nav nav-tabs desktop-only" role="tablist"><li role="presentation" class="active">   
      <a href="https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-configuration/integrate-with-pix#editor_1" aria-controls="home" role="tab" data-toggle="tab" class="code_tab_selector" language-type="html">
        html
      </a>
    </li><li role="presentation">   
      <a href="https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-configuration/integrate-with-pix#editor_2" aria-controls="home" role="tab" data-toggle="tab" class="code_tab_selector" language-type="bash">
        bash
      </a>
    </li></ul>
      <select class="tab-select mobile-only" role="tablist"><option value="editor_1" role="tab" data-toggle="tab" class="code_tab_selector" language-type="html">
    html
  </option><option value="editor_2" role="tab" data-toggle="tab" class="code_tab_selector" language-type="bash">
    bash
  </option></select>
    </div>
    <div class="tab-content">
    <div role="tabpanel" class="tab-pane active">
      <div id="editor_child_1" class="code_editor" language-type="html"><pre class="line-numbers language-html" data-line="" tabindex="0">          <code id="code_1" class="language-html">
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>body</span><span class="token punctuation">&gt;</span></span>
  <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>script</span> <span class="token attr-name">src</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>https://sdk.mercadopago.com/js/v2<span class="token punctuation">"</span></span><span class="token punctuation">&gt;</span></span><span class="token script"></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>script</span><span class="token punctuation">&gt;</span></span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>body</span><span class="token punctuation">&gt;</span></span>
<span aria-hidden="true" class="line-numbers-rows"><span></span><span></span><span></span><span></span></span></code>
        </pre>
      </div>
      <button type="button" class="ui-button ui-button--secondary ui-button--small btn-copy-code" data-snippet-id="1">Copiar
  </button>
    </div>
    <div role="tabpanel" class="tab-pane">
      <div id="editor_child_2" class="code_editor" language-type="bash"><pre class="line-numbers language-bash" data-line="" tabindex="0">          <code id="code_2" class="language-bash">
<span class="token function">npm</span> <span class="token function">install</span> @mercadopago/sdk-js

<span aria-hidden="true" class="line-numbers-rows"><span></span><span></span><span></span></span></code>
        </pre>
      </div>
      <button type="button" class="ui-button ui-button--secondary ui-button--small btn-copy-code" data-snippet-id="2">Copiar
  </button>
    </div>
  </div>
  </div></div><div><h2 id="bookmark_configurar_credencial">Configurar credencial</h2></div><p>As credenciais são chaves únicas com as quais identificamos uma integração na sua conta. Servem para capturar pagamentos em lojas virtuais e outras aplicações de forma segura.</p><p>Esta é a primeira etapa de uma estrutura completa de código que deverá ser seguida para a correta integração do pagamento via Pix. Atente-se aos blocos abaixo para adicionar aos códigos conforme indicado.</p><div>  <div class="code-container">
    <div class="code-container__header u-clearfix no-overflow">
      <ul class="nav nav-tabs desktop-only" role="tablist"><li role="presentation" class="active">   
      <a href="https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-configuration/integrate-with-pix#editor_3" aria-controls="home" role="tab" data-toggle="tab" class="code_tab_selector" language-type="html">
        html
      </a>
    </li><li role="presentation">   
      <a href="https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-configuration/integrate-with-pix#editor_4" aria-controls="home" role="tab" data-toggle="tab" class="code_tab_selector" language-type="javascript">
        javascript
      </a>
    </li></ul>
      <select class="tab-select mobile-only" role="tablist"><option value="editor_3" role="tab" data-toggle="tab" class="code_tab_selector" language-type="html">
    html
  </option><option value="editor_4" role="tab" data-toggle="tab" class="code_tab_selector" language-type="javascript">
    javascript
  </option></select>
    </div>
    <div class="tab-content">
    <div role="tabpanel" class="tab-pane active">
      <div id="editor_child_3" class="code_editor" language-type="html"><pre class="line-numbers language-html" data-line="" tabindex="0">          <code id="code_3" class="language-html">
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>script</span><span class="token punctuation">&gt;</span></span><span class="token script"><span class="token language-javascript">
  <span class="token keyword">const</span> mp <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">MercadoPago</span><span class="token punctuation">(</span><span class="token string">"YOUR_PUBLIC_KEY"</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>script</span><span class="token punctuation">&gt;</span></span>
<span aria-hidden="true" class="line-numbers-rows"><span></span><span></span><span></span><span></span></span></code>
        </pre>
      </div>
      <button type="button" class="ui-button ui-button--secondary ui-button--small btn-copy-code" data-snippet-id="3">Copiar
  </button>
    </div>
    <div role="tabpanel" class="tab-pane">
      <div id="editor_child_4" class="code_editor" language-type="javascript"><pre class="line-numbers language-javascript" data-line="" tabindex="0">          <code id="code_4" class="language-javascript">
<span class="token keyword">import</span> <span class="token punctuation">{</span> loadMercadoPago <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">"@mercadopago/sdk-js"</span><span class="token punctuation">;</span>


<span class="token keyword">await</span> <span class="token function">loadMercadoPago</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token keyword">const</span> mp <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">window<span class="token punctuation">.</span>MercadoPago</span><span class="token punctuation">(</span><span class="token string">"YOUR_PUBLIC_KEY"</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span aria-hidden="true" class="line-numbers-rows"><span></span><span></span><span></span><span></span><span></span><span></span></span></code>
        </pre>
      </div>
      <button type="button" class="ui-button ui-button--secondary ui-button--small btn-copy-code" data-snippet-id="4">Copiar
  </button>
    </div>
  </div>
  </div></div><div><h2 id="adicionarformulriodepagamento">Adicionar formulário de pagamento</h2></div><p>Com a biblioteca MercadoPago.js incluída e a credencial configurada, adicione o formulário de pagamento abaixo ao seu projeto para garantir a captura segura dos dados dos clientes.</p><div>  <div class="code-container">
    <div class="code-container__header u-clearfix no-overflow">
      <ul class="nav nav-tabs desktop-only" role="tablist"><li role="presentation" class="active">   
      <a href="https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-configuration/integrate-with-pix#editor_5" aria-controls="home" role="tab" data-toggle="tab" class="code_tab_selector" language-type="html">
        html
      </a>
    </li></ul>
      <select class="tab-select mobile-only" role="tablist"><option value="editor_5" role="tab" data-toggle="tab" class="code_tab_selector" language-type="html">
    html
  </option></select>
    </div>
    <div class="tab-content">
    <div role="tabpanel" class="tab-pane active">
      <div id="editor_child_5" class="code_editor" language-type="html"><pre class="line-numbers language-html" data-line="" tabindex="0">          <code id="code_5" class="language-html">
  <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>form</span> <span class="token attr-name">id</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>form-checkout<span class="token punctuation">"</span></span> <span class="token attr-name">action</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>/process_payment<span class="token punctuation">"</span></span> <span class="token attr-name">method</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>post<span class="token punctuation">"</span></span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span><span class="token punctuation">&gt;</span></span>
      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span><span class="token punctuation">&gt;</span></span>
        <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>label</span> <span class="token attr-name">for</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>payerFirstName<span class="token punctuation">"</span></span><span class="token punctuation">&gt;</span></span>Nome<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>label</span><span class="token punctuation">&gt;</span></span>
        <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>input</span> <span class="token attr-name">id</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>form-checkout__payerFirstName<span class="token punctuation">"</span></span> <span class="token attr-name">name</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>payerFirstName<span class="token punctuation">"</span></span> <span class="token attr-name">type</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>text<span class="token punctuation">"</span></span><span class="token punctuation">&gt;</span></span>
      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">&gt;</span></span>
      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span><span class="token punctuation">&gt;</span></span>
        <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>label</span> <span class="token attr-name">for</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>payerLastName<span class="token punctuation">"</span></span><span class="token punctuation">&gt;</span></span>Sobrenome<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>label</span><span class="token punctuation">&gt;</span></span>
        <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>input</span> <span class="token attr-name">id</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>form-checkout__payerLastName<span class="token punctuation">"</span></span> <span class="token attr-name">name</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>payerLastName<span class="token punctuation">"</span></span> <span class="token attr-name">type</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>text<span class="token punctuation">"</span></span><span class="token punctuation">&gt;</span></span>
      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">&gt;</span></span>
      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span><span class="token punctuation">&gt;</span></span>
        <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>label</span> <span class="token attr-name">for</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>email<span class="token punctuation">"</span></span><span class="token punctuation">&gt;</span></span>E-mail<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>label</span><span class="token punctuation">&gt;</span></span>
        <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>input</span> <span class="token attr-name">id</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>form-checkout__email<span class="token punctuation">"</span></span> <span class="token attr-name">name</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>email<span class="token punctuation">"</span></span> <span class="token attr-name">type</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>text<span class="token punctuation">"</span></span><span class="token punctuation">&gt;</span></span>
      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">&gt;</span></span>
      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span><span class="token punctuation">&gt;</span></span>
        <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>label</span> <span class="token attr-name">for</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>identificationType<span class="token punctuation">"</span></span><span class="token punctuation">&gt;</span></span>Tipo de documento<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>label</span><span class="token punctuation">&gt;</span></span>
        <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>select</span> <span class="token attr-name">id</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>form-checkout__identificationType<span class="token punctuation">"</span></span> <span class="token attr-name">name</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>identificationType<span class="token punctuation">"</span></span> <span class="token attr-name">type</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>text<span class="token punctuation">"</span></span><span class="token punctuation">&gt;</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>select</span><span class="token punctuation">&gt;</span></span>
      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">&gt;</span></span>
      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span><span class="token punctuation">&gt;</span></span>
        <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>label</span> <span class="token attr-name">for</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>identificationNumber<span class="token punctuation">"</span></span><span class="token punctuation">&gt;</span></span>Número do documento<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>label</span><span class="token punctuation">&gt;</span></span>
        <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>input</span> <span class="token attr-name">id</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>form-checkout__identificationNumber<span class="token punctuation">"</span></span> <span class="token attr-name">name</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>identificationNumber<span class="token punctuation">"</span></span> <span class="token attr-name">type</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>text<span class="token punctuation">"</span></span><span class="token punctuation">&gt;</span></span>
      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">&gt;</span></span>

    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span><span class="token punctuation">&gt;</span></span>
      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span><span class="token punctuation">&gt;</span></span>
        <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>input</span> <span class="token attr-name">type</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>hidden<span class="token punctuation">"</span></span> <span class="token attr-name">name</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>transactionAmount<span class="token punctuation">"</span></span> <span class="token attr-name">id</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>transactionAmount<span class="token punctuation">"</span></span> <span class="token attr-name">value</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>100<span class="token punctuation">"</span></span><span class="token punctuation">&gt;</span></span>
        <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>input</span> <span class="token attr-name">type</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>hidden<span class="token punctuation">"</span></span> <span class="token attr-name">name</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>description<span class="token punctuation">"</span></span> <span class="token attr-name">id</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>description<span class="token punctuation">"</span></span> <span class="token attr-name">value</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>Nome do Produto<span class="token punctuation">"</span></span><span class="token punctuation">&gt;</span></span>
        <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>br</span><span class="token punctuation">&gt;</span></span>
        <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>button</span> <span class="token attr-name">type</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>submit<span class="token punctuation">"</span></span><span class="token punctuation">&gt;</span></span>Pagar<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>button</span><span class="token punctuation">&gt;</span></span>
      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">&gt;</span></span>
  <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>form</span><span class="token punctuation">&gt;</span></span>
<span aria-hidden="true" class="line-numbers-rows"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></span></code>
        </pre>
      </div>
      <button type="button" class="ui-button ui-button--secondary ui-button--small btn-copy-code" data-snippet-id="5">Copiar
  </button>
    </div>
  </div>
  </div></div><div><h2 id="bookmark_obter_tipos_de_documento">Obter tipos de documento</h2></div><p>Após configurar a credencial e adicionar o formulário de pagamento, é preciso obter os tipos de documento que farão parte do preenchimento do formulário para pagamento.</p><p>Ao incluir o elemento do tipo <code>select</code> com o id: <code>form-checkout__identificationType</code> que está no formulário, será possível preencher automaticamente as opções disponíveis quando chamar a função a seguir:</p><div>  <div class="code-container">
    <div class="code-container__header u-clearfix no-overflow">
      <ul class="nav nav-tabs desktop-only" role="tablist"><li role="presentation" class="active">   
      <a href="https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-configuration/integrate-with-pix#editor_6" aria-controls="home" role="tab" data-toggle="tab" class="code_tab_selector" language-type="javascript">
        javascript
      </a>
    </li></ul>
      <select class="tab-select mobile-only" role="tablist"><option value="editor_6" role="tab" data-toggle="tab" class="code_tab_selector" language-type="javascript">
    javascript
  </option></select>
    </div>
    <div class="tab-content">
    <div role="tabpanel" class="tab-pane active">
      <div id="editor_child_6" class="code_editor" language-type="javascript"><pre class="line-numbers language-javascript" data-line="" tabindex="0">          <code id="code_6" class="language-javascript">
    <span class="token punctuation">(</span><span class="token keyword">async</span> <span class="token keyword">function</span> <span class="token function">getIdentificationTypes</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token keyword">try</span> <span class="token punctuation">{</span>
        <span class="token keyword">const</span> identificationTypes <span class="token operator">=</span> <span class="token keyword">await</span> mp<span class="token punctuation">.</span><span class="token function">getIdentificationTypes</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">const</span> identificationTypeElement <span class="token operator">=</span> document<span class="token punctuation">.</span><span class="token function">getElementById</span><span class="token punctuation">(</span><span class="token string">'form-checkout__identificationType'</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token function">createSelectOptions</span><span class="token punctuation">(</span>identificationTypeElement<span class="token punctuation">,</span> identificationTypes<span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span>e<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> console<span class="token punctuation">.</span><span class="token function">error</span><span class="token punctuation">(</span><span class="token string">'Error getting identificationTypes: '</span><span class="token punctuation">,</span> e<span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">function</span> <span class="token function">createSelectOptions</span><span class="token punctuation">(</span>elem<span class="token punctuation">,</span> options<span class="token punctuation">,</span> labelsAndKeys <span class="token operator">=</span> <span class="token punctuation">{</span> <span class="token literal-property property">label</span><span class="token operator">:</span> <span class="token string">"name"</span><span class="token punctuation">,</span> <span class="token literal-property property">value</span><span class="token operator">:</span> <span class="token string">"id"</span> <span class="token punctuation">}</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token keyword">const</span> <span class="token punctuation">{</span> label<span class="token punctuation">,</span> value <span class="token punctuation">}</span> <span class="token operator">=</span> labelsAndKeys<span class="token punctuation">;</span>

      elem<span class="token punctuation">.</span>options<span class="token punctuation">.</span>length <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>

      <span class="token keyword">const</span> tempOptions <span class="token operator">=</span> document<span class="token punctuation">.</span><span class="token function">createDocumentFragment</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

      options<span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token parameter">option</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        <span class="token keyword">const</span> optValue <span class="token operator">=</span> option<span class="token punctuation">[</span>value<span class="token punctuation">]</span><span class="token punctuation">;</span>
        <span class="token keyword">const</span> optLabel <span class="token operator">=</span> option<span class="token punctuation">[</span>label<span class="token punctuation">]</span><span class="token punctuation">;</span>

        <span class="token keyword">const</span> opt <span class="token operator">=</span> document<span class="token punctuation">.</span><span class="token function">createElement</span><span class="token punctuation">(</span><span class="token string">'option'</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        opt<span class="token punctuation">.</span>value <span class="token operator">=</span> optValue<span class="token punctuation">;</span>
        opt<span class="token punctuation">.</span>textContent <span class="token operator">=</span> optLabel<span class="token punctuation">;</span>

        tempOptions<span class="token punctuation">.</span><span class="token function">appendChild</span><span class="token punctuation">(</span>opt<span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

      elem<span class="token punctuation">.</span><span class="token function">appendChild</span><span class="token punctuation">(</span>tempOptions<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span aria-hidden="true" class="line-numbers-rows"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></span></code>
        </pre>
      </div>
      <button type="button" class="ui-button ui-button--secondary ui-button--small btn-copy-code" data-snippet-id="6">Copiar
  </button>
    </div>
  </div>
  </div></div><div><h2 id="bookmark_enviar_pagamento">Enviar pagamento</h2></div><p>Ao finalizar a inclusão do formulário de pagamento, é preciso enviar o e-mail do comprador, tipo e número de documento, o meio de pagamento utilizado (pix) e o detalhe do valor.</p><div class=""><div><div class="andes-message andes-message--accent andes-message--quiet" id=":r12:"><div class="andes-message__border-color--accent"></div><div class="andes-badge andes-badge--pill andes-badge--accent andes-message__badge andes-badge--pill-icon andes-badge--small" id=":r12:-notification"><div aria-hidden="true" class="andes-badge__icon"><svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M15.3906 18.2169V16.7169H13.0937V9.63989H9.24068V11.1399H10.9062V16.7169H8.70337V18.2169H15.3906Z" fill="white"></path><path d="M13.1181 6.87168C13.1181 7.58447 12.5403 8.1623 11.8275 8.1623C11.1147 8.1623 10.5369 7.58447 10.5369 6.87168C10.5369 6.15889 11.1147 5.58105 11.8275 5.58105C12.5403 5.58105 13.1181 6.15889 13.1181 6.87168Z" fill="white"></path></svg></div></div><div class="andes-message__content"><div class="andes-message__title andes-message__title--accent">Importante</div><div class="andes-message__text andes-message__text--accent"><div>Ao executar as APIs citadas nesta documentação, você deverá enviar o atributo <code>X-Idempotency-Key</code>. Seu preenchimento é importante para garantir a execução e reexecução de requisições sem que haja situações indesejadas como, por exemplo, pagamentos em duplicidade.</div></div></div></div></div></div><p>Para configurar pagamento com Pix, envie um POST ao endpoint <a target="_blank" href="https://www.mercadopago.com.br/developers/pt/reference/payments/_payments/post" node="[object Object]" class="undefined custom-link ">/v1/payments</a> e execute a requisição ou, se preferir, faça a requisição utilizando nossos SDKs.</p><div>  <div class="code-container">
    <div class="code-container__header u-clearfix no-overflow">
      <ul class="nav nav-tabs desktop-only" role="tablist"><li role="presentation">   
      <a href="https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-configuration/integrate-with-pix#editor_7" aria-controls="home" role="tab" data-toggle="tab" class="code_tab_selector" language-type="php">
        php
      </a>
    </li><li role="presentation" class="active">   
      <a href="https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-configuration/integrate-with-pix#editor_8" aria-controls="home" role="tab" data-toggle="tab" class="code_tab_selector" language-type="node">
        node
      </a>
    </li><li role="presentation">   
      <a href="https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-configuration/integrate-with-pix#editor_9" aria-controls="home" role="tab" data-toggle="tab" class="code_tab_selector" language-type="java">
        java
      </a>
    </li><li role="presentation">   
      <a href="https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-configuration/integrate-with-pix#editor_10" aria-controls="home" role="tab" data-toggle="tab" class="code_tab_selector" language-type="ruby">
        ruby
      </a>
    </li><li role="presentation">   
      <a href="https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-configuration/integrate-with-pix#editor_11" aria-controls="home" role="tab" data-toggle="tab" class="code_tab_selector" language-type="csharp">
        csharp
      </a>
    </li><li role="presentation">   
      <a href="https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-configuration/integrate-with-pix#editor_12" aria-controls="home" role="tab" data-toggle="tab" class="code_tab_selector" language-type="python">
        python
      </a>
    </li><li role="presentation">   
      <a href="https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-configuration/integrate-with-pix#editor_13" aria-controls="home" role="tab" data-toggle="tab" class="code_tab_selector" language-type="go">
        go
      </a>
    </li><li role="presentation">   
      <a href="https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-configuration/integrate-with-pix#editor_14" aria-controls="home" role="tab" data-toggle="tab" class="code_tab_selector" language-type="curl">
        curl
      </a>
    </li></ul>
      <select class="tab-select mobile-only" role="tablist"><option value="editor_7" role="tab" data-toggle="tab" class="code_tab_selector" language-type="php">
    php
  </option><option value="editor_8" role="tab" data-toggle="tab" class="code_tab_selector" language-type="node">
    node
  </option><option value="editor_9" role="tab" data-toggle="tab" class="code_tab_selector" language-type="java">
    java
  </option><option value="editor_10" role="tab" data-toggle="tab" class="code_tab_selector" language-type="ruby">
    ruby
  </option><option value="editor_11" role="tab" data-toggle="tab" class="code_tab_selector" language-type="csharp">
    csharp
  </option><option value="editor_12" role="tab" data-toggle="tab" class="code_tab_selector" language-type="python">
    python
  </option><option value="editor_13" role="tab" data-toggle="tab" class="code_tab_selector" language-type="go">
    go
  </option><option value="editor_14" role="tab" data-toggle="tab" class="code_tab_selector" language-type="curl">
    curl
  </option></select>
    </div>
    <div class="tab-content">
    <div role="tabpanel" class="tab-pane">
      <div id="editor_child_7" class="code_editor" language-type="php"><pre class="line-numbers language-php" data-line="" tabindex="0">          <code id="code_7" class="language-php">
<span class="token php language-php"><span class="token delimiter important">&lt;?php</span>
  <span class="token keyword">use</span> <span class="token package">MercadoPago<span class="token punctuation">\</span>Client<span class="token punctuation">\</span>Payment<span class="token punctuation">\</span>PaymentClient</span><span class="token punctuation">;</span>
  <span class="token keyword">use</span> <span class="token package">MercadoPago<span class="token punctuation">\</span>Client<span class="token punctuation">\</span>Common<span class="token punctuation">\</span>RequestOptions</span><span class="token punctuation">;</span>
  <span class="token keyword">use</span> <span class="token package">MercadoPago<span class="token punctuation">\</span>MercadoPagoConfig</span><span class="token punctuation">;</span>

  <span class="token class-name static-context">MercadoPagoConfig</span><span class="token operator">::</span><span class="token function">setAccessToken</span><span class="token punctuation">(</span><span class="token string double-quoted-string">"YOUR_ACCESS_TOKEN"</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token variable">$client</span> <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">PaymentClient</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token variable">$request_options</span> <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">RequestOptions</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token variable">$request_options</span><span class="token operator">-&gt;</span><span class="token function">setCustomHeaders</span><span class="token punctuation">(</span><span class="token punctuation">[</span><span class="token string double-quoted-string">"X-Idempotency-Key: &lt;SOME_UNIQUE_VALUE&gt;"</span><span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token variable">$payment</span> <span class="token operator">=</span> <span class="token variable">$client</span><span class="token operator">-&gt;</span><span class="token function">create</span><span class="token punctuation">(</span><span class="token punctuation">[</span>
 <span class="token string double-quoted-string">"transaction_amount"</span> <span class="token operator">=&gt;</span> <span class="token punctuation">(</span><span class="token keyword type-casting">float</span><span class="token punctuation">)</span> <span class="token variable">$_POST</span><span class="token punctuation">[</span><span class="token string single-quoted-string">'&lt;TRANSACTION_AMOUNT&gt;'</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
    <span class="token string double-quoted-string">"payment_method_id"</span> <span class="token operator">=&gt;</span> <span class="token variable">$_POST</span><span class="token punctuation">[</span><span class="token string single-quoted-string">'&lt;PAYMENT_METHOD_ID&gt;'</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
    <span class="token string double-quoted-string">"payer"</span> <span class="token operator">=&gt;</span> <span class="token punctuation">[</span>
      <span class="token string double-quoted-string">"email"</span> <span class="token operator">=&gt;</span> <span class="token variable">$_POST</span><span class="token punctuation">[</span><span class="token string single-quoted-string">'&lt;EMAIL&gt;'</span><span class="token punctuation">]</span>
    <span class="token punctuation">]</span>
  <span class="token punctuation">]</span><span class="token punctuation">,</span> <span class="token variable">$request_options</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">echo</span> <span class="token function">implode</span><span class="token punctuation">(</span><span class="token variable">$payment</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token delimiter important">?&gt;</span></span>
<span aria-hidden="true" class="line-numbers-rows"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></span></code>
        </pre>
      </div>
      <button type="button" class="ui-button ui-button--secondary ui-button--small btn-copy-code" data-snippet-id="7">Copiar
  </button>
    </div>
    <div role="tabpanel" class="tab-pane active">
      <div id="editor_child_8" class="code_editor" language-type="node"><pre class="line-numbers language-javascript" data-line="" tabindex="0">          <code id="code_8" class="language-javascript">
<span class="token keyword">import</span> <span class="token punctuation">{</span> Payment<span class="token punctuation">,</span> MercadoPagoConfig <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">'mercadopago'</span><span class="token punctuation">;</span>

<span class="token keyword">const</span> client <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">MercadoPagoConfig</span><span class="token punctuation">(</span><span class="token punctuation">{</span> <span class="token literal-property property">accessToken</span><span class="token operator">:</span> <span class="token string">'&lt;ACCESS_TOKEN&gt;'</span> <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token keyword">const</span> payment <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Payment</span><span class="token punctuation">(</span>client<span class="token punctuation">)</span><span class="token punctuation">;</span>

payment<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
    <span class="token literal-property property">body</span><span class="token operator">:</span> <span class="token punctuation">{</span> 
        <span class="token literal-property property">transaction_amount</span><span class="token operator">:</span> req<span class="token punctuation">.</span>transaction_amount<span class="token punctuation">,</span>
        <span class="token literal-property property">description</span><span class="token operator">:</span> req<span class="token punctuation">.</span>description<span class="token punctuation">,</span>
        <span class="token literal-property property">payment_method_id</span><span class="token operator">:</span> req<span class="token punctuation">.</span>paymentMethodId<span class="token punctuation">,</span>
            <span class="token literal-property property">payer</span><span class="token operator">:</span> <span class="token punctuation">{</span>
            <span class="token literal-property property">email</span><span class="token operator">:</span> req<span class="token punctuation">.</span>email<span class="token punctuation">,</span>
            <span class="token literal-property property">identification</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">type</span><span class="token operator">:</span> req<span class="token punctuation">.</span>identificationType<span class="token punctuation">,</span>
        <span class="token literal-property property">number</span><span class="token operator">:</span> req<span class="token punctuation">.</span>number
    <span class="token punctuation">}</span><span class="token punctuation">}</span><span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token literal-property property">requestOptions</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token literal-property property">idempotencyKey</span><span class="token operator">:</span> <span class="token string">'&lt;SOME_UNIQUE_VALUE&gt;'</span> <span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
<span class="token punctuation">.</span><span class="token function">then</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token parameter">result</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>result<span class="token punctuation">)</span><span class="token punctuation">)</span>
<span class="token punctuation">.</span><span class="token function">catch</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token parameter">error</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>error<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span aria-hidden="true" class="line-numbers-rows"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></span></code>
        </pre>
      </div>
      <button type="button" class="ui-button ui-button--secondary ui-button--small btn-copy-code" data-snippet-id="8">Copiar
  </button>
    </div>
    <div role="tabpanel" class="tab-pane">
      <div id="editor_child_9" class="code_editor" language-type="java"><pre class="line-numbers language-java" data-line="" tabindex="0">          <code id="code_9" class="language-java">
<span class="token class-name">MercadoPagoConfig</span><span class="token punctuation">.</span><span class="token function">setAccessToken</span><span class="token punctuation">(</span><span class="token string">"ENV_ACCESS_TOKEN"</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token class-name">Map</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">,</span> <span class="token class-name">String</span><span class="token punctuation">&gt;</span></span> customHeaders <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">HashMap</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    customHeaders<span class="token punctuation">.</span><span class="token function">put</span><span class="token punctuation">(</span><span class="token string">"x-idempotency-key"</span><span class="token punctuation">,</span> <span class="token generics"><span class="token punctuation">&lt;</span>SOME_UNIQUE_VALUE<span class="token punctuation">&gt;</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span>
 
<span class="token class-name">MPRequestOptions</span> requestOptions <span class="token operator">=</span> <span class="token class-name">MPRequestOptions</span><span class="token punctuation">.</span><span class="token function">builder</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token punctuation">.</span><span class="token function">customHeaders</span><span class="token punctuation">(</span>customHeaders<span class="token punctuation">)</span>
    <span class="token punctuation">.</span><span class="token function">build</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token class-name">PaymentClient</span> client <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">PaymentClient</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token class-name">PaymentCreateRequest</span> paymentCreateRequest <span class="token operator">=</span>
   <span class="token class-name">PaymentCreateRequest</span><span class="token punctuation">.</span><span class="token function">builder</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
       <span class="token punctuation">.</span><span class="token function">transactionAmount</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">BigDecimal</span><span class="token punctuation">(</span><span class="token string">"100"</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
       <span class="token punctuation">.</span><span class="token function">description</span><span class="token punctuation">(</span><span class="token string">"Título do produto"</span><span class="token punctuation">)</span>
       <span class="token punctuation">.</span><span class="token function">paymentMethodId</span><span class="token punctuation">(</span><span class="token string">"pix"</span><span class="token punctuation">)</span>
       <span class="token punctuation">.</span><span class="token function">dateOfExpiration</span><span class="token punctuation">(</span><span class="token class-name">OffsetDateTime</span><span class="token punctuation">.</span><span class="token function">of</span><span class="token punctuation">(</span><span class="token number">2023</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">10</span><span class="token punctuation">,</span> <span class="token number">10</span><span class="token punctuation">,</span> <span class="token number">10</span><span class="token punctuation">,</span> <span class="token number">10</span><span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span> <span class="token class-name">ZoneOffset</span><span class="token punctuation">.</span><span class="token constant">UTC</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
       <span class="token punctuation">.</span><span class="token function">payer</span><span class="token punctuation">(</span>
           <span class="token class-name">PaymentPayerRequest</span><span class="token punctuation">.</span><span class="token function">builder</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
               <span class="token punctuation">.</span><span class="token function">email</span><span class="token punctuation">(</span><span class="token string">"PAYER_EMAIL"</span><span class="token punctuation">)</span>
               <span class="token punctuation">.</span><span class="token function">firstName</span><span class="token punctuation">(</span><span class="token string">"Test"</span><span class="token punctuation">)</span>
               <span class="token punctuation">.</span><span class="token function">identification</span><span class="token punctuation">(</span>
                   <span class="token class-name">IdentificationRequest</span><span class="token punctuation">.</span><span class="token function">builder</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">type</span><span class="token punctuation">(</span><span class="token string">"CPF"</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">number</span><span class="token punctuation">(</span><span class="token string">"19119119100"</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">build</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
               <span class="token punctuation">.</span><span class="token function">build</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
       <span class="token punctuation">.</span><span class="token function">build</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

client<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span>paymentCreateRequest<span class="token punctuation">,</span> requestOptions<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span aria-hidden="true" class="line-numbers-rows"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></span></code>
        </pre>
      </div>
      <button type="button" class="ui-button ui-button--secondary ui-button--small btn-copy-code" data-snippet-id="9">Copiar
  </button>
    </div>
    <div role="tabpanel" class="tab-pane">
      <div id="editor_child_10" class="code_editor" language-type="ruby"><pre class="line-numbers language-ruby" data-line="" tabindex="0">          <code id="code_10" class="language-ruby">
<span class="token keyword">require</span> <span class="token string-literal"><span class="token string">'mercadopago'</span></span>
sdk <span class="token operator">=</span> Mercadopago<span class="token double-colon punctuation">::</span><span class="token class-name">SDK</span><span class="token punctuation">.</span><span class="token keyword">new</span><span class="token punctuation">(</span><span class="token string-literal"><span class="token string">'ENV_ACCESS_TOKEN'</span></span><span class="token punctuation">)</span>

custom_headers <span class="token operator">=</span> <span class="token punctuation">{</span>
 <span class="token string-literal"><span class="token string">'x-idempotency-key'</span></span><span class="token operator">:</span> <span class="token string-literal"><span class="token string">'&lt;SOME_UNIQUE_VALUE&gt;'</span></span>
<span class="token punctuation">}</span>

custom_request_options <span class="token operator">=</span> Mercadopago<span class="token double-colon punctuation">::</span><span class="token class-name">RequestOptions</span><span class="token punctuation">.</span><span class="token keyword">new</span><span class="token punctuation">(</span><span class="token symbol">custom_headers</span><span class="token operator">:</span> custom_headers<span class="token punctuation">)</span>

payment_request <span class="token operator">=</span> <span class="token punctuation">{</span>
  <span class="token symbol">transaction_amount</span><span class="token operator">:</span> <span class="token number">100</span><span class="token punctuation">,</span>
  <span class="token symbol">description</span><span class="token operator">:</span> <span class="token string-literal"><span class="token string">'Título do produto'</span></span><span class="token punctuation">,</span>
  <span class="token symbol">payment_method_id</span><span class="token operator">:</span> <span class="token string-literal"><span class="token string">'pix'</span></span><span class="token punctuation">,</span>
  <span class="token symbol">payer</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token symbol">email</span><span class="token operator">:</span> <span class="token string-literal"><span class="token string">'PAYER_EMAIL'</span></span><span class="token punctuation">,</span>
    <span class="token symbol">identification</span><span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token symbol">type</span><span class="token operator">:</span> <span class="token string-literal"><span class="token string">'CPF'</span></span><span class="token punctuation">,</span>
      <span class="token symbol">number</span><span class="token operator">:</span> <span class="token string-literal"><span class="token string">'19119119100'</span></span><span class="token punctuation">,</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

payment_response <span class="token operator">=</span> sdk<span class="token punctuation">.</span>payment<span class="token punctuation">.</span>create<span class="token punctuation">(</span>payment_request<span class="token punctuation">,</span> custom_request_options<span class="token punctuation">)</span>
payment <span class="token operator">=</span> payment_response<span class="token punctuation">[</span><span class="token symbol">:response</span><span class="token punctuation">]</span>

<span aria-hidden="true" class="line-numbers-rows"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></span></code>
        </pre>
      </div>
      <button type="button" class="ui-button ui-button--secondary ui-button--small btn-copy-code" data-snippet-id="10">Copiar
  </button>
    </div>
    <div role="tabpanel" class="tab-pane">
      <div id="editor_child_11" class="code_editor" language-type="csharp"><pre class="line-numbers language-csharp" data-line="" tabindex="0">          <code id="code_11" class="language-csharp">
<span class="token keyword">using</span> <span class="token namespace">MercadoPago<span class="token punctuation">.</span>Config</span><span class="token punctuation">;</span>
<span class="token keyword">using</span> <span class="token namespace">MercadoPago<span class="token punctuation">.</span>Client<span class="token punctuation">.</span>Common</span><span class="token punctuation">;</span>
<span class="token keyword">using</span> <span class="token namespace">MercadoPago<span class="token punctuation">.</span>Client<span class="token punctuation">.</span>Payment</span><span class="token punctuation">;</span>
<span class="token keyword">using</span> <span class="token namespace">MercadoPago<span class="token punctuation">.</span>Resource<span class="token punctuation">.</span>Payment</span><span class="token punctuation">;</span>

MercadoPagoConfig<span class="token punctuation">.</span>AccessToken <span class="token operator">=</span> <span class="token string">"ENV_ACCESS_TOKEN"</span><span class="token punctuation">;</span>

<span class="token class-name"><span class="token keyword">var</span></span> requestOptions <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token constructor-invocation class-name">RequestOptions</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
requestOptions<span class="token punctuation">.</span>CustomHeaders<span class="token punctuation">.</span><span class="token function">Add</span><span class="token punctuation">(</span><span class="token string">"x-idempotency-key"</span><span class="token punctuation">,</span> <span class="token string">"&lt;SOME_UNIQUE_VALUE&gt;"</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token class-name"><span class="token keyword">var</span></span> request <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token constructor-invocation class-name">PaymentCreateRequest</span>
<span class="token punctuation">{</span>
    TransactionAmount <span class="token operator">=</span> <span class="token number">105</span><span class="token punctuation">,</span>
    Description <span class="token operator">=</span> <span class="token string">"Título do produto"</span><span class="token punctuation">,</span>
    PaymentMethodId <span class="token operator">=</span> <span class="token string">"pix"</span><span class="token punctuation">,</span>
    Payer <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token constructor-invocation class-name">PaymentPayerRequest</span>
    <span class="token punctuation">{</span>
        Email <span class="token operator">=</span> <span class="token string">"PAYER_EMAIL"</span><span class="token punctuation">,</span>
        FirstName <span class="token operator">=</span> <span class="token string">"Test"</span><span class="token punctuation">,</span>
        LastName <span class="token operator">=</span> <span class="token string">"User"</span><span class="token punctuation">,</span>
        Identification <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token constructor-invocation class-name">IdentificationRequest</span>
        <span class="token punctuation">{</span>
            Type <span class="token operator">=</span> <span class="token string">"CPF"</span><span class="token punctuation">,</span>
            Number <span class="token operator">=</span> <span class="token string">"191191191-00"</span><span class="token punctuation">,</span>
        <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>

<span class="token class-name"><span class="token keyword">var</span></span> client <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token constructor-invocation class-name">PaymentClient</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token class-name">Payment</span> payment <span class="token operator">=</span> <span class="token keyword">await</span> client<span class="token punctuation">.</span><span class="token function">CreateAsync</span><span class="token punctuation">(</span>request<span class="token punctuation">,</span> requestOptions<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span aria-hidden="true" class="line-numbers-rows"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></span></code>
        </pre>
      </div>
      <button type="button" class="ui-button ui-button--secondary ui-button--small btn-copy-code" data-snippet-id="11">Copiar
  </button>
    </div>
    <div role="tabpanel" class="tab-pane">
      <div id="editor_child_12" class="code_editor" language-type="python"><pre class="line-numbers language-python" data-line="" tabindex="0">          <code id="code_12" class="language-python">
<span class="token keyword">import</span> mercadopago
sdk <span class="token operator">=</span> mercadopago<span class="token punctuation">.</span>SDK<span class="token punctuation">(</span><span class="token string">"ENV_ACCESS_TOKEN"</span><span class="token punctuation">)</span>

request_options <span class="token operator">=</span> mercadopago<span class="token punctuation">.</span>config<span class="token punctuation">.</span>RequestOptions<span class="token punctuation">(</span><span class="token punctuation">)</span>
request_options<span class="token punctuation">.</span>custom_headers <span class="token operator">=</span> <span class="token punctuation">{</span>
    <span class="token string">'x-idempotency-key'</span><span class="token punctuation">:</span> <span class="token string">'&lt;SOME_UNIQUE_VALUE&gt;'</span>
<span class="token punctuation">}</span>

payment_data <span class="token operator">=</span> <span class="token punctuation">{</span>
    <span class="token string">"transaction_amount"</span><span class="token punctuation">:</span> <span class="token number">100</span><span class="token punctuation">,</span>
    <span class="token string">"description"</span><span class="token punctuation">:</span> <span class="token string">"Título do produto"</span><span class="token punctuation">,</span>
    <span class="token string">"payment_method_id"</span><span class="token punctuation">:</span> <span class="token string">"pix"</span><span class="token punctuation">,</span>
    <span class="token string">"payer"</span><span class="token punctuation">:</span> <span class="token punctuation">{</span>
        <span class="token string">"email"</span><span class="token punctuation">:</span> <span class="token string">"PAYER_EMAIL"</span><span class="token punctuation">,</span>
        <span class="token string">"first_name"</span><span class="token punctuation">:</span> <span class="token string">"Test"</span><span class="token punctuation">,</span>
        <span class="token string">"last_name"</span><span class="token punctuation">:</span> <span class="token string">"User"</span><span class="token punctuation">,</span>
        <span class="token string">"identification"</span><span class="token punctuation">:</span> <span class="token punctuation">{</span>
            <span class="token string">"type"</span><span class="token punctuation">:</span> <span class="token string">"CPF"</span><span class="token punctuation">,</span>
            <span class="token string">"number"</span><span class="token punctuation">:</span> <span class="token string">"191191191-00"</span>
        <span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token string">"address"</span><span class="token punctuation">:</span> <span class="token punctuation">{</span>
            <span class="token string">"zip_code"</span><span class="token punctuation">:</span> <span class="token string">"06233-200"</span><span class="token punctuation">,</span>
            <span class="token string">"street_name"</span><span class="token punctuation">:</span> <span class="token string">"Av. das Nações Unidas"</span><span class="token punctuation">,</span>
            <span class="token string">"street_number"</span><span class="token punctuation">:</span> <span class="token string">"3003"</span><span class="token punctuation">,</span>
            <span class="token string">"neighborhood"</span><span class="token punctuation">:</span> <span class="token string">"Bonfim"</span><span class="token punctuation">,</span>
            <span class="token string">"city"</span><span class="token punctuation">:</span> <span class="token string">"Osasco"</span><span class="token punctuation">,</span>
            <span class="token string">"federal_unit"</span><span class="token punctuation">:</span> <span class="token string">"SP"</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

payment_response <span class="token operator">=</span> sdk<span class="token punctuation">.</span>payment<span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span>create<span class="token punctuation">(</span>payment_data<span class="token punctuation">,</span> request_options<span class="token punctuation">)</span>
payment <span class="token operator">=</span> payment_response<span class="token punctuation">[</span><span class="token string">"response"</span><span class="token punctuation">]</span>
<span aria-hidden="true" class="line-numbers-rows"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></span></code>
        </pre>
      </div>
      <button type="button" class="ui-button ui-button--secondary ui-button--small btn-copy-code" data-snippet-id="12">Copiar
  </button>
    </div>
    <div role="tabpanel" class="tab-pane">
      <div id="editor_child_13" class="code_editor" language-type="go"><pre class="line-numbers language-go" data-line="" tabindex="0">          <code id="code_13" class="language-go">
accessToken <span class="token operator">:=</span> <span class="token string">"{{ACCESS_TOKEN}}"</span>


cfg<span class="token punctuation">,</span> err <span class="token operator">:=</span> config<span class="token punctuation">.</span><span class="token function">New</span><span class="token punctuation">(</span>accessToken<span class="token punctuation">)</span>
<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
   fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>err<span class="token punctuation">)</span>
   <span class="token keyword">return</span>
<span class="token punctuation">}</span>


client <span class="token operator">:=</span> payment<span class="token punctuation">.</span><span class="token function">NewClient</span><span class="token punctuation">(</span>cfg<span class="token punctuation">)</span>


request <span class="token operator">:=</span> payment<span class="token punctuation">.</span>Request<span class="token punctuation">{</span>
   TransactionAmount<span class="token punctuation">:</span> <span class="token number">100</span><span class="token punctuation">,</span>
   Description<span class="token punctuation">:</span> <span class="token string">"My product"</span><span class="token punctuation">,</span>
   PaymentMethodID<span class="token punctuation">:</span>   <span class="token string">"pix"</span><span class="token punctuation">,</span>
   Payer<span class="token punctuation">:</span> <span class="token operator">&amp;</span>payment<span class="token punctuation">.</span>PayerRequest<span class="token punctuation">{</span>
      Email<span class="token punctuation">:</span> <span class="token string">"{{PAYER_EMAIL}}"</span><span class="token punctuation">,</span>
      Identification<span class="token punctuation">:</span> <span class="token operator">&amp;</span>payment<span class="token punctuation">.</span>IdentificationRequest<span class="token punctuation">{</span>
         Type<span class="token punctuation">:</span> <span class="token string">"CPF"</span><span class="token punctuation">,</span>
         Number<span class="token punctuation">:</span> <span class="token string">"19119119100"</span><span class="token punctuation">,</span>
      <span class="token punctuation">}</span><span class="token punctuation">,</span>
   <span class="token punctuation">}</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span>


resource<span class="token punctuation">,</span> err <span class="token operator">:=</span> client<span class="token punctuation">.</span><span class="token function">Create</span><span class="token punctuation">(</span>context<span class="token punctuation">.</span><span class="token function">Background</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> request<span class="token punctuation">)</span>
<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
   fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>err<span class="token punctuation">)</span>
<span class="token punctuation">}</span>


fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>resource<span class="token punctuation">)</span>
<span aria-hidden="true" class="line-numbers-rows"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></span></code>
        </pre>
      </div>
      <button type="button" class="ui-button ui-button--secondary ui-button--small btn-copy-code" data-snippet-id="13">Copiar
  </button>
    </div>
    <div role="tabpanel" class="tab-pane">
      <div id="editor_child_14" class="code_editor" language-type="curl"><pre class="line-numbers language-curl" data-line="" tabindex="0">          <code id="code_14" class="language-curl">
curl -X POST \
    -H 'accept: application/json' \
    -H 'content-type: application/json' \
    -H 'Authorization: Bearer ENV_ACCESS_TOKEN' \
    -H 'X-Idempotency-Key: SOME_UNIQUE_VALUE' \
    'https://api.mercadopago.com/v1/payments' \
    -d '{
      "transaction_amount": 100,
      "description": "Título do produto",
      "payment_method_id": "pix",
      "payer": {
        "email": "PAYER_EMAIL",
        "first_name": "Test",
        "last_name": "User",
        "identification": {
            "type": "CPF",
            "number": "19119119100"
        },
        "address": {
            "zip_code": "06233200",
            "street_name": "Av. das Nações Unidas",
            "street_number": "3003",
            "neighborhood": "Bonfim",
            "city": "Osasco",
            "federal_unit": "SP"
        }
      }
    }'
<span aria-hidden="true" class="line-numbers-rows"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></span></code>
        </pre>
      </div>
      <button type="button" class="ui-button ui-button--secondary ui-button--small btn-copy-code" data-snippet-id="14">Copiar
  </button>
    </div>
  </div>
  </div></div><p>A resposta mostrará o estado pendente do pagamento e todas as informações que você precisa para mostrar ao comprador. O valor <code>transaction_data</code> retornará os dados para código QR.</p><div class="code-container" data-slideout-ignore="true"><div class="code-container__header u-clearfix no-overflow"><p class="code_tab_selector">json</p></div><div class="code_editor" language="language-json"><button type="button" class="ui-button ui-button--secondary ui-button--small btn-copy-code">Copiar</button><pre class="line-numbers language-json" data-line="" tabindex="0"><code class="language-json"><span class="token punctuation">{</span>
  ...<span class="token punctuation">,</span>
 <span class="token property">"id"</span><span class="token operator">:</span> <span class="token number">5466310457</span><span class="token punctuation">,</span>
 <span class="token property">"status"</span><span class="token operator">:</span> <span class="token string">"pending"</span><span class="token punctuation">,</span>
 <span class="token property">"status_detail"</span><span class="token operator">:</span> <span class="token string">"pending_waiting_transfer"</span><span class="token punctuation">,</span>
 ...<span class="token punctuation">,</span>
 <span class="token property">"transaction_details"</span><span class="token operator">:</span> <span class="token punctuation">{</span>
     <span class="token property">"net_received_amount"</span><span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span>
     <span class="token property">"total_paid_amount"</span><span class="token operator">:</span> <span class="token number">100</span><span class="token punctuation">,</span>
     <span class="token property">"overpaid_amount"</span><span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span>
     <span class="token property">"external_resource_url"</span><span class="token operator">:</span> <span class="token null keyword">null</span><span class="token punctuation">,</span>
     <span class="token property">"installment_amount"</span><span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span>
     <span class="token property">"financial_institution"</span><span class="token operator">:</span> <span class="token null keyword">null</span><span class="token punctuation">,</span>
     <span class="token property">"transaction_id"</span><span class="token operator">:</span> <span class="token null keyword">null</span>
 <span class="token punctuation">}</span><span class="token punctuation">,</span>
 <span class="token property">"point_of_interaction"</span><span class="token operator">:</span> <span class="token punctuation">{</span>
     <span class="token property">"type"</span><span class="token operator">:</span> <span class="token string">"PIX"</span><span class="token punctuation">,</span>
     <span class="token property">"sub_type"</span><span class="token operator">:</span> <span class="token null keyword">null</span><span class="token punctuation">,</span>
     <span class="token property">"application_data"</span><span class="token operator">:</span> <span class="token punctuation">{</span>
       <span class="token property">"name"</span><span class="token operator">:</span> <span class="token string">"NAME_SDK"</span><span class="token punctuation">,</span>
       <span class="token property">"version"</span><span class="token operator">:</span> <span class="token string">"VERSION_NUMBER"</span>
     <span class="token punctuation">}</span><span class="token punctuation">,</span>
     <span class="token property">"transaction_data"</span><span class="token operator">:</span> <span class="token punctuation">{</span>
       <span class="token property">"qr_code_base64"</span><span class="token operator">:</span> <span class="token string">"iVBORw0KGgoAAAANSUhEUgAABRQAAAUUCAYAAACu5p7oAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAIABJREFUeJzs2luO3LiWQNFmI+Y/Zd6vRt36KGNXi7ZOBtcagHD4kNLeiLX33v8DAAAAABD879sDAAAAAAA/h6AIAAAAAGSCIgAAAACQCYoAAAAAQCYoAgAAAACZoAgAAAAAZIIiAAAAAJAJigAAAABAJigCAAAAAJmgCAAAAABkgiIAAAAAkAmKAAAAAEAmKAIAAAAAmaAIAAAAAGSCIgAAAACQCYoAAAAAQCYoAgAAAACZoAgAAAAAZIIiAAAAAJAJigAAAABAJigCA..."</span><span class="token punctuation">,</span>
       <span class="token property">"qr_code"</span><span class="token operator">:</span> <span class="token string">"00020126600014br.gov.bcb.pix0117john@yourdomain.com0217additional data520400005303986540510.005802BR5913Maria Silva6008Brasilia62070503***6304E2CA"</span><span class="token punctuation">,</span>
       <span class="token property">"ticket_url"</span><span class="token operator">:</span> <span class="token string">"https://www.mercadopago.com.br/payments/123456789/ticket?caller_id=123456&amp;hash=123e4567-e89b-12d3-a456-426655440000"</span><span class="token punctuation">,</span>
       <span class="token property">"transaction_id"</span><span class="token operator">:</span> <span class="token null keyword">null</span>
     <span class="token punctuation">}</span>
 <span class="token punctuation">}</span>
 ...<span class="token punctuation">,</span>
<span class="token punctuation">}</span><span aria-hidden="true" class="line-numbers-rows"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></span></code></pre></div></div><p>Com Pix, você também pode escolher o prazo que o cliente terá para pagar a compra, definindo a validade do código de pagamento enviado a ele após a realização do pedido.</p><div class=""><div><div class="andes-message andes-message--accent andes-message--quiet" id=":r13:"><div class="andes-message__border-color--accent"></div><div class="andes-badge andes-badge--pill andes-badge--accent andes-message__badge andes-badge--pill-icon andes-badge--small" id=":r13:-notification"><div aria-hidden="true" class="andes-badge__icon"><svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M15.3906 18.2169V16.7169H13.0937V9.63989H9.24068V11.1399H10.9062V16.7169H8.70337V18.2169H15.3906Z" fill="white"></path><path d="M13.1181 6.87168C13.1181 7.58447 12.5403 8.1623 11.8275 8.1623C11.1147 8.1623 10.5369 7.58447 10.5369 6.87168C10.5369 6.15889 11.1147 5.58105 11.8275 5.58105C12.5403 5.58105 13.1181 6.15889 13.1181 6.87168Z" fill="white"></path></svg></div></div><div class="andes-message__content"><div class="andes-message__title andes-message__title--accent">Importante</div><div class="andes-message__text andes-message__text--accent"><div>Por padrão, a data de vencimento para pagamentos com Pix é de <strong>24 horas</strong>, mas você pode alterá-la enviando o campo <code>date_of_expiration</code> na solicitação de criação de pagamento. A data configurada deve estar entre <strong>30 minutos até 30 dias</strong> a partir da data de emissão do pagamento.</div></div></div></div></div></div><div><h2 id="visualizaodepagamento">Visualização de pagamento</h2></div><p>Para o usuário efetuar o pagamento, você deve escolher a forma de abertura do mesmo, que pode ser através de um botão ou de um código QR que deve ser renderizado.</p><p>Selecione a opção que mais se adéqua ao seu modelo de negócio e siga as etapas descritas abaixo.</p><ul><li><strong>Adicionar Link ou botão</strong>: Ao optar por adicionar um link ou botão para pagamento com Pix, o comprador será direcionado a uma nova janela contendo todas as informações para pagamento, como QR Code, Pix Copia e Cola e as instruções de pagamento.</li></ul><p>Para oferecer esta opção, utilize o atributo <code>ticket_url</code>, que mostra um Pix em uma nova janela com todas as informações de QR Code, Pix Copia e Cola e instruções de pagamentos.</p><div>  <div class="code-container">
    <div class="code-container__header u-clearfix no-overflow">
      <ul class="nav nav-tabs desktop-only" role="tablist"><li role="presentation" class="active">   
      <a href="https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-configuration/integrate-with-pix#editor_15" aria-controls="home" role="tab" data-toggle="tab" class="code_tab_selector" language-type="html">
        html
      </a>
    </li></ul>
      <select class="tab-select mobile-only" role="tablist"><option value="editor_15" role="tab" data-toggle="tab" class="code_tab_selector" language-type="html">
    html
  </option></select>
    </div>
    <div class="tab-content">
    <div role="tabpanel" class="tab-pane active">
      <div id="editor_child_15" class="code_editor" language-type="html"><pre class="line-numbers language-html" data-line="" tabindex="0">          <code id="code_15" class="language-html">
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>a</span> <span class="token attr-name">href</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>https://www.mercadopago.com.br/payments/123456789/ticket?caller_id=123456&amp;hash=123e4567-e89b-12d3-a456-426655440000<span class="token punctuation">"</span></span> <span class="token attr-name">target</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>_blank<span class="token punctuation">"</span></span><span class="token punctuation">&gt;</span></span>Pagar com Pix<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>a</span><span class="token punctuation">&gt;</span></span>
<span aria-hidden="true" class="line-numbers-rows"><span></span><span></span></span></code>
        </pre>
      </div>
      <button type="button" class="ui-button ui-button--secondary ui-button--small btn-copy-code" data-snippet-id="15">Copiar
  </button>
    </div>
  </div>
  </div></div><ul><li><strong>Renderizar código QR</strong>: É possível renderizar o código QR vigente, que deverá ser utilizado somente uma vez, na própria tela. Além disso, também é possível adicionar uma opção para copiar e colar o código de pagamento, o que permitirá realizar a transação a partir de um Internet Banking.</li></ul><p>Siga as etapas abaixo para renderizar o QR code e disponibilizar o recurso copia e cola.</p><ol><li>Adicione o <code>qr_code_base64</code> para exibir o código QR.</li></ol><div>  <div class="code-container">
    <div class="code-container__header u-clearfix no-overflow">
      <ul class="nav nav-tabs desktop-only" role="tablist"><li role="presentation" class="active">   
      <a href="https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-configuration/integrate-with-pix#editor_16" aria-controls="home" role="tab" data-toggle="tab" class="code_tab_selector" language-type="html">
        html
      </a>
    </li></ul>
      <select class="tab-select mobile-only" role="tablist"><option value="editor_16" role="tab" data-toggle="tab" class="code_tab_selector" language-type="html">
    html
  </option></select>
    </div>
    <div class="tab-content">
    <div role="tabpanel" class="tab-pane active">
      <div id="editor_child_16" class="code_editor" language-type="html"><pre class="line-numbers language-html" data-line="" tabindex="0">          <code id="code_16" class="language-html">
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>img</span> <span class="token attr-name">src</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span>{`data:image/jpeg;base64,${qr_code_base64}`}/</span><span class="token punctuation">&gt;</span></span>

<span aria-hidden="true" class="line-numbers-rows"><span></span><span></span><span></span></span></code>
        </pre>
      </div>
      <button type="button" class="ui-button ui-button--secondary ui-button--small btn-copy-code" data-snippet-id="16">Copiar
  </button>
    </div>
  </div>
  </div></div><ol start="2"><li>Para apresentar a opção que permitirá copiar e colar o código de pagamento, adicione o qr_code da seguinte forma:</li></ol><div>  <div class="code-container">
    <div class="code-container__header u-clearfix no-overflow">
      <ul class="nav nav-tabs desktop-only" role="tablist"><li role="presentation" class="active">   
      <a href="https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-configuration/integrate-with-pix#editor_17" aria-controls="home" role="tab" data-toggle="tab" class="code_tab_selector" language-type="html">
        html
      </a>
    </li></ul>
      <select class="tab-select mobile-only" role="tablist"><option value="editor_17" role="tab" data-toggle="tab" class="code_tab_selector" language-type="html">
    html
  </option></select>
    </div>
    <div class="tab-content">
    <div role="tabpanel" class="tab-pane active">
      <div id="editor_child_17" class="code_editor" language-type="html"><pre class="line-numbers language-html" data-line="" tabindex="0">          <code id="code_17" class="language-html">
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>label</span> <span class="token attr-name">for</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>copiar<span class="token punctuation">"</span></span><span class="token punctuation">&gt;</span></span>Copiar Hash:<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>label</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>input</span> <span class="token attr-name">type</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>text<span class="token punctuation">"</span></span> <span class="token attr-name">id</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>copiar<span class="token punctuation">"</span></span> <span class="token attr-name">value</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span>{qr_code}</span> <span class="token attr-name">readonly</span><span class="token punctuation">/&gt;</span></span>
<span aria-hidden="true" class="line-numbers-rows"><span></span><span></span><span></span></span></code>
        </pre>
      </div>
      <button type="button" class="ui-button ui-button--secondary ui-button--small btn-copy-code" data-snippet-id="17">Copiar
  </button>
    </div>
  </div>
  </div></div><p>Ao concluir essas etapas, o código QR terá sido renderizado e será exibido para o comprador no momento do pagamento.</p></div>