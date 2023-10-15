import { resolve } from "path"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

export default defineConfig({
    build: {
        minify: true,
        lib: {
            entry: [
                resolve(__dirname, "src/main.ts")
            ],
            name: "dataflow",
            formats: ["es", "cjs"]
        }
    },
    plugins: [
        dts({
            insertTypesEntry: true
        })
    ]
})
