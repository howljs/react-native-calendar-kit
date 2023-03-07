"use strict";(self.webpackChunkreact_native_calendar_kit_document=self.webpackChunkreact_native_calendar_kit_document||[]).push([[741],{3905:(e,t,n)=>{n.d(t,{Zo:()=>u,kt:()=>h});var l=n(7294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);t&&(l=l.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,l)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,l,r=function(e,t){if(null==e)return{};var n,l,r={},a=Object.keys(e);for(l=0;l<a.length;l++)n=a[l],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(l=0;l<a.length;l++)n=a[l],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var s=l.createContext({}),d=function(e){var t=l.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},u=function(e){var t=d(e.components);return l.createElement(s.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return l.createElement(l.Fragment,{},t)}},c=l.forwardRef((function(e,t){var n=e.components,r=e.mdxType,a=e.originalType,s=e.parentName,u=o(e,["components","mdxType","originalType","parentName"]),c=d(n),h=r,k=c["".concat(s,".").concat(h)]||c[h]||p[h]||a;return n?l.createElement(k,i(i({ref:t},u),{},{components:n})):l.createElement(k,i({ref:t},u))}));function h(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var a=n.length,i=new Array(a);i[0]=c;var o={};for(var s in t)hasOwnProperty.call(t,s)&&(o[s]=t[s]);o.originalType=e,o.mdxType="string"==typeof e?e:r,i[1]=o;for(var d=2;d<a;d++)i[d]=n[d];return l.createElement.apply(null,i)}return l.createElement.apply(null,n)}c.displayName="MDXCreateElement"},6629:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>i,default:()=>p,frontMatter:()=>a,metadata:()=>o,toc:()=>d});var l=n(7462),r=(n(7294),n(3905));const a={sidebar_position:11},i="Other Props",o={unversionedId:"guides/other-props",id:"guides/other-props",title:"Other Props",description:"Some other properties of TimelineCalendar",source:"@site/docs/guides/other-props.md",sourceDirName:"guides",slug:"/guides/other-props",permalink:"/react-native-calendar-kit/docs/guides/other-props",draft:!1,tags:[],version:"current",sidebarPosition:11,frontMatter:{sidebar_position:11},sidebar:"tutorialSidebar",previous:{title:"Locale",permalink:"/react-native-calendar-kit/docs/guides/locale"}},s={},d=[{value:"minDate",id:"mindate",level:3},{value:"maxDate",id:"maxdate",level:3},{value:"initialDate",id:"initialdate",level:3},{value:"start",id:"start",level:3},{value:"end",id:"end",level:3},{value:"hourWidth",id:"hourwidth",level:3},{value:"firstDay",id:"firstday",level:3},{value:"timeInterval",id:"timeinterval",level:3},{value:"syncedLists",id:"syncedlists",level:3},{value:"spaceFromTop",id:"spacefromtop",level:3},{value:"spaceFromBottom",id:"spacefrombottom",level:3},{value:"isShowHalfLine",id:"isshowhalfline",level:3},{value:"showNowIndicator",id:"shownowindicator",level:3},{value:"scrollToNow",id:"scrolltonow",level:3},{value:"rightEdgeSpacing",id:"rightedgespacing",level:3},{value:"overlapEventsSpacing",id:"overlapeventsspacing",level:3},{value:"renderDayBarItem",id:"renderdaybaritem",level:3},{value:"renderEventContent",id:"rendereventcontent",level:3},{value:"onPressDayNum",id:"onpressdaynum",level:3},{value:"onPressBackground",id:"onpressbackground",level:3},{value:"onLongPressBackground",id:"onlongpressbackground",level:3},{value:"onPressOutBackground",id:"onpressoutbackground",level:3},{value:"onPressEvent",id:"onpressevent",level:3},{value:"isShowHeader",id:"isshowheader",level:3},{value:"onChange",id:"onchange",level:3},{value:"hourFormat",id:"hourformat",level:3},{value:"eventAnimatedDuration",id:"eventanimatedduration",level:3},{value:"useHaptic",id:"usehaptic",level:3},{value:"editEventGestureEnabled",id:"editeventgestureenabled",level:3},{value:"renderSelectedEventContent",id:"renderselectedeventcontent",level:3},{value:"timeZone",id:"timezone",level:3},{value:"renderHalfLineCustom",id:"renderhalflinecustom",level:3},{value:"halfLineContainerStyle",id:"halflinecontainerstyle",level:3},{value:"nowIndicatorInterval",id:"nowindicatorinterval",level:3},{value:"calendarWidth",id:"calendarwidth",level:3},{value:"onTimeIntervalHeightChange",id:"ontimeintervalheightchange",level:3}],u={toc:d};function p(e){let{components:t,...n}=e;return(0,r.kt)("wrapper",(0,l.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"other-props"},"Other Props"),(0,r.kt)("p",null,"Some other properties of TimelineCalendar"),(0,r.kt)("h3",{id:"mindate"},"minDate"),(0,r.kt)("p",null,"Minimum display date. Format: (YYYY-MM-DD). Default is ",(0,r.kt)("strong",{parentName:"p"},"2 year ago")),(0,r.kt)("span",{style:{color:"grey"}},"string"),(0,r.kt)("h3",{id:"maxdate"},"maxDate"),(0,r.kt)("p",null,"Maximum display date. Format: (YYYY-MM-DD). Default is ",(0,r.kt)("strong",{parentName:"p"},"2 year later")),(0,r.kt)("span",{style:{color:"grey"}},"string"),(0,r.kt)("h3",{id:"initialdate"},"initialDate"),(0,r.kt)("p",null,"Initial display date. Format: (YYYY-MM-DD). Default is ",(0,r.kt)("strong",{parentName:"p"},"today")),(0,r.kt)("span",{style:{color:"grey"}},"string"),(0,r.kt)("h3",{id:"start"},"start"),(0,r.kt)("p",null,"Start hour of the day. Default is ",(0,r.kt)("inlineCode",{parentName:"p"},"0")),(0,r.kt)("span",{style:{color:"grey"}},"number"),(0,r.kt)("h3",{id:"end"},"end"),(0,r.kt)("p",null,"End hour of the day. Default is ",(0,r.kt)("inlineCode",{parentName:"p"},"24")),(0,r.kt)("span",{style:{color:"grey"}},"number"),(0,r.kt)("h3",{id:"hourwidth"},"hourWidth"),(0,r.kt)("p",null,"Width of hour column. Default is ",(0,r.kt)("inlineCode",{parentName:"p"},"53")),(0,r.kt)("span",{style:{color:"grey"}},"number"),(0,r.kt)("h3",{id:"firstday"},"firstDay"),(0,r.kt)("p",null,"First day of the week. Default is ",(0,r.kt)("inlineCode",{parentName:"p"},"1")," (Monday)"),(0,r.kt)("span",{style:{color:"grey"}},"number"),(0,r.kt)("h3",{id:"timeinterval"},"timeInterval"),(0,r.kt)("p",null,"The interval of time slots. Default is ",(0,r.kt)("inlineCode",{parentName:"p"},"60")," minutes"),(0,r.kt)("span",{style:{color:"grey"}},"number"),(0,r.kt)("h3",{id:"syncedlists"},"syncedLists"),(0,r.kt)("p",null,"Auto scroll header when scroll time slots view. Default is ",(0,r.kt)("inlineCode",{parentName:"p"},"true")),(0,r.kt)("span",{style:{color:"grey"}},"boolean"),(0,r.kt)("h3",{id:"spacefromtop"},"spaceFromTop"),(0,r.kt)("p",null,"Space between header view and time slots view. Default is ",(0,r.kt)("inlineCode",{parentName:"p"},"16")),(0,r.kt)("span",{style:{color:"grey"}},"number"),(0,r.kt)("h3",{id:"spacefrombottom"},"spaceFromBottom"),(0,r.kt)("p",null,"Space below time slots view. Default is ",(0,r.kt)("inlineCode",{parentName:"p"},"16")),(0,r.kt)("span",{style:{color:"grey"}},"number"),(0,r.kt)("h3",{id:"isshowhalfline"},"isShowHalfLine"),(0,r.kt)("p",null,"Show a line in the middle of the interval. Default is ",(0,r.kt)("inlineCode",{parentName:"p"},"true")),(0,r.kt)("span",{style:{color:"grey"}},"boolean"),(0,r.kt)("h3",{id:"shownowindicator"},"showNowIndicator"),(0,r.kt)("p",null,"Show a line at current time. Default is ",(0,r.kt)("inlineCode",{parentName:"p"},"true")),(0,r.kt)("span",{style:{color:"grey"}},"boolean"),(0,r.kt)("h3",{id:"scrolltonow"},"scrollToNow"),(0,r.kt)("p",null,"Auto scroll to current time. Default is ",(0,r.kt)("inlineCode",{parentName:"p"},"true")),(0,r.kt)("span",{style:{color:"grey"}},"boolean"),(0,r.kt)("h3",{id:"rightedgespacing"},"rightEdgeSpacing"),(0,r.kt)("p",null,"Spacing at the right edge of events. Default is ",(0,r.kt)("inlineCode",{parentName:"p"},"1")),(0,r.kt)("span",{style:{color:"grey"}},"number"),(0,r.kt)("h3",{id:"overlapeventsspacing"},"overlapEventsSpacing"),(0,r.kt)("p",null,"Spacing between overlapping events. Default is ",(0,r.kt)("inlineCode",{parentName:"p"},"1")),(0,r.kt)("span",{style:{color:"grey"}},"number"),(0,r.kt)("h3",{id:"renderdaybaritem"},"renderDayBarItem"),(0,r.kt)("p",null,"Custom header component"),(0,r.kt)("span",{style:{color:"grey"}},"function"),(0,r.kt)("h3",{id:"rendereventcontent"},"renderEventContent"),(0,r.kt)("p",null,"Custom component rendered inside an event"),(0,r.kt)("span",{style:{color:"grey"}},"function"),(0,r.kt)("h3",{id:"onpressdaynum"},"onPressDayNum"),(0,r.kt)("p",null,"Callback function will be called when day in header is pressed"),(0,r.kt)("span",{style:{color:"grey"}},"function"),(0,r.kt)("h3",{id:"onpressbackground"},"onPressBackground"),(0,r.kt)("p",null,"Callback function will be called when time slots view is pressed"),(0,r.kt)("span",{style:{color:"grey"}},"function"),(0,r.kt)("h3",{id:"onlongpressbackground"},"onLongPressBackground"),(0,r.kt)("p",null,"Callback function will be called when time slots view is long pressed"),(0,r.kt)("h3",{id:"onpressoutbackground"},"onPressOutBackground"),(0,r.kt)("p",null,"Callback function will be called when time slots view is pressed out"),(0,r.kt)("span",{style:{color:"grey"}},"function"),(0,r.kt)("h3",{id:"onpressevent"},"onPressEvent"),(0,r.kt)("p",null,"Callback function will be called when the event item is pressed"),(0,r.kt)("span",{style:{color:"grey"}},"function"),(0,r.kt)("h3",{id:"isshowheader"},"isShowHeader"),(0,r.kt)("p",null,"Show/Hide header component. Default is ",(0,r.kt)("inlineCode",{parentName:"p"},"true")),(0,r.kt)("span",{style:{color:"grey"}},"boolean"),(0,r.kt)("h3",{id:"onchange"},"onChange"),(0,r.kt)("p",null,"Callback function will be called when the timeline is scrolling"),(0,r.kt)("span",{style:{color:"grey"}},"boolean"),(0,r.kt)("h3",{id:"hourformat"},"hourFormat"),(0,r.kt)("p",null,"Hour format. Default is ",(0,r.kt)("inlineCode",{parentName:"p"},"HH:mm")),(0,r.kt)("span",{style:{color:"grey"}},"string"),(0,r.kt)("h3",{id:"eventanimatedduration"},"eventAnimatedDuration"),(0,r.kt)("p",null,"How long the animation should last when the style of the event is changed. Default is ",(0,r.kt)("inlineCode",{parentName:"p"},"250")),(0,r.kt)("span",{style:{color:"grey"}},"number"),(0,r.kt)("h3",{id:"usehaptic"},"useHaptic"),(0,r.kt)("p",null,"Haptic Feedback when drag to create/edit."),(0,r.kt)("span",{style:{color:"grey"}},"boolean"),(0,r.kt)("h3",{id:"editeventgestureenabled"},"editEventGestureEnabled"),(0,r.kt)("p",null,"Enable drag with selected event. Default is ",(0,r.kt)("inlineCode",{parentName:"p"},"true")),(0,r.kt)("span",{style:{color:"grey"}},"boolean"),(0,r.kt)("h3",{id:"renderselectedeventcontent"},"renderSelectedEventContent"),(0,r.kt)("p",null,"Custom component rendered inside an selected event"),(0,r.kt)("span",{style:{color:"grey"}},"function"),(0,r.kt)("h3",{id:"timezone"},"timeZone"),(0,r.kt)("p",null,"Use calendar in different time zones"),(0,r.kt)("span",{style:{color:"grey"}},"string"),(0,r.kt)("h3",{id:"renderhalflinecustom"},"renderHalfLineCustom"),(0,r.kt)("p",null,"Custom component rendered inside the line in the middle of the interval"),(0,r.kt)("span",{style:{color:"grey"}},"function"),(0,r.kt)("h3",{id:"halflinecontainerstyle"},"halfLineContainerStyle"),(0,r.kt)("p",null,"Container style of the line in the middle of the interval."),(0,r.kt)("span",{style:{color:"grey"}},"function"),(0,r.kt)("h3",{id:"nowindicatorinterval"},"nowIndicatorInterval"),(0,r.kt)("p",null,"Update indicator at specified intervals (in milliseconds). Default is ",(0,r.kt)("inlineCode",{parentName:"p"},"1000")),(0,r.kt)("span",{style:{color:"grey"}},"number"),(0,r.kt)("h3",{id:"calendarwidth"},"calendarWidth"),(0,r.kt)("p",null,"Width of calendar. Default is ",(0,r.kt)("inlineCode",{parentName:"p"},"window width")),(0,r.kt)("span",{style:{color:"grey"}},"number"),(0,r.kt)("h3",{id:"ontimeintervalheightchange"},"onTimeIntervalHeightChange"),(0,r.kt)("p",null,"Callback function will be called when the time interval height is changed"),(0,r.kt)("span",{style:{color:"grey"}},"function"))}p.isMDXComponent=!0}}]);