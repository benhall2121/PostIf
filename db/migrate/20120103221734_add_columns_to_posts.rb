class AddColumnsToPosts < ActiveRecord::Migration
  def self.up
    add_column :posts, :password_hash, :string
    add_column :posts, :password_salt, :string
    add_column :posts, :status, :string
    add_column :posts, :email_me, :string
    add_column :posts, :expiration_date, :date, :default => Time.now+90.days
    add_column :posts, :flags, :int, :default => 0
  end

  def self.down
    remove_column :posts, :flags
    remove_column :posts, :expiration_date
    remove_column :posts, :email_me
    remove_column :posts, :status
    remove_column :posts, :password_salt
    remove_column :posts, :password_hash
  end
end
