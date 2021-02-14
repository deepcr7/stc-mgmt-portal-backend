const mongoose = require('mongoose')


const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim:true
    },
    username:{
      type: String,
      required: true,
      unique: true,
      trim:true
    },
    password: {
      type: String,
      required: true,
      trim:true,
      minlength:8
    },
    email:{
      type:String,
      required: true,
      unique: true,
      validate: [
        function(v) {
          var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return re.test(v)
      },
        'Please enter a valid Email ID',
      ]
    },
  regId:{
      type:String,
      default: () => {
        var result = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
        return result;
      }
    },
    projects:[{
      type:mongoose.Schema.Types.ObjectId,ref:'Project'
    }],
    role:{
      type:String,
      enum:['Admin','User'],
      default:'User'
    },
    githubLink: {
      type: String,
      validate: [
        function(v) {
          var re = /^https?:\/\/github.com\/[^\/]*\/?$/;
          return re.test(v)
      },
        'Please enter a valid GitHub Link',
      ],
    },
    resetToken:{
      type:String
    },
    resetExpires:{
      type:Date
    }
    /*userImage: {
      type: String,
      required: true,
      validate: /^data:image\/[^;]+;base64[^"]+$/
    },*/
  },{timestamps: true}
);

module.exports = mongoose.model('User', UserSchema)