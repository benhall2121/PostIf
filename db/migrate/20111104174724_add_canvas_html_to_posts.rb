class AddCanvasHtmlToPosts < ActiveRecord::Migration
  def self.up
    add_column :posts, :canvas_html, :text
  end

  def self.down
    remove_column :posts, :canvas_html
  end
end
