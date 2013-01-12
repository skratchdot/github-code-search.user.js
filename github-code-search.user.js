// ==UserScript==
// @name           Github: Code Search
// @namespace      https://github.com/skratchdot/github-code-search.user.js
// @description    A user script that adds a search box to repository pages which allows you to search the code in that repository.
// @include        https://github.com/*
// @match          https://github.com/*
// @run-at         document-end
// @icon           http://skratchdot.com/favicon.ico
// @downloadURL    https://github.com/skratchdot/github-code-search.user.js/raw/master/github-code-search.user.js
// @updateURL      https://github.com/skratchdot/github-code-search.user.js/raw/master/github-code-search.user.js
// @version        1.5
// ==/UserScript==
/*global jQuery */
/*jslint browser: true */

var main = function () {
	'use strict';

	// Declare a namespace to store functions in
	var SKRATCHDOT = window.SKRATCHDOT || {};

	// GitHub.nameWithOwner used to exist on the page, but was removed.
	// Now constructing this with some jQuery selectors
	SKRATCHDOT.nameWithOwner = '';
	SKRATCHDOT.getNameWithOwner = function () {
		var returnValue = '',
			repoLink = jQuery('a.js-current-repository');
		if (repoLink.length > 0) {
			returnValue = repoLink.attr('href').substr(1);
		}
		return returnValue;
	};

	// The function that will be called when repo search is used
	SKRATCHDOT.performCodeSearch = function (searchText, startValue) {
		jQuery.ajax({
			url: '/search',
			dataType: 'html',
			type: 'GET',
			data: {
				type: 'Code',
				repo: SKRATCHDOT.nameWithOwner.toLowerCase(),
				q: searchText,
				start_value: startValue
			},
			success: function (data) {
				try {
					var resultHtml = jQuery(data).find('#code_search_results'),
						resultContainer = jQuery('#skratchdot-result-container');
					resultContainer.html(resultHtml);

					resultContainer.find('#code_search_results div.pagination a.pager_link').click(function (e) {

						resultContainer.empty();

						// Refresh with the results from the pagination
						SKRATCHDOT.performCodeSearch(searchText, jQuery(this).text());

						e.preventDefault();
					});
				} catch (e) {}
			}
		});
	};

	SKRATCHDOT.codeSearchInit = function () {
		var siteContainer = jQuery('div.site div.container'),
			repohead = siteContainer.find('div.tabnav'),
			jsRepoPjaxContainer = jQuery('#js-repo-pjax-container'),
			codeTabSelected,
			tabsOnRight;
		SKRATCHDOT.nameWithOwner = SKRATCHDOT.getNameWithOwner();
		if (repohead.length > 0 && typeof SKRATCHDOT.nameWithOwner === 'string' && SKRATCHDOT.nameWithOwner.length > 0) {
			// Do nothing if code tab isn't selected
			codeTabSelected = siteContainer.find('ul.tabs li:first a.selected');
			if (codeTabSelected.length === 0) {
				return;
			}

			tabsOnRight = repohead.find('.tabnav-right ul');

			// Do nothing if there's already a search box
			if (tabsOnRight.find('input[type=text]').length > 1) {
				return;
			}

			// Create Search Bar
			tabsOnRight.prepend(
				jQuery('<li />')
					.attr('class', 'search')
					.append(
						jQuery('<form />')
							.attr('id', 'skratchdot-code-search')
							.attr('method', 'get')
							.attr('action', 'search')
							.append(
								jQuery('<span />')
									.attr('class', 'fieldwrap')
									.append(
										jQuery('<input />')
											.attr('type', 'text')
											.attr('placeholder', 'Search Source Code...')
											.attr('style', 'border:1px solid #ccc;border-radius:3px;color:#666;height:24px;padding:0 5px;')
									)
									.append(
										jQuery('<button />')
											.attr('class', 'minibutton')
											.attr('type', 'submit')
											.append('<span>Search</span>')
									)
							)
					)
			);

			// When a search is performed
			jQuery('#skratchdot-code-search').submit(function (e) {
				var searchText = jQuery(this).find('input:first').val();

				e.preventDefault();

				// Clear our ajax container, and get ready to store search results
				jsRepoPjaxContainer.empty().append('<div id="skratchdot-result-container"></div>');

				// Only perform search if we entered a value
				if (searchText.length > 0) {
					SKRATCHDOT.performCodeSearch(searchText, 1);
				} else {
					jQuery('#skratchdot-result-container').html('<div style="color:#c00;">Please enter a search term into the code search input, and try again.</div>');
				}

			});
		}
	};

	// onDomReady : setup our page
	jQuery(document).ready(function () {
		SKRATCHDOT.codeSearchInit();
	});
};

// Inject our main script
var script = document.createElement('script');
script.textContent = '(' + main.toString() + ')();';
document.body.appendChild(script);
