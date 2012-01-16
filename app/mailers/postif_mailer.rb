class PostifMailer < ActionMailer::Base
  default :from => "website@postif.com"
  
  def emailMe(email)
    @email = email
    
    mail(:to => @email.to, :from => @email.from, :subject => @email.subject)
  end
  
  def emailUser(email)
    @email = email
    
    mail(:to => @email.from, :subject => @email.subject)
  end
  
  def password_reset(post)
    @post = post
    mail :to => post.email, :subject => "Password Reset"
  end
  
end
