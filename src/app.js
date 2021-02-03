var express = require('express');
var path = require('path');
const cors = require('cors')
var cookieParser = require('cookie-parser');
var logger = require('morgan');


var app = express();

const userRoutes = require("./api/routes/user.js")
const projectRoutes = require("./api/routes/project")
// const meetingRoutes = require("./api/routes/meeting");


app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/user',userRoutes)
app.use('/project',projectRoutes)
// app.use('/meeting',meetingRoutes)

//error handling
app.use((err, req, res, next) => {
  console.log(err);
  if (typeof err == 'string') {
    return res.status(400).send({
      message: err,
    });
  }
  return res.status(400).send({
    message: err.message,
  });
});



module.exports = app;
