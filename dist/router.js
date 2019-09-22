"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useRoutes = exports.getWorkingPath = exports.usePath = exports.getPath = exports.setPath = exports.navigate = exports.ParentContext = exports.getBasepath = exports.setBasepath = void 0;

var _react = _interopRequireDefault(require("react"));

var _isNode = _interopRequireDefault(require("./isNode"));

var _queryParams = require("./queryParams");

var _interceptor = require("./interceptor");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var preparedRoutes = {};
var stack = {};
var componentId = 1;
var currentPath = _isNode.default ? '' : location.pathname;
var basePath = '';
var basePathRegEx = null;
var pathUpdaters = [];
/**
 * Will define a base path that will be utilized in your routing and navigation.
 * To be called _before_ any routing or navigation happens.
 * @param {string} inBasepath
 */

var setBasepath = function setBasepath(inBasepath) {
  basePath = inBasepath;
  basePathRegEx = new RegExp('^' + basePath);
};
/**
 * Returns the currently used base path.
 * @returns {string}
 */


exports.setBasepath = setBasepath;

var getBasepath = function getBasepath() {
  return basePath;
};

exports.getBasepath = getBasepath;

var resolvePath = function resolvePath(inPath) {
  if (_isNode.default) {
    var url = require('url');

    return url.resolve(currentPath, inPath);
  }

  var current = new URL(currentPath, location.href);
  var resolved = new URL(inPath, current);
  return resolved.pathname;
};

var ParentContext = _react.default.createContext(null);
/**
 * Pass a route string to this function to receive a regular expression.
 * The transformation will be cached and if you pass the same route a second
 * time, the cached regex will be returned.
 * @param {string} inRoute
 * @returns {Array} [RegExp, propList]
 */


exports.ParentContext = ParentContext;

var prepareRoute = function prepareRoute(inRoute) {
  if (preparedRoutes[inRoute]) {
    return preparedRoutes[inRoute];
  }

  var preparedRoute = [new RegExp("".concat(inRoute.substr(0, 1) === '*' ? '' : '^').concat(inRoute.replace(/:[a-zA-Z]+/g, '([^/]+)').replace(/\*/g, '')).concat(inRoute.substr(-1) === '*' ? '' : '$'))];
  var propList = inRoute.match(/:[a-zA-Z]+/g);
  preparedRoute.push(propList ? propList.map(function (paramName) {
    return paramName.substr(1);
  }) : []);
  preparedRoutes[inRoute] = preparedRoute;
  return preparedRoute;
};
/**
 * Virtually navigates the browser to the given URL and re-processes all routers.
 * @param {string} url The URL to navigate to. Do not mix adding GET params here and using the `getParams` argument.
 * @param {boolean} [replace=false] Should the navigation be done with a history replace to prevent back navigation by the user
 * @param {object} [queryParams] Key/Value pairs to convert into get parameters to be appended to the URL.
 * @param {boolean} [replaceQueryParams=true] Should existing query parameters be carried over, or dropped (replaced)?
 */


var navigate = function navigate(url) {
  var replace = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var queryParams = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var replaceQueryParams = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
  url = (0, _interceptor.interceptRoute)(currentPath, resolvePath(url)); // NOTE(Syo): パラメータだけ変える状況あり
  // if (!url || url === currentPath) {

  if (!url) {
    return;
  }

  currentPath = url;

  if (_isNode.default) {
    setPath(url);
    processStack();
    updatePathHooks();
    return;
  }

  var finalURL = basePathRegEx ? url.match(basePathRegEx) ? url : basePath + url : url;
  window.history["".concat(replace ? 'replace' : 'push', "State")](null, null, finalURL);
  processStack();
  updatePathHooks();

  if (queryParams) {
    (0, _queryParams.setQueryParams)(queryParams, replaceQueryParams);
  }
};

exports.navigate = navigate;
var customPath = '/';
/**
 * Enables you to manually set the path from outside in a nodeJS environment, where window.history is not available.
 * @param {string} inPath
 */

var setPath = function setPath(inPath) {
  var url = require('url');

  customPath = url.resolve(customPath, inPath);
};
/**
 * Returns the current path of the router.
 * @returns {string}
 */


exports.setPath = setPath;

var getPath = function getPath() {
  return customPath;
};
/**
 * This hook returns the currently used URI.
 * Works in a browser context as well as for SSR.
 *
 * _Heads up:_ This will make your component render on every navigation unless you set this hook to passive!
 * @param {boolean} [active=true] Will update the component upon path changes. Set to false to only retrieve the path, once.
 * @param {boolean} [withBasepath=false] Should the base path be left at the beginning of the URI?
 * @returns {string}
 */


exports.getPath = getPath;

var usePath = function usePath() {
  var active = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
  var withBasepath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var _React$useState = _react.default.useState(0),
      _React$useState2 = _slicedToArray(_React$useState, 2),
      setUpdate = _React$useState2[1];

  _react.default.useEffect(function () {
    if (!active) {
      return;
    }

    pathUpdaters.push(setUpdate);
    return function () {
      var index = pathUpdaters.indexOf(setUpdate);

      if (index !== -1) {
        pathUpdaters.splice(index, 1);
      }
    };
  }, [setUpdate]);

  return withBasepath ? currentPath : currentPath.replace(basePathRegEx, '');
};
/**
 * Render all components that use path hooks.
 */


exports.usePath = usePath;

var updatePathHooks = function updatePathHooks() {
  var now = Date.now();
  pathUpdaters.forEach(function (cb) {
    return cb(now);
  });
};
/**
 * Called from within the router. This returns either the current windows url path
 * or a already reduced path, if a parent router has already matched with a finishing
 * wildcard before.
 * @param {string} [parentRouterId]
 * @returns {string}
 */


var getWorkingPath = function getWorkingPath(parentRouterId) {
  if (!parentRouterId) {
    return _isNode.default ? customPath : window.location.pathname.replace(basePathRegEx, '') || '/';
  }

  var stackEntry = stack[parentRouterId];

  if (!stackEntry) {
    throw 'wth';
  }

  return stackEntry.reducedPath !== null ? stackEntry.reducedPath || '/' : window.location.pathname;
};

exports.getWorkingPath = getWorkingPath;

var processStack = function processStack() {
  return Object.values(stack).forEach(process);
};
/**
 * This function takes two objects and compares if they have the same
 * keys and their keys have the same values assigned, so the objects are
 * basically the same.
 * @param {object} objA
 * @param {object} objB
 * @return {boolean}
 */


var objectsEqual = function objectsEqual(objA, objB) {
  var objAKeys = Object.keys(objA);
  var objBKeys = Object.keys(objB);

  var valueIsEqual = function valueIsEqual(key) {
    return objB.hasOwnProperty(key) && objA[key] === objB[key];
  };

  return objAKeys.length === objBKeys.length && objAKeys.every(valueIsEqual);
};

if (!_isNode.default) {
  window.addEventListener('popstate', function (e) {
    var nextPath = (0, _interceptor.interceptRoute)(currentPath, location.pathname);

    if (!nextPath || nextPath === currentPath) {
      e.preventDefault();
      e.stopPropagation();
      history.pushState(null, null, currentPath);
      return;
    }

    currentPath = nextPath;

    if (nextPath !== location.pathname) {
      history.replaceState(null, null, nextPath);
    }

    processStack();
    updatePathHooks();
  });
}

var emptyFunc = function emptyFunc() {
  return null;
};
/**
 * This will calculate the match of a given router.
 * @param {object} stackObj
 * @param {boolean} [directCall] If its not a direct call, the process function might trigger a component render.
 */


var process = function process(stackObj, directCall) {
  var routerId = stackObj.routerId,
      parentRouterId = stackObj.parentRouterId,
      routes = stackObj.routes,
      setUpdate = stackObj.setUpdate,
      resultFunc = stackObj.resultFunc,
      resultProps = stackObj.resultProps,
      previousReducedPath = stackObj.reducedPath;
  var currentPath = getWorkingPath(parentRouterId);
  var route = null;
  var targetFunction = null;
  var targetProps = null;
  var reducedPath = null;
  var anyMatched = false;

  for (var i = 0; i < routes.length; i++) {
    var _routes$i = _slicedToArray(routes[i], 2);

    route = _routes$i[0];
    targetFunction = _routes$i[1];

    var _ref = preparedRoutes[route] ? preparedRoutes[route] : prepareRoute(route),
        _ref2 = _slicedToArray(_ref, 2),
        regex = _ref2[0],
        groupNames = _ref2[1];

    var _result = currentPath.match(regex);

    if (!_result) {
      targetFunction = emptyFunc;
      continue;
    }

    if (groupNames.length) {
      targetProps = {};

      for (var j = 0; j < groupNames.length; j++) {
        targetProps[groupNames[j]] = _result[j + 1];
      }
    }

    reducedPath = currentPath.replace(_result[0], '');
    anyMatched = true;
    break;
  }

  if (!stack[routerId]) {
    return;
  }

  if (!anyMatched) {
    route = null;
    targetFunction = null;
    targetProps = null;
    reducedPath = null;
  }

  var funcsDiffer = resultFunc !== targetFunction;
  var pathDiffer = reducedPath !== previousReducedPath;
  var propsDiffer = true;

  if (!funcsDiffer) {
    if (!resultProps && !targetProps) {
      propsDiffer = false;
    } else {
      propsDiffer = !(resultProps && targetProps && objectsEqual(resultProps, targetProps) === true);
    }

    if (!propsDiffer) {
      if (!pathDiffer) {
        return;
      }
    }
  }

  var result = funcsDiffer || propsDiffer ? targetFunction ? targetFunction(targetProps) : null : stackObj.result;
  Object.assign(stack[routerId], {
    result: result,
    reducedPath: reducedPath,
    matchedRoute: route,
    passContext: route ? route.substr(-1) === '*' : false
  });

  if (!directCall && (funcsDiffer || propsDiffer || route === null)) {
    setUpdate(Date.now());
  }
};
/**
 * If a route returns a function, instead of a react element, we need to wrap this function
 * to eventually wrap a context object around its result.
 * @param RouteContext
 * @param originalResult
 * @returns {function(): *}
 */


var wrapperFunction = function wrapperFunction(RouteContext, originalResult) {
  return function () {
    return _react.default.createElement(RouteContext, null, originalResult.apply(originalResult, arguments));
  };
};
/**
 * Pass an object to this function where the keys are routes and the values
 * are functions to be executed when a route matches. Whatever your function returns
 * will be returned from the hook as well into your react component. Ideally you would
 * return components to be rendered when certain routes match, but you are not limited
 * to that.
 * @param {object} routeObj {"/someRoute": () => <Example />}
 */


var useRoutes = function useRoutes(routeObj) {
  // Each router gets an internal id to look them up again.
  var _React$useState3 = _react.default.useState(componentId),
      _React$useState4 = _slicedToArray(_React$useState3, 1),
      routerId = _React$useState4[0];

  var setUpdate = _react.default.useState(0)[1]; // Needed to create nested routers which use only a subset of the URL.


  var parentRouterId = _react.default.useContext(ParentContext); // If we just took the last ID, increase it for the next hook.


  if (routerId === componentId) {
    componentId += 1;
  } // Removes the router from the stack after component unmount - it won't be processed anymore.


  _react.default.useEffect(function () {
    return function () {
      return delete stack[routerId];
    };
  }, [routerId]);

  var stackObj = stack[routerId];

  if (stackObj && stackObj.originalRouteObj !== routeObj) {
    stackObj = null;
  }

  if (!stackObj) {
    stackObj = {
      routerId: routerId,
      originalRouteObj: routeObj,
      routes: Object.entries(routeObj),
      setUpdate: setUpdate,
      parentRouterId: parentRouterId,
      matchedRoute: null,
      reducedPath: null,
      passContext: false,
      result: null
    };
    stack[routerId] = stackObj;
    process(stackObj, true);
  }

  _react.default.useDebugValue(stackObj.matchedRoute);

  if (!stackObj.matchedRoute) {
    return null;
  }

  var result = stackObj.result;

  if (!stackObj.passContext) {
    return result;
  } else {
    var RouteContext = function RouteContext(_ref3) {
      var children = _ref3.children;
      return _react.default.createElement(ParentContext.Provider, {
        value: routerId
      }, children);
    };

    if (typeof result === 'function') {
      return wrapperFunction(RouteContext, result);
    }

    return _react.default.isValidElement(result) && result.type !== RouteContext ? _react.default.createElement(RouteContext, null, result) : result;
  }
};

exports.useRoutes = useRoutes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9yb3V0ZXIuanMiXSwibmFtZXMiOlsicHJlcGFyZWRSb3V0ZXMiLCJzdGFjayIsImNvbXBvbmVudElkIiwiY3VycmVudFBhdGgiLCJpc05vZGUiLCJsb2NhdGlvbiIsInBhdGhuYW1lIiwiYmFzZVBhdGgiLCJiYXNlUGF0aFJlZ0V4IiwicGF0aFVwZGF0ZXJzIiwic2V0QmFzZXBhdGgiLCJpbkJhc2VwYXRoIiwiUmVnRXhwIiwiZ2V0QmFzZXBhdGgiLCJyZXNvbHZlUGF0aCIsImluUGF0aCIsInVybCIsInJlcXVpcmUiLCJyZXNvbHZlIiwiY3VycmVudCIsIlVSTCIsImhyZWYiLCJyZXNvbHZlZCIsIlBhcmVudENvbnRleHQiLCJSZWFjdCIsImNyZWF0ZUNvbnRleHQiLCJwcmVwYXJlUm91dGUiLCJpblJvdXRlIiwicHJlcGFyZWRSb3V0ZSIsInN1YnN0ciIsInJlcGxhY2UiLCJwcm9wTGlzdCIsIm1hdGNoIiwicHVzaCIsIm1hcCIsInBhcmFtTmFtZSIsIm5hdmlnYXRlIiwicXVlcnlQYXJhbXMiLCJyZXBsYWNlUXVlcnlQYXJhbXMiLCJzZXRQYXRoIiwicHJvY2Vzc1N0YWNrIiwidXBkYXRlUGF0aEhvb2tzIiwiZmluYWxVUkwiLCJ3aW5kb3ciLCJoaXN0b3J5IiwiY3VzdG9tUGF0aCIsImdldFBhdGgiLCJ1c2VQYXRoIiwiYWN0aXZlIiwid2l0aEJhc2VwYXRoIiwidXNlU3RhdGUiLCJzZXRVcGRhdGUiLCJ1c2VFZmZlY3QiLCJpbmRleCIsImluZGV4T2YiLCJzcGxpY2UiLCJub3ciLCJEYXRlIiwiZm9yRWFjaCIsImNiIiwiZ2V0V29ya2luZ1BhdGgiLCJwYXJlbnRSb3V0ZXJJZCIsInN0YWNrRW50cnkiLCJyZWR1Y2VkUGF0aCIsIk9iamVjdCIsInZhbHVlcyIsInByb2Nlc3MiLCJvYmplY3RzRXF1YWwiLCJvYmpBIiwib2JqQiIsIm9iakFLZXlzIiwia2V5cyIsIm9iakJLZXlzIiwidmFsdWVJc0VxdWFsIiwia2V5IiwiaGFzT3duUHJvcGVydHkiLCJsZW5ndGgiLCJldmVyeSIsImFkZEV2ZW50TGlzdGVuZXIiLCJlIiwibmV4dFBhdGgiLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsInB1c2hTdGF0ZSIsInJlcGxhY2VTdGF0ZSIsImVtcHR5RnVuYyIsInN0YWNrT2JqIiwiZGlyZWN0Q2FsbCIsInJvdXRlcklkIiwicm91dGVzIiwicmVzdWx0RnVuYyIsInJlc3VsdFByb3BzIiwicHJldmlvdXNSZWR1Y2VkUGF0aCIsInJvdXRlIiwidGFyZ2V0RnVuY3Rpb24iLCJ0YXJnZXRQcm9wcyIsImFueU1hdGNoZWQiLCJpIiwicmVnZXgiLCJncm91cE5hbWVzIiwicmVzdWx0IiwiaiIsImZ1bmNzRGlmZmVyIiwicGF0aERpZmZlciIsInByb3BzRGlmZmVyIiwiYXNzaWduIiwibWF0Y2hlZFJvdXRlIiwicGFzc0NvbnRleHQiLCJ3cmFwcGVyRnVuY3Rpb24iLCJSb3V0ZUNvbnRleHQiLCJvcmlnaW5hbFJlc3VsdCIsImFwcGx5IiwiYXJndW1lbnRzIiwidXNlUm91dGVzIiwicm91dGVPYmoiLCJ1c2VDb250ZXh0Iiwib3JpZ2luYWxSb3V0ZU9iaiIsImVudHJpZXMiLCJ1c2VEZWJ1Z1ZhbHVlIiwiY2hpbGRyZW4iLCJpc1ZhbGlkRWxlbWVudCIsInR5cGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7O0FBRUEsSUFBSUEsY0FBYyxHQUFHLEVBQXJCO0FBQ0EsSUFBSUMsS0FBSyxHQUFHLEVBQVo7QUFDQSxJQUFJQyxXQUFXLEdBQUcsQ0FBbEI7QUFDQSxJQUFJQyxXQUFXLEdBQUdDLGtCQUFTLEVBQVQsR0FBY0MsUUFBUSxDQUFDQyxRQUF6QztBQUNBLElBQUlDLFFBQVEsR0FBRyxFQUFmO0FBQ0EsSUFBSUMsYUFBYSxHQUFHLElBQXBCO0FBQ0EsSUFBTUMsWUFBWSxHQUFHLEVBQXJCO0FBRUE7Ozs7OztBQUtPLElBQU1DLFdBQVcsR0FBRyxTQUFkQSxXQUFjLENBQUNDLFVB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UCxLQUFnQlosWUFBaEQsR0FDSiw2QkFBQyxZQUFELFFBQWVULE1BQWYsQ0FESSxHQUVKQSxNQUZIO0FBR0E7QUFDRCxDQTVETSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgaXNOb2RlIGZyb20gJy4vaXNOb2RlJztcbmltcG9ydCB7c2V0UXVlcnlQYXJhbXN9IGZyb20gJy4vcXVlcnlQYXJhbXMnO1xuaW1wb3J0IHtpbnRlcmNlcHRSb3V0ZX0gZnJvbSAnLi9pbnRlcmNlcHRvcic7XG5cbmxldCBwcmVwYXJlZFJvdXRlcyA9IHt9O1xubGV0IHN0YWNrID0ge307XG5sZXQgY29tcG9uZW50SWQgPSAxO1xubGV0IGN1cnJlbnRQYXRoID0gaXNOb2RlID8gJycgOiBsb2NhdGlvbi5wYXRobmFtZTtcbmxldCBiYXNlUGF0aCA9ICcnO1xubGV0IGJhc2VQYXRoUmVnRXggPSBudWxsO1xuY29uc3QgcGF0aFVwZGF0ZXJzID0gW107XG5cbi8qKlxuICogV2lsbCBkZWZpbmUgYSBiYXNlIHBhdGggdGhhdCB3aWxsIGJlIHV0aWxpemVkIGluIHlvdXIgcm91dGluZyBhbmQgbmF2aWdhdGlvbi5cbiAqIFRvIGJlIGNhbGxlZCBfYmVmb3JlXyBhbnkgcm91dGluZyBvciBuYXZpZ2F0aW9uIGhhcHBlbnMuXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5CYXNlcGF0aFxuICovXG5leHBvcnQgY29uc3Qgc2V0QmFzZXBhdGggPSAoaW5CYXNlcGF0aCkgPT4ge1xuXHRiYXNlUGF0aCA9IGluQmFzZXBhdGg7XG5cdGJhc2VQYXRoUmVnRXggPSBuZXcgUmVnRXhwKCdeJyArIGJhc2VQYXRoKTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgY3VycmVudGx5IHVzZWQgYmFzZSBwYXRoLlxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZXhwb3J0IGNvbnN0IGdldEJhc2VwYXRoID0gKCkgPT4gYmFzZVBhdGg7XG5cbmNvbnN0IHJlc29sdmVQYXRoID0gKGluUGF0aCkgPT4ge1xuXHRpZiAoaXNOb2RlKSB7XG5cdFx0Y29uc3QgdXJsID0gcmVxdWlyZSgndXJsJyk7XG5cdFx0cmV0dXJuIHVybC5yZXNvbHZlKGN1cnJlbnRQYXRoLCBpblBhdGgpO1xuXHR9XG5cblx0Y29uc3QgY3VycmVudCA9IG5ldyBVUkwoY3VycmVudFBhdGgsIGxvY2F0aW9uLmhyZWYpO1xuXHRjb25zdCByZXNvbHZlZCA9IG5ldyBVUkwoaW5QYXRoLCBjdXJyZW50KTtcblx0cmV0dXJuIHJlc29sdmVkLnBhdGhuYW1lO1xufTtcblxuZXhwb3J0IGNvbnN0IFBhcmVudENvbnRleHQgPSBSZWFjdC5jcmVhdGVDb250ZXh0KG51bGwpO1xuXG4vKipcbiAqIFBhc3MgYSByb3V0ZSBzdHJpbmcgdG8gdGhpcyBmdW5jdGlvbiB0byByZWNlaXZlIGEgcmVndWxhciBleHByZXNzaW9uLlxuICogVGhlIHRyYW5zZm9ybWF0aW9uIHdpbGwgYmUgY2FjaGVkIGFuZCBpZiB5b3UgcGFzcyB0aGUgc2FtZSByb3V0ZSBhIHNlY29uZFxuICogdGltZSwgdGhlIGNhY2hlZCByZWdleCB3aWxsIGJlIHJldHVybmVkLlxuICogQHBhcmFtIHtzdHJpbmd9IGluUm91dGVcbiAqIEByZXR1cm5zIHtBcnJheX0gW1JlZ0V4cCwgcHJvcExpc3RdXG4gKi9cbmNvbnN0IHByZXBhcmVSb3V0ZSA9IChpblJvdXRlKSA9PiB7XG5cdGlmIChwcmVwYXJlZFJvdXRlc1tpblJvdXRlXSkge1xuXHRcdHJldHVybiBwcmVwYXJlZFJvdXRlc1tpblJvdXRlXTtcblx0fVxuXG5cdGNvbnN0IHByZXBhcmVkUm91dGUgPSBbXG5cdFx0bmV3IFJlZ0V4cChgJHtpblJvdXRlLnN1YnN0cigwLCAxKSA9PT0gJyonID8gJycgOiAnXid9JHtpblJvdXRlLnJlcGxhY2UoLzpbYS16QS1aXSsvZywgJyhbXi9dKyknKS5yZXBsYWNlKC9cXCovZywgJycpfSR7aW5Sb3V0ZS5zdWJzdHIoLTEsKSA9PT0gJyonID8gJycgOiAnJCd9YClcblx0XTtcblxuXHRjb25zdCBwcm9wTGlzdCA9IGluUm91dGUubWF0Y2goLzpbYS16QS1aXSsvZyk7XG5cdHByZXBhcmVkUm91dGUucHVzaChcblx0XHRwcm9wTGlzdFxuXHRcdFx0PyBwcm9wTGlzdC5tYXAocGFyYW1OYW1lID0+IHBhcmFtTmFtZS5zdWJzdHIoMSkpXG5cdFx0XHQ6IFtdXG5cdCk7XG5cblx0cHJlcGFyZWRSb3V0ZXNbaW5Sb3V0ZV0gPSBwcmVwYXJlZFJvdXRlO1xuXHRyZXR1cm4gcHJlcGFyZWRSb3V0ZTtcbn07XG5cbi8qKlxuICogVmlydHVhbGx5IG5hdmlnYXRlcyB0aGUgYnJvd3NlciB0byB0aGUgZ2l2ZW4gVVJMIGFuZCByZS1wcm9jZXNzZXMgYWxsIHJvdXRlcnMuXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBVUkwgdG8gbmF2aWdhdGUgdG8uIERvIG5vdCBtaXggYWRkaW5nIEdFVCBwYXJhbXMgaGVyZSBhbmQgdXNpbmcgdGhlIGBnZXRQYXJhbXNgIGFyZ3VtZW50LlxuICogQHBhcmFtIHtib29sZWFufSBbcmVwbGFjZT1mYWxzZV0gU2hvdWxkIHRoZSBuYXZpZ2F0aW9uIGJlIGRvbmUgd2l0aCBhIGhpc3RvcnkgcmVwbGFjZSB0byBwcmV2ZW50IGJhY2sgbmF2aWdhdGlvbiBieSB0aGUgdXNlclxuICogQHBhcmFtIHtvYmplY3R9IFtxdWVyeVBhcmFtc10gS2V5L1ZhbHVlIHBhaXJzIHRvIGNvbnZlcnQgaW50byBnZXQgcGFyYW1ldGVycyB0byBiZSBhcHBlbmRlZCB0byB0aGUgVVJMLlxuICogQHBhcmFtIHtib29sZWFufSBbcmVwbGFjZVF1ZXJ5UGFyYW1zPXRydWVdIFNob3VsZCBleGlzdGluZyBxdWVyeSBwYXJhbWV0ZXJzIGJlIGNhcnJpZWQgb3Zlciwgb3IgZHJvcHBlZCAocmVwbGFjZWQpP1xuICovXG5leHBvcnQgY29uc3QgbmF2aWdhdGUgPSAodXJsLCByZXBsYWNlID0gZmFsc2UsIHF1ZXJ5UGFyYW1zID0gbnVsbCwgcmVwbGFjZVF1ZXJ5UGFyYW1zID0gdHJ1ZSkgPT4ge1xuXHR1cmwgPSBpbnRlcmNlcHRSb3V0ZShjdXJyZW50UGF0aCwgcmVzb2x2ZVBhdGgodXJsKSk7XG5cblx0Ly8gTk9URShTeW8pOiDjg5Hjg6njg6Hjg7zjgr/jgaDjgZHlpInjgYjjgovnirbms4HjgYLjgopcblx0Ly8gaWYgKCF1cmwgfHwgdXJsID09PSBjdXJyZW50UGF0aCkge1xuXHRpZiAoIXVybCkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGN1cnJlbnRQYXRoID0gdXJsO1xuXG5cdGlmIChpc05vZGUpIHtcblx0XHRzZXRQYXRoKHVybCk7XG5cdFx0cHJvY2Vzc1N0YWNrKCk7XG5cdFx0dXBkYXRlUGF0aEhvb2tzKCk7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Y29uc3QgZmluYWxVUkwgPSBiYXNlUGF0aFJlZ0V4XG5cdFx0PyB1cmwubWF0Y2goYmFzZVBhdGhSZWdFeClcblx0XHRcdD8gdXJsXG5cdFx0XHQ6IGJhc2VQYXRoICsgdXJsXG5cdFx0OlxuXHRcdHVybDtcblxuXHR3aW5kb3cuaGlzdG9yeVtgJHtyZXBsYWNlID8gJ3JlcGxhY2UnIDogJ3B1c2gnfVN0YXRlYF0obnVsbCwgbnVsbCwgZmluYWxVUkwpO1xuXHRwcm9jZXNzU3RhY2soKTtcblx0dXBkYXRlUGF0aEhvb2tzKCk7XG5cblx0aWYgKHF1ZXJ5UGFyYW1zKSB7XG5cdFx0c2V0UXVlcnlQYXJhbXMocXVlcnlQYXJhbXMsIHJlcGxhY2VRdWVyeVBhcmFtcyk7XG5cdH1cbn07XG5cbmxldCBjdXN0b21QYXRoID0gJy8nO1xuLyoqXG4gKiBFbmFibGVzIHlvdSB0byBtYW51YWxseSBzZXQgdGhlIHBhdGggZnJvbSBvdXRzaWRlIGluIGEgbm9kZUpTIGVudmlyb25tZW50LCB3aGVyZSB3aW5kb3cuaGlzdG9yeSBpcyBub3QgYXZhaWxhYmxlLlxuICogQHBhcmFtIHtzdHJpbmd9IGluUGF0aFxuICovXG5leHBvcnQgY29uc3Qgc2V0UGF0aCA9IChpblBhdGgpID0+IHtcblx0Y29uc3QgdXJsID0gcmVxdWlyZSgndXJsJyk7XG5cdGN1c3RvbVBhdGggPSB1cmwucmVzb2x2ZShjdXN0b21QYXRoLCBpblBhdGgpO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBjdXJyZW50IHBhdGggb2YgdGhlIHJvdXRlci5cbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRQYXRoID0gKCkgPT4gY3VzdG9tUGF0aDtcblxuLyoqXG4gKiBUaGlzIGhvb2sgcmV0dXJucyB0aGUgY3VycmVudGx5IHVzZWQgVVJJLlxuICogV29ya3MgaW4gYSBicm93c2VyIGNvbnRleHQgYXMgd2VsbCBhcyBmb3IgU1NSLlxuICpcbiAqIF9IZWFkcyB1cDpfIFRoaXMgd2lsbCBtYWtlIHlvdXIgY29tcG9uZW50IHJlbmRlciBvbiBldmVyeSBuYXZpZ2F0aW9uIHVubGVzcyB5b3Ugc2V0IHRoaXMgaG9vayB0byBwYXNzaXZlIVxuICogQHBhcmFtIHtib29sZWFufSBbYWN0aXZlPXRydWVdIFdpbGwgdXBkYXRlIHRoZSBjb21wb25lbnQgdXBvbiBwYXRoIGNoYW5nZXMuIFNldCB0byBmYWxzZSB0byBvbmx5IHJldHJpZXZlIHRoZSBwYXRoLCBvbmNlLlxuICogQHBhcmFtIHtib29sZWFufSBbd2l0aEJhc2VwYXRoPWZhbHNlXSBTaG91bGQgdGhlIGJhc2UgcGF0aCBiZSBsZWZ0IGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIFVSST9cbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCB1c2VQYXRoID0gKGFjdGl2ZSA9IHRydWUsIHdpdGhCYXNlcGF0aCA9IGZhbHNlKSA9PiB7XG5cdGNvbnN0IFssIHNldFVwZGF0ZV0gPSBSZWFjdC51c2VTdGF0ZSgwKTtcblxuXHRSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuXHRcdGlmICghYWN0aXZlKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0cGF0aFVwZGF0ZXJzLnB1c2goc2V0VXBkYXRlKTtcblx0XHRyZXR1cm4gKCkgPT4ge1xuXHRcdFx0Y29uc3QgaW5kZXggPSBwYXRoVXBkYXRlcnMuaW5kZXhPZihzZXRVcGRhdGUpO1xuXHRcdFx0aWYgKGluZGV4ICE9PSAtMSkge1xuXHRcdFx0XHRwYXRoVXBkYXRlcnMuc3BsaWNlKGluZGV4LCAxKTtcblx0XHRcdH1cblx0XHR9O1xuXHR9LCBbc2V0VXBkYXRlXSk7XG5cblx0cmV0dXJuIHdpdGhCYXNlcGF0aCA/IGN1cnJlbnRQYXRoIDogY3VycmVudFBhdGgucmVwbGFjZShiYXNlUGF0aFJlZ0V4LCAnJyk7XG59O1xuXG4vKipcbiAqIFJlbmRlciBhbGwgY29tcG9uZW50cyB0aGF0IHVzZSBwYXRoIGhvb2tzLlxuICovXG5jb25zdCB1cGRhdGVQYXRoSG9va3MgPSAoKSA9PiB7XG5cdGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG5cdHBhdGhVcGRhdGVycy5mb3JFYWNoKGNiID0+IGNiKG5vdykpO1xufTtcblxuLyoqXG4gKiBDYWxsZWQgZnJvbSB3aXRoaW4gdGhlIHJvdXRlci4gVGhpcyByZXR1cm5zIGVpdGhlciB0aGUgY3VycmVudCB3aW5kb3dzIHVybCBwYXRoXG4gKiBvciBhIGFscmVhZHkgcmVkdWNlZCBwYXRoLCBpZiBhIHBhcmVudCByb3V0ZXIgaGFzIGFscmVhZHkgbWF0Y2hlZCB3aXRoIGEgZmluaXNoaW5nXG4gKiB3aWxkY2FyZCBiZWZvcmUuXG4gKiBAcGFyYW0ge3N0cmluZ30gW3BhcmVudFJvdXRlcklkXVxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZXhwb3J0IGNvbnN0IGdldFdvcmtpbmdQYXRoID0gKHBhcmVudFJvdXRlcklkKSA9PiB7XG5cdGlmICghcGFyZW50Um91dGVySWQpIHtcblx0XHRyZXR1cm4gaXNOb2RlID8gY3VzdG9tUGF0aCA6IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5yZXBsYWNlKGJhc2VQYXRoUmVnRXgsICcnKSB8fCAnLyc7XG5cdH1cblx0Y29uc3Qgc3RhY2tFbnRyeSA9IHN0YWNrW3BhcmVudFJvdXRlcklkXTtcblx0aWYgKCFzdGFja0VudHJ5KSB7XG5cdFx0dGhyb3cgJ3d0aCc7XG5cdH1cblxuXHRyZXR1cm4gc3RhY2tFbnRyeS5yZWR1Y2VkUGF0aCAhPT0gbnVsbCA/IHN0YWNrRW50cnkucmVkdWNlZFBhdGggfHwgJy8nIDogd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lO1xufTtcblxuY29uc3QgcHJvY2Vzc1N0YWNrID0gKCkgPT4gT2JqZWN0LnZhbHVlcyhzdGFjaykuZm9yRWFjaChwcm9jZXNzKTtcblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIHRha2VzIHR3byBvYmplY3RzIGFuZCBjb21wYXJlcyBpZiB0aGV5IGhhdmUgdGhlIHNhbWVcbiAqIGtleXMgYW5kIHRoZWlyIGtleXMgaGF2ZSB0aGUgc2FtZSB2YWx1ZXMgYXNzaWduZWQsIHNvIHRoZSBvYmplY3RzIGFyZVxuICogYmFzaWNhbGx5IHRoZSBzYW1lLlxuICogQHBhcmFtIHtvYmplY3R9IG9iakFcbiAqIEBwYXJhbSB7b2JqZWN0fSBvYmpCXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5jb25zdCBvYmplY3RzRXF1YWwgPSAob2JqQSwgb2JqQikgPT4ge1xuXHRjb25zdCBvYmpBS2V5cyA9IE9iamVjdC5rZXlzKG9iakEpO1xuXHRjb25zdCBvYmpCS2V5cyA9IE9iamVjdC5rZXlzKG9iakIpO1xuXG5cdGNvbnN0IHZhbHVlSXNFcXVhbCA9IGtleSA9PiBvYmpCLmhhc093blByb3BlcnR5KGtleSkgJiYgb2JqQVtrZXldID09PSBvYmpCW2tleV07XG5cblx0cmV0dXJuIChcblx0XHRvYmpBS2V5cy5sZW5ndGggPT09IG9iakJLZXlzLmxlbmd0aFxuXHRcdCYmIG9iakFLZXlzLmV2ZXJ5KHZhbHVlSXNFcXVhbClcblx0KTtcbn07XG5cbmlmICghaXNOb2RlKSB7XG5cdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsIChlKSA9PiB7XG5cdFx0Y29uc3QgbmV4dFBhdGggPSBpbnRlcmNlcHRSb3V0ZShjdXJyZW50UGF0aCwgbG9jYXRpb24ucGF0aG5hbWUpO1xuXG5cdFx0aWYgKCFuZXh0UGF0aCB8fCBuZXh0UGF0aCA9PT0gY3VycmVudFBhdGgpIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0XHRoaXN0b3J5LnB1c2hTdGF0ZShudWxsLCBudWxsLCBjdXJyZW50UGF0aCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Y3VycmVudFBhdGggPSBuZXh0UGF0aDtcblxuXHRcdGlmIChuZXh0UGF0aCAhPT0gbG9jYXRpb24ucGF0aG5hbWUpIHtcblx0XHRcdGhpc3RvcnkucmVwbGFjZVN0YXRlKG51bGwsIG51bGwsIG5leHRQYXRoKTtcblx0XHR9XG5cdFx0cHJvY2Vzc1N0YWNrKCk7XG5cdFx0dXBkYXRlUGF0aEhvb2tzKCk7XG5cdH0pO1xufVxuXG5jb25zdCBlbXB0eUZ1bmMgPSAoKSA9PiBudWxsO1xuXG4vKipcbiAqIFRoaXMgd2lsbCBjYWxjdWxhdGUgdGhlIG1hdGNoIG9mIGEgZ2l2ZW4gcm91dGVyLlxuICogQHBhcmFtIHtvYmplY3R9IHN0YWNrT2JqXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtkaXJlY3RDYWxsXSBJZiBpdHMgbm90IGEgZGlyZWN0IGNhbGwsIHRoZSBwcm9jZXNzIGZ1bmN0aW9uIG1pZ2h0IHRyaWdnZXIgYSBjb21wb25lbnQgcmVuZGVyLlxuICovXG5jb25zdCBwcm9jZXNzID0gKHN0YWNrT2JqLCBkaXJlY3RDYWxsKSA9PiB7XG5cdGNvbnN0IHtcblx0XHRyb3V0ZXJJZCxcblx0XHRwYXJlbnRSb3V0ZXJJZCxcblx0XHRyb3V0ZXMsXG5cdFx0c2V0VXBkYXRlLFxuXHRcdHJlc3VsdEZ1bmMsXG5cdFx0cmVzdWx0UHJvcHMsXG5cdFx0cmVkdWNlZFBhdGg6IHByZXZpb3VzUmVkdWNlZFBhdGhcblx0fSA9IHN0YWNrT2JqO1xuXG5cdGNvbnN0IGN1cnJlbnRQYXRoID0gZ2V0V29ya2luZ1BhdGgocGFyZW50Um91dGVySWQpO1xuXHRsZXQgcm91dGUgPSBudWxsO1xuXHRsZXQgdGFyZ2V0RnVuY3Rpb24gPSBudWxsO1xuXHRsZXQgdGFyZ2V0UHJvcHMgPSBudWxsO1xuXHRsZXQgcmVkdWNlZFBhdGggPSBudWxsO1xuXHRsZXQgYW55TWF0Y2hlZCA9IGZhbHNlO1xuXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgcm91dGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0W3JvdXRlLCB0YXJnZXRGdW5jdGlvbl0gPSByb3V0ZXNbaV07XG5cdFx0Y29uc3QgW3JlZ2V4LCBncm91cE5hbWVzXSA9IHByZXBhcmVkUm91dGVzW3JvdXRlXVxuXHRcdFx0PyBwcmVwYXJlZFJvdXRlc1tyb3V0ZV1cblx0XHRcdDogcHJlcGFyZVJvdXRlKHJvdXRlKTtcblxuXHRcdGNvbnN0IHJlc3VsdCA9IGN1cnJlbnRQYXRoLm1hdGNoKHJlZ2V4KTtcblx0XHRpZiAoIXJlc3VsdCkge1xuXHRcdFx0dGFyZ2V0RnVuY3Rpb24gPSBlbXB0eUZ1bmM7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRpZiAoZ3JvdXBOYW1lcy5sZW5ndGgpIHtcblx0XHRcdHRhcmdldFByb3BzID0ge307XG5cdFx0XHRmb3IgKGxldCBqID0gMDsgaiA8IGdyb3VwTmFtZXMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0dGFyZ2V0UHJvcHNbZ3JvdXBOYW1lc1tqXV0gPSByZXN1bHRbaiArIDFdO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJlZHVjZWRQYXRoID0gY3VycmVudFBhdGgucmVwbGFjZShyZXN1bHRbMF0sICcnKTtcblx0XHRhbnlNYXRjaGVkID0gdHJ1ZTtcblx0XHRicmVhaztcblx0fVxuXG5cdGlmICghc3RhY2tbcm91dGVySWRdKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0aWYgKCFhbnlNYXRjaGVkKSB7XG5cdFx0cm91dGUgPSBudWxsO1xuXHRcdHRhcmdldEZ1bmN0aW9uID0gbnVsbDtcblx0XHR0YXJnZXRQcm9wcyA9IG51bGw7XG5cdFx0cmVkdWNlZFBhdGggPSBudWxsO1xuXHR9XG5cblx0Y29uc3QgZnVuY3NEaWZmZXIgPSByZXN1bHRGdW5jICE9PSB0YXJnZXRGdW5jdGlvbjtcblx0Y29uc3QgcGF0aERpZmZlciA9IHJlZHVjZWRQYXRoICE9PSBwcmV2aW91c1JlZHVjZWRQYXRoO1xuXHRsZXQgcHJvcHNEaWZmZXIgPSB0cnVlO1xuXG5cdGlmICghZnVuY3NEaWZmZXIpIHtcblx0XHRpZiAoIXJlc3VsdFByb3BzICYmICF0YXJnZXRQcm9wcykge1xuXHRcdFx0cHJvcHNEaWZmZXIgPSBmYWxzZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cHJvcHNEaWZmZXIgPSAhKHJlc3VsdFByb3BzICYmIHRhcmdldFByb3BzICYmIG9iamVjdHNFcXVhbChyZXN1bHRQcm9wcywgdGFyZ2V0UHJvcHMpID09PSB0cnVlKTtcblx0XHR9XG5cblx0XHRpZiAoIXByb3BzRGlmZmVyKSB7XG5cdFx0XHRpZiAoIXBhdGhEaWZmZXIpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGNvbnN0IHJlc3VsdCA9IGZ1bmNzRGlmZmVyIHx8IHByb3BzRGlmZmVyXG5cdFx0PyB0YXJnZXRGdW5jdGlvblxuXHRcdFx0PyB0YXJnZXRGdW5jdGlvbih0YXJnZXRQcm9wcylcblx0XHRcdDogbnVsbFxuXHRcdDogc3RhY2tPYmoucmVzdWx0O1xuXG5cdE9iamVjdC5hc3NpZ24oc3RhY2tbcm91dGVySWRdLCB7XG5cdFx0cmVzdWx0LFxuXHRcdHJlZHVjZWRQYXRoLFxuXHRcdG1hdGNoZWRSb3V0ZTogcm91dGUsXG5cdFx0cGFzc0NvbnRleHQ6IHJvdXRlID8gcm91dGUuc3Vic3RyKC0xKSA9PT0gJyonIDogZmFsc2Vcblx0fSk7XG5cblx0aWYgKCFkaXJlY3RDYWxsICYmIChmdW5jc0RpZmZlciB8fCBwcm9wc0RpZmZlciB8fCByb3V0ZSA9PT0gbnVsbCkpIHtcblx0XHRzZXRVcGRhdGUoRGF0ZS5ub3coKSk7XG5cdH1cbn07XG5cbi8qKlxuICogSWYgYSByb3V0ZSByZXR1cm5zIGEgZnVuY3Rpb24sIGluc3RlYWQgb2YgYSByZWFjdCBlbGVtZW50LCB3ZSBuZWVkIHRvIHdyYXAgdGhpcyBmdW5jdGlvblxuICogdG8gZXZlbnR1YWxseSB3cmFwIGEgY29udGV4dCBvYmplY3QgYXJvdW5kIGl0cyByZXN1bHQuXG4gKiBAcGFyYW0gUm91dGVDb250ZXh0XG4gKiBAcGFyYW0gb3JpZ2luYWxSZXN1bHRcbiAqIEByZXR1cm5zIHtmdW5jdGlvbigpOiAqfVxuICovXG5jb25zdCB3cmFwcGVyRnVuY3Rpb24gPSAoUm91dGVDb250ZXh0LCBvcmlnaW5hbFJlc3VsdCkgPT4gZnVuY3Rpb24gKCl7XG5cdHJldHVybiAoXG5cdFx0PFJvdXRlQ29udGV4dD57b3JpZ2luYWxSZXN1bHQuYXBwbHkob3JpZ2luYWxSZXN1bHQsIGFyZ3VtZW50cyl9PC9Sb3V0ZUNvbnRleHQ+XG5cdCk7XG59O1xuXG4vKipcbiAqIFBhc3MgYW4gb2JqZWN0IHRvIHRoaXMgZnVuY3Rpb24gd2hlcmUgdGhlIGtleXMgYXJlIHJvdXRlcyBhbmQgdGhlIHZhbHVlc1xuICogYXJlIGZ1bmN0aW9ucyB0byBiZSBleGVjdXRlZCB3aGVuIGEgcm91dGUgbWF0Y2hlcy4gV2hhdGV2ZXIgeW91ciBmdW5jdGlvbiByZXR1cm5zXG4gKiB3aWxsIGJlIHJldHVybmVkIGZyb20gdGhlIGhvb2sgYXMgd2VsbCBpbnRvIHlvdXIgcmVhY3QgY29tcG9uZW50LiBJZGVhbGx5IHlvdSB3b3VsZFxuICogcmV0dXJuIGNvbXBvbmVudHMgdG8gYmUgcmVuZGVyZWQgd2hlbiBjZXJ0YWluIHJvdXRlcyBtYXRjaCwgYnV0IHlvdSBhcmUgbm90IGxpbWl0ZWRcbiAqIHRvIHRoYXQuXG4gKiBAcGFyYW0ge29iamVjdH0gcm91dGVPYmoge1wiL3NvbWVSb3V0ZVwiOiAoKSA9PiA8RXhhbXBsZSAvPn1cbiAqL1xuZXhwb3J0IGNvbnN0IHVzZVJvdXRlcyA9IChyb3V0ZU9iaikgPT4ge1xuXHQvLyBFYWNoIHJvdXRlciBnZXRzIGFuIGludGVybmFsIGlkIHRvIGxvb2sgdGhlbSB1cCBhZ2Fpbi5cblx0Y29uc3QgW3JvdXRlcklkXSA9IFJlYWN0LnVzZVN0YXRlKGNvbXBvbmVudElkKTtcblx0Y29uc3Qgc2V0VXBkYXRlID0gUmVhY3QudXNlU3RhdGUoMClbMV07XG5cdC8vIE5lZWRlZCB0byBjcmVhdGUgbmVzdGVkIHJvdXRlcnMgd2hpY2ggdXNlIG9ubHkgYSBzdWJzZXQgb2YgdGhlIFVSTC5cblx0Y29uc3QgcGFyZW50Um91dGVySWQgPSBSZWFjdC51c2VDb250ZXh0KFBhcmVudENvbnRleHQpO1xuXG5cdC8vIElmIHdlIGp1c3QgdG9vayB0aGUgbGFzdCBJRCwgaW5jcmVhc2UgaXQgZm9yIHRoZSBuZXh0IGhvb2suXG5cdGlmIChyb3V0ZXJJZCA9PT0gY29tcG9uZW50SWQpIHtcblx0XHRjb21wb25lbnRJZCArPSAxO1xuXHR9XG5cblx0Ly8gUmVtb3ZlcyB0aGUgcm91dGVyIGZyb20gdGhlIHN0YWNrIGFmdGVyIGNvbXBvbmVudCB1bm1vdW50IC0gaXQgd29uJ3QgYmUgcHJvY2Vzc2VkIGFueW1vcmUuXG5cdFJlYWN0LnVzZUVmZmVjdCgoKSA9PiAoKSA9PiBkZWxldGUgc3RhY2tbcm91dGVySWRdLCBbcm91dGVySWRdKTtcblxuXHRsZXQgc3RhY2tPYmogPSBzdGFja1tyb3V0ZXJJZF07XG5cblx0aWYgKHN0YWNrT2JqICYmIHN0YWNrT2JqLm9yaWdpbmFsUm91dGVPYmogIT09IHJvdXRlT2JqKSB7XG5cdFx0c3RhY2tPYmogPSBudWxsO1xuXHR9XG5cblx0aWYgKCFzdGFja09iaikge1xuXHRcdHN0YWNrT2JqID0ge1xuXHRcdFx0cm91dGVySWQsXG5cdFx0XHRvcmlnaW5hbFJvdXRlT2JqOiByb3V0ZU9iaixcblx0XHRcdHJvdXRlczogT2JqZWN0LmVudHJpZXMocm91dGVPYmopLFxuXHRcdFx0c2V0VXBkYXRlLFxuXHRcdFx0cGFyZW50Um91dGVySWQsXG5cdFx0XHRtYXRjaGVkUm91dGU6IG51bGwsXG5cdFx0XHRyZWR1Y2VkUGF0aDogbnVsbCxcblx0XHRcdHBhc3NDb250ZXh0OiBmYWxzZSxcblx0XHRcdHJlc3VsdDogbnVsbFxuXHRcdH07XG5cblx0XHRzdGFja1tyb3V0ZXJJZF0gPSBzdGFja09iajtcblxuXHRcdHByb2Nlc3Moc3RhY2tPYmosIHRydWUpO1xuXHR9XG5cblx0UmVhY3QudXNlRGVidWdWYWx1ZShzdGFja09iai5tYXRjaGVkUm91dGUpO1xuXG5cdGlmICghc3RhY2tPYmoubWF0Y2hlZFJvdXRlKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHRsZXQgcmVzdWx0ID0gc3RhY2tPYmoucmVzdWx0O1xuXG5cdGlmICghc3RhY2tPYmoucGFzc0NvbnRleHQpIHtcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9IGVsc2Uge1xuXHRcdGNvbnN0IFJvdXRlQ29udGV4dCA9ICh7Y2hpbGRyZW59KSA9PiA8UGFyZW50Q29udGV4dC5Qcm92aWRlciB2YWx1ZT17cm91dGVySWR9PntjaGlsZHJlbn08L1BhcmVudENvbnRleHQuUHJvdmlkZXI+O1xuXG5cdFx0aWYgKHR5cGVvZiByZXN1bHQgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdHJldHVybiB3cmFwcGVyRnVuY3Rpb24oUm91dGVDb250ZXh0LCByZXN1bHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiBSZWFjdC5pc1ZhbGlkRWxlbWVudChyZXN1bHQpICYmIHJlc3VsdC50eXBlICE9PSBSb3V0ZUNvbnRleHRcblx0XHRcdD8gPFJvdXRlQ29udGV4dD57cmVzdWx0fTwvUm91dGVDb250ZXh0PlxuXHRcdFx0OiByZXN1bHQ7XG5cdH1cbn07XG4iXX0=