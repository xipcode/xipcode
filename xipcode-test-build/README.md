# Xipcode Test Build

A test build that exercises the major features of xipcode.

# Overview

The test build uses xipcode by declaring it as a `devDependency`
in `package.json`.  It then uses `require('xipcode')` in the 
gulp file to import the xipcode module.  The gulp file invokes
xipcode to create the gulp tasks for the test build.

# Developers

To iterate over testing changes in xipcode along with changes
to the test build, use `./devBuildTestAll.sh` to rebuild xipcode, 
install it into the test build and run the test build.
