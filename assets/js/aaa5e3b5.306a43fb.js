"use strict";(self.webpackChunkreact_native_calendar_kit_document=self.webpackChunkreact_native_calendar_kit_document||[]).push([[21],{8372:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>s,default:()=>g,frontMatter:()=>d,metadata:()=>c,toc:()=>u});var a=n(7462),o=(n(7294),n(3905)),l=n(2004);const r=n.p+"assets/medias/drag-to-edit-c74661fe2f1ab5fa8644afc2d5d26f5a.mp4",i=n.p+"assets/images/drag-to-edit-custom-4f763737eac00ba74e737699f87b460f.png",d={sidebar_position:5},s="Drag to edit",c={unversionedId:"guides/drag-to-edit",id:"guides/drag-to-edit",title:"Drag to edit",description:"When selectedEvent is declared, edit mode will be enabled",source:"@site/docs/guides/drag-to-edit.mdx",sourceDirName:"guides",slug:"/guides/drag-to-edit",permalink:"/react-native-calendar-kit/docs/guides/drag-to-edit",draft:!1,tags:[],version:"current",sidebarPosition:5,frontMatter:{sidebar_position:5},sidebar:"tutorialSidebar",previous:{title:"Drag to create",permalink:"/react-native-calendar-kit/docs/guides/drag-to-create"},next:{title:"Fetch events",permalink:"/react-native-calendar-kit/docs/guides/fetch-events"}},p={},u=[{value:"Example",id:"example",level:2},{value:"Props",id:"props",level:2},{value:"selectedEvent",id:"selectedevent",level:3},{value:"onLongPressEvent",id:"onlongpressevent",level:3},{value:"onEndDragSelectedEvent",id:"onenddragselectedevent",level:3},{value:"dragStep",id:"dragstep",level:3},{value:"theme",id:"theme",level:3}],v={toc:u};function g(e){let{components:t,...n}=e;return(0,o.kt)("wrapper",(0,a.Z)({},v,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"drag-to-edit"},"Drag to edit"),(0,o.kt)("p",null,"When ",(0,o.kt)("inlineCode",{parentName:"p"},"selectedEvent")," is declared, edit mode will be enabled"),(0,o.kt)("h2",{id:"example"},"Example"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-jsx",metastring:'title="Example"',title:'"Example"'},"import { EventItem, PackedEvent, TimelineCalendar } from '@howljs/calendar-kit';\nimport React, { useState } from 'react';\nimport {\n  SafeAreaView,\n  StyleSheet,\n  Text,\n  TouchableOpacity,\n  View,\n} from 'react-native';\n\nconst exampleEvents: EventItem[] = [\n  {\n    id: '1',\n    title: 'Event 1',\n    start: '2022-11-06T09:00:05.313Z',\n    end: '2022-11-06T12:00:05.313Z',\n    color: '#A3C7D6',\n  },\n  {\n    id: '2',\n    title: 'Event 2',\n    start: '2022-11-06T11:00:05.313Z',\n    end: '2022-11-06T14:00:05.313Z',\n    color: '#B1AFFF',\n  },\n];\n\nconst Calendar = () => {\n  const [events, setEvents] = useState<EventItem[]>(exampleEvents);\n  const [selectedEvent, setSelectedEvent] = useState<PackedEvent>();\n\n  const _onLongPressEvent = (event: PackedEvent) => {\n    setSelectedEvent(event);\n  };\n\n  const _onPressCancel = () => {\n    setSelectedEvent(undefined);\n  };\n\n  const _onPressSubmit = () => {\n    setEvents((prevEvents) =>\n      prevEvents.map((ev) => {\n        if (ev.id === selectedEvent?.id) {\n          return { ...ev, ...selectedEvent };\n        }\n        return ev;\n      })\n    );\n    setSelectedEvent(undefined);\n  };\n\n  const _renderEditFooter = () => {\n    return (\n      <View style={styles.footer}>\n        <TouchableOpacity style={styles.button} onPress={_onPressCancel}>\n          <Text style={styles.btnText}>Cancel</Text>\n        </TouchableOpacity>\n        <TouchableOpacity style={styles.button} onPress={_onPressSubmit}>\n          <Text style={styles.btnText}>Save</Text>\n        </TouchableOpacity>\n      </View>\n    );\n  };\n\n  return (\n    <SafeAreaView style={styles.container}>\n      <TimelineCalendar\n        viewMode=\"week\"\n        events={events}\n        onLongPressEvent={_onLongPressEvent}\n        selectedEvent={selectedEvent}\n        onEndDragSelectedEvent={setSelectedEvent}\n        // Optional\n        dragStep={20}\n        theme={{\n          dragHourColor: '#001253',\n          dragHourBorderColor: '#001253',\n          dragHourBackgroundColor: '#FFF',\n          editIndicatorColor: '#FFF',\n        }}\n        // End Optional\n      />\n      {!!selectedEvent && _renderEditFooter()}\n    </SafeAreaView>\n  );\n};\n\nexport default Calendar;\n\nconst styles = StyleSheet.create({\n  container: { flex: 1, backgroundColor: '#FFF' },\n  footer: {\n    position: 'absolute',\n    bottom: 0,\n    left: 0,\n    right: 0,\n    backgroundColor: '#FFF',\n    height: 85,\n    shadowColor: '#000',\n    shadowOffset: {\n      width: 0,\n      height: -2,\n    },\n    shadowOpacity: 0.22,\n    shadowRadius: 2.22,\n    elevation: 3,\n    flexDirection: 'row',\n    justifyContent: 'center',\n  },\n  button: {\n    height: 45,\n    paddingHorizontal: 24,\n    backgroundColor: '#1973E7',\n    justifyContent: 'center',\n    borderRadius: 24,\n    marginHorizontal: 8,\n    marginVertical: 8,\n  },\n  btnText: { fontSize: 16, color: '#FFF', fontWeight: 'bold' },\n});\n\n")),(0,o.kt)(l.Z,{playing:!0,controls:!0,url:r,mdxType:"ReactPlayer"}),(0,o.kt)("h2",{id:"props"},"Props"),(0,o.kt)("h3",{id:"selectedevent"},"selectedEvent"),(0,o.kt)("p",null,"When selectedEvent is declared, edit mode will be enabled"),(0,o.kt)("span",{style:{color:"grey"}},"object"),(0,o.kt)("h3",{id:"onlongpressevent"},"onLongPressEvent"),(0,o.kt)("p",null,"Callback function will be called when the event item is long pressed"),(0,o.kt)("span",{style:{color:"grey"}},"function"),(0,o.kt)("h3",{id:"onenddragselectedevent"},"onEndDragSelectedEvent"),(0,o.kt)("p",null,"Callback function will be called when the selected event item is dropped"),(0,o.kt)("span",{style:{color:"grey"}},"function"),(0,o.kt)("h3",{id:"dragstep"},"dragStep"),(0,o.kt)("p",null,"Handle the navigation time when navigating to next/previous view while dragging. Default is 10 minutes"),(0,o.kt)("span",{style:{color:"grey"}},"number"),(0,o.kt)("h3",{id:"theme"},"theme"),(0,o.kt)("img",{src:i,style:{height:"250px"}}),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("p",{parentName:"li"},(0,o.kt)("inlineCode",{parentName:"p"},"editIndicatorColor"))),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("p",{parentName:"li"},(0,o.kt)("inlineCode",{parentName:"p"},"dragHourColor"))),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("p",{parentName:"li"},(0,o.kt)("inlineCode",{parentName:"p"},"dragHourBorderColor"))),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("p",{parentName:"li"},(0,o.kt)("inlineCode",{parentName:"p"},"dragHourBackgroundColor")))),(0,o.kt)("span",{style:{color:"grey"}},"object"))}g.isMDXComponent=!0}}]);