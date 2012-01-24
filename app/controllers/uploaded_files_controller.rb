class UploadedFilesController < ApplicationController
  
  def show
    @uploaded_file = UploadedFile.find(params[:id])  
    	    
    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @post }
    end
  end
	
  def ajax_submit
    @uploaded_file = UploadedFile.new(params[:uploaded_file])
		
    if @uploaded_file.save
      render :json => @uploaded_file.id
    else
      render :json => nil
    end
  end
end
