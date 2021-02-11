const mongoose = require('mongoose')


const MeetingSchema = mongoose.Schema(
  {
    roomName: {
      type: String,
      required: true,
      trim:true
    },
    meetingStartedBy: {
      type: String,
      required: true,
      trim:true
    },
    status: {
      type: String,
      required: true,
      trim:true
    },
    participants: [
      {
        joinee : {
          type: String,
          required: true,
          trim:true
        }
      }
    ],
    MOM: {
      type: String
    }
  }
);



module.exports = mongoose.model("meeting", MeetingSchema)