---
sidebar_position: 1
toc_max_heading_level: 4
title: Table Column
---

## `TableColumn`

Every object passed to `.describe()` in a `Table` factory is of type `TableColumn`.

| Name         | Type      | Default            | Description                                   |
| ------------ | --------- | ------------------ | --------------------------------------------- |
| `type`       | [`string`](#columns-type) |    | Data type corresponding to an HTML input.     |
| `name`       | `string`  |                    | Name of an underlying `Row` object property.  |
| `title`      | `string`  | Capitalized `name` | String displayed as a column header.          |
| `hide`       | `boolean` | `false`            | Do not render this column in DOM.             |
| `required`   | `boolean` | `false`            | Whether to set `required` property in a form. |
| `overflow`   | `boolean` | `true`             | Allow to wrap words in a table cell with `ellipsis`.      |
| `lineBreaks` | `boolean` | `false`            | Allow to break lines on overflow in a table cell.         |
| `relies`     | [`Relies`](#columns-relies) | `undefined` | Set a dynamic dependency inside a form.        |
| `render`     | `(value: unknown): string`  | `undefined` | Preprocesses value before rendering.           |
| `preprocess` | `(value: unknown): string`  | `undefined` | Preprocesses value before passing into a form. |
| `props`      | [`Props`](#columns-props)   | `undefined` | HTML attributes that will be passed to input in a form. |

These extra fields only apply to columns with `type` **"select"**:

| Name      | Type      | Default  | Description                                 |
| --------- | --------- | -------- | ------------------------------------------- |
| `choices` | [`SelectDependency`](#selectdependency) or [`SelectOption[]`](#selectoption) | | Which options should be allowed. |
| `preventRenderTimeResolution` | `boolean` | `false` | Prevent resolving `SelectDependency` when rendering in a table. |
| `filterable` | `boolean` | `false` | Enable filter for a column (beta) |

This extra field only applies to columns with `type` **"date"**:

| Name    | Type      | Default  | Description                                 |
| ------- | --------- | -------- | ------------------------------------------- |
| `today` | `boolean` | `false`  | Set the default date in a form to be today. |

This extra field only applies to columns with `type` **"datetime-local"** and **"time"**:

| Name  | Type      | Default | Description                                              |
| ----- | --------- | ------- | -------------------------------------------------------- |
| `now` | `boolean` | `false` | Set the default time in a form to match the system time. |

### Column's `type`

`type` is on of the following strings:

| `type`    | Props | MDN article |
| --------- | ----- | ----------- |
| "hidden" | [`HiddenProps`](#hiddenprops) | [`<input type="hidden">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/hidden) |
| "text" | [`TextProps`](#textprops) | [`<input type="text">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/text) |
| "number" | [`NumberProps`](#numberprops) | [`<input type="number">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/number) |
| "email" | [`EmailProps`](#emailprops) | [`<input type="email">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email) |
| "tel" | [`TelProps`](#telprops) | [`<input type="tel">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/tel) |
| "date" | [`DateProps`](#dateprops) | [`<input type="date">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date) |
| "time" | [`TimeProps`](#timeprops) | [`<input type="time">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/time) |
| "datetime-local" | [`DateTimeProps`](#datetimeprops) | [`<input type="datetime-local">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/datetime-local) |
| "checkbox" | [`CheckboxProps`](#checkboxprops) | [`<input type="checkbox">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox) |
| "textarea" |       | [`<textarea>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea) |
| "select" |       | [`<select>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select) |

### Column's `relies`

`relies` controls the value of a described column upon any change of an inputfor
for another column and has the following structure:

| Name       | Type      | Description                                                         |
| ---------- | --------- | ------------------------------------------------------------------- |
| `source`   | `string`  | Name of the column which, upon changing, will trigger `callback`.   |
| `callback` | `(value: unknown): Promise<string>` | Should return the new value for an input. |


### Column's `props`

#### HiddenProps

| Name       | Type      | Description                     |
| ---------- | --------- | ------------------------------- |
| `readonly` | `boolean` | Set the form input as readonly. |

#### TextProps

| Name          | Type      | Description                                                            |
| ------------- | --------- | ---------------------------------------------------------------------- |
| `readonly`    | `boolean` | Set the form input as readonly.                                        |
| `maxlength`   | `number`  | The maximum string length that the user can enter into the text input. |
| `minlength`   | `number`  | The minimum string length that the user can enter into the text input. |
| `pattern`     | `string`  | Regular expression that the input's value must match.                  |
| `placeholder` | `string`  | Input's placeholder value.                                             |
| `size`        | `number`  | How many characters wide the input field should be.                    |
| `spellcheck`  | `boolean` | Whether to enable spell checking for an element.                       |

#### NumberProps

| Name          | Type      | Description                                    |
| ------------- | --------- | ---------------------------------------------- |
| `readonly`    | `boolean` | Set the form input as readonly.                |
| `max`         | `number`  | The maximum value to accept for this input.    |
| `min`         | `number`  | The minimum value to accept for this input.    |
| `placeholder` | `string`  | Input's placeholder value.                     |
| `step`        | `number`  | Granularity that the value must adhere to.     |

#### EmailProps

| Name          | Type      | Description                                                            |
| ------------- | --------- | ---------------------------------------------------------------------- |
| `readonly`    | `boolean` | Set the form input as readonly.                                        |
| `maxlength`   | `number`  | The maximum string length that the user can enter into the text input. |
| `minlength`   | `number`  | The minimum string length that the user can enter into the text input. |
| `multiple`    | `boolean` | Indicates that the user can enter multiple email addresses.            |
| `pattern`     | `string`  | Regular expression that the input's value must match.                  |
| `placeholder` | `string`  | Input's placeholder value.                                             |
| `size`        | `number`  | How many characters wide the input field should be.                    |

#### TelProps

| Name          | Type      | Description                                                            |
| ------------- | --------- | ---------------------------------------------------------------------- |
| `readonly`    | `boolean` | Set the form input as readonly.                                        |
| `maxlength`   | `number`  | The maximum string length that the user can enter into the text input. |
| `minlength`   | `number`  | The minimum string length that the user can enter into the text input. |
| `pattern`     | `string`  | Regular expression that the input's value must match.                  |
| `placeholder` | `string`  | Input's placeholder value.                                             |
| `size`        | `number`  | How many characters wide the input field should be.                    |
| `spellcheck`  | `boolean` | Whether to enable spell checking for an element.                       |

#### DateProps

| Name          | Type      | Description                                        |
| ------------- | --------- | -------------------------------------------------- |
| `readonly`    | `boolean` | Set the form input as readonly.                    |
| `max`         | `string`  | The latest date to accept.                         |
| `min`         | `string`  | The earliest date to accept.                       |
| `step`        | `number`  | Granularity that the value must adhere to in days. |

#### TimeProps

| Name          | Type      | Description                                           |
| ------------- | --------- | ----------------------------------------------------- |
| `readonly`    | `boolean` | Set the form input as readonly.                       |
| `max`         | `string`  | The latest time to accept.                            |
| `min`         | `string`  | The earliest time to accept.                          |
| `step`        | `number`  | Granularity that the value must adhere to in seconds. |

#### DateTimeProps

| Name          | Type      | Description                                           |
| ------------- | --------- | ----------------------------------------------------- |
| `readonly`    | `boolean` | Set the form input as readonly.                       |
| `max`         | `string`  | The latest date and time to accept.                   |
| `min`         | `string`  | The earliest date and time to accept.                 |
| `step`        | `number`  | Granularity that the value must adhere to in seconds. |

#### CheckboxProps

| Name       | Type      | Description                     |
| ---------- | --------- | ------------------------------- |
| `readonly` | `boolean` | Set the form input as readonly. |

#### TextareaProps

| Name           | Type      | Description                                                                     |
| -------------- | --------- | ------------------------------------------------------------------------------- |
| `readonly`     | `boolean` | Set the form input as readonly.                                                 |
| `autocomplete` | `boolean` | Whether the value of the control can be automatically completed by the browser. |
| `autocorrect`  | `boolean` | Whether to activate automatic spelling correction.                              |
| `cols`         | `number`  | The visible width of the text control, in average character widths.             |
| `maxlength`    | `number`  | The maximum string length that the user can enter.                              |
| `minlength`    | `number`  | The minimum string length that the user can enter.                              |
| `placeholder`  | `string`  | Input's placeholder value.                                                      |
| `rows`         | `number`  | The number of visible text lines.                                               |
| `spellcheck`   | `boolean` | Whether the `<textarea>` is subject to spell checking.                          |
| `wrap`         | `"hard" \| "soft" \| "off"` | How the control should wrap the value for form submission.    |

### `SelectDependency`

`SelectDependency` allows to pull data from other defined tables for both
rendering and form filling purposes and has the following structure:

| Name        | Type     | Description                                                     |
| ----------- | -------- | --------------------------------------------------------------- |
| `table`     | `string` | Name of the table containing designated column.                 |
| `column`    | `string` | Name of the target column.                                      |
| `reference` | `string` | Name of the column which value is stored in a described column. |

`reference` is acting as a foreign key here, e.g. if the column stores
`id` of another object and wants to access its `name`, then
"id" would be `reference` and "name" would be `column`.

To instantiate this object one can use `createDependency` function:

```ts
import { createDependency } from "dataflow/fields"
```

### `SelectOption`

`SelectOption` allows static `<select>` options to be passed:

| Name        | Type     |
| ----------- | -------- |
| `value`     | `string` |
| `label`     | `string` |
