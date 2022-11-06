"use strict";(self.webpackChunkreact_native_calendar_kit_document=self.webpackChunkreact_native_calendar_kit_document||[]).push([[452],{6110:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>d,default:()=>u,frontMatter:()=>l,metadata:()=>c,toc:()=>g});var a=n(7462),s=(n(7294),n(3905)),o=n(2004);const i=n.p+"assets/medias/fetch-data-ce17f6effba0292347df3fb7af82a365.mp4",r=n.p+"assets/images/loading-bar-f9cc1e769992b099b053c1ee5e7975ff.png",l={sidebar_position:6},d="Fetch events",c={unversionedId:"guides/fetch-events",id:"guides/fetch-events",title:"Fetch events",description:"Fetch new events when date changed",source:"@site/docs/guides/fetch-events.mdx",sourceDirName:"guides",slug:"/guides/fetch-events",permalink:"/react-native-calendar-kit/docs/guides/fetch-events",draft:!1,tags:[],version:"current",sidebarPosition:6,frontMatter:{sidebar_position:6},sidebar:"tutorialSidebar",previous:{title:"Drag to edit",permalink:"/react-native-calendar-kit/docs/guides/drag-to-edit"},next:{title:"Other Props",permalink:"/react-native-calendar-kit/docs/guides/other-props"}},p={},g=[{value:"Example",id:"example",level:2},{value:"Props",id:"props",level:2},{value:"isLoading",id:"isloading",level:3},{value:"onDateChanged",id:"ondatechanged",level:3},{value:"theme",id:"theme",level:3}],m={toc:g};function u(e){let{components:t,...n}=e;return(0,s.kt)("wrapper",(0,a.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,s.kt)("h1",{id:"fetch-events"},"Fetch events"),(0,s.kt)("p",null,"Fetch new events when date changed"),(0,s.kt)("h2",{id:"example"},"Example"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre",className:"language-jsx",metastring:'title="Example"',title:'"Example"'},"import { EventItem, TimelineCalendar } from '@howljs/calendar-kit';\nimport React, { useEffect, useState } from 'react';\nimport { SafeAreaView, StyleSheet } from 'react-native';\n\nconst fetchData = (props: { from: string; to: string }) =>\n  new Promise<EventItem[]>((resolve) => {\n    //Fake api\n    setTimeout(() => {\n      console.log(props);\n      resolve([]);\n    }, 1000);\n  });\n\nconst Calendar = () => {\n  const [events, setEvents] = useState<EventItem[]>([]);\n  const [isLoading, setIsLoading] = useState(true);\n\n  useEffect(() => {\n    const numOfDays = 7;\n    const fromDate = new Date();\n    const toDate = new Date();\n    toDate.setDate(new Date().getDate() + numOfDays);\n    fetchData({\n      from: fromDate.toISOString(),\n      to: toDate.toISOString(),\n    })\n      .then((res) => {\n        setEvents((prev) => [...prev, ...res]);\n      })\n      .finally(() => {\n        setIsLoading(false);\n      });\n  }, []);\n\n  const _onDateChanged = (date: string) => {\n    setIsLoading(true);\n    const numOfDays = 7;\n    const fromDate = new Date(date);\n    const toDate = new Date(date);\n    toDate.setDate(toDate.getDate() + numOfDays);\n    fetchData({\n      from: fromDate.toISOString(),\n      to: toDate.toISOString(),\n    })\n      .then((res) => {\n        setEvents((prev) => [...prev, ...res]);\n      })\n      .finally(() => {\n        setIsLoading(false);\n      });\n  };\n\n  return (\n    <SafeAreaView style={styles.container}>\n      <TimelineCalendar\n        viewMode=\"week\"\n        events={events}\n        isLoading={isLoading}\n        onDateChanged={_onDateChanged}\n        theme={{ loadingBarColor: '#D61C4E' }}\n      />\n    </SafeAreaView>\n  );\n};\n\nexport default Calendar;\n\nconst styles = StyleSheet.create({\n  container: { flex: 1, backgroundColor: '#FFF' },\n});\n\n\n")),(0,s.kt)(o.Z,{playing:!0,controls:!0,url:i,mdxType:"ReactPlayer"}),(0,s.kt)("h2",{id:"props"},"Props"),(0,s.kt)("h3",{id:"isloading"},"isLoading"),(0,s.kt)("p",null,"Show loading bar"),(0,s.kt)("span",{style:{color:"grey"}},"boolean"),(0,s.kt)("h3",{id:"ondatechanged"},"onDateChanged"),(0,s.kt)("p",null,"Callback function will be called when the event item is long pressed"),(0,s.kt)("span",{style:{color:"grey"}},"function"),(0,s.kt)("h3",{id:"theme"},"theme"),(0,s.kt)("img",{src:r,style:{width:"260px"}}),(0,s.kt)("ul",null,(0,s.kt)("li",{parentName:"ul"},(0,s.kt)("inlineCode",{parentName:"li"},"loadingBarColor"))),(0,s.kt)("span",{style:{color:"grey"}},"object"))}u.isMDXComponent=!0}}]);