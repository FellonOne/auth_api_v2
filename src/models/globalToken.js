const mongoose = require('mongoose');

const {Schema} = mongoose;

const globalToken = new Schema({
  refresh_token: {
    required: true,
    type: String,
  },
  user_id: {
    require: true,
    type: Number,
  },
  full_name: {
    require: true,
    type: String,
  },
  roles_id: {
    require: true,
    type: Number,
  },
  login: {
    require: true,
    type: String,
  },
  uid: {
    require: true,
    type: String
  },
  active: {
    require: true,
    type: Boolean
  }
}, 
{ 
  timestamps: { createdAt: 'created_at' }
});

globalToken.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('GlobalToken', globalToken);


