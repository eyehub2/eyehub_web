// const mongoose = require('mongoose');

// const agentSchema = new mongoose.Schema({
//   agentType: {
//     type: String,
//     required: true
//   },
//   agentUserName: { type: String, required: true },
//   agentPassword: { type: String,   default: '123456' },
// //   agentName: { type: String, required: true },
// //   agentSurname: { type: String, required: true },
// //   agentTCKN: { type: String, default: '' },
// //   agentAddress: { type: String, default: '' },
// //   agentPhone: { type: String, default: '' },
// //   agentEmail: { type: String, default: '' },
// //   agentIBAN: { type: String, default: '' },
// //   agentTotalSalesAmount: { type: Number, default: 0 },
// //   totalEarnedFromNetwork: { type: Number, default: 0 },
// //   totalDirectSalesAmount: { type: Number, default: 0 },
// //   totalAmountPaid: { type: Number, default: 0 },
// //   totalRemainingAmount: { type: Number, default: 0 },
// //   date: { type: Date, default: Date.now },
// //   totalExpenditure: { type: Number, default: 0 },
// //   commissionPercentage: { type: Number, default: 30 },
// //   parentAgentName: { type: String, default: '' },
// //   agentStatus: { type: String, default: 'new' },
// });

// const Agent = mongoose.model('agents', agentSchema);

// module.exports = Agent;

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {type:String, required:true},
  password: {type:String, default:"123456"},
  email: {type: String, default: '',},
  birthday:{type:Date, default:''},
  gender:{type:String, default:''},
  location:{type:String, default:'Istanbul/Turkey'},
  subscription_start_date:{type:Date,default:Date.now},
  subscription_end_date:{type:Date}
});

const User = mongoose.model('User', userSchema);
module.exports = User;
