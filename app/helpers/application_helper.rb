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
  
  def edit_page
    c = params[:controller]
    a = params[:action]
  	  
    if((c == "posts" && a == "edit"))
      return true
    else
      return false
    end

    return false
  end
  
  def show_ipaint
    c = params[:controller]
    a = params[:action]
    
    if((c == "posts" && a == "new") || (c == "posts" && a == "edit") || (c == "posts" && a == "show"))
      return true
    else
      return false
    end
  end
  
  def show_main_header_and_footer
    c = params[:controller]
    a = params[:action]
    
    if((c == "posts" && a == "show"))
      return false
    else
      return true
    end  
  end
	
end
