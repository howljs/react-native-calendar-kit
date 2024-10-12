/*! For license information please see 93ef81b0.37cebf10.js.LICENSE.txt */
"use strict";(self.webpackChunkcalendar_kit_docs=self.webpackChunkcalendar_kit_docs||[]).push([[1093],{7515:(e,n,a)=>{a.r(n),a.d(n,{assets:()=>d,contentTitle:()=>i,default:()=>u,frontMatter:()=>t,metadata:()=>l,toc:()=>o});var r=a(412),s=a(6823);const t={sidebar_position:7},i="Unavailable Hours",l={id:"guides/unavailable-time",title:"Unavailable Hours",description:"React Native Calendar Kit allows you to specify certain hours as unavailable in your calendar view. This feature is useful for indicating non-working hours, lunch breaks, or any other time slots that should be visually distinguished or blocked off.",source:"@site/docs/guides/unavailable-time.md",sourceDirName:"guides",slug:"/guides/unavailable-time",permalink:"/react-native-calendar-kit/docs/guides/unavailable-time",draft:!1,unlisted:!1,tags:[],version:"current",sidebarPosition:7,frontMatter:{sidebar_position:7},sidebar:"tutorialSidebar",previous:{title:"Pinch to Zoom",permalink:"/react-native-calendar-kit/docs/guides/pinch-to-zoom"},next:{title:"Locale and Date Formatting",permalink:"/react-native-calendar-kit/docs/guides/locale"}},d={},o=[{value:"Using the unavailableHours Prop",id:"using-the-unavailablehours-prop",level:2},{value:"Applying to all days of the week",id:"applying-to-all-days-of-the-week",level:3},{value:"Applying to specific days",id:"applying-to-specific-days",level:3},{value:"Examples",id:"examples",level:2},{value:"1. Weekday Working Hours",id:"1-weekday-working-hours",level:3},{value:"2. Weekend Unavailability",id:"2-weekend-unavailability",level:3},{value:"3. Lunch Break",id:"3-lunch-break",level:3},{value:"4. Complex Schedule",id:"4-complex-schedule",level:3},{value:"Considerations",id:"considerations",level:2},{value:"Customizing Appearance",id:"customizing-appearance",level:2}];function c(e){const n={code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",img:"img",li:"li",p:"p",pre:"pre",ul:"ul",...(0,s.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"unavailable-hours",children:"Unavailable Hours"})}),"\n",(0,r.jsx)(n.p,{children:"React Native Calendar Kit allows you to specify certain hours as unavailable in your calendar view. This feature is useful for indicating non-working hours, lunch breaks, or any other time slots that should be visually distinguished or blocked off."}),"\n",(0,r.jsx)(n.h2,{id:"using-the-unavailablehours-prop",children:"Using the unavailableHours Prop"}),"\n",(0,r.jsxs)(n.p,{children:["The ",(0,r.jsx)(n.code,{children:"unavailableHours"})," prop accepts an array or object with the following properties:"]}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"start"}),": The start hour of the unavailable time range (0-1440, where 0 is midnight and 1440 is the last minute of the day)"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"end"}),": The end hour of the unavailable time range (0-1440, where 0 is midnight and 1440 is the last minute of the day)"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"enableBackgroundInteraction"}),": A boolean that determines whether interactions (like creating events) are allowed in unavailable hours. Default is ",(0,r.jsx)(n.code,{children:"false"}),"."]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"backgroundColor"}),": A string representing the background color for unavailable hours."]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Here's the basic structure:"}),"\n",(0,r.jsx)(n.h3,{id:"applying-to-all-days-of-the-week",children:"Applying to all days of the week"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-tsx",children:"const unavailableHours = useMemo(\n    () => [\n      {\n        start: 0,\n        end: 6 * 60,\n        enableBackgroundInteraction: true,\n        backgroundColor: '#ccc',\n      }, // 00:00 - 06:00\n      {\n        start: 20 * 60,\n        end: 24 * 60,\n        enableBackgroundInteraction: true,\n        backgroundColor: '#ccc',\n      }, // 20:00 - 24:00\n    ],\n    []\n  );\n<CalendarContainer\n    unavailableHours={unavailableHours}\n    // ... other props\n>\n    <CalendarHeader />\n    <CalendarBody />\n</CalendarContainer>\n"})}),"\n",(0,r.jsx)(n.p,{children:(0,r.jsx)(n.img,{alt:"unavailable-hours",src:a(9517).A+"",width:"654",height:"848"})}),"\n",(0,r.jsx)(n.h3,{id:"applying-to-specific-days",children:"Applying to specific days"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-tsx",children:"<CalendarKit\n    unavailableHours={{\n        1: [{ start: 0, end: 6 * 60 }, { start: 20 * 60, end: 24 * 60 }], // 00:00 - 06:00 and 20:00 - 24:00\n        '2024-05-01': [{ start: 0, end: 6 * 60 }, { start: 20 * 60, end: 24 * 60 }], // 00:00 - 06:00 and 20:00 - 24:00\n        '2024-05-02': [{ start: 0, end: 24 * 60 }], // All day\n    }}\n/>\n"})}),"\n",(0,r.jsx)(n.h2,{id:"examples",children:"Examples"}),"\n",(0,r.jsx)(n.p,{children:"Let's explore various cases and how to implement them:"}),"\n",(0,r.jsx)(n.h3,{id:"1-weekday-working-hours",children:"1. Weekday Working Hours"}),"\n",(0,r.jsx)(n.p,{children:"To set unavailable hours for weekdays (assuming work hours are 9 AM to 5 PM):"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-tsx",children:"const unavailableHours = useMemo(\n    () => ({\n        1: [{ start: 0, end: 9 * 60 }, { start: 17 * 60, end: 24 * 60 }],  // Monday 00:00 - 09:00 and 17:00 - 24:00\n        2: [{ start: 0, end: 9 * 60 }, { start: 17 * 60, end: 24 * 60 }],  // Tuesday 00:00 - 09:00 and 17:00 - 24:00\n        3: [{ start: 0, end: 9 * 60 }, { start: 17 * 60, end: 24 * 60 }],  // Wednesday 00:00 - 09:00 and 17:00 - 24:00\n        4: [{ start: 0, end: 9 * 60 }, { start: 17 * 60, end: 24 * 60 }],  // Thursday 00:00 - 09:00 and 17:00 - 24:00\n        5: [{ start: 0, end: 9 * 60 }, { start: 17 * 60, end: 24 * 60 }],  // Friday 00:00 - 09:00 and 17:00 - 24:00\n    }),\n    []\n);\n"})}),"\n",(0,r.jsx)(n.h3,{id:"2-weekend-unavailability",children:"2. Weekend Unavailability"}),"\n",(0,r.jsx)(n.p,{children:"To mark weekends as entirely unavailable:"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-tsx",children:"const unavailableHours = useMemo(\n    () => ({\n        6: [{ start: 0, end: 24 * 60 }],  // Saturday\n        7: [{ start: 0, end: 24 * 60 }],  // Sunday\n    }),\n    []\n);\n"})}),"\n",(0,r.jsx)(n.h3,{id:"3-lunch-break",children:"3. Lunch Break"}),"\n",(0,r.jsx)(n.p,{children:"To mark a lunch break as unavailable on all days:"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-tsx",children:"const unavailableHours = useMemo(\n    () => ({\n        1: [{ start: 12 * 60, end: 13 * 60 }],\n        2: [{ start: 12 * 60, end: 13 * 60 }],\n        3: [{ start: 12 * 60, end: 13 * 60 }],\n        4: [{ start: 12 * 60, end: 13 * 60 }],\n        5: [{ start: 12 * 60, end: 13 * 60 }],\n        6: [{ start: 12 * 60, end: 13 * 60 }],\n        7: [{ start: 12 * 60, end: 13 * 60 }],\n    }),\n    []\n);\n"})}),"\n",(0,r.jsx)(n.h3,{id:"4-complex-schedule",children:"4. Complex Schedule"}),"\n",(0,r.jsx)(n.p,{children:"For a more complex schedule with different hours for different days:"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-tsx",children:"const unavailableHours = useMemo(\n    () => ({\n        1: [{ start: 0, end: 9 * 60 }, { start: 17 * 60, end: 24 * 60 }],  // Monday 00:00 - 09:00 and 17:00 - 24:00\n        2: [{ start: 0, end: 10 * 60 }, { start: 16 * 60, end: 24 * 60 }], // Tuesday 00:00 - 10:00 and 16:00 - 24:00\n        3: [{ start: 0, end: 9 * 60 }, { start: 17 * 60, end: 24 * 60 }],  // Wednesday 00:00 - 09:00 and 17:00 - 24:00\n        4: [{ start: 0, end: 10 * 60 }, { start: 16 * 60, end: 24 * 60 }], // Thursday 00:00 - 10:00 and 16:00 - 24:00\n        5: [{ start: 0, end: 9 * 60 }, { start: 14 * 60, end: 24 * 60 }],  // Friday 00:00 - 09:00 and 14:00 - 24:00\n        6: [{ start: 0, end: 24 * 60 }],  // Saturday 00:00 - 24:00\n        7: [{ start: 0, end: 24 * 60 }],  // Sunday 00:00 - 24:00\n    }),\n    []\n);\n"})}),"\n",(0,r.jsx)(n.h2,{id:"considerations",children:"Considerations"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsx)(n.li,{children:"The day numbers are 1-7, where 1 is Monday and 7 is Sunday."}),"\n",(0,r.jsx)(n.li,{children:"When specifying hours, use minutes from midnight (0-1440)."}),"\n",(0,r.jsx)(n.li,{children:"You can specify multiple unavailable ranges for each day."}),"\n",(0,r.jsx)(n.li,{children:"If a day is not specified in the object, it will be treated as fully available."}),"\n"]}),"\n",(0,r.jsx)(n.h2,{id:"customizing-appearance",children:"Customizing Appearance"}),"\n",(0,r.jsx)(n.p,{children:"You can set default background color for unavailable hours using the theme prop:"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-tsx",children:"<CalendarKit\n    unavailableHours={{\n        1: [{ start: 0, end: 9 * 60 }, { start: 17 * 60, end: 24 * 60 }],\n    }}\n    theme={{\n        unavailableHourBackgroundColor: 'rgba(0, 0, 0, 0.1)', // Customize the background color\n    }}\n/>  \n"})})]})}function u(e={}){const{wrapper:n}={...(0,s.R)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(c,{...e})}):c(e)}},9296:(e,n,a)=>{var r=a(9856),s=Symbol.for("react.element"),t=Symbol.for("react.fragment"),i=Object.prototype.hasOwnProperty,l=r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,d={key:!0,ref:!0,__self:!0,__source:!0};function o(e,n,a){var r,t={},o=null,c=null;for(r in void 0!==a&&(o=""+a),void 0!==n.key&&(o=""+n.key),void 0!==n.ref&&(c=n.ref),n)i.call(n,r)&&!d.hasOwnProperty(r)&&(t[r]=n[r]);if(e&&e.defaultProps)for(r in n=e.defaultProps)void 0===t[r]&&(t[r]=n[r]);return{$$typeof:s,type:e,key:o,ref:c,props:t,_owner:l.current}}n.Fragment=t,n.jsx=o,n.jsxs=o},412:(e,n,a)=>{e.exports=a(9296)},9517:(e,n,a)=>{a.d(n,{A:()=>r});const r=a.p+"assets/images/unavailable-hours-b83bd24361ca64b1fe983887da2fe397.png"},6823:(e,n,a)=>{a.d(n,{R:()=>i,x:()=>l});var r=a(9856);const s={},t=r.createContext(s);function i(e){const n=r.useContext(t);return r.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:i(e.components),r.createElement(t.Provider,{value:n},e.children)}}}]);