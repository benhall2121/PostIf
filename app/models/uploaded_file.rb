class UploadedFile < ActiveRecord::Base
  has_attached_file :uploaded_file, :whiny => false,
  :url  => "/assets/uploaded_image/:id/:style/:basename.:extension",
  :path => ":rails_root/public/assets/uploaded_image/:id/:style/:basename.:extension"

  validates_attachment_size :uploaded_file, :less_than => 10.megabytes	
end
