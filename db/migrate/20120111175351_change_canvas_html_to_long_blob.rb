class ChangeCanvasHtmlToLongBlob < ActiveRecord::Migration
   def self.up
    change_table :posts do |t|
      t.change :canvas_html, :longblob
    end
  end

  def self.down
    change_table :posts do |t|
      t.change :canvas_html, :blob
    end
  end
end
