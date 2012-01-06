class PostsController < ApplicationController
  skip_before_filter :require_secret, :only => [:check_secret, :secret_test, :create]
  # GET /posts
  # GET /posts.xml
  
  def secret_test
    respond_to do |format|
      format.html { render :layout => false }
    end
  end
  
   def check_secret
    if params[:secret] == 'postifMark'
      session[:secret_ok] = true
      redirect_to :root
    else
      flash[:error] = "Wrong secret. Try again."
      redirect_to secret_test_path
    end
  end
  
  def home
    render :layout => false	  
  end
  
  def reset_page  
    render '/posts/reset_page.html.erb', :layout => false
  end
  
  def open_page  
    render '/posts/open_page.html.erb', :layout => false
  end
  
  def edit_page  
  	  render '/posts/edit_page.html.erb', :layout => false
  end
  
  def save_page  
    render '/posts/save_page.html.erb', :layout => false
  end
  
  def post_page  
    render '/posts/post_page.html.erb', :layout => false
  end
  
  def share_page  
    render :layout => false
  end
  
  def renew_page  
    render :layout => false
  end
  
  def delete_page  
    render :layout => false
  end
  
  def flag_page  
    render '/posts/flag_page.html.erb', :layout => false
  end
  
  def index
    @posts = Post.all

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @posts }
    end
  end

  # GET /posts/1
  # GET /posts/1.xml
  def show
    if params[:canvas]
      @post = Post.new(:canvas_html => params[:canvas])
    elsif params[:url]
      @post = Post.find_by_url(params[:url])
    else  
      @post = Post.find(params[:id])
    end
    
    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @post }
    end
  end

  # GET /posts/new
  # GET /posts/new.xml
  def new
    if params[:url]
      @new_canvas = Post.find_by_url(params[:url])
      @post = Post.new(:canvas_html => @new_canvas.canvas_html)
    else
      @post = Post.new
    end
    @post.expiration_date = Time.now + 90.days

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @post }
    end
  end

  # GET /posts/1/edit
  def edit
    if params[:url]	  	  
      @post = Post.find_by_url(params[:url])
    else
      @post = Post.find(params[:id])
    end
    
  end
  
  def valid_password
    @auth = Post.authenticate(params[:url], params[:password])
    
    if(@auth)
      @post = Post.find_by_url(params[:url])
    else
      puts 'else'
      render '/posts/valid_password.js.erb'
    end
  end

  # POST /posts
  # POST /posts.xml
  def create
  	
    session[:secret_ok] = true
    
    @post = Post.new(params[:post])

    respond_to do |format|
      if @post.save
        format.html { redirect_to(@post, :notice => 'Post was successfully created.') }
        format.xml  { render :xml => @post, :status => :created, :location => @post }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @post.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /posts/1
  # PUT /posts/1.xml
  def update
    @post = Post.find(params[:id])

    respond_to do |format|
      if @post.update_attributes(params[:post])
        format.html { redirect_to(@post, :notice => 'Post was successfully updated.') }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @post.errors, :status => :unprocessable_entity }
      end
    end
  end
  
  def update_js
    @post = Post.find(params[:id])

    respond_to do |format|
      if @post.update_attributes(params[:post])
        format.html { redirect_to(@post, :notice => 'Post was successfully updated.') }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @post.errors, :status => :unprocessable_entity }
      end
    end
  end

  def search_post
    @posts = Post.search(params[:search])
  end
  
  def search_post_open
    @posts = Post.search(params[:search])
  end
  
  def search_post_is_url
    @posts = Post.search(params[:search])
  end
  
  def report_url
    @post = Post.find_by_url(params[:url])
    @post.flags += 1
    @post.save!
    
    render :nothing => true
  end
  
  # DELETE /posts/1
  # DELETE /posts/1.xml
  def destroy
    @post = Post.find(params[:id])
    @post.destroy

    respond_to do |format|
      format.html { redirect_to(posts_url) }
      format.xml  { head :ok }
    end
  end
end
