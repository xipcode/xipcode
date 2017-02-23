![Xipcode](https://s3.amazonaws.com/xipcode/xipcode-logo-250x100.png "Xipcode")

## Overview

Xipcode builds a codebase consisting of multiple projects into a set of artifacts that can be deployed to a variety of execution environments, such as node or a web browser.

## Getting Started

### Install Xipcode

Create a folder for your codebase and from within that folder install xipcode's peer dependencies and then xipcode itself:

```
npm install babel-polyfill
npm install gulp
npm install gulp-eslint
npm install sinon
npm install chai
npm install xipcode
```

### Configure Gulp to Invoke Xipcode

Xipcode's command line interface is implemented using gulp.  Future version will likely support a standalone command line interface without gulp.

To build your first project create a gulpfile.js with the following:

```
const xipcode = require('xipcode');
const gulp = require('gulp');
xipcode.initialize();
gulp.task('default', ['install']);
```

`xipcode.intialize()` will scan the current folder from which gulp was run and all parent folders until it finds a file called `project.json`.  That file will then be built by xipcode using the default 'install' phase, or another phase if supplied on the gulp command line.  More information on phases below.

### Configure the Linting Rules

To get started you can create a .eslintrc file in the top level folder of the codebase with the following:

```
{
  "parserOptions": {
    "ecmaVersion": 6,
    "sourceType": "module"
  }
}
```

As the codebase matures you might want to replace this with your own set of rules.

### Create Your First Xipcode Project

From the command line:

```
gulp create-project --id=my-project
```

This will create a new folder with a project.json that compiles, tests and produces code coverage reports for an example module.  The project will produce two sets of output files, one for executing the code as a node module, and one file that is suitable for executing in the browser.  Projects can be configured to be either "node" projects "browser" projects, or both.

### Build Your First Project

```
cd my-project
gulp install
```

This will compile my-project, run tests in both node and the browser, create a code coverage report and install the package in your local node_modules folder.  See the build folder created by xipcode for details the artifact it has produced.

You can now create more projects that import my-project just as if it was a 3rd party dependency installed from the npm registry.

### Watching

```
gulp <phase> --watch
```

Use the `--watch` command line argument to enable watching the filesystem for changes.  Xipcode will watch all source and test files for all projects and sub-projects being built.  If a file change is detected only the projects impacted by the change will be rebuilt (i.e. the project dependencies are analyzed to avoid building projects that do not need to be rebuilt).

### Build Projects From Any Folder

If a `project.json` file is created at the codebase root the it is possible to build any project referenced by that top-level project by using its project ID:

```
gulp <project-id>
```

The above performs the same build as:

```
cd path/to/project
gulp install
```

### Building Projects During Development

Sometimes it's helpful to peform a quick edit, compile, and manual test cycle during the experimental phase of development, where running all the linting rules and unit tests is unecessary.  Xipocode supports this by generating gulp tasks of the form `dev:<project-id>` that run just the minimal phases needed to compile and install a project.

If the project is used to build a distribution file with the product scenario it's then possible to use a one line command to rebuild that file with incremental changes:

```
gulp dev:<project-id> && gulp <product-project-id>
```

## Lifecycle, Phase and Scenario Reference

For an explanation of lifecycles, phases and scenarios, see the [Concepts](#Concepts) section below.

The `build` lifecycle is used to transform a set of source files into a package that can be used by other projects, or run as a standalone application.  It has the following phases:

* initialize
* lint
* compile
* compile-tests
* test
* package
* install

The `clean` lifecycle is used to delete all temporary files created by Xipcode and the corresponding package from the node_modules folder if it exists.  It has just one phase:

* clean

Scenarios determine which operations actually get performed when executing a phase for a project.  A project can participate in the following scenarios.

* node: Compiles and tests a project to produce a set of CommonJS modules that are suitable for running on node, and that can be referenced by other projects that use the node scenario.  
* browser: Compiles and tests a project to produce a bundle that is suitable for running in a browser, and that can be referenced by other projects that use the browser scenario.  
* product: Creates a single file by concatenating all the project's dependencies in topologically sorted order.  Used to create the file that gets loaded in the browser.

## Concepts

### Codebase

A collection of projects that are being developed together to produce a distributable piece of software.  A codebase also contains a set of external packages that projects can reference and that can be included in the distributable artifact produced by the build.  Some external packages may be excluded from the distribution artifacts if they are assumed to be present in the target execution environment.

### Project

A project represents a unit of modularity that defines the interface between collections of files.  The source files in a project all share access to the same list of packages that are declared as dependencies of the project.  The source files must all be written using the same language version and module system. 

A project is defined by a folder on the file system that contains subfolders for source files, test files and sometimes other support files.  A `project.json` describes the content of the project, its dependencies and the target environment it will be packaged for.

Projects in a codebase reference other projects in the same codebase the same way they would an external (3rd party) dependency.  Xipcode takes care of publishing projects as they are built so that other projects can reference them in this way.

### Package

A package is a project that has been built for a particular execution environment.  An example of a package is a folder under node_modules that has been produced by building a project for the node execution environment.

### Lifecycle

A lifecycle defines a high level process being applied to a project.  Xipcode supports two lifecycles: clean and build.

The clean lifecycle is simply deleting all artifacts created by the build lifecycle so the project is restored to a known state as if it had just been retrieved from version control.

The build lifecycle consists of a series of predefined phases that take the source files of a project as input and produce some artifacts that can be published for other projects to use.  The build lifecycle can also produce artifacts ready for deployment to a production environment (or staging or test).
 
### Phase

A discrete step in the process of executing a lifecycle. Examples of phases are `lint`, `compile`, `test`, and `package`.  The exact operations that get performed at each phase of a lifecycle are determined by the scenario the project participates in.  

### Scenario

A scenario determines the concrete operations that will be performed at each phase of a lifecycle.  For example the `node` scenario will compile sources to use the CommonJS module system and run tests using node, whereas the `browser` scenario will compile sources to use AMD and run tests using Karma and a headless browser.

### Operation

An operation is a unit of implementation for a phase. An example of an operation is invoking a test runner to run tests over files that have already been compiled by a previous operation.  

Phases can have default operations that always get executed for that phase.  For example the `lint` phase always runs the same linting operation.  Phases can also have operations added to them by a scenario.  For example the `compile` phase runs different operations depending on the active scenarios for the project.

# Usage

## Using Mocha With Browser Projects

Xipcode makes Mocha available at test time automatically as part of launching Karma.  For browser projects, early versions of Mocha may cause errors if they are referenced directly from Xipcode projects because Xipcode will attempt to browserify mocha and fail.  Although earlier versions of Mocha cannot be browserified there is an easy solution.  Simply do not import Mocha in any of your test files, and do not include Mocha as a dependendency (or devDependency) in your project.json.  This allows Xipcode to build the project without Mocha, but provide it at test time as the built-in test runner.

If you're using eslint then adding this to your .eslintrc file will ensure that the lack of import statements doesn't cause linting errors:

      "env": {
        "mocha": true
      }

## Implementing a Web Worker

The key aspects of creating a Web Worker in Xipcode are to ensure the following:

### Configure the Project as Standalone

In project.json include this configuration:
 
    "browserCompiler": {
        "standalone": "myWorker"
    }

This ensures that the worker code gets executed on load rather than needing another module to 'require' it first.

### Use addEventListener

Web Workers receive incoming events via the `onmessage` function.  Since Xipcode projects compile every source file as an ES6 module, simply defining an onmessage function inside a module will not work because the scope of that function is local to the module.  

Instead, call `addEventListener('message', myOnmessageFunction, false)` from within your module to register the onmessage function globally.  You can also export the function as a convenience for use by tests.

### Copy the Web Worker Bundle to the Web Server

Once you have built your Web Worker using Xipcode it must be made available to be served by the web server.  For example the code that uses the Web Worker will do something like this:

    const myWebWorker = new WebWorker('/path/to/myWebWorker.js');

Xipcode will create a bundle file in the build/release folder of the web worker project that must be copied (and optionally renamed) to wherever your web server will serve the file referenced from the part of your code that uses the Web Worker.

### Handle 404 Errors in Tests

If you are testing code that uses a Web Worker while running Karma tests you may find that you're getting a 404 error because the test environment does not have the Web Worker available to Karma's web server.  There are two ways of dealing with this.  Either find a way to get the web worker file where Karma expects it (not currently supported by Xipcode), or handle the load error and continue.  This can be done as follows:

    const myWebWorker = new WebWorker('/path/to/myWebWorker.js');
    myWebWorker.onerror = function(event) {
        // handle the load error and continue
    };
