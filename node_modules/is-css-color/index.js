'use strict';

//every string I match against are lowercase
var HEX_PATTERN = /^#(?:[a-f0-9]{3})?(?:[a-f0-9]{3})$/;
// css color names + initial + inherit + currentColor + transparent
var CSS_COLOR_NAMES = [
  'aliceblue',
  'antiquewhite',
  'aqua',
  'aquamarine',
  'azure',
  'beige',
  'bisque',
  'black',
  'blanchedalmond',
  'blue',
  'blueviolet',
  'brown',
  'burlywood',
  'cadetblue',
  'chartreuse',
  'chocolate',
  'coral',
  'cornflowerblue',
  'cornsilk',
  'crimson',
  'currentColor',
  'cyan',
  'darkblue',
  'darkcyan',
  'darkgoldenrod',
  'darkgray',
  'darkgreen',
  'darkgrey',
  'darkkhaki',
  'darkmagenta',
  'darkolivegreen',
  'darkorange',
  'darkorchid',
  'darkred',
  'darksalmon',
  'darkseagreen',
  'darkslateblue',
  'darkslategray',
  'darkslategrey',
  'darkturquoise',
  'darkviolet',
  'deeppink',
  'deepskyblue',
  'dimgray',
  'dimgrey',
  'dodgerblue',
  'firebrick',
  'floralwhite',
  'forestgreen',
  'fuchsia',
  'gainsboro',
  'ghostwhite',
  'gold',
  'goldenrod',
  'gray',
  'green',
  'greenyellow',
  'grey',
  'honeydew',
  'hotpink',
  'indianred',
  'indigo',
  'inherit',
  'initial',
  'ivory',
  'khaki',
  'lavender',
  'lavenderblush',
  'lawngreen',
  'lemonchiffon',
  'lightblue',
  'lightcoral',
  'lightcyan',
  'lightgoldenrodyellow',
  'lightgray',
  'lightgreen',
  'lightgrey',
  'lightpink',
  'lightsalmon',
  'lightseagreen',
  'lightskyblue',
  'lightslategray',
  'lightslategrey',
  'lightsteelblue',
  'lightyellow',
  'lime',
  'limegreen',
  'linen',
  'magenta',
  'maroon',
  'mediumaquamarine',
  'mediumblue',
  'mediumorchid',
  'mediumpurple',
  'mediumseagreen',
  'mediumslateblue',
  'mediumspringgreen',
  'mediumturquoise',
  'mediumvioletred',
  'midnightblue',
  'mintcream',
  'mistyrose',
  'moccasin',
  'navajowhite',
  'navy',
  'oldlace',
  'olive',
  'olivedrab',
  'orange',
  'orangered',
  'orchid',
  'palegoldenrod',
  'palegreen',
  'paleturquoise',
  'palevioletred',
  'papayawhip',
  'peachpuff',
  'peru',
  'pink',
  'plum',
  'powderblue',
  'purple',
  'rebeccapurple',
  'red',
  'rosybrown',
  'royalblue',
  'saddlebrown',
  'salmon',
  'sandybrown',
  'seagreen',
  'seashell',
  'sienna',
  'silver',
  'skyblue',
  'slateblue',
  'slategray',
  'slategrey',
  'snow',
  'springgreen',
  'steelblue',
  'tan',
  'teal',
  'thistle',
  'tomato',
  'transparent',
  'turquoise',
  'violet',
  'wheat',
  'white',
  'whitesmoke',
  'yellow',
  'yellowgreen',
];

var PREFIX = '^(rgb|hsl)(a?)\\s*\\(';
var VALUE = '\\s*([-+]?\\d+%?)\\s*';
var ALPHA = '(?:,\\s*([-+]?(?:(?:\\d+(?:\.\\d+)?)|(?:\.\\d+))\\s*))?';
var SUFFIX = '\\)$';
var RGB_HSL_PATTERN = new RegExp(PREFIX + VALUE + ',' + VALUE + ',' + VALUE + ALPHA + SUFFIX);

var NUM_TYPE = 1;
var PERCENTAGE_TYPE = 2;
var ERROR_TYPE = NUM_TYPE & PERCENTAGE_TYPE;

module.exports = function(str) {
  function getColorType(token) {
    return token.indexOf('%') !== -1 ? PERCENTAGE_TYPE : NUM_TYPE;
  }

  if(!str || typeof str !== 'string') {
    return false;
  }

  var color = str.replace(/^\s+|\s+$/g, '').toLocaleLowerCase();

  // named colors or hex code
  if((CSS_COLOR_NAMES.indexOf(color) !== -1) || HEX_PATTERN.test(color)) {
    return true;
  }

  var result = color.match(RGB_HSL_PATTERN);
  if(result) {
    var flavor = result[1];
    var alpha = result[2];
    var rh = result[3];
    var gs = result[4];
    var bl = result[5];
    var a = result[6];

    // alpha test
    if((alpha === 'a' && !a) || (a && alpha === '')) {
      return false;
    }

    // hsl
    if(flavor === 'hsl') {
      if(getColorType(rh) !== NUM_TYPE) {
        return false;
      }
      return (getColorType(gs) & getColorType(bl)) === PERCENTAGE_TYPE;
    }

    // rgb
    return (getColorType(rh) & getColorType(gs) & getColorType(bl)) !== ERROR_TYPE;
  }

  return false;
};
