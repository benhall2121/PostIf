Postif::Application.routes.draw do
  resources :emails

  resources :feedbacks

  resources :users

  resources :posts
      
  match "home" => "posts#home", :as => "home"
  match "/post/reset_page" => "posts#reset_page", :as => "reset_page"
  
  match '/users/add_subscriber' => 'users#add_subscriber'
  match '/feedbacks/add_feedback' => 'feedbacks#add_feedback'
  match '/emails/add_email' => 'emails#add_email'
  
  root :to => "posts#new"
  match '/posts/create' => 'posts#create'
  get "search_post" => "posts#search_post", :as => "search_post"
  get 'secret/secret_test' => "posts#secret_test", :as => 'secret_test'
  match '/secret/check_secret' => "posts#check_secret", :as => 'check_secret'
  
  match '/:url' => 'posts#show'
end
