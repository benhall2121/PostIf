module ApplicationHelper

  def skip_layout
    c = params[:controller]
    a = params[:action]
  	  
=begin 
    if((c == "posts" && a == "reset_page"))
      return true
    else
      return false
    end
=end
    return false
  end
	
end
