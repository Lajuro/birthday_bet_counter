<div class="layout__container"><nav aria-label="List of pages" id=":rm:"><ol class="andes-breadcrumb"><li class="andes-breadcrumb__item"><a class="andes-breadcrumb__link" href="https://www.mercadopago.com.br/developers/pt/docs">Documentação</a><div class="andes-breadcrumb__chevron" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="6" height="8"><path fill="none" stroke="#666" d="M1 0l4 4-4 4"></path></svg></div></li><li class="andes-breadcrumb__item"><a class="andes-breadcrumb__link" href="https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/landing">Checkout Pro</a><div class="andes-breadcrumb__chevron" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="6" height="8"><path fill="none" stroke="#666" d="M1 0l4 4-4 4"></path></svg></div></li><li class="andes-breadcrumb__item"><span class="andes-breadcrumb__label" aria-current="page">Integração Web</span></li></ol></nav><div><div class=""><div class="client-server__container client-server__h1"><h1 id="bookmark_adicionar_checkout">Adicionar checkout</h1><div class="andes-badge andes-badge--pill andes-badge--accent changelog_pill andes-badge--small andes-badge--accent--quiet andes-badge--rounded-top-left andes-badge--rounded-top-right andes-badge--rounded-bottom-left andes-badge--rounded-bottom-right" id=":rt:"><p class="andes-badge__content">Client-Side</p></div></div></div><p>Primeiro, certifique-se de ter <strong>criado a <a target="_blank" href="https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/integrate-preferences" node="[object Object]" class="undefined custom-link ">preferência no seu backend</a></strong>.</p><p>Em seguida, instale o SDK de <strong>frontend</strong> do Mercado Pago no seu projeto para adicionar o botão de pagamento.</p><p>A instalação é feita em <strong>duas etapas</strong>:</p><ol><li><a target="_blank" href="https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/integrate-checkout-pro/web#bookmark_adicionar_o_sdk_do_mercado_pago_ao_projeto" node="[object Object]" class="undefined custom-link ">Adicionar o SDK do Mercado Pago ao projeto com suas credenciais configuradas</a></li><li><a target="_blank" href="https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/integrate-checkout-pro/web#bookmark_iniciar_el_checkout_desde_la_preferencia" node="[object Object]" class="undefined custom-link ">Iniciar o checkout a partir da preferência gerada anteriormente</a></li></ol><div class=""><div class="client-server__container client-server__h2"><h2 id="bookmark_adicionar_o_sdk_do_mercado_pago_ao_projeto">Adicionar o SDK do Mercado Pago ao projeto</h2><div class="andes-badge andes-badge--pill andes-badge--accent changelog_pill andes-badge--small andes-badge--accent--quiet andes-badge--rounded-top-left andes-badge--rounded-top-right andes-badge--rounded-bottom-left andes-badge--rounded-bottom-right" id=":ru:"><p class="andes-badge__content">Client-Side</p></div></div></div><p>Para incluir o SDK do Mercado Pago.js, adicione o seguinte código ao HTML do seu projeto ou instale a biblioteca para ReactJs.</p><div>  <div class="code-container">
    <div class="code-container__header u-clearfix no-overflow">
      <ul class="nav nav-tabs desktop-only" role="tablist"><li role="presentation" class="">   
      <a href="https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/integrate-checkout-pro/web#editor_1" aria-controls="home" role="tab" data-toggle="tab" class="code_tab_selector" language-type="html">
        html
      </a>
    </li><li role="presentation" class="active">   
      <a href="https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/integrate-checkout-pro/web#editor_2" aria-controls="home" role="tab" data-toggle="tab" class="code_tab_selector" language-type="node">
        node
      </a>
    </li></ul>
      <select class="tab-select mobile-only" role="tablist"><option value="editor_1" role="tab" data-toggle="tab" class="code_tab_selector" language-type="html">
    html
  </option><option value="editor_2" role="tab" data-toggle="tab" class="code_tab_selector" language-type="node">
    node
  </option></select>
    </div>
    <div class="tab-content">
    <div role="tabpanel" class="tab-pane">
      <div id="editor_child_1" class="code_editor" language-type="html"><pre class="line-numbers language-html" data-line="" tabindex="0">          <code id="code_1" class="language-html">
// SDK MercadoPago.js
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>script</span> <span class="token attr-name">src</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>https://sdk.mercadopago.com/js/v2<span class="token punctuation">"</span></span><span class="token punctuation">&gt;</span></span><span class="token script"></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>script</span><span class="token punctuation">&gt;</span></span>
<span aria-hidden="true" class="line-numbers-rows"><span></span><span></span><span></span></span></code>
        </pre>
      </div>
      <button type="button" class="ui-button ui-button--secondary ui-button--small btn-copy-code" data-snippet-id="1">Copiar
  </button>
    </div>
    <div role="tabpanel" class="tab-pane active">
      <div id="editor_child_2" class="code_editor" language-type="node"><pre class="line-numbers language-javascript" data-line="" tabindex="0">          <code id="code_2" class="language-javascript">
npm install @mercadopago<span class="token operator">/</span>sdk<span class="token operator">-</span>react@<span class="token number">0.0</span><span class="token number">.24</span>
<span aria-hidden="true" class="line-numbers-rows"><span></span><span></span></span></code>
        </pre>
      </div>
      <button type="button" class="ui-button ui-button--secondary ui-button--small btn-copy-code" data-snippet-id="2">Copiar
  </button>
    </div>
  </div>
  </div></div><p>Em seguida, inicie a integração configurando sua <a target="_blank" href="https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/your-integrations/credentials" node="[object Object]" class="undefined custom-link ">chave pública</a> usando o seguinte código JavaScript.</p><div>  <div class="code-container">
    <div class="code-container__header u-clearfix no-overflow">
      <ul class="nav nav-tabs desktop-only" role="tablist"><li role="presentation" class="active">   
      <a href="https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/integrate-checkout-pro/web#editor_3" aria-controls="home" role="tab" data-toggle="tab" class="code_tab_selector" language-type="javascript">
        javascript
      </a>
    </li><li role="presentation" class="">   
      <a href="https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/integrate-checkout-pro/web#editor_4" aria-controls="home" role="tab" data-toggle="tab" class="code_tab_selector" language-type="react-jsx">
        react-jsx
      </a>
    </li></ul>
      <select class="tab-select mobile-only" role="tablist"><option value="editor_3" role="tab" data-toggle="tab" class="code_tab_selector" language-type="javascript">
    javascript
  </option><option value="editor_4" role="tab" data-toggle="tab" class="code_tab_selector" language-type="react-jsx">
    react-jsx
  </option></select>
    </div>
    <div class="tab-content">
    <div role="tabpanel" class="tab-pane active">
      <div id="editor_child_3" class="code_editor" language-type="javascript"><pre class="line-numbers language-javascript" data-line="" tabindex="0">          <code id="code_3" class="language-javascript">
<span class="token keyword">const</span> mp <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">MercadoPago</span><span class="token punctuation">(</span><span class="token string">'YOUR_PUBLIC_KEY'</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token keyword">const</span> bricksBuilder <span class="token operator">=</span> mp<span class="token punctuation">.</span><span class="token function">bricks</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span aria-hidden="true" class="line-numbers-rows"><span></span><span></span><span></span></span></code>
        </pre>
      </div>
      <button type="button" class="ui-button ui-button--secondary ui-button--small btn-copy-code" data-snippet-id="3">Copiar
  </button>
    </div>
    <div role="tabpanel" class="tab-pane">
      <div id="editor_child_4" class="code_editor" language-type="react-jsx"><pre class="line-numbers language-jsx" data-line="" tabindex="0">          <code id="code_4" class="language-jsx">
<span class="token keyword">import</span> <span class="token punctuation">{</span> initMercadoPago<span class="token punctuation">,</span> Wallet <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">'@mercadopago/sdk-react'</span>
<span class="token function">initMercadoPago</span><span class="token punctuation">(</span><span class="token string">'YOUR_PUBLIC_KEY'</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span aria-hidden="true" class="line-numbers-rows"><span></span><span></span><span></span></span></code>
        </pre>
      </div>
      <button type="button" class="ui-button ui-button--secondary ui-button--small btn-copy-code" data-snippet-id="4">Copiar
  </button>
    </div>
  </div>
  </div></div><p>Para integrações JavaScript/HTML, via CDN, você vai precisar ainda criar um container identificador para definir o local que o botão será inserido na tela. A criação do container é feita inserindo um elemento no código HTML da página no qual o componente será renderizado.</p><div class="code-container" data-slideout-ignore="true"><div class="code-container__header u-clearfix no-overflow"><p class="code_tab_selector">html</p></div><div class="code_editor" language="language-html"><button type="button" class="ui-button ui-button--secondary ui-button--small btn-copy-code">Copiar</button><pre class="line-numbers language-html" data-line="" tabindex="0"><code class="language-html"> <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">id</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wallet_container<span class="token punctuation">"</span></span><span class="token punctuation">&gt;</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">&gt;</span></span><span aria-hidden="true" class="line-numbers-rows"><span></span></span></code></pre></div></div><div class=""><div><div class="andes-message andes-message--accent andes-message--quiet" id=":rv:"><div class="andes-message__border-color--accent"></div><div class="andes-badge andes-badge--pill andes-badge--accent andes-message__badge andes-badge--pill-icon andes-badge--small" id=":rv:-notification"><div aria-hidden="true" class="andes-badge__icon"><svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M15.3906 18.2169V16.7169H13.0937V9.63989H9.24068V11.1399H10.9062V16.7169H8.70337V18.2169H15.3906Z" fill="white"></path><path d="M13.1181 6.87168C13.1181 7.58447 12.5403 8.1623 11.8275 8.1623C11.1147 8.1623 10.5369 7.58447 10.5369 6.87168C10.5369 6.15889 11.1147 5.58105 11.8275 5.58105C12.5403 5.58105 13.1181 6.15889 13.1181 6.87168Z" fill="white"></path></svg></div></div><div class="andes-message__content"><div class="andes-message__title andes-message__title--accent">Atenção</div><div class="andes-message__text andes-message__text--accent"><div>O valor exibido na propriedade ID a seguir é apenas um exemplo e pode ser alterado, mas deve sempre corresponder ao ID indicado na etapa de renderização.</div></div></div></div></div></div><div class=""><div class="client-server__container client-server__h2"><h2 id="iniciarocheckoutapartirdapreferncia">Iniciar o checkout a partir da preferência</h2><div class="andes-badge andes-badge--pill andes-badge--accent changelog_pill andes-badge--small andes-badge--accent--quiet andes-badge--rounded-top-left andes-badge--rounded-top-right andes-badge--rounded-bottom-left andes-badge--rounded-bottom-right" id=":r10:"><p class="andes-badge__content">Client-Side</p></div></div></div><p>Ao finalizar a etapa anterior, <strong>inicialize seu checkout utilizando o ID da preferência previamente criada com o identificador do elemento onde o botão deverá ser exibido</strong>, caso esteja utilizando a integração <code>Javascript/HTML</code>, ou instanciando o componente, no caso da biblioteca <code>React</code>, conforme os exemplos abaixo.</p><div>  <div class="code-container">
    <div class="code-container__header u-clearfix no-overflow">
      <ul class="nav nav-tabs desktop-only" role="tablist"><li role="presentation" class="active">   
      <a href="https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/integrate-checkout-pro/web#editor_5" aria-controls="home" role="tab" data-toggle="tab" class="code_tab_selector" language-type="javascript">
        javascript
      </a>
    </li><li role="presentation" class="">   
      <a href="https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/integrate-checkout-pro/web#editor_6" aria-controls="home" role="tab" data-toggle="tab" class="code_tab_selector" language-type="react-jsx">
        react-jsx
      </a>
    </li></ul>
      <select class="tab-select mobile-only" role="tablist"><option value="editor_5" role="tab" data-toggle="tab" class="code_tab_selector" language-type="javascript">
    javascript
  </option><option value="editor_6" role="tab" data-toggle="tab" class="code_tab_selector" language-type="react-jsx">
    react-jsx
  </option></select>
    </div>
    <div class="tab-content">
    <div role="tabpanel" class="tab-pane active">
      <div id="editor_child_5" class="code_editor" language-type="javascript"><pre class="line-numbers language-javascript" data-line="" tabindex="0">          <code id="code_5" class="language-javascript">
mp<span class="token punctuation">.</span><span class="token function">bricks</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span><span class="token string">"wallet"</span><span class="token punctuation">,</span> <span class="token string">"wallet_container"</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>
   <span class="token literal-property property">initialization</span><span class="token operator">:</span> <span class="token punctuation">{</span>
       <span class="token literal-property property">preferenceId</span><span class="token operator">:</span> <span class="token string">"&lt;PREFERENCE_ID&gt;"</span><span class="token punctuation">,</span>
   <span class="token punctuation">}</span><span class="token punctuation">,</span>
<span class="token literal-property property">customization</span><span class="token operator">:</span> <span class="token punctuation">{</span>
 <span class="token literal-property property">texts</span><span class="token operator">:</span> <span class="token punctuation">{</span>
  <span class="token literal-property property">valueProp</span><span class="token operator">:</span> <span class="token string">'smart_option'</span><span class="token punctuation">,</span>
 <span class="token punctuation">}</span><span class="token punctuation">,</span>
 <span class="token punctuation">}</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span aria-hidden="true" class="line-numbers-rows"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></span></code>
        </pre>
      </div>
      <button type="button" class="ui-button ui-button--secondary ui-button--small btn-copy-code" data-snippet-id="5">Copiar
  </button>
    </div>
    <div role="tabpanel" class="tab-pane">
      <div id="editor_child_6" class="code_editor" language-type="react-jsx"><pre class="line-numbers language-jsx" data-line="" tabindex="0">          <code id="code_6" class="language-jsx">
<span class="token keyword">import</span> <span class="token punctuation">{</span> Wallet <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">'@mercadopago/sdk-react'</span><span class="token punctuation">;</span>

<span class="token keyword">const</span> <span class="token function-variable function">App</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
  <span class="token keyword">return</span> <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Wallet</span></span> <span class="token attr-name">initialization</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">{</span><span class="token punctuation">{</span> <span class="token literal-property property">preferenceId</span><span class="token operator">:</span> <span class="token string">'YOUR_PREFERENCE_ID'</span> <span class="token punctuation">}</span><span class="token punctuation">}</span></span> <span class="token punctuation">/&gt;</span></span><span class="token punctuation">;</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>
<span class="token keyword">export</span> <span class="token keyword">default</span> App<span class="token punctuation">;</span>
<span aria-hidden="true" class="line-numbers-rows"><span></span><span></span><span></span><span></span><span></span><span></span><span></span></span></code>
        </pre>
      </div>
      <button type="button" class="ui-button ui-button--secondary ui-button--small btn-copy-code" data-snippet-id="6">Copiar
  </button>
    </div>
  </div>
  </div></div><p>Em seguida, observe o botão de pagamento renderizado em sua página. Caso queira fazer <strong>alterações nos textos ou uma alteração visual</strong>, acesse as seções de <a target="_blank" href="https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/checkout-customization/user-interface/change-button-texts" node="[object Object]" class="undefined custom-link ">Alterar textos do botão</a> e <a target="_blank" href="https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/checkout-customization/user-interface/change-button-appearance" node="[object Object]" class="undefined custom-link ">Alterar visual do botão</a>.</p><p><img src="https://http2.mlstatic.com/storage/dx-devsite/docs-assets/images/cow/wallet-render-pt.png?v=4.39.8-rc-3" alt="wallet-render"></p><p>No exemplo acima, um botão de pagamento será renderizado e ficará responsável por abrir o Checkout Pro. Caso queira que a experiência com Checkout Pro seja feita em uma <strong>aba externa</strong>, veja a seção <a target="_blank" href="https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/checkout-customization/user-interface/opening-schema" node="[object Object]" class="undefined custom-link ">Esquema de abertura</a></p><div><h2 id="bookmark_configurar_as_back_urls">Configurar as back_urls</h2></div><p>No final do processo de pagamento, é possível redirecionar o comprador para outro ambiente do site através do atributo <code>back_urls</code> que é configurado ao criar a preferência. As <code>back_urls</code> serão responsáveis por guiar o fluxo de retorno ao seu site quando o pagamento for concluído. É possível definir três URLs de retorno diferentes que correspondem a cenários de pagamento pendente, sucesso ou erro.</p><p>Para obter mais informações, consulte a seção <a target="_blank" href="https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/checkout-customization/user-interface/redirection" node="[object Object]" class="undefined custom-link ">URL de retorno</a>.</p><div class=""><div><div class="andes-message andes-message--orange andes-message--quiet" id=":r11:"><div class="andes-message__border-color--orange"></div><div class="andes-badge andes-badge--pill andes-badge--orange andes-message__badge andes-badge--pill-icon andes-badge--small" id=":r11:-notification"><div aria-hidden="true" class="andes-badge__icon"><svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M13.4545 5.81824H10.5454L10.909 13.8182H13.0909L13.4545 5.81824Z" fill="white"></path><path d="M12 15.2728C12.8033 15.2728 13.4545 15.924 13.4545 16.7273C13.4545 17.5307 12.8033 18.1819 12 18.1819C11.1966 18.1819 10.5454 17.5307 10.5454 16.7273C10.5454 15.924 11.1966 15.2728 12 15.2728Z" fill="white"></path></svg></div></div><div class="andes-message__content"><div class="andes-message__title andes-message__title--orange">Importante</div><div class="andes-message__text andes-message__text--orange"><div>Não utilize domínios locais no valor <code>back_urls</code>, como 'localhost/' ou '127.0.0.1' com ou sem porta especificada. Recomendamos o uso de um servidor com um domínio nomeado (DNS) ou IPs de desenvolvimento para poder retornar ao site após o pagamento. Caso contrário, aparecerá a mensagem "Alguma coisa deu errado" ao finalizar o processo de compra.</div></div></div></div></div></div><div><h2 id="bookmark_receber_estados_de_pagamento">Receber estados de pagamento</h2></div><p>Os pagamentos criados possuem os seguintes status: <code>Pendente</code>, <code>Rejeitado</code> e <code>Aprovado</code>. Para acompanhar as atualizações é necessário configurar seu sistema para receber as notificações de pagamentos e outras atualizações de status. Veja <a target="_blank" href="https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/your-integrations/notifications" node="[object Object]" class="undefined custom-link ">Notificações</a> para mais detalhes.</p><div><h2 id="exemplodeimplementao">Exemplo de implementação</h2></div><p>Confira o <a target="_blank" href="http://github.com/mercadopago/checkout-payment-sample" node="[object Object]" class="undefined custom-link ">exemplo completo de integração</a> no GitHub para <strong>PHP</strong> ou <strong>NodeJS</strong> para fazer o <em>download</em> de um projeto básico de implementação rápida do Checkout Pro.</p></div></div>