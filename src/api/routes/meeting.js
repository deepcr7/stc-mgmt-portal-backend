const express= require("express");
const bodyParser = require('body-parser')
const router = express.Router();
const checkAuth = require('../middleware/checkAuth')

const meetingHandler = require('../handlers/meetingHandler')

//Meeting Routes

router.post('/createMeet',checkAuth,meetingHandler.saveRoomAndCreatorAndStartMeet)
router.post('/createMeet/endMeet',checkAuth,meetingHandler.changeMeetStatus)
router.get('/activeMeetings',checkAuth,meetingHandler.activeMeetDetails)
router.get('/joinMeet',checkAuth,meetingHandler.joinMeetForParticipants)
router.get('/meetDetails',checkAuth,meetingHandler.getSpecificMeetDetails)
router.post('/postMOM',checkAuth,meetingHandler.postmom)
router.get('/test',checkAuth,meetingHandler.test )

module.exports = router