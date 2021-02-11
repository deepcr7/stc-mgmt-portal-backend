const express= require("express");
const bodyParser = require('body-parser')
const router = express.Router();
const checkAuth = require('../middleware/checkAuth')

const meetingHandler = require('../handlers/meetingHandler')

//Meeting Routes

router.post('/createMeet',meetingHandler.saveRoomAndCreatorAndStartMeet)
router.post('/createMeet/endMeet',meetingHandler.changeMeetStatus)
router.get('/activeMeetings',meetingHandler.activeMeetDetails)
router.get('/joinMeet',meetingHandler.joinMeetForParticipants)
router.post('/joinMeet',meetingHandler.saveParticipantsAndStartMeet)
router.get('/meetDetails',meetingHandler.getSpecificMeetDetails)
router.post('/postMOM',meetingHandler.postmom)
router.get('/test',meetingHandler.test )

module.exports = router