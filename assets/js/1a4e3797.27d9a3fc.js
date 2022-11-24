"use strict";(self.webpackChunkreact_native_calendar_kit_document=self.webpackChunkreact_native_calendar_kit_document||[]).push([[920],{2027:(e,t,n)=>{n.r(t),n.d(t,{default:()=>x});var a=n(7294),r=n(2263),l=n(3929),s=n(5742),c=n(9960),o=n(5999);const u=["zero","one","two","few","many","other"];function m(e){return u.filter((t=>e.includes(t)))}const i={locale:"en",pluralForms:m(["one","other"]),select:e=>1===e?"one":"other"};function h(){const{i18n:{currentLocale:e}}=(0,r.Z)();return(0,a.useMemo)((()=>{try{return function(e){const t=new Intl.PluralRules(e);return{locale:e,pluralForms:m(t.resolvedOptions().pluralCategories),select:e=>t.select(e)}}(e)}catch(t){return console.error(`Failed to use Intl.PluralRules for locale "${e}".\nDocusaurus will fallback to the default (English) implementation.\nError: ${t.message}\n`),i}}),[e])}function p(){const e=h();return{selectMessage:(t,n)=>function(e,t,n){const a=e.split("|");if(1===a.length)return a[0];a.length>n.pluralForms.length&&console.error(`For locale=${n.locale}, a maximum of ${n.pluralForms.length} plural forms are expected (${n.pluralForms.join(",")}), but the message contains ${a.length}: ${e}`);const r=n.select(t),l=n.pluralForms.indexOf(r);return a[Math.min(l,a.length-1)]}(n,t,e)}}var d=n(6550),g=n(412);const f=function(){const e=(0,d.k6)(),t=(0,d.TH)(),{siteConfig:{baseUrl:n}}=(0,r.Z)(),a=g.Z.canUseDOM?new URLSearchParams(t.search):null,l=(null==a?void 0:a.get("q"))||"",s=(null==a?void 0:a.get("ctx"))||"",c=(null==a?void 0:a.get("version"))||"",o=e=>{const n=new URLSearchParams(t.search);return e?n.set("q",e):n.delete("q"),n};return{searchValue:l,searchContext:s,searchVersion:c,updateSearchPath:t=>{const n=o(t);e.replace({search:n.toString()})},generateSearchPageLink:e=>{const t=o(e);return`${n}search?${t.toString()}`}}};var E=n(22),y=n(8202),S=n(2539),_=n(726),v=n(1073),w=n(311),b=n(3926),I=n(1029);const P="searchQueryInput_CFBF",k="searchResultItem_U687",F="searchResultItemPath_uIbk",R="searchResultItemSummary_oZHr";function C(){const{siteConfig:{baseUrl:e}}=(0,r.Z)(),{selectMessage:t}=p(),{searchValue:n,searchContext:l,searchVersion:c,updateSearchPath:u}=f(),[m,i]=(0,a.useState)(n),[h,d]=(0,a.useState)(),[g,S]=(0,a.useState)(),_=`${e}${c}`,v=(0,a.useMemo)((()=>m?(0,o.I)({id:"theme.SearchPage.existingResultsTitle",message:'Search results for "{query}"',description:"The search page title for non-empty query"},{query:m}):(0,o.I)({id:"theme.SearchPage.emptyResultsTitle",message:"Search the documentation",description:"The search page title for empty query"})),[m]);(0,a.useEffect)((()=>{u(m),h&&(m?h(m,(e=>{S(e)})):S(void 0))}),[m,h]);const b=(0,a.useCallback)((e=>{i(e.target.value)}),[]);return(0,a.useEffect)((()=>{n&&n!==m&&i(n)}),[n]),(0,a.useEffect)((()=>{!async function(){const{wrappedIndexes:e,zhDictionary:t}=await(0,E.w)(_,l);d((()=>(0,y.v)(e,t,100)))}()}),[l,_]),a.createElement(a.Fragment,null,a.createElement(s.Z,null,a.createElement("meta",{property:"robots",content:"noindex, follow"}),a.createElement("title",null,v)),a.createElement("div",{className:"container margin-vert--lg"},a.createElement("h1",null,v),a.createElement("input",{type:"search",name:"q",className:P,"aria-label":"Search",onChange:b,value:m,autoComplete:"off",autoFocus:!0}),!h&&m&&a.createElement("div",null,a.createElement(w.Z,null)),g&&(g.length>0?a.createElement("p",null,t(g.length,(0,o.I)({id:"theme.SearchPage.documentsFound.plurals",message:"1 document found|{count} documents found",description:'Pluralized label for "{count} documents found". Use as much plural forms (separated by "|") as your language support (see https://www.unicode.org/cldr/cldr-aux/charts/34/supplemental/language_plural_rules.html)'},{count:g.length}))):a.createElement("p",null,(0,o.I)({id:"theme.SearchPage.noResultsText",message:"No documents were found",description:"The paragraph for empty search result"}))),a.createElement("section",null,g&&g.map((e=>a.createElement($,{key:e.document.i,searchResult:e}))))))}function $(e){let{searchResult:{document:t,type:n,page:r,tokens:l,metadata:s}}=e;const o=0===n,u=2===n,m=(o?t.b:r.b).slice(),i=u?t.s:t.t;o||m.push(r.t);let h="";if(I.vc&&l.length>0){const e=new URLSearchParams;for(const t of l)e.append("_highlight",t);h=`?${e.toString()}`}return a.createElement("article",{className:k},a.createElement("h2",null,a.createElement(c.Z,{to:t.u+h+(t.h||""),dangerouslySetInnerHTML:{__html:u?(0,S.C)(i,l):(0,_.o)(i,(0,v.m)(s,"t"),l,100)}})),m.length>0&&a.createElement("p",{className:F},(0,b.e)(m)),u&&a.createElement("p",{className:R,dangerouslySetInnerHTML:{__html:(0,_.o)(t.t,(0,v.m)(s,"t"),l,100)}}))}const x=function(){return a.createElement(l.Z,null,a.createElement(C,null))}}}]);