/* global _, Raphael*/
/* exported normalizeClipperPolygons */


/* Input can be JSON-stringified version of the following:
 - Array of arrays of points [[{"X":10,"Y":10},{"X":10,"Y":10},{"X":10,"Y":10}][{"X":10,"Y":10},{"X":10,"Y":10},{"X":10,"Y":10}]]
 - Array of points [{"X":10,"Y":10},{"X":10,"Y":10},{"X":10,"Y":10}]
 - The aboves in lowercase
 - Array of x,y-coordinates eg. [0, 10, 20, 30, 40, 50] or [0 10 20 30 40 50] or [0 10, 20 30, 40 50];
 - The above without []
 - SVG path string with commands MLVHZ and mlvhz
 Returns normalized Clipper Polygons object stringified or false in failure
*/
function normalizeClipperPolygons(polygonString) {
  if (typeof polygonString !== 'string') return false;
  polygonString = polygonString.trim();
  var np, poly;
  if (polygonString.substr(0, 1).toUpperCase() === 'M') {
    np = SVGPathToClipperPolygons(polygonString);
    if (np === false) {
      return !!console.warn('Unable to parse SVG path string');
    }
    return JSON.stringify(np);
  }
  polygonString = polygonString.replace(/[\s,]+/g, ',');
  if (polygonString.substr(0, 1) !== '[') polygonString = '[' + polygonString;
  if (polygonString.substr(-1, 1) !== ']') polygonString = polygonString + ']';
  try {
    poly = JSON.parse(polygonString);
  } catch (err) {
    return !!console.warn('Unable to parse polygon string');
  }
  // if only points without 'X' and 'Y'
  var temp_n = [], i;
  if (_.isArray(poly) && poly.length && typeof poly[0] === 'number') {
    for (i = 0; i < poly.length; i = i + 2) {
      temp_n.push({
        X: poly[i],
        Y: poly[i + 1]
      });
    }
    poly = temp_n;
  }
  // if an array of array of points without 'X' and 'Y'
  var temp_n2 = [], j;
  if (_.isArray(poly) && poly.length && _.isArray(poly[0]) && typeof poly[0][0] !== 'undefined' && typeof poly[0][0].X === 'undefined' && typeof poly[0][0].x === 'undefined') {
    for (j = 0; j < poly.length; j++) {
      temp_n = [];
      for (i = 0; i < poly[j].length; i = i + 2) {
        temp_n.push({
          X: poly[j][i],
          Y: poly[j][i + 1]
        });
      }
      temp_n2.push(temp_n);
    }
    poly = temp_n2;
  }

  // if not array of arrays, convert to array of arrays
  if (_.isArray(poly) && poly.length > 0 && !_.isArray(poly[0])) poly = [poly];
  var pp, x, y;
  np = [[]];
  for (i = 0; i < poly.length; i++) {
    np[i] = [];
    for (j = 0; j < poly[i].length; j++) {
      pp = {};
      y = null;
      x = null;
      if (typeof poly[i][j].X !== 'undefined' && !isNaN(Number(poly[i][j].X))) x = Number(poly[i][j].X);
      else if (typeof poly[i][j].x !== 'undefined' && !isNaN(Number(poly[i][j].x))) x = Number(poly[i][j].x);
      if (typeof poly[i][j].Y !== 'undefined' && !isNaN(Number(poly[i][j].Y))) y = Number(poly[i][j].Y);
      else if (typeof poly[i][j].y !== 'undefined' && !isNaN(Number(poly[i][j].y))) y = Number(poly[i][j].y);
      if (y !== null && x !== null) {
        pp.X = x;
        pp.Y = y;
        np[i].push(pp);
      } else {
        return !!console.warn('Unable to parse polygon string Error: Coordinates are not in a right form.');
      }
    }
  }
  return JSON.stringify(np);
}

// helper function for normalizeClipperPolygons()
function SVGPathToClipperPolygons(d) {
  var arr = Raphael.parsePathString(d.trim()); // str to array
  arr = Raphael._pathToAbsolute(arr); // mahvstcsqz -> uppercase
  var str = _.flatten(arr).join(' '),
    paths = str.replace(/M/g, '|M').split('|'),
    polygons = [], polygon;
  for (var k = 0; k < paths.length; k++) {
    if (paths[k].trim() === '') continue;
    arr = Raphael.parsePathString(paths[k].trim());
    polygon = [];
    var letter = '',
      x = 0,
      y = 0,
      pt = {},
      subPathStart = {
        x: '',
        y: ''
      };
    for (var i = 0; i < arr.length; i++) {
      letter = arr[i][0].toUpperCase();
      if (letter !== 'M' && letter !== 'L' && letter !== 'Z') continue;
      if (letter !== 'Z') {
        for (var j = 1; j < arr[i].length; j = j + 2) {
          if (letter === 'V') y = arr[i][j];
          else if (letter === 'H') x = arr[i][j];
          else {
            x = arr[i][j];
            y = arr[i][j + 1];
          }
          pt = {
            X: null,
            Y: null
          };
          if (typeof x !== 'undefined' && !isNaN(Number(x))) pt.X = Number(x);
          if (typeof y !== 'undefined' && !isNaN(Number(y))) pt.Y = Number(y);
          if (pt.X !== null && pt.Y !== null) {
            polygon.push(pt);
          } else {
            return false;
          }
        }
      }
      if ((letter !== 'Z' && subPathStart.x === '') || letter === 'M') {
        subPathStart.x = x;
        subPathStart.y = y;
      }
      if (letter === 'Z') {
        x = subPathStart.x;
        y = subPathStart.y;
      }
    }
    polygons.push(polygon);
  }
  return polygons;
}
