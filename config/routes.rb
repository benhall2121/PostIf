Postif::Application.routes.draw do
  resources :posts
      
  match "home" => "posts#home", :as => "home"
  
  root :to => "posts#new"
end
