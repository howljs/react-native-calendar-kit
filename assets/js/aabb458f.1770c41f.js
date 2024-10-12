/*! For license information please see aabb458f.1770c41f.js.LICENSE.txt */
"use strict";(self.webpackChunkcalendar_kit_docs=self.webpackChunkcalendar_kit_docs||[]).push([[3714],{6239:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>s,contentTitle:()=>o,default:()=>c,frontMatter:()=>i,metadata:()=>d,toc:()=>l});var r=t(412),a=t(6823);const i={sidebar_position:4},o="Drag to Edit Events",d={id:"guides/drag-to-edit",title:"Drag to Edit Events",description:"The React Native Calendar Kit allows users to edit existing events by dragging them to new times or dates. This guide will walk you through enabling this feature and customizing its behavior.",source:"@site/docs/guides/drag-to-edit.md",sourceDirName:"guides",slug:"/guides/drag-to-edit",permalink:"/react-native-calendar-kit/docs/guides/drag-to-edit",draft:!1,unlisted:!1,tags:[],version:"current",sidebarPosition:4,frontMatter:{sidebar_position:4},sidebar:"tutorialSidebar",previous:{title:"Drag to Create Events",permalink:"/react-native-calendar-kit/docs/guides/drag-to-create"},next:{title:"Drag Selected Event",permalink:"/react-native-calendar-kit/docs/guides/drag-selected-event"}},s={},l=[{value:"Enabling Drag-to-Edit",id:"enabling-drag-to-edit",level:2},{value:"Handling Event Editing",id:"handling-event-editing",level:2},{value:"Customizing Drag-to-Edit Behavior",id:"customizing-drag-to-edit-behavior",level:2},{value:"Drag Step",id:"drag-step",level:3},{value:"Customizing the Dragging Indicator",id:"customizing-the-dragging-indicator",level:3}];function g(e){const n={code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",li:"li",ol:"ol",p:"p",pre:"pre",...(0,a.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"drag-to-edit-events",children:"Drag to Edit Events"})}),"\n",(0,r.jsx)(n.p,{children:"The React Native Calendar Kit allows users to edit existing events by dragging them to new times or dates. This guide will walk you through enabling this feature and customizing its behavior."}),"\n",(0,r.jsx)(n.h2,{id:"enabling-drag-to-edit",children:"Enabling Drag-to-Edit"}),"\n",(0,r.jsxs)(n.p,{children:["To enable the drag-to-edit feature, set the ",(0,r.jsx)(n.code,{children:"allowDragToEdit"})," prop to ",(0,r.jsx)(n.code,{children:"true"})," on the ",(0,r.jsx)(n.code,{children:"CalendarContainer"})," component:"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-tsx",children:'import {\n  CalendarContainer,\n  CalendarHeader,\n  CalendarBody,\n} from "@howljs/calendar-kit";\n\nconst MyCalendar = () => {\n  return (\n    <CalendarContainer\n      allowDragToEdit={true}\n      // ... other props\n    >\n      <CalendarHeader />\n      <CalendarBody />\n    </CalendarContainer>\n  );\n};\n'})}),"\n",(0,r.jsx)(n.h2,{id:"handling-event-editing",children:"Handling Event Editing"}),"\n",(0,r.jsx)(n.p,{children:"When a user drags to edit an event, you need to handle the editing process. This is done using two callback props:"}),"\n",(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"onDragEventStart"}),": Called when the user starts dragging an event."]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"onDragEventEnd"}),": Called when the user releases the drag, finalizing the event edit."]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Here's an example of how to implement these callbacks:"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-tsx",children:'const MyCalendar = () => {\n  const handleDragStart = (event) => {\n    console.log("Started editing event:", event);\n    // You can use this to show a UI indicator that event editing has started\n  };\n\n  const handleDragEnd = (event, newStart, newEnd) => {\n    console.log("Event edited:", event, newStart, newEnd);\n    // Here you would typically update the event in your events array\n    // and possibly update your backend or state management\n  };\n\n  return (\n    <CalendarContainer\n      allowDragToEdit={true}\n      onDragEventStart={handleDragStart}\n      onDragEventEnd={handleDragEnd}\n      // ... other props\n    >\n      <CalendarHeader />\n      <CalendarBody />\n    </CalendarContainer>\n  );\n};\n'})}),"\n",(0,r.jsx)(n.h2,{id:"customizing-drag-to-edit-behavior",children:"Customizing Drag-to-Edit Behavior"}),"\n",(0,r.jsx)(n.p,{children:"You can customize various aspects of the drag-to-edit feature:"}),"\n",(0,r.jsx)(n.h3,{id:"drag-step",children:"Drag Step"}),"\n",(0,r.jsxs)(n.p,{children:["The ",(0,r.jsx)(n.code,{children:"dragStep"})," prop determines the time increments (in minutes) for dragging:"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-tsx",children:"<CalendarContainer\n  allowDragToEdit={true}\n  dragStep={15} // Drag will snap to 15-minute increments\n  // ... other props\n>\n  {/* ... */}\n</CalendarContainer>\n"})}),"\n",(0,r.jsx)(n.h3,{id:"customizing-the-dragging-indicator",children:"Customizing the Dragging Indicator"}),"\n",(0,r.jsx)(n.p,{children:"You can customize the appearance of the dragging indicator by providing a custom renderer:"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-tsx",children:"import React, { useCallback } from 'react';\nimport {\n  CalendarBody,\n  CalendarContainer,\n  CalendarHeader,\n  DraggingEvent,\n  DraggingEventProps\n} from '@howljs/calendar-kit';\n\nconst renderDraggingEvent = useCallback((props: DraggingEventProps) => {\n  return (\n    <DraggingEvent\n        {...props}\n        TopEdgeComponent={\n          <View\n            style={{\n              height: 10,\n              width: '100%',\n              backgroundColor: 'red',\n              position: 'absolute',\n            }}\n          />\n        }\n        BottomEdgeComponent={\n          <View\n            style={{\n              height: 10,\n              width: '100%',\n              backgroundColor: 'red',\n              bottom: 0,\n              position: 'absolute',\n            }}\n          />\n        }\n      />\n  );\n}, []);\n\n<CalendarContainer\n  allowDragToEdit={true}\n  // ... other props\n>\n  <CalendarHeader />\n  <CalendarBody renderDraggingEvent={renderDraggingEvent} />\n</CalendarContainer>\n"})})]})}function c(e={}){const{wrapper:n}={...(0,a.R)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(g,{...e})}):g(e)}},9296:(e,n,t)=>{var r=t(9856),a=Symbol.for("react.element"),i=Symbol.for("react.fragment"),o=Object.prototype.hasOwnProperty,d=r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,s={key:!0,ref:!0,__self:!0,__source:!0};function l(e,n,t){var r,i={},l=null,g=null;for(r in void 0!==t&&(l=""+t),void 0!==n.key&&(l=""+n.key),void 0!==n.ref&&(g=n.ref),n)o.call(n,r)&&!s.hasOwnProperty(r)&&(i[r]=n[r]);if(e&&e.defaultProps)for(r in n=e.defaultProps)void 0===i[r]&&(i[r]=n[r]);return{$$typeof:a,type:e,key:l,ref:g,props:i,_owner:d.current}}n.Fragment=i,n.jsx=l,n.jsxs=l},412:(e,n,t)=>{e.exports=t(9296)},6823:(e,n,t)=>{t.d(n,{R:()=>o,x:()=>d});var r=t(9856);const a={},i=r.createContext(a);function o(e){const n=r.useContext(i);return r.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function d(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:o(e.components),r.createElement(i.Provider,{value:n},e.children)}}}]);