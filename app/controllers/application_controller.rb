class ApplicationController < ActionController::Base
  helper_method :current_user
  #before_filter :require_secret
  protect_from_forgery
  
  def require_secret
    return true if session[:secret_ok] == true
    redirect_to secret_test_path
  end
  
  private

  def current_user
    @current_user ||= User.find(session[:user_id]) if session[:user_id]
  end
  
  def is_admin?
    if current_user
      return current_user.admin?
    else
      return false
    end	  
  end
  
  def admin_only
    return true if is_admin?
    redirect_to root_url
  end
  
end
