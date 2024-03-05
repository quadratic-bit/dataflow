---
sidebar_position: 5
title: Dark Theme
---

# Dark Theme

Dark theme is almost fully supported by default with css `color-scheme` property:

```css
:root {
    color-scheme: light dark;
}
```

But some elements will remain white. To fix it, add following rulesets:

```css
.dataflow-table tbody {
    background-color: black; /* Change to your page's black*/
}

.dataflow-table tr > td > div::after {
    color: rgba(255, 255, 255, 0.87);
}

.dataflow-table th {
    box-shadow: inset 10em 10em black; /* Change to your page's black*/
}

.dataflow-form-content {
    background-color: black; /* Change to your page's black*/
}
```

:::note
Make sure these rulesets are included *after* the default ones that
dataflow provide so they do not get overwritten.
:::
