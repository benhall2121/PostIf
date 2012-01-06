class RemoveDefaultForExpirationDateFromPosts < ActiveRecord::Migration
  def self.up
    change_table :posts do |t|
      t.change :expiration_date, :date, :default => nil
    end
  end

  def self.down
    change_table :posts do |t|
      t.change :expiration_date, :date, :default => Time.now+90.days
    end
  end
end
