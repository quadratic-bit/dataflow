Data:Flow
---------

Dependency-free TypeScript library designed to make your HTML tables interactive.

> [!WARNING]
> This codebase will undermine multiple breaking changes,
> so no documentation will be up-to-date up until the 20th of March.

> [!NOTE]
> The project is under active development and your contributions are welcome.

### Getting started

#### Installation

##### Building from source

To build the package from source, first clone the repository:

```console
$ git clone git@github.com:quadratic-bit/dataflow.git
$ cd ./dataflow
```

... then build it with your favourite package manager:

```console
$ yarn build # npm run build
```

You can now reference it in `package.json` of your project like this:

```json
"dependencies": {
    "dataflow": "link:<path_to_dataflow>"
}
```

##### NPM package

Coming soon!

#### Usage

Getting started is fairly trivial.

1. Declare an interface of a table row:

```ts
interface Person {
    full_name: string,
    age: number,
}
```

2. Create a common `TableCollection`, specify its selector and a callback to retrieve data from:

```ts
import { TableCollection } from "dataflow"

async function tableGetter(action: string): Promise<Person[]> {
    const response = await fetch("https://example.com/api?action=" + action)
    return await response.json()
}

let collection = new TableCollection("main#my-table", tableGetter)
```

3. Add your table within a `collection`, describing each column to display (and maybe an action):

```ts
let table = collection
    .new<Person>("group", "get_group") // Specify table ID and its getter
    .describe({ name: "full_name", type: "text" }) // `name` should match some Person's property name
    .describe({ name: "age", type: "number" })
    .actionDelete(async () => console.log("Some row has been deleted"))
    .init()
```

4. Voilà! There should be a pretty table at `main#my-table` filled with data pulled from `https://example.com/api?action=get_group`.

For more info, tips and tricks please refer to the [documentation website](https://quadratic-bit.github.io/dataflow/).

### Contributing

Your contributions are always welcome and highly appreciated. Please have a look at the [contribution guidelines](.github/CONTRIBUTING.md) and [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for details.

### License

This project is released under the GPLv3 [license](LICENSE).
