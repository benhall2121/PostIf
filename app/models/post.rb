class Post < ActiveRecord::Base
  attr_accessible :canvas_html, :url
  
  def self.search(search)
    puts "post model search"
    if search
      where('url = ?', "#{search}")
    else
      scoped
    end
    
  end
end
