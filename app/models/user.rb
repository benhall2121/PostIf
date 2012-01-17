class User < ActiveRecord::Base
  validates_uniqueness_of :email, :case_sensitive => false
  validates_presence_of :email
  
  has_many :posts
  
  attr_accessible :email, :password, :password_confirmation, :subscribed
  
  attr_accessor :password
  before_save :encrypt_password
  
  def self.authenticate(email, password)
    user = find_by_email(email)
    if user && user.password_hash == BCrypt::Engine.hash_secret(password, user.password_salt)
      user
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

end
