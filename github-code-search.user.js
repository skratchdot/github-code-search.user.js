// ==UserScript==
// @name           Github Code Search
// @namespace      https://github.com/skratchdot/github-code-search.user.js
// @description    A user script that adds a search box to repository pages which allows you to search the code in that repository.
// @include        https://github.com/*
// ==/UserScript==

var main = function () {
	// Declare a namespace to store functions in
	var SKRATCHDOT = SKRATCHDOT || {};

	// GitHub.nameWithOwner used to exist on the page, but was removed.
	// Now constructing this with some jQuery selectors
	SKRATCHDOT.nameWithOwner = '';
	SKRATCHDOT.getNameWithOwner = function () {
		var returnValue = '',
			repoLink = jQuery('div.site div.title-actions-bar h1:first a:eq(1)');
		if (repoLink.length > 0) {
			returnValue = repoLink.attr('href').substr(1);
		}
		return returnValue;
	};

	// The function that will be called when repo search is used
	SKRATCHDOT.performCodeSearch = function (searchText, startValue) {
		jQuery.ajax({
			url: 'https://github.com/search',
			dataType: 'html',
			type: 'GET',
			data: {
				type: 'Code',
				repo: SKRATCHDOT.nameWithOwner,
				q: searchText,
				start_value: startValue
			},
			success: function(data, textStatus, XMLHttpRequest) {
				try {
					var resultHtml = jQuery(data).find('#code_search_results');
					var resultContainer = jQuery('#skratchdot-result-container');
					resultContainer.html(resultHtml);

					resultContainer.find('#code_search_results div.pagination a.pager_link').click(function(e) {

						resultContainer.empty();

						// Refresh with the results from the pagination
						SKRATCHDOT.performCodeSearch(searchText, jQuery(this).text());

						e.preventDefault();
					});
				} catch(e) {}
			}
		});
	};

	SKRATCHDOT.codeSearchInit = function () {
		var siteContainer = jQuery('div.site div.container');
		var repohead = siteContainer.find('div.repohead');
		SKRATCHDOT.nameWithOwner = SKRATCHDOT.getNameWithOwner();
		if (repohead.length > 0 && typeof SKRATCHDOT.nameWithOwner === 'string' && SKRATCHDOT.nameWithOwner.length > 0) {
			// Do nothing if code tab isn't selected
			var codeTabSelected = repohead.find('ul.tabs li:first a.selected');
			if (codeTabSelected.length === 0) {
				return;
			}

			var subnavBar = repohead.find('div.subnav-bar');
			var actions = subnavBar.find('ul.actions');
			
			// Do nothing if there's already a search box
			if (actions.find('input[type=text]').length > 1) {
				return;
			}

			// Create Search Bar
			actions.prepend(
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
			jQuery('#skratchdot-code-search').submit(function(e) {
				e.preventDefault();
				
				// Remove everything after the subnavBar
				var belowSubNav = false;
				repohead.children().each(function() {
					var elem = jQuery(this);
					if (belowSubNav === true) {
						elem.remove();
					} else {
						if (elem.hasClass('subnav-bar')) {
							belowSubNav = true;
						}
					}
				});
				siteContainer.children().each(function() {
					var elem = jQuery(this);
					if (elem.hasClass('repohead') === false) {
						elem.remove();
					}
				});

				siteContainer.append('<div id="skratchdot-result-container"></div>');
				// Only perform search if we entered a value
				var searchText = jQuery(this).find('input:first').val();
				if( searchText.length > 0 ) {
					SKRATCHDOT.performCodeSearch(searchText, 1);
				}
				else {
					jQuery('#skratchdot-result-container').html('<div style="color:#c00;">Please enter a search term into the code search input, and try again.</div>');
				}
				
			});
		}
	};

	// onDomReady : setup our page
	jQuery(document).ready(function() {
		SKRATCHDOT.codeSearchInit();
	});
};

// Inject our main script
var script = document.createElement('script');
script.textContent = '(' + main.toString() + ')();';
document.body.appendChild(script);