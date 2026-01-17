/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/base64url";
exports.ids = ["vendor-chunks/base64url"];
exports.modules = {

/***/ "(ssr)/./node_modules/base64url/dist/base64url.js":
/*!**************************************************!*\
  !*** ./node_modules/base64url/dist/base64url.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nvar pad_string_1 = __webpack_require__(/*! ./pad-string */ \"(ssr)/./node_modules/base64url/dist/pad-string.js\");\nfunction encode(input, encoding) {\n    if (encoding === void 0) { encoding = \"utf8\"; }\n    if (Buffer.isBuffer(input)) {\n        return fromBase64(input.toString(\"base64\"));\n    }\n    return fromBase64(Buffer.from(input, encoding).toString(\"base64\"));\n}\n;\nfunction decode(base64url, encoding) {\n    if (encoding === void 0) { encoding = \"utf8\"; }\n    return Buffer.from(toBase64(base64url), \"base64\").toString(encoding);\n}\nfunction toBase64(base64url) {\n    base64url = base64url.toString();\n    return pad_string_1.default(base64url)\n        .replace(/\\-/g, \"+\")\n        .replace(/_/g, \"/\");\n}\nfunction fromBase64(base64) {\n    return base64\n        .replace(/=/g, \"\")\n        .replace(/\\+/g, \"-\")\n        .replace(/\\//g, \"_\");\n}\nfunction toBuffer(base64url) {\n    return Buffer.from(toBase64(base64url), \"base64\");\n}\nvar base64url = encode;\nbase64url.encode = encode;\nbase64url.decode = decode;\nbase64url.toBase64 = toBase64;\nbase64url.fromBase64 = fromBase64;\nbase64url.toBuffer = toBuffer;\nexports[\"default\"] = base64url;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvYmFzZTY0dXJsL2Rpc3QvYmFzZTY0dXJsLmpzIiwibWFwcGluZ3MiOiJBQUFhO0FBQ2IsOENBQTZDLEVBQUUsYUFBYSxFQUFDO0FBQzdELG1CQUFtQixtQkFBTyxDQUFDLHVFQUFjO0FBQ3pDO0FBQ0EsK0JBQStCO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0JBQStCO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBZSIsInNvdXJjZXMiOlsid2VicGFjazovL2RhcHAtZmFjdG9yeS1wbGF0Zm9ybS8uL25vZGVfbW9kdWxlcy9iYXNlNjR1cmwvZGlzdC9iYXNlNjR1cmwuanM/YmMxYiJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciBwYWRfc3RyaW5nXzEgPSByZXF1aXJlKFwiLi9wYWQtc3RyaW5nXCIpO1xuZnVuY3Rpb24gZW5jb2RlKGlucHV0LCBlbmNvZGluZykge1xuICAgIGlmIChlbmNvZGluZyA9PT0gdm9pZCAwKSB7IGVuY29kaW5nID0gXCJ1dGY4XCI7IH1cbiAgICBpZiAoQnVmZmVyLmlzQnVmZmVyKGlucHV0KSkge1xuICAgICAgICByZXR1cm4gZnJvbUJhc2U2NChpbnB1dC50b1N0cmluZyhcImJhc2U2NFwiKSk7XG4gICAgfVxuICAgIHJldHVybiBmcm9tQmFzZTY0KEJ1ZmZlci5mcm9tKGlucHV0LCBlbmNvZGluZykudG9TdHJpbmcoXCJiYXNlNjRcIikpO1xufVxuO1xuZnVuY3Rpb24gZGVjb2RlKGJhc2U2NHVybCwgZW5jb2RpbmcpIHtcbiAgICBpZiAoZW5jb2RpbmcgPT09IHZvaWQgMCkgeyBlbmNvZGluZyA9IFwidXRmOFwiOyB9XG4gICAgcmV0dXJuIEJ1ZmZlci5mcm9tKHRvQmFzZTY0KGJhc2U2NHVybCksIFwiYmFzZTY0XCIpLnRvU3RyaW5nKGVuY29kaW5nKTtcbn1cbmZ1bmN0aW9uIHRvQmFzZTY0KGJhc2U2NHVybCkge1xuICAgIGJhc2U2NHVybCA9IGJhc2U2NHVybC50b1N0cmluZygpO1xuICAgIHJldHVybiBwYWRfc3RyaW5nXzEuZGVmYXVsdChiYXNlNjR1cmwpXG4gICAgICAgIC5yZXBsYWNlKC9cXC0vZywgXCIrXCIpXG4gICAgICAgIC5yZXBsYWNlKC9fL2csIFwiL1wiKTtcbn1cbmZ1bmN0aW9uIGZyb21CYXNlNjQoYmFzZTY0KSB7XG4gICAgcmV0dXJuIGJhc2U2NFxuICAgICAgICAucmVwbGFjZSgvPS9nLCBcIlwiKVxuICAgICAgICAucmVwbGFjZSgvXFwrL2csIFwiLVwiKVxuICAgICAgICAucmVwbGFjZSgvXFwvL2csIFwiX1wiKTtcbn1cbmZ1bmN0aW9uIHRvQnVmZmVyKGJhc2U2NHVybCkge1xuICAgIHJldHVybiBCdWZmZXIuZnJvbSh0b0Jhc2U2NChiYXNlNjR1cmwpLCBcImJhc2U2NFwiKTtcbn1cbnZhciBiYXNlNjR1cmwgPSBlbmNvZGU7XG5iYXNlNjR1cmwuZW5jb2RlID0gZW5jb2RlO1xuYmFzZTY0dXJsLmRlY29kZSA9IGRlY29kZTtcbmJhc2U2NHVybC50b0Jhc2U2NCA9IHRvQmFzZTY0O1xuYmFzZTY0dXJsLmZyb21CYXNlNjQgPSBmcm9tQmFzZTY0O1xuYmFzZTY0dXJsLnRvQnVmZmVyID0gdG9CdWZmZXI7XG5leHBvcnRzLmRlZmF1bHQgPSBiYXNlNjR1cmw7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/base64url/dist/base64url.js\n");

/***/ }),

/***/ "(ssr)/./node_modules/base64url/dist/pad-string.js":
/*!***************************************************!*\
  !*** ./node_modules/base64url/dist/pad-string.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nfunction padString(input) {\n    var segmentLength = 4;\n    var stringLength = input.length;\n    var diff = stringLength % segmentLength;\n    if (!diff) {\n        return input;\n    }\n    var position = stringLength;\n    var padLength = segmentLength - diff;\n    var paddedStringLength = stringLength + padLength;\n    var buffer = Buffer.alloc(paddedStringLength);\n    buffer.write(input);\n    while (padLength--) {\n        buffer.write(\"=\", position++);\n    }\n    return buffer.toString();\n}\nexports[\"default\"] = padString;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvYmFzZTY0dXJsL2Rpc3QvcGFkLXN0cmluZy5qcyIsIm1hcHBpbmdzIjoiQUFBYTtBQUNiLDhDQUE2QyxFQUFFLGFBQWEsRUFBQztBQUM3RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWUiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9kYXBwLWZhY3RvcnktcGxhdGZvcm0vLi9ub2RlX21vZHVsZXMvYmFzZTY0dXJsL2Rpc3QvcGFkLXN0cmluZy5qcz9iNWU1Il0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZnVuY3Rpb24gcGFkU3RyaW5nKGlucHV0KSB7XG4gICAgdmFyIHNlZ21lbnRMZW5ndGggPSA0O1xuICAgIHZhciBzdHJpbmdMZW5ndGggPSBpbnB1dC5sZW5ndGg7XG4gICAgdmFyIGRpZmYgPSBzdHJpbmdMZW5ndGggJSBzZWdtZW50TGVuZ3RoO1xuICAgIGlmICghZGlmZikge1xuICAgICAgICByZXR1cm4gaW5wdXQ7XG4gICAgfVxuICAgIHZhciBwb3NpdGlvbiA9IHN0cmluZ0xlbmd0aDtcbiAgICB2YXIgcGFkTGVuZ3RoID0gc2VnbWVudExlbmd0aCAtIGRpZmY7XG4gICAgdmFyIHBhZGRlZFN0cmluZ0xlbmd0aCA9IHN0cmluZ0xlbmd0aCArIHBhZExlbmd0aDtcbiAgICB2YXIgYnVmZmVyID0gQnVmZmVyLmFsbG9jKHBhZGRlZFN0cmluZ0xlbmd0aCk7XG4gICAgYnVmZmVyLndyaXRlKGlucHV0KTtcbiAgICB3aGlsZSAocGFkTGVuZ3RoLS0pIHtcbiAgICAgICAgYnVmZmVyLndyaXRlKFwiPVwiLCBwb3NpdGlvbisrKTtcbiAgICB9XG4gICAgcmV0dXJuIGJ1ZmZlci50b1N0cmluZygpO1xufVxuZXhwb3J0cy5kZWZhdWx0ID0gcGFkU3RyaW5nO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/base64url/dist/pad-string.js\n");

/***/ }),

/***/ "(ssr)/./node_modules/base64url/index.js":
/*!*****************************************!*\
  !*** ./node_modules/base64url/index.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("module.exports = __webpack_require__(/*! ./dist/base64url */ \"(ssr)/./node_modules/base64url/dist/base64url.js\")[\"default\"];\nmodule.exports[\"default\"] = module.exports;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvYmFzZTY0dXJsL2luZGV4LmpzIiwibWFwcGluZ3MiOiJBQUFBLDJIQUFvRDtBQUNwRCx5QkFBc0IiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9kYXBwLWZhY3RvcnktcGxhdGZvcm0vLi9ub2RlX21vZHVsZXMvYmFzZTY0dXJsL2luZGV4LmpzP2RiZjMiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2Rpc3QvYmFzZTY0dXJsJykuZGVmYXVsdDtcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBtb2R1bGUuZXhwb3J0cztcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/base64url/index.js\n");

/***/ })

};
;