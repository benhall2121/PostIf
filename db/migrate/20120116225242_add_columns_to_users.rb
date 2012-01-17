class AddColumnsToUsers < ActiveRecord::Migration
  def self.up
    add_column :users, :password_hash, :string
    add_column :users, :password_salt, :string
    add_column :users, :admin, :string
  end

  def self.down
    remove_column :users, :password_salt
    remove_column :users, :password_hash
    remove_column :users, :admin
  end
end
