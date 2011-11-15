Postif::Application.routes.draw do
  resources :posts
      
  match "home" => "posts#home", :as => "home"
  
  root :to => "posts#new"
  match '/posts/create' => 'posts#create'
  get "search_post" => "posts#search_post", :as => "search_post"
  match '/:url' => 'posts#show'
  get 'secret/secret_test' => "posts#secret_test", :as => 'secret_test'
  match '/secret/check_secret' => "posts#check_secret", :as => 'check_secret'
  
end
