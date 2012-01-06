Postif::Application.routes.draw do
  resources :emails

  resources :feedbacks

  resources :users

  resources :posts
      
  match "home" => "posts#home", :as => "home"
  match "/post/reset_page" => "posts#reset_page", :as => "reset_page"
  match "/post/open_page" => "posts#open_page", :as => "open_page"
  match "/post/edit_page" => "posts#edit_page", :as => "edit_page"
  match "/post/save_page" => "posts#save_page", :as => "save_page"
  match "/post/post_page" => "posts#post_page", :as => "post_page"
  match "/post/share_page" => "posts#share_page", :as => "share_page"
  match "/post/renew_page" => "posts#renew_page", :as => "renew_page"
  match "/post/delete_page" => "posts#delete_page", :as => "delete_page"
  match "/post/post_name/:url/edit" => "posts#edit", :as => "post_name_edit"
  match "/post/preview/:canvas" => "posts#show", :as => "post_preview_show"
  match "/post/update_js/:id" => "posts#update_js", :as => "update_post"
  match "/post/valid_password" => "posts#valid_password", :as => "valid_password"
  match "/posts/edit" => "posts#edit", :as => "edit"
  match "/post/new_canvas/:url" => "posts#new", :as => "post_new_canvas"
  match "/post/report_url/:url" => "posts#report_url", :as => "report_url"
  match "/post/flag_page" => "posts#flag_page", :as => "flag_page"
  
  match '/users/add_subscriber' => 'users#add_subscriber'
  match '/feedbacks/add_feedback' => 'feedbacks#add_feedback'
  match '/emails/add_email' => 'emails#add_email'
  
  root :to => "posts#new"
  match '/posts/create' => 'posts#create'
  get "/post/search_post" => "posts#search_post", :as => "search_post"
  get "/post/search_post_open" => "posts#search_post_open", :as => "search_post_open"
  get "/post/search_post_is_url" => "posts#search_post_is_url", :as => "search_post_is_url"
  get 'secret/secret_test' => "posts#secret_test", :as => 'secret_test'
  match '/secret/check_secret' => "posts#check_secret", :as => 'check_secret'
  
  match '/:url' => 'posts#show'
end
