class ApplicationController < ActionController::Base
  before_filter :require_secret
  protect_from_forgery
  
  def require_secret
  	  puts "require secret"
  	  puts session[:secret_ok]
    return true if session[:secret_ok] == true
    redirect_to secret_test_path
  end
end
