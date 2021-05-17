# Ulu

A collection of tools and libraries for Node and front-end. Organized in a monorepo since they share assets and are developed together. Frameworks and libraries included relate to:

_Note: the list below is in progress_

- Styling (Less, Sass)
- Javascript
    + Utilities (for Node or the browser)
    + Helpful top level framework for traditional non-app websites
    + Gulp Workflow that can be updated in projects without individual gulp files
    + Vue Components
    + Vue Plugins
    + jQuery plugins
- Project Templates
    + Hugo
    + Vue
    + Drupal Theme
- Node Applications/Tools
    + Scan a directory of local HTML and  submit to Nu Validator service
    + Dynamic Less Modules
    + Static Asset Compiler/Template System

## Organization

All modules live within their own folder within `/packages/`. Each is it's own node module. Each is published to NPM for use in web projects and node projects (al-la-carte).

## Usage & Documentation

Each package has it's own Readme and documentation. Also all packages that support full documentation can be found in the complete documentation links.

[Documentation Links](https://jscherbe.github.io/ulu/)

## Development

The repository uses [Lerna](https://github.com/lerna/lerna) to manage the monorepo and link the packages during development. To start you will need to install Lerna CLI tool globally.

```
$ npm install --global lerna
```

Navigate your CL to the Ulu repo add the local dependencies:

```
$ npm install
```

Now link the packages for development using:

```
$ lerna bootstrap
# or to force use of all local dependencies
$ lerna bootstrap --force-local
```

### About the packages

All modules live within their own folder within `/packages/`. Each is it's own node module. Each is published to NPM for use in web projects and node projects (al-la-carte). 

#### To publish

First run lerna publish which will increment the package version numbers and publish to NPM.

```
$ lerna publish
```

_Note: Occasionally this doesn't work. Until I understand more packages can be manually published with `npm publish`_

### Automated Commands

The following commands allow you to automate things across all packages in monorepo.

#### Run tests in all packages:

```
$ lerna run test
```

_Will run every packages NPM > scripts > test and report._

#### Update all documentation:

```
$ lerna run docs
```

_Will run every packages NPM > scripts > docs and report._

**This will:**

- Run NPM > scripts > docs, which will run the create-docs module on each package
- Generate local markdown documentation for each package that supports documentation generation.
- Update or add HTML version of documentation to global docs for the Ulu repository. Which is accessible via Git Pages here.
- Update the list of links to each global docs child sites

**Notes**

- Configured using package's ulu.docs object API below
    - `title` {String} Title for documentation of package
    - `description` {String} Description to insert
    - `includes` {Array} Local paths to parse 
    - `html` {Boolean} Generate HTML documentation (placed into the ulu documentation pages area, .md version is the local)
    - `markdown` {Boolean} Generate Markdown Documentation
    - `markdownFilename` {String} Name of generated markdown documentation (inserted into the package root directory)
    - `syntax` {String} Syntax for documentation, determines which parser to use in ulu/create-docs package

## Resources

### Vue JS Guides

- [Packaging Components](https://vuejs.org/v2/cookbook/packaging-sfc-for-npm.html)

