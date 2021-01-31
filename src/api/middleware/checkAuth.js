const jwt = require("jsonwebtoken")
const user = require("../../models/user")
require('dotenv/config')

module.exports =async (req,res,next) => {
  const token = req.header("auth-token")
  if(!token){
    res.status(401).send({
      message:"Auth Failed!"
    })
  }

  try{
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      req.user = decoded
      if(await user.findById(req.user._id)!==null){
        next();
      }
      else
      {
        res.status(403).send({
          message:"User not found!"
        }) 
      }
      
  }
  catch(error){
    console.error(error)
    return res.status(401).json({
      message: "Token Invalid!"
    })
  }
}
