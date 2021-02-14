const express= require("express");
const router = express.Router();
const checkAuth = require('../middleware/checkAuth')

const userAuth = require('../handlers/userAuth')

//signup
router.post('/signup',userAuth.signupFunction)

//login
router.post('/login',userAuth.loginFunction)

//get user details
router.get('/getuser',checkAuth,userAuth.getUserFunction);

//reset password 
router.post('/resetpassword',userAuth.passwordReset);
router.put('/updatepassword',userAuth.updatePassword);

module.exports = router
