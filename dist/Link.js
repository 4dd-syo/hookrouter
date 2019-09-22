"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.A = exports.setLinkProps = void 0;

var _react = _interopRequireDefault(require("react"));

var _router = require("./router");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Accepts HTML `a`-tag properties, requiring `href` and optionally
 * `onClick`, which are appropriately wrapped to allow other
 * frameworks to be used for creating `hookrouter` navigatable links.
 *
 * If `onClick` is supplied, then the navigation will happen before
 * the supplied `onClick` action!
 *
 * @example
 *
 * &lt;MyFrameworkLink what="ever" {...useLink({ href: '/' })}&gt;
 *   Link text
 * &lt;/MyFrameworkLink&gt;
 *
 * @param {Object} props Requires `href`. `onClick` is optional.
 */
var setLinkProps = function setLinkProps(props) {
  var onClick = function onClick(e) {
    if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault(); // prevent the link from actually navigating

      (0, _router.navigate)(e.currentTarget.href);
    }

    if (props.onClick) {
      props.onClick(e);
    }
  };

  var href = props.href.substr(0, 1) === '/' ? (0, _router.getBasepath)() + props.href : props.href;
  return _objectSpread({}, props, {
    href: href,
    onClick: onClick
  });
};
/**
 * Accepts standard HTML `a`-tag properties. `href` and, optionally,
 * `onClick` are used to create links that work with `hookrouter`.
 *
 * @example
 *
 * &lt;A href="/" target="_blank"&gt;
 *   Home
 * &lt;/A&gt;
 *
 * @param {Object} props Requires `href`. `onClick` is optional
 */


exports.setLinkProps = setLinkProps;

var A = function A(props) {
  return _react.default.createElement("a", setLinkProps(props));
};

exports.A = A;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9MaW5rLmpzIl0sIm5hbWVzIjpbInNldExpbmtQcm9wcyIsInByb3BzIiwib25DbGljayIsImUiLCJzaGlmdEtleSIsImN0cmxLZXkiLCJhbHRLZXkiLCJwcmV2ZW50RGVmYXVsdCIsImN1cnJlbnRUYXJnZXQiLCJocmVmIiwic3Vic3RyIiwiQSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOzs7Ozs7OztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JPLElBQU1BLFlBQVksR0FBRyxTQUFmQSxZQUFlLENBQUNDLEtBQUQsRUFBVztBQUN0QyxNQUFNQyxPQUFPLEdBQUcsU0FBVkEsT0FBVSxDQUFDQyxDQUFELEVBQU87QUFDdEIsUUFBSSxDQUFDQSxDQUFDLENBQUNDLFFBQUgsSUFBZSxDQUFDRCxDQUFDLENBQUNFLE9BQWxCLElBQTZCLENBQUNGLENBQUMsQ0FBQ0csTUFBcEMsRUFBNEM7QUFDM0NILE1BQUFBLENBQUMsQ0FBQ0ksY0FBRixHQUQyQyxDQUN2Qjs7QUFDcEIsNEJBQVNKLENBQUMsQ0FBQ0ssYUFBRixDQUFnQkMsSUFBekI7QUFDQTs7QUFFRCxRQUFJUixLQUFLLENBQUNDLE9BQVYsRUFBbUI7QUFDbEJELE1BQUFBLEtBQUssQ0FBQ0MsT0FBTixDQUFjQyxDQUFkO0FBQ0E7QUFDRCxHQVREOztBQVVBLE1BQU1NLElBQUksR0FDVFIsS0FBSyxDQUFDUSxJQUFOLENBQVdDLE1BQVgsQ0FBa0IsQ0FBbEIsRUFBcUIsQ0FBckIsTUFBNEIsR0FBNUIsR0FDRyw2QkFBZ0JULEtBQUssQ0FBQ1EsSUFEekIsR0FFR1IsS0FBSyxDQUFDUSxJQUhWO0FBS0EsMkJBQVdSLEtBQVg7QUFBa0JRLElBQUFBLElBQUksRUFBSkEsSUFBbEI7QUFBd0JQLElBQUFBLE9BQU8sRUFBUEE7QUFBeEI7QUFDQSxDQWpCTTtBQW1CUDs7Ozs7Ozs7Ozs7Ozs7OztBQVlPLElBQU1TLENBQUMsR0FBRyxTQUFKQSxDQUFJLENBQUNWLEtBQUQ7QUFBQSxTQUFXLGtDQUFPRCxZQUFZLENBQUNDLEtBQUQsQ0FBbkIsQ0FBWDtBQUFBLENBQVYiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQge25hdmlnYXRlLCBnZXRCYXNlcGF0aH0gZnJvbSBcIi4vcm91dGVyXCI7XG5cbi8qKlxuICogQWNjZXB0cyBIVE1MIGBhYC10YWcgcHJvcGVydGllcywgcmVxdWlyaW5nIGBocmVmYCBhbmQgb3B0aW9uYWxseVxuICogYG9uQ2xpY2tgLCB3aGljaCBhcmUgYXBwcm9wcmlhdGVseSB3cmFwcGVkIHRvIGFsbG93IG90aGVyXG4gKiBmcmFtZXdvcmtzIHRvIGJlIHVzZWQgZm9yIGNyZWF0aW5nIGBob29rcm91dGVyYCBuYXZpZ2F0YWJsZSBsaW5rcy5cbiAqXG4gKiBJZiBgb25DbGlja2AgaXMgc3VwcGxpZWQsIHRoZW4gdGhlIG5hdmlnYXRpb24gd2lsbCBoYXBwZW4gYmVmb3JlXG4gKiB0aGUgc3VwcGxpZWQgYG9uQ2xpY2tgIGFjdGlvbiFcbiAqXG4gKiBAZXhhbXBsZVxuICpcbiAqICZsdDtNeUZyYW1ld29ya0xpbmsgd2hhdD1cImV2ZXJcIiB7Li4udXNlTGluayh7IGhyZWY6ICcvJyB9KX0mZ3Q7XG4gKiAgIExpbmsgdGV4dFxuICogJmx0Oy9NeUZyYW1ld29ya0xpbmsmZ3Q7XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHByb3BzIFJlcXVpcmVzIGBocmVmYC4gYG9uQ2xpY2tgIGlzIG9wdGlvbmFsLlxuICovXG5leHBvcnQgY29uc3Qgc2V0TGlua1Byb3BzID0gKHByb3BzKSA9PiB7XG5cdGNvbnN0IG9uQ2xpY2sgPSAoZSkgPT4ge1xuXHRcdGlmICghZS5zaGlmdEtleSAmJiAhZS5jdHJsS2V5ICYmICFlLmFsdEtleSkge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpOyAvLyBwcmV2ZW50IHRoZSBsaW5rIGZyb20gYWN0dWFsbHkgbmF2aWdhdGluZ1xuXHRcdFx0bmF2aWdhdGUoZS5jdXJyZW50VGFyZ2V0LmhyZWYpO1xuXHRcdH1cblxuXHRcdGlmIChwcm9wcy5vbkNsaWNrKSB7XG5cdFx0XHRwcm9wcy5vbkNsaWNrKGUpO1xuXHRcdH1cblx0fTtcblx0Y29uc3QgaHJlZiA9XG5cdFx0cHJvcHMuaHJlZi5zdWJzdHIoMCwgMSkgPT09ICcvJ1xuXHRcdFx0PyBnZXRCYXNlcGF0aCgpICsgcHJvcHMuaHJlZlxuXHRcdFx0OiBwcm9wcy5ocmVmO1xuXG5cdHJldHVybiB7Li4ucHJvcHMsIGhyZWYsIG9uQ2xpY2t9O1xufTtcblxuLyoqXG4gKiBBY2NlcHRzIHN0YW5kYXJkIEhUTUwgYGFgLXRhZyBwcm9wZXJ0aWVzLiBgaHJlZmAgYW5kLCBvcHRpb25hbGx5LFxuICogYG9uQ2xpY2tgIGFyZSB1c2VkIHRvIGNyZWF0ZSBsaW5rcyB0aGF0IHdvcmsgd2l0aCBgaG9va3JvdXRlcmAuXG4gKlxuICogQGV4YW1wbGVcbiAqXG4gKiAmbHQ7QSBocmVmPVwiL1wiIHRhcmdldD1cIl9ibGFua1wiJmd0O1xuICogICBIb21lXG4gKiAmbHQ7L0EmZ3Q7XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHByb3BzIFJlcXVpcmVzIGBocmVmYC4gYG9uQ2xpY2tgIGlzIG9wdGlvbmFsXG4gKi9cbmV4cG9ydCBjb25zdCBBID0gKHByb3BzKSA9PiA8YSB7Li4uc2V0TGlua1Byb3BzKHByb3BzKX0gLz47XG4iXX0=