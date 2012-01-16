class PasswordResetsController < ApplicationController
  def create
    post = Post.find_by_url(params[:url])
    post.send_password_reset if post
    redirect_to root_url, :notice => "Email sent with password reset instructions."
  end

  def edit
    @post = Post.find_by_password_reset_token!(params[:id])
  end

  def update
    @post = Post.find_by_password_reset_token!(params[:id])
    if @post.password_reset_sent_at < 2.hours.ago
      redirect_to new_password_reset_path, :alert => "Password reset has expired."
    elsif @post.update_attributes(params[:post])
      redirect_to edut_post_path(@post), :notice => "Password has been reset!"
    else
      render :edit
    end
  end

end
