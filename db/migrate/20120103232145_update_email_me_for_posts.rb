class UpdateEmailMeForPosts < ActiveRecord::Migration
  def self.up
    change_table :posts do |t|
      t.change :email_me, :boolean
    end
  end

  def self.down
    change_table :posts do |t|
      t.change :email_me, :string
    end
  end
end
