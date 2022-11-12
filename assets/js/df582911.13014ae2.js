"use strict";(self.webpackChunkreact_native_calendar_kit_document=self.webpackChunkreact_native_calendar_kit_document||[]).push([[481],{3905:(e,t,n)=>{n.d(t,{Zo:()=>d,kt:()=>g});var r=n(7294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function A(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var l=r.createContext({}),c=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},d=function(e){var t=c(e.components);return r.createElement(l.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},s=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,l=e.parentName,d=A(e,["components","mdxType","originalType","parentName"]),s=c(n),g=a,m=s["".concat(l,".").concat(g)]||s[g]||u[g]||o;return n?r.createElement(m,i(i({ref:t},d),{},{components:n})):r.createElement(m,i({ref:t},d))}));function g(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,i=new Array(o);i[0]=s;var A={};for(var l in t)hasOwnProperty.call(t,l)&&(A[l]=t[l]);A.originalType=e,A.mdxType="string"==typeof e?e:a,i[1]=A;for(var c=2;c<o;c++)i[c]=n[c];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}s.displayName="MDXCreateElement"},2781:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>i,default:()=>u,frontMatter:()=>o,metadata:()=>A,toc:()=>c});var r=n(7462),a=(n(7294),n(3905));const o={sidebar_position:7},i="Custom Header",A={unversionedId:"guides/custom-header",id:"guides/custom-header",title:"Custom Header",description:"Customize the header",source:"@site/docs/guides/custom-header.md",sourceDirName:"guides",slug:"/guides/custom-header",permalink:"/react-native-calendar-kit/docs/guides/custom-header",draft:!1,tags:[],version:"current",sidebarPosition:7,frontMatter:{sidebar_position:7},sidebar:"tutorialSidebar",previous:{title:"Fetch events",permalink:"/react-native-calendar-kit/docs/guides/fetch-events"},next:{title:"Unavailable Time",permalink:"/react-native-calendar-kit/docs/guides/unavailableTime"}},l={},c=[{value:"highlightDates",id:"highlightdates",level:2},{value:"theme",id:"theme",level:2}],d={toc:c};function u(e){let{components:t,...o}=e;return(0,a.kt)("wrapper",(0,r.Z)({},d,o,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"custom-header"},"Custom Header"),(0,a.kt)("p",null,"Customize the header"),(0,a.kt)("h2",{id:"highlightdates"},"highlightDates"),(0,a.kt)("p",null,(0,a.kt)("img",{alt:"highlightDates",src:n(8517).Z,width:"182",height:"122"})),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-jsx",metastring:'title="highlightDates"',title:'"highlightDates"'},"const highlightDates: HighlightDates = useMemo(\n  () => ({\n    '2022-11-07': {\n      dayNameColor: 'red',\n      dayNumberColor: 'red',\n      dayNumberBackgroundColor: '#FFF',\n    },\n    '2022-11-08': {\n      dayNameColor: 'red',\n      dayNumberColor: 'red',\n      dayNumberBackgroundColor: '#FFF',\n    },\n    '2022-11-09': {\n      dayNameColor: 'blue',\n      dayNumberColor: 'blue',\n      dayNumberBackgroundColor: '#FFF',\n    },\n  }),\n  []\n);\n\n<TimelineCalendar viewMode=\"week\" highlightDates={highlightDates} />;\n")),(0,a.kt)("h2",{id:"theme"},"theme"),(0,a.kt)("p",null,(0,a.kt)("img",{alt:"weekend-style",src:n(5622).Z,width:"204",height:"63"})),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-jsx",metastring:'title="highlightDates"',title:'"highlightDates"'},"<TimelineCalendar\n  viewMode=\"week\"\n  theme={{\n    //Saturday style\n    saturdayName: { color: 'blue' },\n    saturdayNumber: { color: 'blue' },\n    saturdayNumberContainer: { backgroundColor: 'white' },\n\n    //Sunday style\n    sundayName: { color: 'red' },\n    sundayNumber: { color: 'red' },\n    sundayNumberContainer: { backgroundColor: 'white' },\n\n    //Today style\n    todayName: { color: 'green' },\n    todayNumber: { color: 'white' },\n    todayNumberContainer: { backgroundColor: 'green' },\n\n    //Normal style\n    dayName: { color: 'black' },\n    dayNumber: { color: 'black' },\n    dayNumberContainer: { backgroundColor: 'white' },\n  }}\n/>\n")))}u.isMDXComponent=!0},8517:(e,t,n)=>{n.d(t,{Z:()=>r});const r=n.p+"assets/images/highlight-dates-c8d388a9c0c9d6c2e21ce8bebd5a365d.png"},5622:(e,t,n)=>{n.d(t,{Z:()=>r});const r="data:image/png;base64,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"}}]);