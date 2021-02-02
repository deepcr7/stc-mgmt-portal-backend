const User = require('../../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')



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

module.exports ={
  signupFunction,
  loginFunction,
  getUserFunction
}