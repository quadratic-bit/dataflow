---
sidebar_position: 4
title: Locali(z/s)ation
---

# Localization

Localization is fairly trivial and is applied upon collection creation:

```ts
let collection = new TableCollection({
    mount: "tag#id",
    receiver: async (query: string) => { ... },
    // highlight-start
    locale: {...} satisfies Locale
    // highlight-end
})
```

Defaults are as follows:

```ts
LOCALE_DEFAULT: Locale = {
    status: {
        idle: "Click on a row to select it",
        showRange: "Showing _START_ to _END_ of _TOTAL_ entries",
        showEmpty: "No entries available"
    },
    pagination: {
        size: "Show _TOTAL_ entries",
        all: "All"
    },
    actions: {
        add: "Add",
        edit: "Edit",
        delete: "Delete"
    },
    form: {
        goBack: "Go back",
        confirmation: "Are you sure you want to perform this action?",
        buttonSubmit: "Submit",
        buttonCancel: "Cancel"
    },
    frame: {
        empty: "Looks like there's nothing here"
    }
}
```
