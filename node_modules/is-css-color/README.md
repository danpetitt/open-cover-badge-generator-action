# is-css-color

[![Build Status](https://travis-ci.org/princejwesley/is-css-color.svg)](https://travis-ci.org/princejwesley/is-css-color) [![npm version](https://badge.fury.io/js/is-css-color.svg)](http://badge.fury.io/js/is-css-color)  ![license](https://img.shields.io/badge/license-MIT-blue.svg)

Check if a given string is css compatible color value.

## Install
> npm install is-css-color

## Usage
```
var isCSSColor = require('is-css-color');

isCSSColor('#FFF'); // true
isCSSColor(rgba(255, 100, 123, 0.5)); // true
isCSSColor(hsl(25, 60%, 15%)); // true
```

## License
[MIT License](https://github.com/princejwesley/is-css-color/blob/master/LICENSE.md)
