/************************************************************************************
  This is your extension code.
  For more information please visit our wiki site:
  http://crossrider.wiki.zoho.com
*************************************************************************************/

// when crossrider app is ready
appAPI.ready(function($) {

	// don't do anything if the page is not the GDrive page
	if (!appAPI.isMatchPages("drive.google.com/*")) return;
	
	// a central place to define various messages used in the app	
	var MESSAGES = {
		chatter_login: 'Please login to Salesforce first...',
		chatter_loading: 'Loading...',
		endpoint_btn_text: 'Chatter Endpoint',
		endpoint_prompt: 'Please set chatter endpoint',
		endpoint_sample: 'https://c.na9.visual.force.com/apex/gdrive_chatter',
	};
	
	// load stylesheet from the local resources
	appAPI.resources.includeCSS('css/extension.css');
	
	// chatter endpoint button - which is inserted on the GDrive page's left column
	$('<div class="goog-menuseparator navpane-download-separator" role="separator"></div>'+ 
		'<a id="chatter-endpoint-btn" class="download-link">'+ 
		'<span class="goog-tree-item-label">'+ MESSAGES['endpoint_btn_text'] +'</span>'+
		'</a>'
	).appendTo('#navpane-container-scrollable');
	
	// .chatter-btn (chatter button) - insert them for each file
	$('.doclist-td-name').each(function() {
		$(this).prepend('<div class="chatter-btn">&nbsp;</div>');
	});
	
	// insert modal box inside the document body
	$('<div id="modal-wrapper" style="display: none;"><div id="modal" style="width: 580px; height: 440px;" /></div>').appendTo('body');
	
	// insert close button inside the modal box
	$('<div id="modal-title"><span id="modal-title-text">Title Here</span><span id="modal-close-btn">x</span><div style="clear: both" /></div>').appendTo('#modal');
	
	// insert modal body inside the modal box
	$('<div id="modal-body"><iframe src="" marginwidth=0 marginheight=0 frameborder=0 scrolling=yes style="border: 0; width: 560px; height: 360px; margin: 10px 8px 10px 12px;" /></div>').appendTo('#modal');	
	
	// on escape key pressed - hide modal box
	$(document).on('keyup', function(e) {
  		if (e.keyCode == 27) $('#modal-wrapper').fadeOut('fast');  // esc
	});
	
	// listen to click on #modal-close-btn
	// when close button is clicked, hide the modal box
	$('#modal-close-btn').on('click', function() {
		$('#modal-wrapper').fadeOut('fast');
	});
	
	// delegate to click on td.doclist-td-name
	// when chatter icon is clicked, show the modal box and load the relevant content
	$('body').delegate('td.doclist-td-name', 'click', function(e) {
		
		// check if the click is really on the .chatter-btn
		if(!$(this).hasClass('doclist-td-name')) return;
		
		//console.log($(this).attr('id').split('.')[2]);
		//console.log($(this).find('.doclist-content-wrapper').html());

		// if chatter_endpoint is blank, prompt for entry
		if(!appAPI.db.get('chatter_endpoint')) $('#chatter-endpoint-btn').click();
	
		// set iframe src to the visualforce page with DocumentID appended
		var _url = appAPI.db.get('chatter_endpoint') +'?DocumentID='+ $(this).attr('id').split('.')[2];
		
		// document title - shown inside the modal box
		var docTitle = $(this).find('.doclist-content-wrapper').html();
		
		// set loading message
		$('#modal-title-text').html(MESSAGES['chatter_loading']);
		
		// show the modal box
		$('#modal-wrapper').fadeIn('fast');
		
		// an ajax call to check if the user is logged in
		// salesforce doesn't allow the login page to be iframed
		// so user is asked to login on his/her own
		appAPI.request.get(_url, function(resp) {

			// if #newfeed element is there - it is not a login page
			if($(resp).find('#newfeed').length) { // so user is logged in
			
				// change #modal-title-text to title
				$('#modal-title-text').html(docTitle);
				
				// set iframe src
				$('#modal-body > iframe').attr('src', _url);
			} else { // user is not logged in - ask uthe ser to login
			
				// change #modal-title-text to login message 
				$('#modal-title-text').html(MESSAGES['chatter_login']);
				
				// set iframe src to blank page
				$('#modal-body > iframe').attr('src', '');
			}

		}, function(resp) {
			
		}); // end appAPI.request.get
		
		e.preventDefault(); // stop the default event behavior
	});

	// at defined interval insert the .chatter-btn (chatter button)
	// needed to rely on the interval as GDrive page changes a lot via JS
	setInterval(function() { 
		$('.chatter-btn').remove();
		$('.doclist-td-name').each(function() {
			$(this).prepend('<div class="chatter-btn">&nbsp;</div>');
		});
	}, 800);
	
	// listen to click #chatter-endpoint-btn
	// when the button is clicked, show the prompt box where user can change the endpoint
	// it is a nice feature, as user can switch between various salesforce accounts with just one plugin
	$('#chatter-endpoint-btn').on('click', function(e) {
		var _endpoint = prompt(MESSAGES['endpoint_prompt'], appAPI.db.get('chatter_endpoint'));
		if(_endpoint) appAPI.db.set('chatter_endpoint', _endpoint);
		
		e.preventDefault();
	});
	
	// if chatter_endpoint is blank, set is to the sample endpoint
	if(!appAPI.db.get('chatter_endpoint')) appAPI.db.set('chatter_endpoint', MESSAGES['endpoint_sample']);
});