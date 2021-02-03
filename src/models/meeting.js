const mongoose = require('mongoose')


const MeetingSchema = mongoose.Schema(
  {
    roomName: {
      type: String,
      required: true,
      trim:true
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime:{
      type:Date,
      required: true
    },
    participants:[{
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }],
    momContent:{
      type: String
    }
  },{timestamps: true}
);



module.exports = mongoose.model("Meeting", MeetingSchema)