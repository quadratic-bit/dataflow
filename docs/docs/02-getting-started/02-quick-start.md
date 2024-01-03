---
sidebar_position: 2
title: Quick Start
---

# Quick Start

### Minimal setup

Firstly, let's pick a simple interface to work with:

```ts
interface Person {
    name: string,
    age: number,
}
```

Then, we'll need to define a table collection.
The signature for the constructor is as follows:

```ts
TableCollection(
    mount: string, // HTML selector
    getter: (query: any) => Promise<any>, // Callback for retrieving data
    // locale?: Locale
)
```

So let's define both collection and our first table:

```ts
import { Table, TableCollection } from "dataflow"

let collection = new TableCollection("main#frame", (query: string) => { ... })
let table_group = collection.new<Person>("group", "get_group")
```

### Modules overview 

#### dataflow

Root export contains two classes &mdash; `Table`, representing an instance of the table,
and `TableCollection` for sharing common fields and manipulating table states:

```ts
import { Table, TableCollection } from "dataflow"
```

#### dataflow/columns

The `columns` export contains classes for every implemented column:

```ts
import { TextTableColumn, NumberTableColumn, ... } from "dataflow/columns"
```

#### dataflow/fields

The `fields` export gives auxiliary function to create relations between tables
(`createDependency`), as well as functions for data retrieval from submitted form:

```ts
import { createDependency, getString, getInt, ... } from "dataflow/fields"
```

#### dataflow/pagination

The `pagination` export allows to specify possible pages amount to choose from for the user:

```ts
import { PagesSome, PagesAll } from "dataflow/pagination"

collection.new(...).pageSizes([PagesSome(10), PagesSome(50), PagesAll])
```
