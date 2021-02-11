const meetingModel = require('../../models/meeting');

function saveRoomAndCreatorAndStartMeet (req,res){
    const roomname = req.body.roomName;
    const meetingStartedBy = req.body.displayName;
       
    let meet = new meetingModel ({
                roomName : req.body.roomName,
                meetingStartedBy :  req.body.displayName,
                status : "active"
                });
    meet.save()
    
    var hashedRoomName = Buffer.from(roomname).toString('base64');
    res.status(201).send( {roomValue: hashedRoomName, nameValue: meetingStartedBy});
}

async function changeMeetStatus (req,res){
    const  removeRoom = req.body.remove;
    var originalText = Buffer.from(removeRoom, 'base64').toString();
    //update status
    let meetingData = await  meetingModel.findOne({roomName:originalText})
    meetingData.status = "inactive"
    await meetingData.save();

    res.send("meeting status of room name = " + originalText + "and hashed room name = " + req.body.remove + "changed to inactive");
}

function activeMeetDetails (req,res){
    meetingModel.find({}, function(err, data) {
        res.send({meetings: data});
    });
}

function joinMeetForParticipants(req,res){
    let rname = req.query.mid ;
    res.send({roomName : rname});
}

async function saveParticipantsAndStartMeet(req,res){
    let roomname = req.body.roomName;
    let meetingJoinedBy = req.body.displayName;
    try {
        //update participants
        let meetingData = await  meetingModel.findOne({roomName: roomname});
        await meetingData.update({
            $push : {participants : {joinee : meetingJoinedBy}}
        })
        .catch(err => console.log(err));  ;
        meetingData.save();
        
        var hashedRoomName =Buffer.from(roomname).toString('base64');
        res.send({roomValue: hashedRoomName, nameValue: meetingJoinedBy});
        }  catch(err){
            console.error(err)
            res.status(500).send(err.message)
}
}

function getSpecificMeetDetails(req,res){
    let roomname = req.query.rname ;
    meetingModel.findOne({roomName: roomname}, function(err, data) {
        res.send({meetingData : data , roomname: roomname});
    });
}

async function postmom(req,res){
    const mom = await req.body.mom;
    const roomname = await req.body.roomName; 
    //update mom
    let meetingData = await  meetingModel.findOne({roomName: roomname});
    await meetingData.updateOne({
        $set : {MOM : mom}
    })
    .catch(err => console.log(err));  ;
    await meetingData.save();
    res.send("mom saved!")
}

function test (req,res){
    res.send("testing in process!!")
}

module.exports = {
    saveRoomAndCreatorAndStartMeet,
    changeMeetStatus,
    activeMeetDetails,
    joinMeetForParticipants,
    saveParticipantsAndStartMeet,
    getSpecificMeetDetails,
    postmom,
    test
  }
  