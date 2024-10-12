/*! For license information please see 2fba4e46.d90ab404.js.LICENSE.txt */
"use strict";(self.webpackChunkcalendar_kit_docs=self.webpackChunkcalendar_kit_docs||[]).push([[4803],{8979:(e,r,n)=>{n.r(r),n.d(r,{assets:()=>c,contentTitle:()=>i,default:()=>h,frontMatter:()=>s,metadata:()=>o,toc:()=>a});var t=n(412),d=n(6823);const s={sidebar_position:3},i="CalendarBody",o={id:"api/calendar-body",title:"CalendarBody",description:"The CalendarBody component is a core part of the React Native Calendar Kit. It renders the main calendar grid, including time slots, events, and various interactive elements.",source:"@site/docs/api/calendar-body.md",sourceDirName:"api",slug:"/api/calendar-body",permalink:"/react-native-calendar-kit/docs/api/calendar-body",draft:!1,unlisted:!1,tags:[],version:"current",sidebarPosition:3,frontMatter:{sidebar_position:3},sidebar:"tutorialSidebar",previous:{title:"CalendarHeader",permalink:"/react-native-calendar-kit/docs/api/calendar-header"},next:{title:"useCalendar",permalink:"/react-native-calendar-kit/docs/api/hooks/useCalendar"}},c={},a=[{value:"Props",id:"props",level:2}];function l(e){const r={code:"code",h1:"h1",h2:"h2",header:"header",p:"p",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,d.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(r.header,{children:(0,t.jsx)(r.h1,{id:"calendarbody",children:"CalendarBody"})}),"\n",(0,t.jsxs)(r.p,{children:["The ",(0,t.jsx)(r.code,{children:"CalendarBody"})," component is a core part of the React Native Calendar Kit. It renders the main calendar grid, including time slots, events, and various interactive elements."]}),"\n",(0,t.jsx)(r.h2,{id:"props",children:"Props"}),"\n",(0,t.jsxs)(r.p,{children:["The ",(0,t.jsx)(r.code,{children:"CalendarBody"})," component accepts the following props:"]}),"\n",(0,t.jsxs)(r.table,{children:[(0,t.jsx)(r.thead,{children:(0,t.jsxs)(r.tr,{children:[(0,t.jsx)(r.th,{children:"Prop Name"}),(0,t.jsx)(r.th,{children:"Type"}),(0,t.jsx)(r.th,{children:"Default"}),(0,t.jsx)(r.th,{children:"Description"})]})}),(0,t.jsxs)(r.tbody,{children:[(0,t.jsxs)(r.tr,{children:[(0,t.jsx)(r.td,{children:(0,t.jsx)(r.code,{children:"hourFormat"})}),(0,t.jsx)(r.td,{children:"string"}),(0,t.jsx)(r.td,{children:(0,t.jsx)(r.code,{children:"'HH:mm'"})}),(0,t.jsx)(r.td,{children:"Format for displaying hours."})]}),(0,t.jsxs)(r.tr,{children:[(0,t.jsx)(r.td,{children:(0,t.jsx)(r.code,{children:"renderHour"})}),(0,t.jsx)(r.td,{children:"function"}),(0,t.jsx)(r.td,{children:"-"}),(0,t.jsx)(r.td,{children:"Custom renderer for hour labels."})]}),(0,t.jsxs)(r.tr,{children:[(0,t.jsx)(r.td,{children:(0,t.jsx)(r.code,{children:"showNowIndicator"})}),(0,t.jsx)(r.td,{children:"boolean"}),(0,t.jsx)(r.td,{children:(0,t.jsx)(r.code,{children:"true"})}),(0,t.jsx)(r.td,{children:"Whether to show the current time indicator."})]}),(0,t.jsxs)(r.tr,{children:[(0,t.jsx)(r.td,{children:(0,t.jsx)(r.code,{children:"renderCustomOutOfRange"})}),(0,t.jsx)(r.td,{children:"function"}),(0,t.jsx)(r.td,{children:"-"}),(0,t.jsx)(r.td,{children:"Custom renderer for out-of-range areas."})]}),(0,t.jsxs)(r.tr,{children:[(0,t.jsx)(r.td,{children:(0,t.jsx)(r.code,{children:"renderCustomUnavailableHour"})}),(0,t.jsx)(r.td,{children:"function"}),(0,t.jsx)(r.td,{children:"-"}),(0,t.jsx)(r.td,{children:"Custom renderer for unavailable hours."})]}),(0,t.jsxs)(r.tr,{children:[(0,t.jsx)(r.td,{children:(0,t.jsx)(r.code,{children:"renderEvent"})}),(0,t.jsx)(r.td,{children:"function"}),(0,t.jsx)(r.td,{children:"-"}),(0,t.jsx)(r.td,{children:"Custom renderer for events."})]}),(0,t.jsxs)(r.tr,{children:[(0,t.jsx)(r.td,{children:(0,t.jsx)(r.code,{children:"renderDraggableEvent"})}),(0,t.jsx)(r.td,{children:"function"}),(0,t.jsx)(r.td,{children:"-"}),(0,t.jsx)(r.td,{children:"Custom renderer for draggable events."})]}),(0,t.jsxs)(r.tr,{children:[(0,t.jsx)(r.td,{children:(0,t.jsx)(r.code,{children:"renderDraggingEvent"})}),(0,t.jsx)(r.td,{children:"function"}),(0,t.jsx)(r.td,{children:"-"}),(0,t.jsx)(r.td,{children:"Custom renderer for events being dragged."})]}),(0,t.jsxs)(r.tr,{children:[(0,t.jsx)(r.td,{children:(0,t.jsx)(r.code,{children:"renderDraggingHour"})}),(0,t.jsx)(r.td,{children:"function"}),(0,t.jsx)(r.td,{children:"-"}),(0,t.jsx)(r.td,{children:"Custom renderer for hour indicator while dragging."})]}),(0,t.jsxs)(r.tr,{children:[(0,t.jsx)(r.td,{children:(0,t.jsx)(r.code,{children:"NowIndicatorComponent"})}),(0,t.jsx)(r.td,{children:"component"}),(0,t.jsx)(r.td,{children:"-"}),(0,t.jsx)(r.td,{children:"Custom component for the current time indicator."})]})]})]})]})}function h(e={}){const{wrapper:r}={...(0,d.R)(),...e.components};return r?(0,t.jsx)(r,{...e,children:(0,t.jsx)(l,{...e})}):l(e)}},9296:(e,r,n)=>{var t=n(9856),d=Symbol.for("react.element"),s=Symbol.for("react.fragment"),i=Object.prototype.hasOwnProperty,o=t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,c={key:!0,ref:!0,__self:!0,__source:!0};function a(e,r,n){var t,s={},a=null,l=null;for(t in void 0!==n&&(a=""+n),void 0!==r.key&&(a=""+r.key),void 0!==r.ref&&(l=r.ref),r)i.call(r,t)&&!c.hasOwnProperty(t)&&(s[t]=r[t]);if(e&&e.defaultProps)for(t in r=e.defaultProps)void 0===s[t]&&(s[t]=r[t]);return{$$typeof:d,type:e,key:a,ref:l,props:s,_owner:o.current}}r.Fragment=s,r.jsx=a,r.jsxs=a},412:(e,r,n)=>{e.exports=n(9296)},6823:(e,r,n)=>{n.d(r,{R:()=>i,x:()=>o});var t=n(9856);const d={},s=t.createContext(d);function i(e){const r=t.useContext(s);return t.useMemo((function(){return"function"==typeof e?e(r):{...r,...e}}),[r,e])}function o(e){let r;return r=e.disableParentContext?"function"==typeof e.components?e.components(d):e.components||d:i(e.components),t.createElement(s.Provider,{value:r},e.children)}}}]);