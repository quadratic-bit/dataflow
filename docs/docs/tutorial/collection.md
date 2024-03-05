---
sidebar_position: 2
title: Collection
---

# Collection

### Changing tables

Things get complicated when we have more than one table in the collection:

```ts
let collection = new TableCollection({
    mount: "tag#id",
    receiver: async (query: string) => { ... }
})
let table1 = collection.new<Type1>({ id: "table_1", ... })
let table2 = collection.new<Type2>({ id: "table_2", ... })
```

This will show only table1 and its rows. Since all tables are mounted in the same HTML node
(`"tag#id"` in our case) we'll need a way to switch between them.

Dataflow does not have a built-in switcher,
so you'll have to implement it with the following methods in your disposal:

```ts
// Find a table by ID
let table_1: Table<Type1> | null = collection.find("table_1")

// Switch to another table by ID
let table_2: Table<Type2> | null = collection.swap("table_2")
```

There are also methods for manual table mounting and umnounting, though not recommended for use:

```ts
// Unmount table by ID. Throws an error if no table is mounted.
collection.unmount("table_1")

// Mount table by ID. Throws an error if some other table is already mounted or no table with such ID is found.
let table_2: Table<Type2> = collection.moun("table_2")
```

CUSTOM AND SIMPLE IMPLEMENTATION OF A SWITCHER WITH A GIF
