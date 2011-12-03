// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults
jQuery.ajaxSetup({ 
  'beforeSend': function(xhr) {xhr.setRequestHeader("Accept", "text/javascript")}
})

$(window).load(function () {
			
  $("#popHome").fancybox().trigger('click');
});

$(document).ready(function() {	
		$(".header_nav").fancybox({
		  
		});
  
  $(".save_canvas").click(function(){
  	aa = $('canvas#ipaint_frame_canvas').get();
	canvas_html=aa[0].toDataURL('image/png');	
  	url = $('#post_url').val();
  	
      $.post('/posts/create', {post:{"canvas_html": canvas_html, "url": url }}, function(response) { 
        //$('.test_div').html("Thanks");
      });
  });
  
  
  $("#search_post input").keyup(function() {
    $.get($("#search_post").attr("action"), $("#search_post").serialize(), null, "script");
    return false;
  });
  
});




