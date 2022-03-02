const fs = require('fs');
const path = require('path');
const globby = require('globby');
const webpack = require('webpack');

const defaultOptions = {
    localModulesPath: '@magento',
    nodeModulesFolder: 'node_modules/@magento',
    nodeModulePathRegex: new RegExp(/node_modules\/@magento\/(venia-ui|peregrine|pagebuilder)\/(.*)/),
    nodeModulePathReplaceRegex: new RegExp(/^.+node_modules\/@magento/),
}

const defaultFolders = [
    'venia-ui', 'peregrine', 'pagebuilder'
]

module.exports = async (targets, newOptions = defaultOptions, folders = defaultFolders) => {
    const options = {
        ...newOptions
    }

    const themeoverwritePath = path.join(path.resolve("./"), `src/${options.localModulesPath}`);
    const nodeModulesPath = path.join(path.resolve("./"), options.nodeModulesFolder);

    const overwriteFolders = {}

    folders.map(async (folder) => {
        if (!fs.existsSync(`${themeoverwritePath}/${folder}`)){
            fs.mkdirSync(`${themeoverwritePath}/${folder}`, { recursive: true });
            await fs.writeFileSync(`${themeoverwritePath}/${folder}/.gitignore`, '');
        }

        overwriteFolders[folder] = (await globby(`${themeoverwritePath}/${folder}`))
    });

    targets.of('@magento/pwa-buildpack').webpackCompiler.tap(compiler => {
        const plugin = new webpack.NormalModuleReplacementPlugin(
            options.nodeModulePathRegex,
            resource => {
                let found = null
                let resourcePath = resource.request
                resourcePath = resourcePath.replace(options.nodeModulePathReplaceRegex,'').replace(nodeModulesPath, '');

                const whichThemeFolder = Object.keys(overwriteFolders).map(overwriteFolder => {
                    if (resourcePath.includes(overwriteFolder)) {
                        return overwriteFolder
                    }
                }).filter(Boolean);

                if (whichThemeFolder.length) {
                    found = overwriteFolders[whichThemeFolder[0]].find(themePath => {
                        if (themePath.includes(resourcePath)) {
                            return themePath
                        }
                    })

                    if (found) {
                        resource.resource = found
                    }
                }
            }

        );
        plugin.apply(compiler);
    });
}
