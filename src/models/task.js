const mongoose = require('mongoose')


const TaskSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim:true
    },
    type:{
      type:String,
      required:true
    },
    description: {
      type: String,
      trim:true
    },
    status:{
      type: String,
      required: true,
      trim:true,
      default:'To Do'
    },
    priority:{
      type:String,
      trim:true
    },
    projectId:{
      type:mongoose.Schema.Types.ObjectId,
      required: true,
      ref:'Project'
    },
    startDate:{
      type:Date,
      required:'Please enter a start date for this task!'
    },
    endDate:{
      type:Date,
      required:'Please enter an end date for this task!'
    },
    allottedUsers:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User"
    }]
  },{timestamps: true}
);

module.exports = mongoose.model("Task", TaskSchema)