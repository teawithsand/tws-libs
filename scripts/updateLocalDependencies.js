#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const mutateAllPackageJSONs = async (
    mutator
) => {
    const entries = fs.readdirSync(path.join(__dirname, '..')).filter(e => /^tws-.+$/.test(e)).map(
        e => ({
            project: e,
            path: path.join(__dirname, '..', e, 'package.json')
        })

    ).filter(e => fs.existsSync(e.path))

    for (const e of entries) {
        console.log("processing", e)
        const c = JSON.parse(fs.readFileSync(e.path))
        const newValue = await mutator(c, e.project)
        if (typeof newValue !== "object")
            throw new Error("not even an object")
        const newContent = JSON.stringify(newValue, null, "\t") + "\n"
        fs.writeFileSync(e.path, newContent, 'utf-8')
    }
}

const readAllPackageJSONs = async (
    mutator
) => {
    const entries = fs.readdirSync(path.join(__dirname, '..')).filter(e => /^tws-.+$/.test(e)).map(
        e => ({
            project: e,
            path: path.join(__dirname, '..', e, 'package.json')
        })

    ).filter(e => fs.existsSync(e.path))

    const m = new Map
    for (const e of entries) {
        m.set(e.project, JSON.parse(fs.readFileSync(e.path)))
    }

    return m
}

/**
 * Updates all package dependencies to latest versions.
 */
const main = async () => {
    const folderPackages = await readAllPackageJSONs()
    const dependencyPackages = new Map()
    for (const [_k, v] of folderPackages.entries()) {
        dependencyPackages.set(v.name, v)
    }

    mutateAllPackageJSONs(async (content, project) => {
        for (const dependencyType in content) {
            if (!/dependencies/i.test(dependencyType))
                continue

            for (const dependency in content[dependencyType]) {
                if (dependencyPackages.has(dependency)) {
                    content[dependencyType][dependency] = "^" + dependencyPackages.get(dependency).version
                }
            }
        }

        return content
    })
}

main()


// TODO(teawithsand): script for DAGing all libs and building them in order