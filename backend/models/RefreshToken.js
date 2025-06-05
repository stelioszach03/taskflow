const mongoose = require('mongoose');
const crypto = require('crypto');

const RefreshTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expires: {
    type: Date,
    required: true
  },
  createdByIp: {
    type: String
  },
  revoked: {
    type: Date
  },
  revokedByIp: {
    type: String
  },
  replacedByToken: {
    type: String
  }
}, {
  timestamps: true
});

RefreshTokenSchema.virtual('isExpired').get(function() {
  return Date.now() >= this.expires;
});

RefreshTokenSchema.virtual('isActive').get(function() {
  return !this.revoked && !this.isExpired;
});

RefreshTokenSchema.statics.generateToken = function() {
  return crypto.randomBytes(40).toString('hex');
};

RefreshTokenSchema.methods.revoke = function(ip, replacedByToken = null) {
  this.revoked = Date.now();
  this.revokedByIp = ip;
  if (replacedByToken) {
    this.replacedByToken = replacedByToken;
  }
  return this.save();
};

// Clean up expired tokens
RefreshTokenSchema.statics.cleanupExpired = async function() {
  const expiredDate = new Date();
  expiredDate.setDate(expiredDate.getDate() - 7); // Keep revoked tokens for 7 days for audit
  
  await this.deleteMany({
    $or: [
      { expires: { $lt: Date.now() }, revoked: null },
      { revoked: { $lt: expiredDate } }
    ]
  });
};

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);