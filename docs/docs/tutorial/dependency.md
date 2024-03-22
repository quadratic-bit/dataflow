---
sidebar_position: 3
title: Dependency System
---

# Dependency System

### Setup

Let's say we have the following two interfaces:

```ts
interface User {
    id: number,
    name: string
}

interface Item {
    id: number,
    owner: number,
    label: string
}
```

Assume `owner` field holds corresponding `User.id`. Let's create some tables:

```ts
let userTable = collection.new<User>({
    id: "users",
    init: "get_users",
    columns: [
        { name: "id", type: "number" },
        { name: "name", type: "string" }
    ]
})

let itemTable = collection.new<Item>({
    id: "items",
    init: "get_items",
    columns: [
        { name: "id", type: "number" },
        { name: "owner", type: "number" },
        { name: "label", type: "text" }
    ]
})
```

PICTURE

### Select Dependency

What if we want to show corresponding `User.name` instead of `User.id` for each `Item`
without touching the underlying data? That's where *dependencies* come in:

FILENAME dataflow/fields
```ts title="@ashooww/dataflow/fields"
function createDependency(tableID: string, column: string, reference: string): SelectDependency
```

If some other table within the same collection (like `User` in our case) contains necessary fields,
we can change the type of our column slightly:

```ts
import { createDependency } from "@ashooww/dataflow/fields"

let itemTable = collection.new<Item>({
    id: "items",
    init: "get_items",
    columns: [
        { name: "id", type: "number" },
        // highlight-start
        {
            name: "owner",
            type: "select",
            choices: createDependency("users", "name", "id")
        },
        // highlight-end
        { name: "label", type: "text" }
    ]
})
```

Here we specify that we want to replace `Item.owner` field with `User.name` from `users` table
where value of `Item.owner` matches with `User.id`

PICTURE

HTML field for `owner` field has also changed &mdash; it is now
`<select>` tag with all values pulled from `users` table

### Filters

If we want to be able to filter through specific values of dependency
(especially in One-To-Many relationship) we need to activate the filter during init:

```ts
let itemTable = collection.new<Item>({
    id: "items",
    init: "get_items",
    columns: [
        { name: "id", type: "number" },
        {
            name: "owner",
            type: "select",
            choices: createDependency("users", "name", "id"),
            // highlight-start
            filterable: true
            // highlight-end
        },
        { name: "label", type: "text" }
    ]
})
```

PICTURE
