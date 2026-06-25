!function(){"use strict";
/**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */const t=globalThis,e=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),i=new WeakMap;let n=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const s=this.t;if(e&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=i.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&i.set(s,t))}return t}toString(){return this.cssText}};const r=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,s,i)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[i+1],t[0]);return new n(i,t,s)},o=e?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return(t=>new n("string"==typeof t?t:t+"",void 0,s))(e)})(t):t,{is:a,defineProperty:c,getOwnPropertyDescriptor:h,getOwnPropertyNames:l,getOwnPropertySymbols:d,getPrototypeOf:p}=Object,u=globalThis,_=u.trustedTypes,$=_?_.emptyScript:"",f=u.reactiveElementPolyfillSupport,g=(t,e)=>t,v={toAttribute(t,e){switch(e){case Boolean:t=t?$:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let s=t;switch(e){case Boolean:s=null!==t;break;case Number:s=null===t?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t)}catch(t){s=null}}return s}},y=(t,e)=>!a(t,e),m={attribute:!0,type:String,converter:v,reflect:!1,useDefault:!1,hasChanged:y};
/**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */Symbol.metadata??=Symbol("metadata"),u.litPropertyMetadata??=new WeakMap;let A=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=m){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const s=Symbol(),i=this.getPropertyDescriptor(t,s,e);void 0!==i&&c(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){const{get:i,set:n}=h(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:i,set(e){const r=i?.call(this);n?.call(this,e),this.requestUpdate(t,r,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??m}static _$Ei(){if(this.hasOwnProperty(g("elementProperties")))return;const t=p(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(g("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(g("properties"))){const t=this.properties,e=[...l(t),...d(t)];for(const s of e)this.createProperty(s,t[s])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,s]of e)this.elementProperties.set(t,s)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const s=this._$Eu(t,e);void 0!==s&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const t of s)e.unshift(o(t))}else void 0!==t&&e.push(o(t));return e}static _$Eu(t,e){const s=e.attribute;return!1===s?void 0:"string"==typeof s?s:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const s=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((s,i)=>{if(e)s.adoptedStyleSheets=i.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of i){const i=document.createElement("style"),n=t.litNonce;void 0!==n&&i.setAttribute("nonce",n),i.textContent=e.cssText,s.appendChild(i)}})(s,this.constructor.elementStyles),s}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){const s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(void 0!==i&&!0===s.reflect){const n=(void 0!==s.converter?.toAttribute?s.converter:v).toAttribute(e,s.type);this._$Em=t,null==n?this.removeAttribute(i):this.setAttribute(i,n),this._$Em=null}}_$AK(t,e){const s=this.constructor,i=s._$Eh.get(t);if(void 0!==i&&this._$Em!==i){const t=s.getPropertyOptions(i),n="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:v;this._$Em=i;const r=n.fromAttribute(e,t.type);this[i]=r??this._$Ej?.get(i)??r,this._$Em=null}}requestUpdate(t,e,s,i=!1,n){if(void 0!==t){const r=this.constructor;if(!1===i&&(n=this[t]),s??=r.getPropertyOptions(t),!((s.hasChanged??y)(n,e)||s.useDefault&&s.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,s))))return;this.C(t,e,s)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:i,wrapped:n},r){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??e??this[t]),!0!==n||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),!0===i&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,s]of t){const{wrapped:t}=s,i=this[e];!0!==t||this._$AL.has(e)||void 0===i||this.C(e,void 0,s,i)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};A.elementStyles=[],A.shadowRootOptions={mode:"open"},A[g("elementProperties")]=new Map,A[g("finalized")]=new Map,f?.({ReactiveElement:A}),(u.reactiveElementVersions??=[]).push("2.1.2");
/**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
const b=globalThis,x=t=>t,S=b.trustedTypes,w=S?S.createPolicy("lit-html",{createHTML:t=>t}):void 0,E="$lit$",C=`lit$${Math.random().toFixed(9).slice(2)}$`,P="?"+C,M=`<${P}>`,U=document,O=()=>U.createComment(""),k=t=>null===t||"object"!=typeof t&&"function"!=typeof t,N=Array.isArray,T="[ \t\n\f\r]",H=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,I=/-->/g,R=/>/g,D=RegExp(`>|${T}(?:([^\\s"'>=/]+)(${T}*=${T}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),z=/'/g,j=/"/g,B=/^(?:script|style|textarea|title)$/i,L=t=>(e,...s)=>({_$litType$:t,strings:e,values:s}),V=L(1),q=L(2),W=Symbol.for("lit-noChange"),K=Symbol.for("lit-nothing"),F=new WeakMap,G=U.createTreeWalker(U,129);function J(t,e){if(!N(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==w?w.createHTML(e):e}const Z=(t,e)=>{const s=t.length-1,i=[];let n,r=2===e?"<svg>":3===e?"<math>":"",o=H;for(let e=0;e<s;e++){const s=t[e];let a,c,h=-1,l=0;for(;l<s.length&&(o.lastIndex=l,c=o.exec(s),null!==c);)l=o.lastIndex,o===H?"!--"===c[1]?o=I:void 0!==c[1]?o=R:void 0!==c[2]?(B.test(c[2])&&(n=RegExp("</"+c[2],"g")),o=D):void 0!==c[3]&&(o=D):o===D?">"===c[0]?(o=n??H,h=-1):void 0===c[1]?h=-2:(h=o.lastIndex-c[2].length,a=c[1],o=void 0===c[3]?D:'"'===c[3]?j:z):o===j||o===z?o=D:o===I||o===R?o=H:(o=D,n=void 0);const d=o===D&&t[e+1].startsWith("/>")?" ":"";r+=o===H?s+M:h>=0?(i.push(a),s.slice(0,h)+E+s.slice(h)+C+d):s+C+(-2===h?e:d)}return[J(t,r+(t[s]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),i]};class Q{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let n=0,r=0;const o=t.length-1,a=this.parts,[c,h]=Z(t,e);if(this.el=Q.createElement(c,s),G.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(i=G.nextNode())&&a.length<o;){if(1===i.nodeType){if(i.hasAttributes())for(const t of i.getAttributeNames())if(t.endsWith(E)){const e=h[r++],s=i.getAttribute(t).split(C),o=/([.?@])?(.*)/.exec(e);a.push({type:1,index:n,name:o[2],strings:s,ctor:"."===o[1]?st:"?"===o[1]?it:"@"===o[1]?nt:et}),i.removeAttribute(t)}else t.startsWith(C)&&(a.push({type:6,index:n}),i.removeAttribute(t));if(B.test(i.tagName)){const t=i.textContent.split(C),e=t.length-1;if(e>0){i.textContent=S?S.emptyScript:"";for(let s=0;s<e;s++)i.append(t[s],O()),G.nextNode(),a.push({type:2,index:++n});i.append(t[e],O())}}}else if(8===i.nodeType)if(i.data===P)a.push({type:2,index:n});else{let t=-1;for(;-1!==(t=i.data.indexOf(C,t+1));)a.push({type:7,index:n}),t+=C.length-1}n++}}static createElement(t,e){const s=U.createElement("template");return s.innerHTML=t,s}}function X(t,e,s=t,i){if(e===W)return e;let n=void 0!==i?s._$Co?.[i]:s._$Cl;const r=k(e)?void 0:e._$litDirective$;return n?.constructor!==r&&(n?._$AO?.(!1),void 0===r?n=void 0:(n=new r(t),n._$AT(t,s,i)),void 0!==i?(s._$Co??=[])[i]=n:s._$Cl=n),void 0!==n&&(e=X(t,n._$AS(t,e.values),n,i)),e}class Y{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:s}=this._$AD,i=(t?.creationScope??U).importNode(e,!0);G.currentNode=i;let n=G.nextNode(),r=0,o=0,a=s[0];for(;void 0!==a;){if(r===a.index){let e;2===a.type?e=new tt(n,n.nextSibling,this,t):1===a.type?e=new a.ctor(n,a.name,a.strings,this,t):6===a.type&&(e=new rt(n,this,t)),this._$AV.push(e),a=s[++o]}r!==a?.index&&(n=G.nextNode(),r++)}return G.currentNode=U,i}p(t){let e=0;for(const s of this._$AV)void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}}class tt{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,i){this.type=2,this._$AH=K,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=X(this,t,e),k(t)?t===K||null==t||""===t?(this._$AH!==K&&this._$AR(),this._$AH=K):t!==this._$AH&&t!==W&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>N(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==K&&k(this._$AH)?this._$AA.nextSibling.data=t:this.T(U.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:s}=t,i="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=Q.createElement(J(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(e);else{const t=new Y(i,this),s=t.u(this.options);t.p(e),this.T(s),this._$AH=t}}_$AC(t){let e=F.get(t.strings);return void 0===e&&F.set(t.strings,e=new Q(t)),e}k(t){N(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let s,i=0;for(const n of t)i===e.length?e.push(s=new tt(this.O(O()),this.O(O()),this,this.options)):s=e[i],s._$AI(n),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=x(t).nextSibling;x(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class et{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,i,n){this.type=1,this._$AH=K,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=n,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=K}_$AI(t,e=this,s,i){const n=this.strings;let r=!1;if(void 0===n)t=X(this,t,e,0),r=!k(t)||t!==this._$AH&&t!==W,r&&(this._$AH=t);else{const i=t;let o,a;for(t=n[0],o=0;o<n.length-1;o++)a=X(this,i[s+o],e,o),a===W&&(a=this._$AH[o]),r||=!k(a)||a!==this._$AH[o],a===K?t=K:t!==K&&(t+=(a??"")+n[o+1]),this._$AH[o]=a}r&&!i&&this.j(t)}j(t){t===K?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class st extends et{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===K?void 0:t}}class it extends et{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==K)}}class nt extends et{constructor(t,e,s,i,n){super(t,e,s,i,n),this.type=5}_$AI(t,e=this){if((t=X(this,t,e,0)??K)===W)return;const s=this._$AH,i=t===K&&s!==K||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,n=t!==K&&(s===K||i);i&&this.element.removeEventListener(this.name,this,s),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class rt{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){X(this,t)}}const ot=b.litHtmlPolyfillSupport;ot?.(Q,tt),(b.litHtmlVersions??=[]).push("3.3.3");const at=globalThis;
/**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */class ct extends A{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,s)=>{const i=s?.renderBefore??e;let n=i._$litPart$;if(void 0===n){const t=s?.renderBefore??null;i._$litPart$=n=new tt(e.insertBefore(O(),t),t,void 0,s??{})}return n._$AI(t),n})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return W}}ct._$litElement$=!0,ct.finalized=!0,at.litElementHydrateSupport?.({LitElement:ct});const ht=at.litElementPolyfillSupport;function lt(t,e){let s;return(...i)=>{clearTimeout(s),s=setTimeout(()=>t(...i),e)}}ht?.({LitElement:ct}),(at.litElementVersions??=[]).push("4.2.2");const dt=["light_entity","color_entity","layout_sensor","panel_colors_entity","pattern_entity","brightness_entity","spread_entity"];function pt(t,e){const s=e?`${e}: `:"";for(const e of dt)if(!t[e])throw new Error(`nanoleaf-card: ${s}missing required config key "${e}"`)}function ut(t,e){const s=Number(t);return!Number.isInteger(s)||s<0||s>=e?0:s}function _t(t,e){const s=t?.states?.[e?.light_entity];return!s||"unavailable"===s.state}function $t(t){if(!t||!t.service)return;const e=t.service.indexOf(".");return-1!==e?{domain:t.service.slice(0,e),service:t.service.slice(e+1),data:t.data,target:t.target}:void 0}const ft=["solid","linear","radial","rainbow"];class gt extends ct{static styles=r`
    :host { display: block; }
    ha-card { overflow: hidden; padding: 0; }
    svg { display: block; }
    .svg-wrapper { position: relative; }
    .device-bar {
      display: flex;
      justify-content: flex-end;
      padding: 8px 12px 0;
    }
    .device-select {
      background: var(--card-background-color);
      color: var(--primary-text-color);
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 4px 8px;
      font-size: 14px;
    }
    .power-btn {
      position: absolute;
      top: 8px;
      right: 12px;
      z-index: 2;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
    }
    .controls {
      background: rgba(255,255,255,0.05);
      border-radius: 12px;
      margin: 0 12px 12px;
      padding: 12px;
    }
    .color-row {
      display: flex;
      height: 150px;
      gap: 12px;
      align-items: stretch;
    }
    ha-color-picker { flex: none; }
    .right-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 0;
    }
    .pattern-row {
      display: flex;
      justify-content: space-between;
      padding-bottom: 10px;
    }
    .pattern-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px 0;
      font-size: 14px;
      color: var(--secondary-text-color);
    }
    .pattern-btn.active {
      color: var(--primary-color);
      font-weight: bold;
    }
    .slider-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 5px 0;
    }
    ha-icon.slider-icon {
      --mdc-icon-size: 20px;
      color: var(--secondary-text-color);
    }
    input[type='range'] {
      flex: 1;
      accent-color: var(--primary-color);
    }
    .offline {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      min-height: 300px;
      color: var(--secondary-text-color);
      text-align: center;
    }
    .offline ha-icon {
      --mdc-icon-size: 48px;
      color: var(--error-color, var(--disabled-text-color));
    }
    .offline-msg { font-size: 15px; }
    .reconnect-btn {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 14px;
      cursor: pointer;
    }
  `;setConfig(t){this._devices=function(t){const e=Array.isArray(t.devices),s=dt.some(e=>e in t);if(e&&s)throw new Error('nanoleaf-card: use either "devices" or top-level entity keys, not both');if(e){if(0===t.devices.length)throw new Error('nanoleaf-card: "devices" is empty');return t.devices.forEach((t,e)=>{pt(t,t.name||`devices[${e}]`)}),t.devices}return pt(t),[t]}(t),this._config=t,this._storageKey="nanoleaf-card:"+this._devices.map(t=>t.light_entity).join(","),this._activeIndex=ut(this._loadIndex(),this._devices.length),this._debouncedSetBrightness=lt(t=>this._setValue(this._activeDevice.brightness_entity,t),150),this._debouncedSetSpread=lt(t=>this._setValue(this._activeDevice.spread_entity,t),150)}set hass(t){this._hass=t,this.requestUpdate()}get _activeDevice(){return this._devices?.[this._activeIndex]}get _isOn(){return"on"===this._hass?.states[this._activeDevice?.light_entity]?.state}_renderPicker(){return!this._devices||this._devices.length<2?"":V`
      <div class="device-bar">
        <select class="device-select" @change=${this._selectDevice}>
          ${this._devices.map((t,e)=>V`
              <option value=${e} ?selected=${e===this._activeIndex}>
                ${t.name||t.light_entity}${_t(this._hass,t)?" ●":""}
              </option>`)}
        </select>
      </div>`}render(){if(!this._hass||!this._config)return V``;const t=this._activeDevice;if(_t(this._hass,t)){const e=$t(t.reconnect_action);return V`
        <ha-card>
          ${this._renderPicker()}
          <div class="offline">
            <ha-icon icon="mdi:lan-disconnect"></ha-icon>
            <div class="offline-msg">
              ${t.name||"Nanoleaf"} unreachable
            </div>
            ${e?V`<button
                  class="reconnect-btn"
                  @click=${this._reconnect}
                >
                  Reconnect
                </button>`:""}
          </div>
        </ha-card>`}const e=this._hass.states[t.layout_sensor],s=this._hass.states[t.panel_colors_entity],i=this._hass.states[t.pattern_entity],n=this._hass.states[t.brightness_entity],r=this._hass.states[t.spread_entity],o=this._hass.states[t.color_entity],a=i?.state??"",c=n?.attributes??{},h=r?.attributes??{},l=function(t,e,s){const i=t/255,n=e/255,r=s/255,o=Math.max(i,n,r),a=o-Math.min(i,n,r);let c=0;return 0!==a&&(c=o===i?(n-r)/a%6:o===n?(r-i)/a+2:(i-n)/a+4,c=Math.round(60*c),c<0&&(c+=360)),{h:c,s:0===o?0:a/o}}(...o?.attributes?.rgb_color??[128,128,128]);return V`
      <ha-card>
        ${this._renderPicker()}
        <div class="svg-wrapper">
          ${this._renderSVG(e,s)}
          <button
            class="power-btn"
            @click=${this._togglePower}
            title="Toggle power"
          >
            <ha-icon
              icon="mdi:power"
              style="color:${this._isOn?"var(--primary-color)":"var(--disabled-text-color)"}"
            ></ha-icon>
          </button>
        </div>
        <div class="controls">
          <div class="color-row">
            <ha-color-picker
              .desiredHsColor=${l}
              @color-changed=${this._onColorChanged}
            ></ha-color-picker>
            <div class="right-col">
              <div class="pattern-row">
                ${ft.map(t=>V`
                    <button
                      class="pattern-btn ${a===t?"active":""}"
                      @click=${()=>this._selectPattern(t)}
                    >
                      ${t[0].toUpperCase()+t.slice(1)}
                    </button>`)}
              </div>
              <div class="slider-row">
                <ha-icon
                  class="slider-icon"
                  icon="mdi:brightness-6"
                ></ha-icon>
                <input
                  type="range"
                  min=${c.min??0}
                  max=${c.max??100}
                  step=${c.step??1}
                  .value=${String(n?.state??0)}
                  @input=${this._onBrightnessInput}
                />
              </div>
              <div class="slider-row">
                <ha-icon
                  class="slider-icon"
                  icon="mdi:arrow-expand-horizontal"
                ></ha-icon>
                <input
                  type="range"
                  min=${h.min??0}
                  max=${h.max??100}
                  step=${h.step??1}
                  .value=${String(r?.state??0)}
                  @input=${this._onSpreadInput}
                />
              </div>
            </div>
          </div>
        </div>
      </ha-card>`}_renderSVG(t,e){const s=t?.attributes?.positionData??[],i=parseFloat(t?.attributes?.sideLength)||150,n=s.filter(t=>8===t.shapeType);if(!n.length)return V`<div style="height:280px"></div>`;const r=function(t){const e={};if(!t)return e;for(const s of t.split(",")){const t=s.indexOf(":");-1!==t&&(e[s.slice(0,t).trim()]=s.slice(t+1).trim())}return e}(e?.state??""),o=i/1.732,a=.75,c=i/1.5,h=i/6,l=n.map(t=>t.x),d=n.map(t=>t.y),p=0-Math.max(...l)-c,u=0-Math.min(...l)+c,_=Math.min(...d)-h,$=Math.max(...d)+h,f=n.map(t=>{const e=function(t,e){const s=parseInt(t.slice(0,2),16),i=parseInt(t.slice(2,4),16),n=parseInt(t.slice(4,6),16),r=Math.max(s,i,n);if(!e||0===r)return"rgb(77,77,77)";const o=255/r;return`rgb(${Math.round(s*o)},${Math.round(i*o)},${Math.round(n*o)})`}(r[String(t.panelId)]??"000000",this._isOn),s=["0,"+-o*a,`${-i/2*a},${o/2*a}`,`${i/2*a},${o/2*a}`].join(" ");return q`
        <g
          data-panel-id=${t.panelId}
          transform="translate(${-t.x},${t.y})
                     rotate(${180-t.o})"
        >
          <polygon
            points=${s}
            fill=${e}
            stroke=${e}
            stroke-width="15"
            stroke-linejoin="round"
          />
        </g>`});return V`
      <svg
        viewBox="${p} ${_} ${u-p} ${$-_}"
        style="width:100%;height:280px;pointer-events:none;"
      >
        ${f}
      </svg>`}_selectDevice(t){this._activeIndex=ut(t.target.value,this._devices.length),this._saveIndex(),this.requestUpdate()}_loadIndex(){try{return window.localStorage.getItem(this._storageKey)}catch(t){return null}}_saveIndex(){try{window.localStorage.setItem(this._storageKey,String(this._activeIndex))}catch(t){}}_reconnect(){const t=$t(this._activeDevice.reconnect_action);t&&this._callService(t.domain,t.service,t.data||{},t.target)}_togglePower(){this._callService("light","toggle",{entity_id:this._activeDevice.light_entity})}_onColorChanged(t){const{h:e,s:s}=t.detail.color,i=function(t,e){t%=360;const s=e,i=s*(1-Math.abs(t/60%2-1)),n=1-s;let r=0,o=0,a=0;return t<60?(r=s,o=i):t<120?(r=i,o=s):t<180?(o=s,a=i):t<240?(o=i,a=s):t<300?(r=i,a=s):(r=s,a=i),[Math.round(255*(r+n)),Math.round(255*(o+n)),Math.round(255*(a+n))]}(e,s);this._callService("light","turn_on",{entity_id:this._activeDevice.color_entity,rgb_color:i})}_selectPattern(t){this._callService("input_select","select_option",{entity_id:this._activeDevice.pattern_entity,option:t})}_onBrightnessInput(t){this._debouncedSetBrightness(parseFloat(t.target.value))}_onSpreadInput(t){this._debouncedSetSpread(parseFloat(t.target.value))}_setValue(t,e){this._callService("input_number","set_value",{entity_id:t,value:e})}_callService(t,e,s,i){this._hass.callService(t,e,s,i)}}customElements.define("nanoleaf-reloaded-card",gt),window.customCards=window.customCards||[],window.customCards.push({type:"nanoleaf-reloaded-card",name:"Nanoleaf Reloaded Card",description:"Control panel for Nanoleaf light panels"})}();
