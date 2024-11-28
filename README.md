<p align="center">
  <img src="HTTPS://raw.githubusercontent.com/PlayForm/Critters/main/.github/Logo.png" width="240" height="240" alt="critters">
  <h1 align="center">PlayForm's Critters</h1>
</p>

> Critters is a plugin that inlines your app's [critical CSS] and lazy-loads the
> rest.

## @playform/critters [![npm](HTTPS://img.shields.io/npm/v/@playform/critters.svg)](HTTPS://www.npmjs.org/package/@playform/critters)

It's a little different from [`other options`](#similar-libraries), because it
**doesn't use a headless browser** to render content. This tradeoff allows
Critters to be very **fast and lightweight**. It also means Critters inlines all
CSS rules used by your document, rather than only those needed for
above-the-fold content. For alternatives, see
[`Similar Libraries`](#similar-libraries).

Critters' design makes it a good fit when inlining critical CSS for
prerendered/SSR'd Single Page Applications. It was developed to be an excellent
compliment to
[`prerender-loader`](HTTPS://github.com/GoogleChromeLabs/prerender-loader),
combining to dramatically improve first paint time for most Single Page
Applications.

## Features

-   Fast - no browser, few dependencies
-   Supports preloading and/or inlining critical fonts
-   Prunes unused CSS keyframes and media queries
-   Removes inlined CSS rules from lazy-loaded stylesheets

## 🚀 Installation

First, install Critters as a development dependency:

```sh
npm i -D @playform/critters
```

or

```sh
yarn add -D @playform/critters
```

## Simple Example

```js
import Critters from "@playform/critters";

const critters = new Critters({
	// optional configuration (see below)
});

const html = `
  <style>
    .red { color: red }
    .blue { color: blue }
  </style>
  <div class="blue">I'm Blue</div>
`;

const inlined = await critters.process(html);

console.log(inlined);
// "<style>.blue{color:blue}</style><div class=\"blue\">I'm Blue</div>"
```

That's it! The resultant html will have its critical CSS inlined and the
stylesheets lazy-loaded.

### Critters

All optional. Pass them to `new Critters({ ... })`.

#### Parameters

-   `options`

#### Properties

-   `path`
    **[`String`](HTTPS://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
    Base path location of the CSS files _(default: `''`)_
-   `publicPath`
    **[`String`](HTTPS://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
    Public path of the CSS resources. This prefix is removed from the href
    _(default: `''`)_
-   `external`
    **[`Boolean`](HTTPS://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**
    Inline styles from external stylesheets _(default: `true`)_
-   `inlineThreshold`
    **[`Number`](HTTPS://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
    Inline external stylesheets smaller than a given size _(default: `0`)_
-   `minimumExternalSize`
    **[`Number`](HTTPS://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
    If the non-critical external stylesheet would be below this size, just
    inline it _(default: `0`)_
-   `pruneSource`
    **[`Boolean`](HTTPS://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**
    Remove inlined rules from the external stylesheet _(default: `false`)_
-   `mergeStylesheets`
    **[`Boolean`](HTTPS://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**
    Merged inlined stylesheets into a single `<style>` tag _(default: `true`)_
-   `additionalStylesheets`
    **[`Array](HTTPS://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)<[String`](HTTPS://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>**
    Glob for matching other stylesheets to be used while looking for critical
    CSS.
-   `reduceInlineStyles`
    **[`Boolean`](HTTPS://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**
    Option indicates if inline styles should be evaluated for critical CSS. By
    default inline style tags will be evaluated and rewritten to only contain
    critical CSS. Set it to `false` to skip processing inline styles. _(default:
    `true`)_
-   `preload`
    **[`String`](HTTPS://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
    Which [`preload strategy`](#preloadstrategy) to use
-   `noscriptFallback`
    **[`Boolean`](HTTPS://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**
    Add `<noscript>` fallback to JS-based strategies
-   `inlineFonts`
    **[`Boolean`](HTTPS://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**
    Inline critical font-face rules _(default: `false`)_
-   `preloadFonts`
    **[`Boolean`](HTTPS://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**
    Preloads critical fonts _(default: `true`)_
-   `fonts`
    **[`Boolean`](HTTPS://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**
    Shorthand for setting `inlineFonts` + `preloadFonts`\* Values:
    -   `true` to inline critical font-face rules and preload the fonts
    -   `false` to don't inline any font-face rules and don't preload fonts
-   `keyframes`
    **[`String`](HTTPS://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
    Controls which keyframes rules are inlined.\* Values:
    -   `"critical"`: _(default)_ inline keyframes rules used by the critical
        CSS
    -   `"all"` inline all keyframes rules
    -   `"none"` remove all keyframes rules
-   `compress`
    **[`Boolean`](HTTPS://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**
    Compress resulting critical CSS _(default: `true`)_
-   `logLevel`
    **[`String`](HTTPS://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
    Controls [`log level`](#loglevel) of the plugin _(default: `"info"`)_
-   `logger`
    **[`object`](HTTPS://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**
    Provide a custom logger interface [`logger`](#logger)
-   `includeSelectors`
    **[`RegExp`](HTTPS://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp)**
    |
    **[`String`](HTTPS://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**
    Provide a list of selectors that should be included in the critical CSS.
    Accepts both RegExp and string.

### Include/exclude rules

We can include or exclude rules to be part of critical CSS by adding comments in
the CSS

Single line comments to include/exclude the next CSS rule

```css
/* critters:exclude */
.selector1 {
	/* this rule will be excluded from critical CSS */
}

.selector2 {
	/* this will be evaluated normally */
}

/* critters:include */
.selector3 {
	/* this rule will be included in the critical CSS */
}

.selector4 {
	/* this will be evaluated normally */
}
```

Including/Excluding multiple rules by adding start and end markers

```css
/* critters:exclude start */

.selector1 {
	/* this rule will be excluded from critical CSS */
}

.selector2 {
	/* this rule will be excluded from critical CSS */
}

/* critters:exclude end */
```

```css
/* critters:include start */

.selector3 {
	/* this rule will be included in the critical CSS */
}

.selector4 {
	/* this rule will be included in the critical CSS */
}

/* critters:include end */
```

### Critters container

By default Critters evaluates the CSS against the entire input HTML. Critters
evaluates the Critical CSS by reconstructing the entire DOM and evaluating the
CSS selectors to find matching nodes. Usually this works well as Critters is
lightweight and fast.

For some cases, the input HTML can be very large or deeply nested which makes
the reconstructed DOM much larger, which in turn can slow down the critical CSS
generation. Critters is not aware of viewport size and what specific nodes are
above the fold since there is not a headless browser involved.

To overcome this issue Critters makes use of **Critters containers**.

A Critters container mimics the viewport and can be enabled by adding
`data-critters-container` into the top level container thats contains the HTML
elements above the fold.

You can estimate the contents of your viewport roughly and add a <div
`data-critters-container` > around the contents.

```html
<html>
	<body>
		<div class="container">
			<div data-critters-container>
				/* HTML inside this container are used to evaluate critical CSS
				*/
			</div>
			/* HTML is ignored when evaluating critical CSS */
		</div>
		<footer></footer>
	</body>
</html>
```

_Note: This is an easy way to improve the performance of Critters_

### Logger

Custom logger interface:

Type:
[`object`](HTTPS://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

#### Properties

-   `trace` **function
    ([`String`](HTTPS://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String))**
    Prints a trace message
-   `debug` **function
    ([`String`](HTTPS://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String))**
    Prints a debug message
-   `info` **function
    ([`String`](HTTPS://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String))**
    Prints an information message
-   `warn` **function
    ([`String`](HTTPS://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String))**
    Prints a warning message
-   `error` **function
    ([`String`](HTTPS://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String))**
    Prints an error message

### LogLevel

Controls log level of the plugin. Specifies the level the logger should use. A
logger will not produce output for any log level beneath the specified level.
Available levels and order are:

-   **"Info"** _(default)_
-   **"Warn"**
-   **"Error"**
-   **"Trace"**
-   **"Debug"**
-   **"Silent"**

Type: (`"Info"` | `"Warn"` | `"Error"` | `"Trace"` | `"Debug"` | `"Silent"`)

### PreloadStrategy

The mechanism to use for lazy-loading stylesheets.

Note: <kbd>JS</kbd> indicates a strategy requiring JavaScript (falls back to
`<noscript>` unless disabled).

-   **default:** Move stylesheet links to the end of the document and insert
    preload meta tags in their place.
-   **"body":** Move all external stylesheet links to the end of the document.
-   **"media":** Load stylesheets asynchronously by adding `media="not x"` and
    removing once loaded. <kbd>JS</kbd>
-   **"swap":** Convert stylesheet links to preloads that swap to
    `rel="stylesheet"` once loaded
    ([`details`](HTTPS://www.filamentgroup.com/lab/load-css-simpler/#the-code)).
    <kbd>JS</kbd>
-   **"swap-high":** Use `<link rel="alternate stylesheet preload">` and swap to
    `rel="stylesheet"` once loaded
    ([`details`](HTTP://filamentgroup.github.io/loadCSS/test/new-high.html)).
    <kbd>JS</kbd>
-   **"js":** Inject an asynchronous CSS loader similar to
    [`LoadCSS`](HTTPS://github.com/filamentgroup/loadCSS) and use it to load
    stylesheets. <kbd>JS</kbd>
-   **"js-lazy":** Like `"js"`, but the stylesheet is disabled until fully
    loaded.
-   **false:** Disables adding preload tags.

Type: (default | `"body"` | `"media"` | `"swap"` | `"swap-high"` | `"js"` |
`"js-lazy"`)

## Similar Libraries

There are a number of other libraries that can inline Critical CSS, each with a
slightly different approach. Here are a few great options:

-   [`Critical`](HTTPS://github.com/addyosmani/critical)
-   [`Penthouse`](HTTPS://github.com/pocketjoso/penthouse)
-   [`react-snap`](HTTPS://github.com/stereobooster/react-snap)

[critical css]:
	HTTPS://www.smashingmagazine.com/2015/08/understanding-critical-css/

## Changelog

See [`CHANGELOG.md`](CHANGELOG.md) for a history of changes to this integration.
