// ==UserScript==
// @name           Github Code Search
// @namespace      https://github.com/skratchdot/github-code-search.user.js
// @description    A user script that adds a search box to repository pages which allows you to search the code in that repository.
// @include        https://github.com/*
// ==/UserScript==

var main = function () {
	// Declare a namespace to store functions in
	var SKRATCHDOT = SKRATCHDOT || {};

	// The function that will be called when repo search is used
	SKRATCHDOT.performCodeSearch = function (searchText, startValue) {
		jQuery.ajax({
			url: 'https://github.com/search',
			dataType: 'html',
			type: 'GET',
			data: {
				type: 'Code',
				repo: GitHub.nameWithOwner,
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
		var site = jQuery('div#main div.site');
		var repohead = site.find('div.repohead');
		if (repohead.length > 0 && typeof GitHub.nameWithOwner === 'string' && GitHub.nameWithOwner.length > 0) {
			var subnavBar = repohead.find('div.subnav-bar');

			// Create Search Bar
			subnavBar.append(
				jQuery('<form />')
					.attr('id', 'skratchdot-code-search')
					.attr('method', 'get')
					.attr('action', 'search')
					.append(
						jQuery('<input />')
							.attr('type', 'text')
							.attr('placeholder', 'Search Code...')
							.css('float', 'right')
							.css('padding', '3px')
							.css('border-width', '1px')
							.css('border-style', 'solid')
							.css('border-radius', '3px')
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
				site.children().each(function() {
					var elem = jQuery(this);
					if (elem.hasClass('repohead') === false) {
						elem.remove();
					}
				});

				site.append('<div id="skratchdot-result-container"></div>');
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