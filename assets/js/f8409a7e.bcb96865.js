"use strict";(self.webpackChunkreact_native_calendar_kit_document=self.webpackChunkreact_native_calendar_kit_document||[]).push([[206],{3905:(e,t,a)=>{a.d(t,{Zo:()=>u,kt:()=>m});var n=a(7294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function l(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function o(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?l(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):l(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function i(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},l=Object.keys(e);for(n=0;n<l.length;n++)a=l[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(n=0;n<l.length;n++)a=l[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var s=n.createContext({}),c=function(e){var t=n.useContext(s),a=t;return e&&(a="function"==typeof e?e(t):o(o({},t),e)),a},u=function(e){var t=c(e.components);return n.createElement(s.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,l=e.originalType,s=e.parentName,u=i(e,["components","mdxType","originalType","parentName"]),d=c(a),m=r,v=d["".concat(s,".").concat(m)]||d[m]||p[m]||l;return a?n.createElement(v,o(o({ref:t},u),{},{components:a})):n.createElement(v,o({ref:t},u))}));function m(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var l=a.length,o=new Array(l);o[0]=d;var i={};for(var s in t)hasOwnProperty.call(t,s)&&(i[s]=t[s]);i.originalType=e,i.mdxType="string"==typeof e?e:r,o[1]=i;for(var c=2;c<l;c++)o[c]=a[c];return n.createElement.apply(null,o)}return n.createElement.apply(null,a)}d.displayName="MDXCreateElement"},9596:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>k,contentTitle:()=>y,default:()=>T,frontMatter:()=>h,metadata:()=>g,toc:()=>w});var n=a(7462),r=a(7294),l=a(3905),o=a(6010),i=a(2389),s=a(7392),c=a(7094),u=a(2466);const p="tabList__CuJ",d="tabItem_LNqP";function m(e){var t;const{lazy:a,block:l,defaultValue:i,values:m,groupId:v,className:b}=e,f=r.Children.map(e.children,(e=>{if((0,r.isValidElement)(e)&&"value"in e.props)return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)})),h=m??f.map((e=>{let{props:{value:t,label:a,attributes:n}}=e;return{value:t,label:a,attributes:n}})),y=(0,s.l)(h,((e,t)=>e.value===t.value));if(y.length>0)throw new Error(`Docusaurus error: Duplicate values "${y.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`);const g=null===i?i:i??(null==(t=f.find((e=>e.props.default)))?void 0:t.props.value)??f[0].props.value;if(null!==g&&!h.some((e=>e.value===g)))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${g}" but none of its children has the corresponding value. Available values are: ${h.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);const{tabGroupChoices:k,setTabGroupChoices:w}=(0,c.U)(),[N,T]=(0,r.useState)(g),O=[],{blockElementScrollPositionUntilNextRender:j}=(0,u.o5)();if(null!=v){const e=k[v];null!=e&&e!==N&&h.some((t=>t.value===e))&&T(e)}const E=e=>{const t=e.currentTarget,a=O.indexOf(t),n=h[a].value;n!==N&&(j(t),T(n),null!=v&&w(v,String(n)))},I=e=>{var t;let a=null;switch(e.key){case"Enter":E(e);break;case"ArrowRight":{const t=O.indexOf(e.currentTarget)+1;a=O[t]??O[0];break}case"ArrowLeft":{const t=O.indexOf(e.currentTarget)-1;a=O[t]??O[O.length-1];break}}null==(t=a)||t.focus()};return r.createElement("div",{className:(0,o.Z)("tabs-container",p)},r.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,o.Z)("tabs",{"tabs--block":l},b)},h.map((e=>{let{value:t,label:a,attributes:l}=e;return r.createElement("li",(0,n.Z)({role:"tab",tabIndex:N===t?0:-1,"aria-selected":N===t,key:t,ref:e=>O.push(e),onKeyDown:I,onClick:E},l,{className:(0,o.Z)("tabs__item",d,null==l?void 0:l.className,{"tabs__item--active":N===t})}),a??t)}))),a?(0,r.cloneElement)(f.filter((e=>e.props.value===N))[0],{className:"margin-top--md"}):r.createElement("div",{className:"margin-top--md"},f.map(((e,t)=>(0,r.cloneElement)(e,{key:t,hidden:e.props.value!==N})))))}function v(e){const t=(0,i.Z)();return r.createElement(m,(0,n.Z)({key:String(t)},e))}const b="tabItem_Ymn6";function f(e){let{children:t,hidden:a,className:n}=e;return r.createElement("div",{role:"tabpanel",className:(0,o.Z)(b,n),hidden:a},t)}const h={sidebar_position:1},y="Getting Started",g={unversionedId:"intro",id:"intro",title:"Getting Started",description:"Installation",source:"@site/docs/intro.mdx",sourceDirName:".",slug:"/intro",permalink:"/react-native-calendar-kit/docs/intro",draft:!1,tags:[],version:"current",sidebarPosition:1,frontMatter:{sidebar_position:1},sidebar:"tutorialSidebar",next:{title:"TimelineCalendar",permalink:"/react-native-calendar-kit/docs/category/timelinecalendar"}},k={},w=[{value:"Installation",id:"installation",level:2},{value:"Installing dependencies into a bare React Native project",id:"installing-dependencies-into-a-bare-react-native-project",level:3}],N={toc:w};function T(e){let{components:t,...a}=e;return(0,l.kt)("wrapper",(0,n.Z)({},N,a,{components:t,mdxType:"MDXLayout"}),(0,l.kt)("h1",{id:"getting-started"},"Getting Started"),(0,l.kt)("h2",{id:"installation"},"Installation"),(0,l.kt)("p",null,"Install the required packages in your React Native project:"),(0,l.kt)(v,{groupId:"environment",defaultValue:"yarn",values:[{label:"Yarn",value:"yarn"},{label:"npm",value:"npm"}],mdxType:"Tabs"},(0,l.kt)(f,{value:"yarn",mdxType:"TabItem"},(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-bash"},"yarn add @howljs/calendar-kit\n"))),(0,l.kt)(f,{value:"npm",mdxType:"TabItem"},(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-bash"},"npm install @howljs/calendar-kit\n")))),(0,l.kt)("p",null,"The libraries we will install now are ",(0,l.kt)("a",{parentName:"p",href:"https://shopify.github.io/flash-list/docs/"},"@shopify/flash-list"),", ",(0,l.kt)("a",{parentName:"p",href:"https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/installation"},"react-native-reanimated")," and ",(0,l.kt)("a",{parentName:"p",href:"https://docs.swmansion.com/react-native-gesture-handler/docs/installation"},"react-native-gesture-handler"),". If you already have these libraries installed and at the latest version, you are done here! Otherwise, read on."),(0,l.kt)("h3",{id:"installing-dependencies-into-a-bare-react-native-project"},"Installing dependencies into a bare React Native project"),(0,l.kt)("p",null,"In your project directory, run:"),(0,l.kt)(v,{groupId:"environment",defaultValue:"yarn",values:[{label:"Yarn",value:"yarn"},{label:"npm",value:"npm"}],mdxType:"Tabs"},(0,l.kt)(f,{value:"yarn",mdxType:"TabItem"},(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-bash"},"yarn add @shopify/flash-list react-native-reanimated react-native-gesture-handler\n"))),(0,l.kt)(f,{value:"npm",mdxType:"TabItem"},(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-bash"},"npm install @shopify/flash-list react-native-reanimated react-native-gesture-handler\n")))),(0,l.kt)("blockquote",null,(0,l.kt)("p",{parentName:"blockquote"},"Follow installation instructions for ",(0,l.kt)("a",{parentName:"p",href:"https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/installation"},"React Native Reanimated")," and ",(0,l.kt)("a",{parentName:"p",href:"https://docs.swmansion.com/react-native-gesture-handler/docs/installation"},"React Native Gesture Handler"),".")))}T.isMDXComponent=!0}}]);