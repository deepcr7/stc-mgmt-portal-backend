const User = require('../../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
var otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer')



//signup function
async function signupFunction(req,res) {

  //firstly salt the hashing for the password
  //genSalt is math.pow(2, value)
  const salt = await bcrypt.genSalt(10);
  //hash the password
  hashedpassword = await bcrypt.hash(req.body.password, salt)

  const emailAlreadyExists = await User.findOne({email: req.body.email})


  if(emailAlreadyExists){
    res.status(400).send({message:"Email Already Exists!"})
  }
  const userData = {
    ...req.body,
    password: hashedpassword
  }

  var user = new User({
    ...userData
  })

  try{

    const userSignup = await user.save();
    const payload = {
      _id: userSignup._id
    }

    //creating jwt token
    jwt.sign(payload,process.env.JWT_KEY,(err,token) => {
      if(err){
        res.status(500).send(err);
      }
      res.status(201).send({
        message:"User has registered successfully!"
      })
    })
  } catch(err){
    res.status(400).send({
      message: err.message
    })
  }
}

//Login Function

async function loginFunction(req,res,next) {
  try{
  //check whether register number exists
  const userNameExists = await User.findOne({username: req.body.username})
  if(!userNameExists){
    res.status(400).send({
      message: "Username or Password is incorrect!"
    })
  }
  //compare the passwords
  const checkpassword = await bcrypt.compare(req.body.password, userNameExists.password)
  if(!checkpassword){
    res.status(403).send({
      message: "The Username or Password is incorrect!"
    })
  }
    // create token and add it to the header file
  const token = jwt.sign({_id:userNameExists.id},process.env.JWT_KEY)
  res.header('auth-token',token).json({
    Token:token,
    message:"You have successfully logged in!"
  })
} catch(err){
  res.status(400).send({
    message: err.message
  })
}
}

async function getUserFunction(req,res){
  try{
    const user = await User.findOne({_id:req.user._id})
    res.status(200).json({
      userDetails: user
    })
  } catch(err){
    res.status(400).send({
      message: "Error in finding the user!"
    })
  }
}



async function passwordReset(req,res,next){
 try{
  const user= await User.findOne({email:req.body.email})
  .then(async (user)=>{
   const otp= otpGenerator.generate(6, { upperCase: false, specialChars: false ,alphabets:false});
   if(user==null)
   res.status(401).send({message:"User not found!"})
   else
   {
     user.resetToken = otp;
   
     //5 minutes expiry time
     user.resetExpires=Date.now()+300000;

     await user.save();

 const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASSWORD 
      }
    });

      const mailOptions = {
      from: process.env.EMAIL_ID,
      to: req.body.email,
      subject: 'Password Reset',
      text: 'This is your OTP for Password Reset.\n ' + otp
    }

    transporter.sendMail(mailOptions, (err,information) => {
      if(err){
      console.log(err)
      res.status(400).send({
        message: "Error in sending Email!"
      }) }
      else {
        console.log('Email successfully sent!')
        res.status(200).send({
          message:"Email has been sent"
        })
      }
    })
  }
})
} catch(err){
  return res.status(500).send({
    message:err.message
  })
}
}

async function updatePassword(req,res,next){
  await User.findOne({resetToken:req.body.otp,resetExpires:{$gt:Date.now()}})
  .then(async (user)=>{
    console.log(user)
    if(!user){
      console.log('User not found!');
      res.status(401).send({message:"User Not Found/Incorrect OTP!"})
    }
    else{
      const salt = await bcrypt.genSalt(10);
  //hash the password
  hashedpassword = await bcrypt.hash(req.body.password, salt)

  user.password = hashedpassword;
  
    user.resetToken=null;


    await user.save();

      
      res.status(200).send({message:"Password Updated"});
    }
  })
  .catch((err)=>{
    return res.status(500).send(err);
  }
  )
}

module.exports ={
  signupFunction,
  loginFunction,
  getUserFunction,
  passwordReset,
  updatePassword
}