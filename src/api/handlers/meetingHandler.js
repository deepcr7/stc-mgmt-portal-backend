const meetingModel = require('../../models/meeting');
const User = require("../../models/user")

async function saveRoomAndCreatorAndStartMeet (req,res){
    const roomname = req.body.roomName;
    const userID = req.user._id;
    
    let userData = await User.findById(userID);
    let name = await userData.name
    
    let meet = new meetingModel ({
                roomName : req.body.roomName,
                meetingStartedBy :  name,
                status : "active"
                });
    meet.save(function(err){
            if (err){
                res.send(err);
            }
            else{
                var hashedRoomName = Buffer.from(roomname).toString('base64');
                res.status(201).send( {roomValue: hashedRoomName, userid: userID, name:name});
                }
    })
}

async function changeMeetStatus (req,res){
    const  removeRoom = req.body.remove;
    var originalText = Buffer.from(removeRoom, 'base64').toString();
    //update status
    let meetingData = await  meetingModel.findOne({roomName:originalText})
    meetingData.status = "inactive"
    meetingData.save(function(err){
        if (err){
            res.send(err);
        }else{
            // res.send("meeting status of room name = " + originalText + " and hashed room name = " + req.body.remove + " changed to inactive");
            res.send({"message":"status chnaged to inactive"});
        }
    });  
}

function activeMeetDetails (req,res){
    meetingModel.find({}, function(err, data) {
        res.send({meetings: data});
    });
}

async function joinMeetForParticipants(req,res){
    let roomname = req.body.roomName;
    const userID = await req.user._id;
    let userData = await User.findById(userID);
    let ParticipantName = userData.name
    try {
        //update participants
        let meetingData = await  meetingModel.findOne({roomName: roomname});
        await meetingData.update({
            $push : {participants : {joinee : ParticipantName}}
        })
        .catch(err => console.log(err));  ;
        meetingData.save({new:true, upsert: true, timestamps:{createdAt:false, updatedAt:true}} ,function(err){
            if (err){
                res.send(err);
            }else{
                var hashedRoomName =Buffer.from(roomname).toString('base64');
                res.send({roomValue: hashedRoomName, joinedBy: ParticipantName});
            }
        });
        }  catch(err){
            console.error(err)
            res.status(500).send(err.message)
        }
}

async function getSpecificMeetDetails(req,res){
    let roomname = await req.query.roomName ;
    let data = await meetingModel.findOne({roomName: roomname})
    res.send({meetingData : data , roomname: roomname});
    };


async function postmom(req,res){
    const mom = await req.body.mom;
    const roomname = await req.body.roomName; 
    //update mom
    let meetingData = await  meetingModel.findOne({roomName: roomname});
    await meetingData.updateOne({
        $set : {MOM : mom}
    })
    .catch(err => console.log(err));  ;
    meetingData.save({new:true, upsert: true, timestamps:{createdAt:false, updatedAt:true}} ,function(err){
        if (err){
            res.send(err);
        }else{
            // res.send("mom saved!");
            res.send({"message" : "mom saved!" });
        }
    });
    
}


module.exports = {
    saveRoomAndCreatorAndStartMeet,
    changeMeetStatus,
    activeMeetDetails,
    joinMeetForParticipants,
    getSpecificMeetDetails,
    postmom
}