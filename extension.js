/************************************************************************************
  This is your extension code.
  For more information please visit our wiki site:
  http://crossrider.wiki.zoho.com
*************************************************************************************/

appAPI.ready(function($) {

	// don't do anything if not Google Drive page
	if (!appAPI.isMatchPages("drive.google.com/*")) return;
		
	var MESSAGES = {
		chatter_login: 'Please login to Salesforce first...',
		chatter_loading: 'Loading...',
		endpoint_btn_text: 'Chatter Endpoint',
		endpoint_prompt: 'Please set chatter endpoint',
		endpoint_sample: 'https://c.na9.visual.force.com/apex/gdrive_chatter',
	};

	// load local resources
	appAPI.resources.includeCSS('css/extension.css');
	
	// chatter endpoint button
	$('<div class="goog-menuseparator navpane-download-separator" role="separator"></div><a id="chatter-endpoint-btn" class="download-link"><span class="goog-tree-item-label">'+ MESSAGES['endpoint_btn_text'] +'</span></a>').appendTo('#navpane-container-scrollable');
	
	// insert chatter icons
	$('.doclist-td-name').each(function() {
		$(this).prepend('<div class="chatter-btn">&nbsp;</div>');
	});
	
	// insert modal
	$('<div id="modal-wrapper" style="display: none;"><div id="modal" style="width: 580px; height: 440px;" /></div>').appendTo('body');
	
	// insert close button
	$('<div id="modal-title"><span id="modal-title-text">Title Here</span><span id="modal-close-btn">x</span></div>').appendTo('#modal');
	
	// insert modal-body
	$('<div id="modal-body"><iframe src="" marginwidth=0 marginheight=0 frameborder=0 scrolling=yes style="border: 0; width: 560px; height: 360px; margin: 10px 8px 10px 12px;" /></div>').appendTo('#modal');	
	
	// press escape - hide modal
	$(document).keyup(function(e) {
  		if (e.keyCode == 27) $('#modal-wrapper').fadeOut('fast');  // esc
	});
	
	// listen to click on #modal-close-btn - hide modal
	$('#modal-close-btn').on('click', function() {
		$('#modal-wrapper').fadeOut('fast');
	});
	
	// delegate to click on td.doclist-td-name - when chatter icon is clicked
	$('body').delegate('td.doclist-td-name', 'click', function(e) {
		if(e.target.nodeName == 'SPAN') return;
		
		//console.log($(this).attr('id').split('.')[2]);
		//console.log($(this).find('.doclist-content-wrapper').html());

		// if chatter_endpoint is blank, prompt for entry
		if(!appAPI.db.get('chatter_endpoint')) $('#chatter-endpoint-btn').click();
	
		// set iframe src
		$('#modal-body > iframe').attr('src', appAPI.db.get('chatter_endpoint') +'?DocumentID='+ $(this).attr('id').split('.')[2]);
		
		var docTitle = $(this).find('.doclist-content-wrapper').html();
		
		// successful iframe loading
		$('#modal-body > iframe').load(function() {
        	clearTimeout(iframeTimer);
        	
        	// change #modal-title-text
			$('#modal-title-text').html(docTitle);
		
    	});
    	
		// unsuccessful iframe loading - ask user to login
		var iframeTimer = window.setTimeout(function() {
			$('#modal-title-text').html(MESSAGES['chatter_login']);
		}, 3000);
		
		// set loading message
		$('#modal-title-text').html(MESSAGES['chatter_loading']);
		
		// show modal
		$('#modal-wrapper').fadeIn('fast');

		e.preventDefault();
	});

	// listen to change - when google drive page is modified via JS
	setInterval(function() { // a bit stupid but mutation events are not suppored well across browsers
		$('.chatter-btn').remove();
		$('.doclist-td-name').each(function() {
			$(this).prepend('<div class="chatter-btn">&nbsp;</div>');
		});
	}, 800);
	
	// listen to click #chatter-endpoint-btn
	$('#chatter-endpoint-btn').on('click', function(e) {
		var _endpoint = prompt(MESSAGES['endpoint_prompt'], appAPI.db.get('chatter_endpoint'));
		appAPI.db.set('chatter_endpoint', _endpoint);
		
		e.preventDefault();
	});
	
	// if chatter_endpoint is blank, prompt for entry
	// if(!appAPI.db.get('chatter_endpoint')) $('#chatter-endpoint-btn').click();
	if(!appAPI.db.get('chatter_endpoint')) appAPI.db.set('chatter_endpoint', MESSAGES['endpoint_sample']);
});
