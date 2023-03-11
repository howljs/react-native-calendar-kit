"use strict";(self.webpackChunkreact_native_calendar_kit_document=self.webpackChunkreact_native_calendar_kit_document||[]).push([[384],{1376:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>g,contentTitle:()=>s,default:()=>m,frontMatter:()=>d,metadata:()=>c,toc:()=>p});var n=a(7462),r=(a(7294),a(3905)),o=a(2004);const i=a.p+"assets/medias/drag-to-create-8fccfdb75f645823fc65bcb0c525bf73.mp4",l=a.p+"assets/images/drag-to-create-custom-a010185e975df95b1658dd3f8c1f2e33.png",d={sidebar_position:4},s="Drag to create",c={unversionedId:"guides/drag-to-create",id:"guides/drag-to-create",title:"Drag to create",description:"You can set allowDragToCreate= to enable this function",source:"@site/docs/guides/drag-to-create.mdx",sourceDirName:"guides",slug:"/guides/drag-to-create",permalink:"/react-native-calendar-kit/docs/guides/drag-to-create",draft:!1,tags:[],version:"current",sidebarPosition:4,frontMatter:{sidebar_position:4},sidebar:"tutorialSidebar",previous:{title:"Pinch to zoom",permalink:"/react-native-calendar-kit/docs/guides/pinch-to-zoom"},next:{title:"Drag to edit",permalink:"/react-native-calendar-kit/docs/guides/drag-to-edit"}},g={},p=[{value:"Example",id:"example",level:2},{value:"Props",id:"props",level:2},{value:"dragCreateInterval",id:"dragcreateinterval",level:3},{value:"onDragCreateEnd",id:"ondragcreateend",level:3},{value:"dragStep",id:"dragstep",level:3},{value:"theme",id:"theme",level:3}],u={toc:p};function m(e){let{components:t,...a}=e;return(0,r.kt)("wrapper",(0,n.Z)({},u,a,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"drag-to-create"},"Drag to create"),(0,r.kt)("p",null,"You can set ",(0,r.kt)("strong",{parentName:"p"},"allowDragToCreate={true}")," to enable this function"),(0,r.kt)("h2",{id:"example"},"Example"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-jsx",metastring:'title="Example"',title:'"Example"'},"import { EventItem, RangeTime, TimelineCalendar } from '@howljs/calendar-kit';\nimport React, { useState } from 'react';\nimport { SafeAreaView, StyleSheet } from 'react-native';\n\nconst Calendar = () => {\n  const [events, setEvents] = useState<EventItem[]>([]);\n\n  const _onDragCreateEnd = (event: RangeTime) => {\n    const randomId = Math.random().toString(36).slice(2, 10);\n    const newEvent = {\n      id: randomId,\n      title: randomId,\n      start: event.start,\n      end: event.end,\n      color: '#A3C7D6',\n    };\n    setEvents((prev) => [...prev, newEvent]);\n  };\n\n  return (\n    <SafeAreaView style={styles.container}>\n      <TimelineCalendar\n        viewMode=\"week\"\n        events={events}\n        allowDragToCreate\n        onDragCreateEnd={_onDragCreateEnd}\n        // Optional\n        dragCreateInterval={120}\n        dragStep={20}\n        theme={{\n          dragHourContainer: {\n            backgroundColor: '#FFF',\n            borderColor: '#001253',\n          },\n          dragHourText: { color: '#001253' },\n          dragCreateItemBackgroundColor: 'rgba(0, 18, 83, 0.2)',\n        }}\n        // End Optional\n      />\n    </SafeAreaView>\n  );\n};\n\nexport default Calendar;\n\nconst styles = StyleSheet.create({\n  container: { flex: 1, backgroundColor: '#FFF' },\n});\n\n")),(0,r.kt)(o.Z,{playing:!0,controls:!0,url:i,mdxType:"ReactPlayer"}),(0,r.kt)("h2",{id:"props"},"Props"),(0,r.kt)("h3",{id:"dragcreateinterval"},"dragCreateInterval"),(0,r.kt)("p",null,"Initial time interval when you drag to create event. Default is 60 minutes"),(0,r.kt)("span",{style:{color:"grey"}},"number"),(0,r.kt)("h3",{id:"ondragcreateend"},"onDragCreateEnd"),(0,r.kt)("p",null,"Callback function will be called when the create box is dropped"),(0,r.kt)("span",{style:{color:"grey"}},"function"),(0,r.kt)("h3",{id:"dragstep"},"dragStep"),(0,r.kt)("p",null,"Handle the navigation time when navigating to next/previous view while dragging. Default is 10 minutes"),(0,r.kt)("span",{style:{color:"grey"}},"number"),(0,r.kt)("h3",{id:"theme"},"theme"),(0,r.kt)("img",{src:l,style:{height:"250px"}}),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},(0,r.kt)("inlineCode",{parentName:"p"},"dragHourContainer"))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},(0,r.kt)("inlineCode",{parentName:"p"},"dragHourText")))),(0,r.kt)("span",{style:{color:"grey"}},"object"))}m.isMDXComponent=!0}}]);