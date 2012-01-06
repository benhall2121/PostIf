class ChangeCanvasHtmlToBlob < ActiveRecord::Migration
   def self.up
    change_table :posts do |t|
      t.change :canvas_html, :blob
    end
  end

  def self.down
    change_table :posts do |t|
      t.change :canvas_html, :text
    end
  end
end
