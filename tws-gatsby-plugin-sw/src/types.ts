import { GenerateSWOptions } from "workbox-build"
export type PrecachePageData = {
    path: string
    indexHtmlPath: string
    dependencies: string[]
    // TODO(teawithsand): add page-data.json path here
}

export type BuildWorkboxConfigData = {
    pages: PrecachePageData[]
    otherFiles: string[]
}

export type Config = {
    precachePages: string[],
    appendScript: string | null,
    debug?: boolean,
    makeWorkboxConfig: (template: GenerateSWOptions, data: BuildWorkboxConfigData) => GenerateSWOptions
}