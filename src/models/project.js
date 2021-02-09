const mongoose = require('mongoose')
const Task = require('./task');
const user = require('./user');


const ProjectSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim:true
    },
    creatorId:{
      type:mongoose.Schema.ObjectId,
      required:true,
      ref:"User"
    },
    description: {
      type: String,
      required: true
    },
    tasks:[{
      type:mongoose.Schema.Types.ObjectId,
      required: true,
      ref:"Task"
    }],
  accessId:{
      type:String,
      default: () => {
        var result = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 6);
        return result;
      }
    },
    startDate:{
      type:Date,
      required:'Please enter a start date for this project!',
      validate: [
        function () {
          return this.startDate > Date.now();
        },
        'Start date should not be in the past',
      ]
    },
    endDate:{
      type:Date,
      required:'Please enter an end date for this project!',
      validate: [
        function () {
          return this.endDate > this.startDate;
        },
        'End Date should be after start Date',
      ]
    },
    users:[{
      type:mongoose.Schema.ObjectId,
      ref:"User"
    }]
  },{timestamps: true}
);

//before deleting a project, delete all the tasks associated with it, we will not delete projects from user as it might be required to store them for later purposes

// ProjectSchema.pre("remove",async (next) => {
//   await Task.deleteMany({projectId: {$in: this.tasks}})
//   next();
// });

module.exports = mongoose.model("Project", ProjectSchema)