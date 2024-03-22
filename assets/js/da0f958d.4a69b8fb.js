"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[886],{1700:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>r,contentTitle:()=>o,default:()=>h,frontMatter:()=>s,metadata:()=>l,toc:()=>c});var a=t(4848),i=t(8453);const s={sidebar_position:2,toc_max_heading_level:4,title:"Quick Start"},o="Quick Start",l={id:"tutorial/getting-started/quick-start",title:"Quick Start",description:"Minimal setup",source:"@site/docs/tutorial/getting-started/quick-start.md",sourceDirName:"tutorial/getting-started",slug:"/tutorial/getting-started/quick-start",permalink:"/dataflow/docs/tutorial/getting-started/quick-start",draft:!1,unlisted:!1,tags:[],version:"current",sidebarPosition:2,frontMatter:{sidebar_position:2,toc_max_heading_level:4,title:"Quick Start"},sidebar:"tutorial",previous:{title:"Installation",permalink:"/dataflow/docs/tutorial/getting-started/installation"},next:{title:"Collection",permalink:"/dataflow/docs/tutorial/collection"}},r={},c=[{value:"Minimal setup",id:"minimal-setup",level:3},{value:"Stylesheet",id:"stylesheet",level:4},{value:"Create the first table",id:"create-the-first-table",level:4},{value:"Adding actions",id:"adding-actions",level:4},{value:"Frame components",id:"frame-components",level:4}];function d(e){const n={a:"a",admonition:"admonition",code:"code",h1:"h1",h3:"h3",h4:"h4",img:"img",li:"li",p:"p",pre:"pre",ul:"ul",...(0,i.R)(),...e.components};return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(n.h1,{id:"quick-start",children:"Quick Start"}),"\n",(0,a.jsx)(n.h3,{id:"minimal-setup",children:"Minimal setup"}),"\n",(0,a.jsx)(n.h4,{id:"stylesheet",children:"Stylesheet"}),"\n",(0,a.jsx)(n.p,{children:"Before we touch any TypeScript, dataflow stylesheet needs to be included on the page:"}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-html",children:'<head>\n    \x3c!-- metas titles and links--\x3e\n    <link rel="stylesheet" href="node_modules/dataflow/dist/css/dataflow.css" />\n</head>\n'})}),"\n",(0,a.jsxs)(n.p,{children:["... or at the start of your ",(0,a.jsx)(n.code,{children:".ts"})," file:"]}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-ts",children:'import "../node_modules/dataflow/dist/css/dataflow.css"\n'})}),"\n",(0,a.jsx)(n.h4,{id:"create-the-first-table",children:"Create the first table"}),"\n",(0,a.jsx)(n.p,{children:"Firstly, let's pick a simple interface that will represent a single table row:"}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-ts",children:"interface Person {\n    full_name: string,\n    age: number,\n}\n"})}),"\n",(0,a.jsx)(n.p,{children:"Then, we'll define both collection and our first table:"}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-ts",children:'import { TableCollection } from "@ashooww/dataflow"\n\nlet collection = new TableCollection({\n    mount: "tag#id",\n    receiver: async (query: string) => { ... }\n})\nlet table = collection.new<Person>({\n    id: "group",\n    init: "get_group",\n    columns: [\n        { name: "full_name", type: "text" },\n        { name: "age", type: "number" }\n    ]\n})\n'})}),"\n",(0,a.jsx)(n.admonition,{type:"note",children:(0,a.jsxs)(n.p,{children:["Make sure that value in a ",(0,a.jsx)(n.code,{children:"name"})," field of each column mathches with an actual property of\na described object."]})}),"\n",(0,a.jsxs)(n.p,{children:["Data retrieval callback allows user-defined implementations, e.g, using js ",(0,a.jsx)(n.code,{children:"fetch"}),".\nThe function itself, as its purpose suggests, should return a list of rows:"]}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-ts",children:'async function tableGetter(operation: string): Promise<Person[]> {\n    const response = await fetch("https://example.com/api?operation=" + operation)\n    return await response.json()\n}\n\nlet collection = new TableCollection({\n    mount: "tag#id",\n    receiver: tableGetter\n})\n'})}),"\n",(0,a.jsx)(n.admonition,{type:"info",children:(0,a.jsxs)(n.p,{children:['The "operation" that will be passed to an above-specified getter is constant\n(and often unique) for each table and is determined by the ',(0,a.jsx)(n.code,{children:"init"})," argument\nof a ",(0,a.jsx)(n.code,{children:"Table"})," constructor, ",(0,a.jsx)(n.code,{children:'"get_group"'})," in our case"]})}),"\n",(0,a.jsxs)(n.admonition,{type:"tip",children:[(0,a.jsxs)(n.p,{children:["The ",(0,a.jsx)(n.a,{href:"https://tauri.app/",children:"Tauri"})," equivalent would be just passing ",(0,a.jsx)(n.code,{children:"invoke"}),"\nfunction as a getter:"]}),(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-ts",children:'import { invoke } from "@tauri-apps/api"\n\nlet collection = new TableCollection({\n    mount: "tag#id",\n    receiver: invoke\n})\n'})})]}),"\n",(0,a.jsxs)(n.p,{children:["You should now be seeing table filled with data,\npulled from ",(0,a.jsx)(n.code,{children:'"https://example.com/api?operation=get_group"'})]}),"\n",(0,a.jsx)(n.p,{children:(0,a.jsx)(n.img,{alt:"Example of a filled table",src:t(3138).A+"",width:"700",height:"380"})}),"\n",(0,a.jsx)(n.p,{children:"The complete code for the setup:"}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-ts",children:'import "../node_modules/dataflow/dist/css/dataflow.css"\nimport { TableCollection } from "@ashooww/dataflow"\n\ninterface Person {\n    full_name: string,\n    age: number,\n}\n\nlet collection = new TableCollection({\n    mount: "tag#id",\n    receiver: async (query: string) => []\n})\nlet table = collection.new<Person>({\n    id: "group",\n    init: "get_group",\n    columns: [\n        { name: "full_name", type: "text" },\n        { name: "age", type: "number" }\n    ]\n})\n\n// It\'s also possible to imperatively add rows to the table\ntable.add([\n    { name: "Mary Fee", age: 47 },\n    { name: "Jerome Gutowski", age: 63 },\n    { name: "Ryan Leon", age: 31 }\n])\n'})}),"\n",(0,a.jsx)(n.h4,{id:"adding-actions",children:"Adding actions"}),"\n",(0,a.jsxs)(n.p,{children:["There are 4 built-in actions available: ",(0,a.jsx)(n.code,{children:"actionAdd"}),", ",(0,a.jsx)(n.code,{children:"actionEdit"}),", ",(0,a.jsx)(n.code,{children:"actionDelete"})," and ",(0,a.jsx)(n.code,{children:"actionLink"}),".\nTo add one, include it at the initialization step:"]}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-ts",children:'import type { Table } from "@ashooww/dataflow"\nimport { actionEdit } from "@ashooww/dataflow/actions"\n\nlet table = collection.new<Person>({\n    id: "group",\n    init: "get_group",\n    columns: [\n        { name: "full_name", type: "text" },\n        { name: "age", type: "number" }\n    ],\n    // highlight-start\n    actions: [\n        actionEdit(async (data: FormData, table: Table<Person>) => {\n            // send data to server and confirm update\n            table.reinit()\n            return true;\n        })\n    ]\n    // highlight-end\n})\n'})}),"\n",(0,a.jsx)(n.p,{children:(0,a.jsx)(n.img,{alt:"Example of a table with edit action",src:t(4267).A+"",width:"700",height:"380"})}),"\n",(0,a.jsx)(n.p,{children:'(notice an "Edit" button at the top of the frame)'}),"\n",(0,a.jsxs)(n.p,{children:["When this button is clicked, a form filled with row data appears.\nParameter ",(0,a.jsx)(n.code,{children:"data"})," contains ",(0,a.jsx)(n.code,{children:"FormData"}),", formed automatically when HTML ",(0,a.jsx)(n.code,{children:"<form>"}),"\nis submitted:"]}),"\n",(0,a.jsx)(n.p,{children:(0,a.jsx)(n.img,{alt:"Example of an edit form",src:t(4356).A+"",width:"700",height:"380"})}),"\n",(0,a.jsx)(n.p,{children:'"Edit" action activates only on row selection and fills the entire form on\nspawn. "Add" action is always active and leaves all fields blank.'}),"\n",(0,a.jsx)(n.p,{children:'"Delete" action spawns a form with hidden fields and instead shows a confirmation\ndialogue:'}),"\n",(0,a.jsx)(n.p,{children:(0,a.jsx)(n.img,{alt:"Example of an edit form",src:t(7389).A+"",width:"700",height:"380"})}),"\n",(0,a.jsx)(n.h4,{id:"frame-components",children:"Frame components"}),"\n",(0,a.jsxs)(n.p,{children:["Mount point of the table specified in ",(0,a.jsx)(n.code,{children:"TableCollection"}),' will be referred to as\na "frame", as it has more components than just a table. By default, it includes:']}),"\n",(0,a.jsxs)(n.ul,{children:["\n",(0,a.jsx)(n.li,{children:"Search bar (top right corner)"}),"\n",(0,a.jsx)(n.li,{children:"Status span (bottom left corner)"}),"\n",(0,a.jsx)(n.li,{children:"Pagination (the remaining two corners)"}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"With some more conifguration, filters can be added as well."})]})}function h(e={}){const{wrapper:n}={...(0,i.R)(),...e.components};return n?(0,a.jsx)(n,{...e,children:(0,a.jsx)(d,{...e})}):d(e)}},3138:(e,n,t)=>{t.d(n,{A:()=>a});const a=t.p+"assets/images/quick-start-2-d732db5cd5404a1285cc601fa62b46e7.png"},4267:(e,n,t)=>{t.d(n,{A:()=>a});const a=t.p+"assets/images/quick-start-3-46c586d76632801a60fb5e8bbc845928.png"},4356:(e,n,t)=>{t.d(n,{A:()=>a});const a=t.p+"assets/images/quick-start-4-cd895738d5accd2bbcae6cc916ac4b5a.png"},7389:(e,n,t)=>{t.d(n,{A:()=>a});const a=t.p+"assets/images/quick-start-5-91237fda15f960b1a8135d6758ef0b1a.png"},8453:(e,n,t)=>{t.d(n,{R:()=>o,x:()=>l});var a=t(6540);const i={},s=a.createContext(i);function o(e){const n=a.useContext(s);return a.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:o(e.components),a.createElement(s.Provider,{value:n},e.children)}}}]);