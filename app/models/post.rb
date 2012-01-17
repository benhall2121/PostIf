class Post < ActiveRecord::Base
  attr_accessible :canvas_html, :url, :email_me, :password, :email, :status, :expiration_date, :user_id
  
  belongs_to :user
  
  attr_accessor :password
  before_save :encrypt_password
  
  def self.search(search)
    if search
      where('url = ? && status != "inactive"', "#{search}")
    else
      scoped
    end
  end
  
  def self.authenticate(url, password)
    post = find_by_url(url)
    if post && !post.password_salt.nil? && post.password_hash == BCrypt::Engine.hash_secret(password, post.password_salt)
      post
    else
      nil
    end
  end
  
  def encrypt_password
    if password.present?
      self.password_salt = BCrypt::Engine.generate_salt
      self.password_hash = BCrypt::Engine.hash_secret(password, password_salt)	
    end
  end
  
  def send_password_reset
    generate_token(:password_reset_token)
    self.password_reset_sent_at = Time.zone.now
    save!
    PostifMailer.password_reset(self).deliver
  end

  def generate_token(column)
    begin
      self[column] = SecureRandom.base64.tr("+/", "-_")
    end while Post.exists?(column => self[column])
  end
end
