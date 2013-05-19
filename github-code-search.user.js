// ==UserScript==
// @name           Github: Code Search
// @namespace      https://github.com/skratchdot/github-code-search.user.js
// @description    A user script that adds a search box to repository pages which allows you to search the code in that repository.
// @include        https://github.com/*
// @match          https://github.com/*
// @require        https://gist.github.com/skratchdot/5604120/raw/_init.js
// @require        https://gist.github.com/skratchdot/5604120/raw/code-search.js
// @run-at         document-end
// @icon           http://skratchdot.com/favicon.ico
// @downloadURL    https://github.com/skratchdot/github-code-search.user.js/raw/master/github-code-search.user.js
// @updateURL      https://github.com/skratchdot/github-code-search.user.js/raw/master/github-code-search.user.js
// @version        2.4
// ==/UserScript==
/*global SKRATCHDOT, document */

// This code is only going to run for browsers that don't support
// the @require annotation when executing userscripts.
if ('undefined' === typeof SKRATCHDOT) {
	var addScript = function (src) {
		'use strict';
		var script = document.createElement('script');
		script.src = src;
		document.body.appendChild(script);
		document.body.removeChild(script);
	};

	// Required by: repo-filter-info
	addScript('https://gist.github.com/skratchdot/5604120/raw/code-search.js');
}