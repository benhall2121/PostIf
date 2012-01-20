class UploadedFilesController < ApplicationController
  def new
		puts 'new'
		puts 'new'
		puts 'new'
		puts 'new'
		puts 'new'
		puts 'new'
  end
  
  def create
		puts 'create'
		puts 'create'
		puts 'create'
		puts 'create'
		puts 'create'
		puts params[:uploaded_file]
		puts 'create'
		
		render :nothing => true
  end
end
