!function(){"use strict";
/**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */const t=globalThis,e=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),s=new WeakMap;let n=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const i=this.t;if(e&&void 0===t){const e=void 0!==i&&1===i.length;e&&(t=s.get(i)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&s.set(i,t))}return t}toString(){return this.cssText}};const r=(t,...e)=>{const s=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new n(s,t,i)},o=e?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new n("string"==typeof t?t:t+"",void 0,i))(e)})(t):t,{is:a,defineProperty:l,getOwnPropertyDescriptor:c,getOwnPropertyNames:h,getOwnPropertySymbols:d,getPrototypeOf:p}=Object,u=globalThis,_=u.trustedTypes,g=_?_.emptyScript:"",v=u.reactiveElementPolyfillSupport,f=(t,e)=>t,m={toAttribute(t,e){switch(e){case Boolean:t=t?g:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},$=(t,e)=>!a(t,e),y={attribute:!0,type:String,converter:m,reflect:!1,useDefault:!1,hasChanged:$};
/**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */Symbol.metadata??=Symbol("metadata"),u.litPropertyMetadata??=new WeakMap;let b=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=y){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&l(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:n}=c(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){const r=s?.call(this);n?.call(this,e),this.requestUpdate(t,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??y}static _$Ei(){if(this.hasOwnProperty(f("elementProperties")))return;const t=p(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(f("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(f("properties"))){const t=this.properties,e=[...h(t),...d(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(o(t))}else void 0!==t&&e.push(o(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const i=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((i,s)=>{if(e)i.adoptedStyleSheets=s.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of s){const s=document.createElement("style"),n=t.litNonce;void 0!==n&&s.setAttribute("nonce",n),s.textContent=e.cssText,i.appendChild(s)}})(i,this.constructor.elementStyles),i}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){const n=(void 0!==i.converter?.toAttribute?i.converter:m).toAttribute(e,i.type);this._$Em=t,null==n?this.removeAttribute(s):this.setAttribute(s,n),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=i.getPropertyOptions(s),n="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:m;this._$Em=s;const r=n.fromAttribute(e,t.type);this[s]=r??this._$Ej?.get(s)??r,this._$Em=null}}requestUpdate(t,e,i,s=!1,n){if(void 0!==t){const r=this.constructor;if(!1===s&&(n=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??$)(n,e)||i.useDefault&&i.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:n},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??e??this[t]),!0!==n||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};b.elementStyles=[],b.shadowRootOptions={mode:"open"},b[f("elementProperties")]=new Map,b[f("finalized")]=new Map,v?.({ReactiveElement:b}),(u.reactiveElementVersions??=[]).push("2.1.2");
/**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
const w=globalThis,x=t=>t,A=w.trustedTypes,S=A?A.createPolicy("lit-html",{createHTML:t=>t}):void 0,E="$lit$",M=`lit$${Math.random().toFixed(9).slice(2)}$`,k="?"+M,C=`<${k}>`,P=document,O=()=>P.createComment(""),U=t=>null===t||"object"!=typeof t&&"function"!=typeof t,T=Array.isArray,D="[ \t\n\f\r]",N=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,R=/-->/g,H=/>/g,I=RegExp(`>|${D}(?:([^\\s"'>=/]+)(${D}*=${D}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),j=/'/g,z=/"/g,B=/^(?:script|style|textarea|title)$/i,L=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),q=L(1),V=L(2),W=Symbol.for("lit-noChange"),K=Symbol.for("lit-nothing"),F=new WeakMap,G=P.createTreeWalker(P,129);function J(t,e){if(!T(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==S?S.createHTML(e):e}const X=(t,e)=>{const i=t.length-1,s=[];let n,r=2===e?"<svg>":3===e?"<math>":"",o=N;for(let e=0;e<i;e++){const i=t[e];let a,l,c=-1,h=0;for(;h<i.length&&(o.lastIndex=h,l=o.exec(i),null!==l);)h=o.lastIndex,o===N?"!--"===l[1]?o=R:void 0!==l[1]?o=H:void 0!==l[2]?(B.test(l[2])&&(n=RegExp("</"+l[2],"g")),o=I):void 0!==l[3]&&(o=I):o===I?">"===l[0]?(o=n??N,c=-1):void 0===l[1]?c=-2:(c=o.lastIndex-l[2].length,a=l[1],o=void 0===l[3]?I:'"'===l[3]?z:j):o===z||o===j?o=I:o===R||o===H?o=N:(o=I,n=void 0);const d=o===I&&t[e+1].startsWith("/>")?" ":"";r+=o===N?i+C:c>=0?(s.push(a),i.slice(0,c)+E+i.slice(c)+M+d):i+M+(-2===c?e:d)}return[J(t,r+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class Y{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let n=0,r=0;const o=t.length-1,a=this.parts,[l,c]=X(t,e);if(this.el=Y.createElement(l,i),G.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=G.nextNode())&&a.length<o;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(E)){const e=c[r++],i=s.getAttribute(t).split(M),o=/([.?@])?(.*)/.exec(e);a.push({type:1,index:n,name:o[2],strings:i,ctor:"."===o[1]?it:"?"===o[1]?st:"@"===o[1]?nt:et}),s.removeAttribute(t)}else t.startsWith(M)&&(a.push({type:6,index:n}),s.removeAttribute(t));if(B.test(s.tagName)){const t=s.textContent.split(M),e=t.length-1;if(e>0){s.textContent=A?A.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],O()),G.nextNode(),a.push({type:2,index:++n});s.append(t[e],O())}}}else if(8===s.nodeType)if(s.data===k)a.push({type:2,index:n});else{let t=-1;for(;-1!==(t=s.data.indexOf(M,t+1));)a.push({type:7,index:n}),t+=M.length-1}n++}}static createElement(t,e){const i=P.createElement("template");return i.innerHTML=t,i}}function Z(t,e,i=t,s){if(e===W)return e;let n=void 0!==s?i._$Co?.[s]:i._$Cl;const r=U(e)?void 0:e._$litDirective$;return n?.constructor!==r&&(n?._$AO?.(!1),void 0===r?n=void 0:(n=new r(t),n._$AT(t,i,s)),void 0!==s?(i._$Co??=[])[s]=n:i._$Cl=n),void 0!==n&&(e=Z(t,n._$AS(t,e.values),n,s)),e}class Q{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??P).importNode(e,!0);G.currentNode=s;let n=G.nextNode(),r=0,o=0,a=i[0];for(;void 0!==a;){if(r===a.index){let e;2===a.type?e=new tt(n,n.nextSibling,this,t):1===a.type?e=new a.ctor(n,a.name,a.strings,this,t):6===a.type&&(e=new rt(n,this,t)),this._$AV.push(e),a=i[++o]}r!==a?.index&&(n=G.nextNode(),r++)}return G.currentNode=P,s}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class tt{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=K,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Z(this,t,e),U(t)?t===K||null==t||""===t?(this._$AH!==K&&this._$AR(),this._$AH=K):t!==this._$AH&&t!==W&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>T(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==K&&U(this._$AH)?this._$AA.nextSibling.data=t:this.T(P.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=Y.createElement(J(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const t=new Q(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=F.get(t.strings);return void 0===e&&F.set(t.strings,e=new Y(t)),e}k(t){T(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const n of t)s===e.length?e.push(i=new tt(this.O(O()),this.O(O()),this,this.options)):i=e[s],i._$AI(n),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=x(t).nextSibling;x(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class et{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,n){this.type=1,this._$AH=K,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=K}_$AI(t,e=this,i,s){const n=this.strings;let r=!1;if(void 0===n)t=Z(this,t,e,0),r=!U(t)||t!==this._$AH&&t!==W,r&&(this._$AH=t);else{const s=t;let o,a;for(t=n[0],o=0;o<n.length-1;o++)a=Z(this,s[i+o],e,o),a===W&&(a=this._$AH[o]),r||=!U(a)||a!==this._$AH[o],a===K?t=K:t!==K&&(t+=(a??"")+n[o+1]),this._$AH[o]=a}r&&!s&&this.j(t)}j(t){t===K?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class it extends et{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===K?void 0:t}}class st extends et{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==K)}}class nt extends et{constructor(t,e,i,s,n){super(t,e,i,s,n),this.type=5}_$AI(t,e=this){if((t=Z(this,t,e,0)??K)===W)return;const i=this._$AH,s=t===K&&i!==K||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,n=t!==K&&(i===K||s);s&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class rt{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){Z(this,t)}}const ot=w.litHtmlPolyfillSupport;ot?.(Y,tt),(w.litHtmlVersions??=[]).push("3.3.3");const at=globalThis;
/**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */class lt extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const s=i?.renderBefore??e;let n=s._$litPart$;if(void 0===n){const t=i?.renderBefore??null;s._$litPart$=n=new tt(e.insertBefore(O(),t),t,void 0,i??{})}return n._$AI(t),n})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return W}}lt._$litElement$=!0,lt.finalized=!0,at.litElementHydrateSupport?.({LitElement:lt});const ct=at.litElementPolyfillSupport;function ht(t,e){t%=360;const i=e,s=i*(1-Math.abs(t/60%2-1)),n=1-i;let r=0,o=0,a=0;return t<60?(r=i,o=s):t<120?(r=s,o=i):t<180?(o=i,a=s):t<240?(o=s,a=i):t<300?(r=s,a=i):(r=i,a=s),[Math.round(255*(r+n)),Math.round(255*(o+n)),Math.round(255*(a+n))]}function dt(t,e){let i;return(...s)=>{clearTimeout(i),i=setTimeout(()=>t(...s),e)}}ct?.({LitElement:lt}),(at.litElementVersions??=[]).push("4.2.2");const pt=["light_entity","color_entity","layout_sensor","panel_colors_entity","pattern_entity","brightness_entity","spread_entity"];function ut(t,e){const i=e?`${e}: `:"";for(const e of pt)if(!t[e])throw new Error(`nanoleaf-card: ${i}missing required config key "${e}"`)}function _t(t,e){const i=Number(t);return!Number.isInteger(i)||i<0||i>=e?0:i}function gt(t,e){const i=t?.states?.[e?.light_entity];return!i||"unavailable"===i.state}function vt(t){if(!t||!t.service)return;const e=t.service.indexOf(".");return-1!==e?{domain:t.service.slice(0,e),service:t.service.slice(e+1),data:t.data,target:t.target}:void 0}const ft=[{key:"light_entity",label:"Panels (light)",domain:"light"},{key:"color_entity",label:"Base colour (light)",domain:"light"},{key:"layout_sensor",label:"Layout (sensor)",domain:"sensor"},{key:"panel_colors_entity",label:"Panel colours (sensor)",domain:"sensor"},{key:"pattern_entity",label:"Pattern (select)",domain:"select"},{key:"brightness_entity",label:"Brightness (number)",domain:"number"},{key:"spread_entity",label:"Spread (number)",domain:"number"}];function mt(){const t={};for(const e of ft)t[e.key]="";return t}function $t(t,e){const i=e.split(".")[0],s=e.toLowerCase();"light"===i?/base|color|colour/.test(s)?t.color_entity=e:t.light_entity||(t.light_entity=e):"sensor"===i?/color|colour/.test(s)?t.panel_colors_entity=e:/layout/.test(s)&&(t.layout_sensor=e):"select"===i?t.pattern_entity||(t.pattern_entity=e):"number"===i&&(/spread/.test(s)?t.spread_entity=e:/bright/.test(s)&&(t.brightness_entity=e))}function yt(t){const e=t?.entities??{},i=t?.states??{},s=new Map;for(const t of Object.keys(i)){const i=e[t];if("nanoleaf_reloaded"!==i?.platform)continue;const n=i.device_id||"_single";s.has(n)||s.set(n,mt()),$t(s.get(n),t)}return[...s.values()]}const bt={0:3,2:4,3:4,4:4,7:6,8:3,9:3},wt={0:150,2:100,3:100,4:100,7:67,8:135,9:68};function xt(t,e){const i=bt[t];if(!i)return null;return{sides:i,radius:e*wt[t]/135/(2*Math.sin(Math.PI/i))}}const At=["solid","linear","radial","rainbow"];class St extends lt{static styles=r`
    :host { display: block; }
    ha-card { overflow: hidden; padding: 0; }
    svg { display: block; }
    /* fade panel colours in the preview, mirroring the hardware */
    svg polygon { transition: fill 0.45s ease, stroke 0.45s ease; }
    /* inset the preview equally from the side and bottom edges */
    .svg-wrapper { position: relative; padding: 0 16px 16px; }
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
    /* full-width button bar above the preview */
    .power-bar {
      padding: 0;
    }
    .power-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      cursor: pointer;
      padding: 6px 0;
      transition: background 0.15s ease;
    }
    .power-btn:hover {
      background: rgba(255,255,255,0.06);
    }
    .power-btn:active {
      background: rgba(255,255,255,0.12);
    }
    .power-btn ha-icon {
      --mdc-icon-size: 28px;
    }
    .controls {
      background: rgba(255,255,255,0.05);
      border-radius: 12px;
      margin: 0 12px 12px;
      /* less vertical padding so the dial fills more height */
      padding: 6px 12px;
    }
    /* dial column : sliders column = 1 : 2; stretch so both
       columns are full height and the dial centres within it */
    .color-row {
      display: flex;
      align-items: stretch;
      gap: 12px;
      padding: 0;
    }
    .wheel-wrap {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      /* a little breathing room above/below the dial */
      padding: 8px 0;
    }
    .color-wheel {
      position: relative;
      width: 100%;
      max-width: 160px;
      aspect-ratio: 1 / 1;
      border-radius: 50%;
      touch-action: none;
      cursor: pointer;
      background:
        radial-gradient(circle at center,
          #fff 0%, rgba(255,255,255,0) 70%),
        conic-gradient(
          hsl(0,100%,50%), hsl(60,100%,50%),
          hsl(120,100%,50%), hsl(180,100%,50%),
          hsl(240,100%,50%), hsl(300,100%,50%),
          hsl(360,100%,50%));
      box-shadow: inset 0 0 0 1px rgba(0,0,0,0.25);
    }
    .wheel-knob {
      position: absolute;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid #fff;
      box-shadow: 0 0 3px rgba(0,0,0,0.7);
      transform: translate(-50%, -50%);
      pointer-events: none;
    }
    .right-col {
      flex: 2;
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
    .pill-slider {
      position: relative;
      height: 42px;
      border-radius: 12px;
      margin: 4px 0;
      overflow: hidden;
      cursor: pointer;
      touch-action: none;
      background: rgba(255,255,255,0.07);
    }
    .pill-fill {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      border-radius: 12px;
      background: rgba(255,255,255,0.22);
    }
    .pill-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      --mdc-icon-size: 20px;
      color: var(--primary-text-color);
      pointer-events: none;
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
  `;static getConfigElement(){return document.createElement("nanoleaf-reloaded-card-editor")}static getStubConfig(t){const e=yt(t);return e.length>1?{devices:e}:function(t){return yt(t)[0]??mt()}(t)}setConfig(t){this._devices=function(t){const e=Array.isArray(t.devices),i=pt.some(e=>e in t);if(e&&i)throw new Error('nanoleaf-card: use either "devices" or top-level entity keys, not both');if(e){if(0===t.devices.length)throw new Error('nanoleaf-card: "devices" is empty');return t.devices.forEach((t,e)=>{ut(t,t.name||`devices[${e}]`)}),t.devices}return ut(t),[t]}(t),this._config=t,this._storageKey="nanoleaf-card:"+this._devices.map(t=>t.light_entity).join(","),this._activeIndex=_t(this._loadIndex(),this._devices.length),this._debouncedSetBrightness=dt(t=>this._setValue(this._activeDevice.brightness_entity,t),150),this._debouncedSetSpread=dt(t=>this._setValue(this._activeDevice.spread_entity,t),150),this._debouncedColor=dt(t=>{this._callService("light","turn_on",{entity_id:this._activeDevice.color_entity,rgb_color:t})},150),this._ov={}}set hass(t){this._hass=t,this._reconcileOverrides(t),this.requestUpdate()}_reconcileOverrides(t){const e=this._activeDevice;if(!e)return;const i={brightness:e.brightness_entity,spread:e.spread_entity};for(const[e,s]of Object.entries(i))if(void 0!==this._ov?.[e]&&Number(t.states[s]?.state)===this._ov[e]){const t={...this._ov};delete t[e],this._ov=t}if(this._wheelHs&&this._sentRgb){const i=t.states[e.color_entity]?.attributes?.rgb_color;i&&i[0]===this._sentRgb[0]&&i[1]===this._sentRgb[1]&&i[2]===this._sentRgb[2]&&(this._wheelHs=void 0)}if(void 0!==this._powerOv){"on"===t.states[e.light_entity]?.state===this._powerOv&&(this._powerOv=void 0,clearTimeout(this._powerTimer))}}get _activeDevice(){return this._devices?.[this._activeIndex]}get _isOn(){return void 0!==this._powerOv?this._powerOv:"on"===this._hass?.states[this._activeDevice?.light_entity]?.state}_renderPicker(){return!this._devices||this._devices.length<2?"":q`
      <div class="device-bar">
        <select class="device-select" @change=${this._selectDevice}>
          ${this._devices.map((t,e)=>q`
              <option value=${e} ?selected=${e===this._activeIndex}>
                ${t.name||t.light_entity}${gt(this._hass,t)?" ●":""}
              </option>`)}
        </select>
      </div>`}render(){if(!this._hass||!this._config)return q``;const t=this._activeDevice;if(gt(this._hass,t)){const e=vt(t.reconnect_action);return q`
        <ha-card>
          ${this._renderPicker()}
          <div class="offline">
            <ha-icon icon="mdi:lan-disconnect"></ha-icon>
            <div class="offline-msg">
              ${t.name||"Nanoleaf"} unreachable
            </div>
            ${e?q`<button
                  class="reconnect-btn"
                  @click=${this._reconnect}
                >
                  Reconnect
                </button>`:""}
          </div>
        </ha-card>`}const e=this._hass.states[t.layout_sensor],i=this._hass.states[t.panel_colors_entity],s=this._hass.states[t.pattern_entity],n=this._hass.states[t.brightness_entity],r=this._hass.states[t.spread_entity],o=this._hass.states[t.color_entity],a=s?.state??"",l=n?.attributes??{},c=r?.attributes??{},h=this._wheelHs??function(t,e,i){const s=t/255,n=e/255,r=i/255,o=Math.max(s,n,r),a=o-Math.min(s,n,r);let l=0;return 0!==a&&(l=o===s?(n-r)/a%6:o===n?(r-s)/a+2:(s-n)/a+4,l=Math.round(60*l),l<0&&(l+=360)),{h:l,s:0===o?0:a/o}}(...o?.attributes?.rgb_color??[128,128,128]),d=function(t,e,i){const s=Math.min(1,Math.max(0,e))*i,n=t*Math.PI/180;return{x:Math.sin(n)*s,y:-Math.cos(n)*s}}(h.h,h.s,1),p=ht(h.h,h.s);return q`
      <ha-card>
        ${this._renderPicker()}
        <div class="power-bar">
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
        <div class="svg-wrapper">
          ${this._renderSVG(e,i)}
        </div>
        <div class="controls">
          <div class="color-row">
            <div class="wheel-wrap">
              <div
                class="color-wheel"
                @pointerdown=${this._wheelDown}
                @pointermove=${this._wheelMove}
                @pointerup=${this._wheelUp}
                @pointercancel=${this._wheelUp}
              >
                <div
                  class="wheel-knob"
                  style="left:${50+50*d.x}%;top:${50+50*d.y}%;background:rgb(${p.join(",")})"
                ></div>
              </div>
            </div>
            <div class="right-col">
              <div class="pattern-row">
                ${At.map(t=>q`
                    <button
                      class="pattern-btn ${a===t?"active":""}"
                      @click=${()=>this._selectPattern(t)}
                    >
                      ${t[0].toUpperCase()+t.slice(1)}
                    </button>`)}
              </div>
              ${this._renderPill("mdi:brightness-6",n,l,"brightness")}
              ${this._renderPill("mdi:arrow-expand-horizontal",r,c,"spread")}
            </div>
          </div>
        </div>
      </ha-card>`}_renderSVG(t,e){const i=t?.attributes?.positionData??[],s=parseFloat(t?.attributes?.sideLength)||135,n=i.map(t=>({...t,geom:xt(t.shapeType,s)})).filter(t=>t.geom);if(!n.length)return q`<div style="height:280px"></div>`;const r=function(t){const e={};if(!t)return e;for(const i of t.split(",")){const t=i.indexOf(":");-1!==t&&(e[i.slice(0,t).trim()]=i.slice(t+1).trim())}return e}(e?.state??""),o=Math.max(...n.map(t=>t.geom.radius)),a=.23*o,l=.18*o,c=t=>Math.max(t.geom.radius-a,6)+l/2+6,h=Math.min(...n.map(t=>-t.x-c(t))),d=Math.max(...n.map(t=>-t.x+c(t))),p=Math.min(...n.map(t=>t.y-c(t))),u=Math.max(...n.map(t=>t.y+c(t))),_=n.map(t=>{const e=function(t,e){const i=parseInt(t.slice(0,2),16),s=parseInt(t.slice(2,4),16),n=parseInt(t.slice(4,6),16),r=Math.max(i,s,n);if(!e||0===r)return"rgb(77,77,77)";const o=255/r;return`rgb(${Math.round(i*o)},${Math.round(s*o)},${Math.round(n*o)})`}(r[String(t.panelId)]??"000000",this._isOn),i=function(t,e,i=1){const s=[];for(let n=0;n<e;n++){const r=(360/e*n-90)*Math.PI/180,o=(t*Math.cos(r)*i).toFixed(2),a=(t*Math.sin(r)*i).toFixed(2);s.push(`${o},${a}`)}return s.join(" ")}(Math.max(t.geom.radius-a,6),t.geom.sides);return V`
        <g
          data-panel-id=${t.panelId}
          transform="translate(${-t.x},${t.y})
                     rotate(${180-t.o})"
        >
          <polygon
            points=${i}
            fill=${e}
            stroke=${e}
            stroke-width=${l}
            stroke-linejoin="round"
          />
        </g>`}),g=d-h,v=u-p;return q`
      <svg
        viewBox="${h} ${p} ${g} ${v}"
        style="display:block;width:100%;margin:0 auto;
               aspect-ratio:${g} / ${v};
               max-height:300px;pointer-events:none;"
      >
        ${_}
      </svg>`}_selectDevice(t){this._activeIndex=_t(t.target.value,this._devices.length),this._saveIndex(),this.requestUpdate()}_loadIndex(){try{return window.localStorage.getItem(this._storageKey)}catch(t){return null}}_saveIndex(){try{window.localStorage.setItem(this._storageKey,String(this._activeIndex))}catch(t){}}_reconnect(){const t=vt(this._activeDevice.reconnect_action);t&&this._callService(t.domain,t.service,t.data||{},t.target)}_togglePower(){this._powerTarget=!this._isOn,this._powerOv=this._powerTarget,this.requestUpdate(),clearTimeout(this._powerTimer),this._powerTimer=setTimeout(()=>{this._powerOv=void 0,this.requestUpdate()},3e3),clearTimeout(this._powerSendTimer),this._powerSendTimer=setTimeout(()=>{this._callService("light",this._powerTarget?"turn_on":"turn_off",{entity_id:this._activeDevice.light_entity})},350)}_wheelDown(t){this._wheelDragging=!0,t.target.setPointerCapture?.(t.pointerId),this._wheelApply(t)}_wheelMove(t){this._wheelDragging&&this._wheelApply(t)}_wheelUp(t){this._wheelDragging=!1,t.target.releasePointerCapture?.(t.pointerId)}_wheelApply(t){const e=t.currentTarget.getBoundingClientRect(),i=function(t,e,i){let s=180*Math.atan2(t,-e)/Math.PI;return s<0&&(s+=360),{h:s,s:i?Math.min(1,Math.hypot(t,e)/i):0}}(t.clientX-e.left-e.width/2,t.clientY-e.top-e.height/2,e.width/2);this._wheelHs=i;const s=ht(i.h,i.s);this._sentRgb=s,this._debouncedColor(s),this.requestUpdate()}_selectPattern(t){const e=this._activeDevice.pattern_entity;this._optimisticOn(),this._callService(e.split(".")[0],"select_option",{entity_id:e,option:t})}_optimisticOn(){this._isOn||(this._powerOv=!0,this.requestUpdate(),clearTimeout(this._powerTimer),this._powerTimer=setTimeout(()=>{this._powerOv=void 0,this.requestUpdate()},4e3))}_renderPill(t,e,i,s){const n=Number(i.min??0),r=Number(i.max??100),o=Number(i.step??1),a="spread"===s?2.2:1,l=function(t,e,i,s=1){if(i===e)return 0;const n=Math.min(1,Math.max(0,(t-e)/(i-e)));return 1===s?n:Math.pow(n,1/s)}(this._ov?.[s]??Number(e?.state??n),n,r,a);return q`
      <div
        class="pill-slider"
        @pointerdown=${t=>this._pillDown(t,n,r,o,s)}
        @pointermove=${t=>this._pillMove(t,n,r,o,s)}
        @pointerup=${this._pillUp}
        @pointercancel=${this._pillUp}
      >
        <div class="pill-fill" style="width:${100*l}%"></div>
        <ha-icon class="pill-icon" icon=${t}></ha-icon>
      </div>`}_pillDown(t,e,i,s,n){this._pillDragging=!0,t.target.setPointerCapture?.(t.pointerId),this._pillApply(t,e,i,s,n)}_pillMove(t,e,i,s,n){this._pillDragging&&this._pillApply(t,e,i,s,n)}_pillUp(t){this._pillDragging=!1,t.target.releasePointerCapture?.(t.pointerId)}_pillApply(t,e,i,s,n){const r=t.currentTarget.getBoundingClientRect(),o="spread"===n?2.2:1,a=function(t,e,i,s,n,r,o=1){const a=i?(t-e)/i:0,l=Math.min(1,Math.max(0,a)),c=s+(1===o?l:Math.pow(l,o))*(n-s),h=r?Math.round(c/r)*r:c;return Math.min(n,Math.max(s,h))}(t.clientX,r.left,r.width,e,i,s,o);this._ov={...this._ov,[n]:a},this._optimisticOn(),"brightness"===n?this._debouncedSetBrightness(a):this._debouncedSetSpread(a),this.requestUpdate()}_setValue(t,e){this._callService(t.split(".")[0],"set_value",{entity_id:t,value:e})}_callService(t,e,i,s){this._hass.callService(t,e,i,s)}}customElements.define("nanoleaf-reloaded-card",St);class Et extends lt{static properties={_config:{state:!0}};static styles=r`
    .editor { display: flex; flex-direction: column; gap: 12px; }
    .device-block {
      border: 1px solid var(--divider-color);
      border-radius: 10px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .device-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      color: var(--primary-text-color);
    }
    .field { display: flex; flex-direction: column; gap: 4px; }
    label { font-size: 13px; color: var(--secondary-text-color); }
    select,
    input[type='text'] {
      padding: 8px;
      border-radius: 8px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font-size: 14px;
    }
    button {
      border: none;
      border-radius: 8px;
      padding: 8px 14px;
      font-size: 14px;
      cursor: pointer;
    }
    .editor-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .add { background: var(--primary-color); color: #fff; }
    .rm {
      background: none;
      color: var(--error-color, #c00);
      padding: 4px 8px;
    }
  `;setConfig(t){this._config=t||{}}set hass(t){this._hass=t,this.requestUpdate()}_devices(){if(Array.isArray(this._config?.devices))return this._config.devices.length?this._config.devices:[{}];const t={};for(const e of ft)null!=this._config?.[e.key]&&(t[e.key]=this._config[e.key]);return null!=this._config?.name&&(t.name=this._config.name),[t]}_options(t){return Object.keys(this._hass?.states??{}).filter(e=>e.split(".")[0]===t).sort()}_emit(t){const e=new Set([...ft.map(t=>t.key),"name"]),i={};for(const[t,s]of Object.entries(this._config||{}))"devices"===t||e.has(t)||(i[t]=s);const s=t.length<=1?{...i,...t[0]||{}}:{...i,devices:t};this._config=s,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:s},bubbles:!0,composed:!0}))}_updateDevice(t,e,i){const s=this._devices().map(t=>({...t}));""===i?delete s[t][e]:s[t][e]=i,this._emit(s)}_addDevice(){this._emit([...this._devices().map(t=>({...t})),{}])}_autoDetect(){const t=yt(this._hass);t.length&&this._emit(t)}_removeDevice(t){this._emit(this._devices().filter((e,i)=>i!==t))}render(){if(!this._hass)return q``;const t=this._devices();return q`
      <div class="editor">
        ${t.map((e,i)=>q`
            <div class="device-block">
              <div class="device-head">
                <span>Device ${i+1}</span>
                ${t.length>1?q`<button
                      class="rm"
                      @click=${()=>this._removeDevice(i)}
                    >
                      Remove
                    </button>`:""}
              </div>
              <div class="field">
                <label>Name (optional)</label>
                <input
                  type="text"
                  .value=${e.name??""}
                  @input=${t=>this._updateDevice(i,"name",t.target.value)}
                />
              </div>
              ${ft.map(t=>{const s=e[t.key]??"";return q`
                  <div class="field">
                    <label>${t.label}</label>
                    <select
                      @change=${e=>this._updateDevice(i,t.key,e.target.value)}
                    >
                      <option value="" ?selected=${!s}>—</option>
                      ${this._options(t.domain).map(t=>q`
                          <option
                            value=${t}
                            ?selected=${t===s}
                          >
                            ${t}
                          </option>`)}
                    </select>
                  </div>`})}
            </div>`)}
        <div class="editor-actions">
          <button class="add" @click=${this._autoDetect}>
            Auto-detect devices
          </button>
          <button class="add" @click=${this._addDevice}>
            + Add device
          </button>
        </div>
      </div>`}}customElements.define("nanoleaf-reloaded-card-editor",Et),window.customCards=window.customCards||[],window.customCards.push({type:"nanoleaf-reloaded-card",name:"Nanoleaf Reloaded Card",description:"Control panel for Nanoleaf light panels",preview:!0})}();
