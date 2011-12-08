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
  
  //Submit Subscribe
  $('#subscribe_submit_email').live('click',function(){
      var email_address = $('#subscribe_email_textfield_id').val();
      
        
      if(email_address.indexOf("@") == -1){ 
        $('.subscribe_warning_message_div').html('Please enter a valid email address');
        return false;
      }
  		
      $.post('/users/add_subscriber', {"email_address": email_address }, function(response) { 
        $('.subscribe_warning_message_div').html("Thanks for signing up! You'll hear from us soon");
        $('#subscribe_email_textfield_id').val('');
      });
  });
  
  //Submit feedback
  $("#feedback_submit").live('click',function(){
      var name = $('#feedback_name_id').val();
      var subject = $('#feedback_subject_id').val();
      var message = $('#feedback_message_id').val();
  
      if(name == '' || subject == '' || message == ''){
        alert("All fields are required. Please fill out the rest of the form");
      	return false;      
      }
      
      $.post('/feedbacks/add_feedback', {"feedback": {"name": name, "subject": subject, "message": message} }, 'script');
      $('#feedback_name_id').val('');
        $('#feedback_subject_id').val('');
        $('#feedback_message_id').val('');
  });
  
  //Cancel feedback
  $("#feedback_cancel").live('click',function(){
      $('#feedback_name_id').val('');
      $('#feedback_subject_id').val('');
      $('#feedback_message_id').val('');
  });
  
  //Submit Email
  $("#email_submit").live('click',function(){
      var to = $('#email_to_id').val();
      var from = $('#email_from_id').val();
      var subject = $('#email_subject_id').val();
      var message = $('#email_message_id').val();
  
      if(name == '' || subject == '' || message == ''){
        alert("All fields are required. Please fill out the rest of the form");
      	return false;      
      }
      
      $.post('/emails/add_email', {"email": {"to": to, "from": from, "subject": subject, "message": message} }, 'script');
      $('#email_from_id').val('');
      $('#email_subject_id').val('');
      $('#email_message_id').val('');
  });
  
  //Cancel Email
  $("#email_cancel").live('click',function(){
      $('#email_from_id').val('');
      $('#email_subject_id').val('');
      $('#email_message_id').val('');
  });
  
});




