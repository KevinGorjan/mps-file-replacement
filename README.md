# Vaimo :: Magento PWA Studio File Replacement
### Overwrite files in the "node_modules"-folder

---

A Webpack Plugin for PWA Studio, by Vaimo.

---
## About:
With this package you can overwrite files in the `node_modules` folder.

By default, you can overwrite files in 
* `node_modules/@magento/venia-ui`
* `node_modules/@magento/peregrine`
* `node_modules/@magento/pagebuilder`

But you can also overwrite third parties packages

## Example
Let's say, you want to overwrite some files from `node_modules/@magento/venia-ui/lib/components/Header/...` and `node_modules/@magento/venia-ui/lib/components/Footer/...`

You can do this by creating a folder with sub-folders with the same folder-structure as in `node_modules/@magento/venia-ui`
```
src 
|-> @magento/lib/components/
                    |-> Header/header.js
                    |-> Footer/
                           |-> footer.js
                           |-> footer.modules.css
                           
|-> @my-custom-package/...
|-> @my-custom-package-2/...
```


## Installation:
In the root of your application
```bash
yarn add @vaimo/mps-file-replacement
```

Add Vaimo's File Replacement intercept.js to your project local-intercept.js
```js
const vaimoFileReplacementIntercept = require('@vaimo/mps-file-replacement/targets/extend-intercept');

const localIntercept = async (targets) => {
    await vaimoFileReplacementIntercept(targets);
}

module.exports = localIntercept;
```

---

## Usage:
As the example demonstrated, by default you can overwrite the folders `venia-ui`, `peregrine` and `pagebuilder`
```bash
mkdir -p src/@magento/venia-ui/lib/components/Footer
```
```bash
touch src/@magento/venia-ui/lib/components/Footer/footer.js
```
```bash
cp node_modules/@magento/venia-ui/lib/components/Footer/footer.module.css src/@magento/venia-ui/lib/components/Footer/footer.module.css
```

```jsx
// src/@magento/venia-ui/lib/components/Footer/footer.js
import React from 'react';
import { useStyle } from '@magento/venia-ui/lib/classify';
import defaultClasses from './footer.module.css';

const Footer = props => {
    const classes = useStyle(defaultClasses, props.classes);
    return (
        <footer className={classes.root}>
            My New Awesome Footer
        </footer>
    );
};

export default Footer;
```

Start the application
```
yarn watch
```

See your new footer and try to modify the css in `src/@magento/venia-ui/lib/components/Footer/footer.module.css`

## Usage 2:
You can also overwrite other applications that are PWA Studio packages

For example: let's say there is a package called `@vaimo/base-theme` and this is present in your `node_modules` (this package is made up)

It contains the same folder structure as any @magento package
```
Example: 
@vaimo/
    |-> base-theme/
    |       |-> i18n/... 
    |       |-> lib/
    |            |-> components/...
    |            |-> peregrine/...
    |            |-> helpers/...
    |            |-> and-so-on/...
    |-> yotpo/...       
```

This is package is used in your project, but you want to change `button.js` in the components folder.

You can add a new interceptor and add some settings

```js
const vaimoFileReplacementIntercept = require('@vaimo/mps-file-replacement/targets/extend-intercept');

const localIntercept = async (targets) => {
    await vaimoFileReplacementIntercept(targets);
    
    const options = {
        localModulesPath: '@vaimo',
        nodeModulesFolder: 'node_modules/@vaimo',
        nodeModulePathRegex: new RegExp(/node_modules\/@vaimo\/base-theme\/(.*)/),
        nodeModulePathReplaceRegex: new RegExp(/^.+node_modules\/@vaimo/),
    };
    const folders = ['base-theme']
    
    await vaimoFileReplacementIntercept(targets, options, folders);
}

module.exports = localIntercept;
```

```bash
mkdir -p src/@vaimo/base-theme/lib/components/Button
```
```bash
touch src/@vaimo/base-theme/lib/components/Button/button.js
```

```jsx
// src/@vaimo/base-theme/lib/components/Button/button.js
import React from 'react'

const Button = props => {
    return (
        <button {...props}>
            Overwrite the button from Vaimo Base Theme
        </button>
    )
}

export default Button
```

You need to pass following options
```js
const options = {
    localModulesPath: '@vaimo', // the name of the folder in your src-folder (keep the same name, it's easier) 
    nodeModulesFolder: 'node_modules/@vaimo', // the folder in the node_modules
    nodeModulePathRegex: new RegExp(/node_modules\/@vaimo\/base-theme\/(.*)/), // with this regex, it will reduce the amount of searches and matching webpack needs to do to overwrite the files
    nodeModulePathReplaceRegex: new RegExp(/^.+node_modules\/@vaimo/), // with this regex, it will remove all text before the node_modules/@vaimo because the webpack-loaders are adding reference strings to it
};
```

### Remarks
* At this moment, if you add new files in your `src`-folder for overwriting files in the `node_modules`-folder, you need to restart the application.
* Without configuration, you can only overwrite files in `node_modules/@magento/venia-ui`, `node_modules/@magento/peregrine` and `node_modules/@magento/pagebuilder`
---
