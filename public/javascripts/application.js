// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults

jQuery.ajaxSetup({ 
  'beforeSend': function(xhr) {xhr.setRequestHeader("Accept", "text/javascript")}
})


var redirect_to = ""

function setCookie(c_name,value,exdays){
  var exdate=new Date();
  exdate.setDate(exdate.getDate() + exdays);
  var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
  document.cookie=c_name + "=" + c_value;
}

function getCookie(c_name){
  var i,x,y,ARRcookies=document.cookie.split(";");
  for (i=0;i<ARRcookies.length;i++){
    x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
    y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
    x=x.replace(/^\s+|\s+$/g,"");
    if (x==c_name){
      return unescape(y);
    }
  }
}

function getDrawnHistory(){
    //Get history of how the canvas was drawn
    var s = window.localStorage.getItem("baseattr") + " :!: ";
    var nTotal = window.localStorage.getItem("totalentry");
    if ( nTotal ){
      nTotal = parseInt(nTotal,10);
    }else{
      nTotal = 0;
    }
    
    for ( i = 0; i < nTotal; i ++ ){
      s += window.localStorage.getItem("hist_" + i) + " :!: ";
    }
    //End Get history of how the canvas was drawn
    
    return s
}

function update_drawing(calling, status){
    var id = $("#post_id").val();
    var s = getDrawnHistory();
    
    $.post('/post/update_js/' + id, {post:{"canvas_html": s, "status": status }}, function(response) { 
      if(calling=="post"){
        var url = "/" + $('#post_url').val() + '?popup=true';
        window.open(url);    	    
      } else {
        alert("Your postif page has been saved.");    
      }
    });
}

$(document).ready(function() {	
		
  $("#calendar").datepicker({
    inline:true
  });
		
  $(".header_nav").fancybox();
  $(".pop").fancybox({
    onStart: function(){
    },
    onClosed: function(currentArray, currentIndex, currentOpts){
      if(redirect_to == 'feedback'){
        setTimeout(function(){$("#popFeedback").fancybox().trigger('click');},currentOpts.speedOut);
        redirect_to = ''
      }
    }
  });
  
  $('.note').click(function(){	 
    $('.tips_wrapper').hide();		  
    return false;
  });
  
  $(".save_without_popup").click(function(){
    update_drawing('save');	
    return false;
  });
  
  $(".preview_canvas").click(function(){
    var canvas = getDrawnHistory();
    var url = "/post/preview/" + encodeURI(canvas);
    window.open(url);
    return false;
  });
  
  $(".post_page").click(function(){
    var id = $("#post_id").val();
  		
    if(id == ''){
      alert("You have to save your page before you post it.");
      return false;	    
    }
    
    update_drawing("post","post");
    return false;
    
  });
  
  $("#search_post input").keyup(function() {
  		  
        url = $('#post_url').val().replace(/ /g,'');
        
        $('#post_url').val(url);
        
  	if(url == '' || url == '&nbsp;'){
  	  $('#url_ok').html('&nbsp;');	
  	  $('#url_ok').removeClass('light_red');		
  	  $('#url_ok').removeClass('light_green');
  	  $('#valid_url').val('false');
  	  return false;
  	}
  		
    $.get($("#search_post").attr("action"), $("#search_post").serialize(), null, "script");
    return false;
  });
  
  //Submit Subscribe
  $('#subscribe_submit_email').live('click',function(){
      var email_address = $('#subscribe_email_textfield_id').val();
      var email_address_again = $('#subscribe_email_textfield_id_again').val();
        
      if(email_address.indexOf("@") == -1){ 
        $('.subscribe_warning_message_div').html('Please enter a valid email address');
        return false;
      }
      
      if(email_address != email_address_again){ 
        $('.subscribe_warning_message_div').html('The email addresses you entered do not match. Please try again.');
        return false;
      }
  		
      $.post('/users/add_subscriber', {"email_address": email_address }, function(response) { 
        $('.subscribe_warning_message_div').html("Thanks for signing up! You'll hear from us soon");
        $('#subscribe_email_textfield_id').val('');
        $('#subscribe_email_textfield_id_again').val('');
      });
  });
  
  //Cancel Subscribe
  $("#subscribe_cancel_email").live('click',function(){
      $('#subscribe_email_textfield_id').val('');
      $('#subscribe_email_textfield_id_again').val('');
      $('.subscribe_warning_message_div').html("&nbsp");
      
      
      $.fancybox.close();
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
        
      //if(prev_tab == ''){
      //	$.fancybox.close();    
      //} else {
      //  new_tab(prev_tab);
      //}
  });
  
  //Cancel feedback
  $("#feedback_cancel").live('click',function(){
      $('#feedback_name_id').val('');
      $('#feedback_subject_id').val('');
      $('#feedback_message_id').val('');
     
      if(prev_tab == ''){
      	$.fancybox.close();    
      } else {
        new_tab(prev_tab);
      }
  });
  
  //Submit Email
  $("#email_submit").live('click',function(){
      var to = $('#email_to_id').val();
      var from = $('#email_from_id').val();
      var subject = $('#email_subject_id').val();
      var message = $('#email_message_id').val();
      var cc = $('#email_cc').is(':checked');
      
      if(to == '' || from == '' || subject == '' || message == ''){
        alert("All fields are required. Please fill out the rest of the form");
      	return false;      
      }
      
      $.post('/emails/add_email', {"email": {"to": to, "from": from, "subject": subject, "message": message}, "cc": cc }, 'script');
      $('#email_from_id').val('');
      $('#email_subject_id').val('');
      $('#email_message_id').val('');
      $('#email_cc').attr('checked', false);
      
      if(prev_tab == ''){
      	$.fancybox.close();    
      } else {
        new_tab(prev_tab);
      }
  });
  
  //Cancel Email
  $("#email_cancel").live('click',function(){
      $('#email_from_id').val('');
      $('#email_subject_id').val('');
      $('#email_message_id').val('');
      $('#email_cc').attr('checked', false);
      
      if(prev_tab == ''){
      	$.fancybox.close();    
      } else {
        new_tab(prev_tab);
      }
  });
  
});

$(window).load(function () {	
    var showPopUp = getCookie('show_PopUp'); 
    var showTips = getCookie('show_Tips'); 
    
    if(showPopUp != 'true'){
      setCookie('show_PopUp', 'true21', '3');  
      $("#popHome").fancybox().trigger('click');
    }	
    
    if(showTips != 'true'){
      setCookie('show_Tips', 'true', '3');  
      $('.tips_wrapper').show();
    }
});


