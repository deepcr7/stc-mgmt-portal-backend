const Project = require("../../models/project")
const Task = require("../../models/task")
const User = require("../../models/user")
const mongoose = require('mongoose')

//add a Project
async function addProject(req,res){
  const projectData = {
    ...req.body,
    creatorId:req.user._id
  };
  try {
    const project = new Project({
      ...projectData
    });
    var users = req.body.users;

    let flag =0;
    //check if users exist
    for await (const user of users){
      let userData = await User.findById(user);
      if(!userData){
        flag++
      }
      console.log(userData)
      console.log(flag)
    }

    if(flag > 0){
      return res.status(404).send({
        message: flag + " user/users are not valid!"
      })
    } else if(flag == 0){
      var data = await project.save();
      //update users projects 
      for(var i =0;i<users.length; i++){
        User.findOneAndUpdate({_id:users[i]},{$push:{projects:data._id}},{safe: true, upsert: true},(err) => {
         if (err) res.status(500).send(err);
       })
     }
     
     //update creators projects 
      User.findOneAndUpdate({_id: req.user._id || req.body.creatorId},{$push: { projects: data._id}},{safe:true, upsert: true}, (err) => {
       if(err) res.status(500).send(err)
     })
   return res.status(201).send(project);
    }

       
  } catch(err){
    console.error(err)
    res.status(500).json(err.message)
  }
}

//get a specific project(everyone is allowed to see the data in this) (debatable route)

async function getSpecificProject(req,res) {

  try{

    let project = await Project.find( {
      $and : [
               { 
                 $or : [ {'users':{$in:[req.user._id]}},{'creatorId':req.user._id} ]
               },
               { 
                 "_id":req.query.projectId
               }
             ]
    } ).populate({path:'tasks',
    populate:[{
      path:'allottedUsers'
    }]
  })
    console.log(project)
    if(project.length === 0){
      return res.status(404).send({
        message:"Project does not exist or you dont have access to this!"
      })
    }
    return res.status(200).send(project)
  } catch(err){
    return res.status(500).json(err.message)
  }

}

//get all projects for a particular user (side tab and right tab)

async function getAllProjects(req,res){
  try{
    let projects = await Project.find( { $or:[ {'users':req.user._id},{'creatorId':req.user._id} ]}).sort({createdAt:'desc'}).limit(5).populate({path:'tasks',
    populate:[{
      path:'allottedUsers'
    }]
  })
    
    if(projects.length === 0){
      return res.status(400).send({message:"No Projects found!"})
    }
    return res.status(200).send(projects)
  } catch(err){
    return res.status(500).json(err.message)
  }
}

//delete a project
async function deleteProject(req,res) {
  try{
    let {projectId} = req.params
    let project = await Project.findById(projectId)

    if(req.user._id == project.creatorId){
    await Project.findByIdAndRemove(projectId);

    await Task.findOneAndDelete({projectId: {$in:projectId}})

    let user = await User.findOne({projects:{$in:projectId}})

    user.projects = user.projects.filter(projectId => projectId !== project._id)

    return res.status(200).send({message:"Project has been deleted!"})
    } else{
      return res.status(403).send({
        message:"You do not have the rights to delete this project!"
      })
    }
  } catch(err){
    return res.status(500).json(err.message)
  }
}

//edit the project(given permission only to creator)

async function updateProject(req,res) {
try{
  // let {title,description,startDate,endDate,users,tasks} = req.body
 
 let project = await Project.findOne({_id:req.params.projectId,creatorId:req.user._id})

 if(!project){
  return res.status(403).send({
    message:"Project does not exist or you do not have enough rights to modify the project!"
  })
 }
    // project.title = req.body.title;
    // project.description = req.body.description;
    // project.startDate = req.body.startDate;
    // project.endDate = req.body.endDate;
    // project.users = req.body.users;
    // project.tasks = req.body.tasks;

    
    Object.keys(req.body).forEach((key) => {
      if(key == "users"){
        return;
      }
      project[key] = req.body[key];
    });
    if(req.body.users){

      var flag= 0;
      for await (const user of req.body.users){
        console.log(typeof((user)))
        console.log(user)
        
        let userData = await User.findById(user)
      if(!userData){
        flag++
      }
      console.log(userData)
      console.log(flag)
    }
      
      if(flag == 0){
         await project.users.push((req.body.users))
        await project.save();
        console.log(project)
      } else {
        return res.status(403).send({
          message: flag + 'user/users do not exist!'
        })
      }
      
  }
     else if(!req.body.users){
      await project.save();
    }
    return res.status(200).send(project)
 }
catch(err){
  return res.status(500).json({
    message: err
  })
}
} 

//search for a project with its unique access code

async function searchProjectwithAccessId(req,res){
  try{
    let project = Project.findOne({accessId:req.query.accessId}).populate({path:'tasks',
    populate:[{
      path:'allottedUsers'
    }]
  })
    if(!project){
      return res.status(404).send({
        message:"No Project Found!"
      })
    }
    return res.status(200).send(project)
  }
  catch(err){
    return res.status(500).send({
      message:"Error"
    })
  }
}

//Add a Task

async function addTask(req,res){
  try{
    let project = await Project.findOne({
      _id:req.body.projectId,
      creatorId: req.user._id
    })

    if(!project){
      return res.status(400).send({
        message:"No Project Found or you dont have the rights to this project!"
      })
    }
    const taskData = {
      ...req.body
    }
  let usersAllotted = taskData.allottedUsers
  console.log(usersAllotted)
    let flag =0;
    //check if users exist
    for await (const user of usersAllotted){
      let userData = await Project.find({users:{$in:[user]}})
      if(userData.length == 0){
        flag++
      }
      console.log(userData)
      console.log(flag)
    }

    if(flag > 0){
      return res.status(404).send({
        message: flag + " user/users of the allotted users are not valid!"
      })
    } else if(flag == 0){
      if(taskData.startDate < project.startDate || taskData.startDate> project.endDate){
      return res.status(400).send({
        message:"The Start Date of a Task cannot be before the Project's Start Date or after the Projects End Date!"
      })
    }


    const task = new Task({
      ...taskData
    }).populate('allottedUsers');

    await task.save();
    await project.tasks.push(task._id)
    await project.save();

    return res.status(201).send(task)
  }    
  } catch(err){
    return res.status(500).json(err.message)
  }
}

//get a particular task(on clicking on plus button for a task)

async function getSpecificTask(req,res) {

  try{
    let user = await User.findById(req.user._id)
    if(!user){
      return res.status(404).send({
        message:"User Not Found!"
      })
    }

    let task = await Task.findOne({_id:req.query.taskId,allottedUsers:req.user._id}).populate('allottedUsers')
    
    // .populate([{path:'allottedUsers'},{path:'projectId'}])
console.log(task)
    if(!task){
      return res.status(404).send({
        message:"Task does not exist or you do not have the rights to view this!"
      })
    }

    return res.status(200).send(task)

  } catch(err){
    return res.status(500).json(err.message)
  }

}

//get all the tasks for a particular user in that project(on clicking the users icon)

async function getAllTasksForUser(req,res){
    try{
      let tasks = await Task.find({projectId:req.query.projectId,allottedUsers:req.user._id}).sort({createdAt:'desc'}).limit(5).populate('projectId')
  
      if(tasks.length === 0){
        return res.status(400).send({message:"No Tasks found!"})
      }
      return res.status(200).send(tasks)
    } catch(err){
      return res.status(500).json(err.message)
    }
}

//delete a task(only creator can delete it)

async function deleteTask(req,res){
  let {taskId} = req.params;

  try{
    let project = await Project.findOne({_id:req.params.projectId,creatorId:req.user._id});

    console.log(project)

    if(!project){
      return res.status(400).send({
        message:"No Project Exists for these details!"
      })
    }

    let task = await Task.findByIdAndDelete(taskId)
    console.log(task)

    project.tasks = project.tasks.filter(taskId => taskId !== task._id)

    await project.save();

    return res.status(200).send({message:"Task has been deleted!"})
  } catch(err){
    return res.status(500).json(err.message)
  }
}

//update a task
async function updateTask(req,res){
  let{taskId} = req.params
  // let {title,type,status,priority,description,allottedUsers,startDate,endDate} = req.body;

  try{
    let task = await Task.findById(taskId)

    if(!task){
      res.status(400).send({
        message:"Task to be updated not found!"
      })
    }
    // task.title = title;
    // task.type = type;
    // task.status = status;
    // task.priority = priority;
    // task.description = description;
    // task.allottedUsers = allottedUsers;
    // task.startDate = startDate;
    // task.endDate = endDate;
    // Object.keys(req.body).forEach((key) => {
    //   task[key] = req.body[key];
    // });
    // await task.save();
    // res.status(200).send(task)

    Object.keys(req.body).forEach((key) => {
      if(key == "allottedUsers"){
        return;
      }
      task[key] = req.body[key];
    });
    let projectData = await Project.findOne({creatorId:req.user._id,_id:req.params.projectId})
    console.log(projectData)
    if(req.body.allottedUsers){
      //check if the user is the creator of the project
      if(!projectData){
    return res.status(403).send({message:"You do not have the rights to alter users!"})        
      }
      //check if the users to be added exist
      var flag =0;
      for await (const user of req.body.allottedUsers){
        //check if the user is a part of the project
        let projectAccess = await Project.findOne({users: mongoose.Types.ObjectId(user)})

      if(!projectAccess){
        flag++
      }
      console.log(projectAccess)
      console.log(flag)
    }
      
      if(flag == 0){
        await task.allottedUsers.push(req.body.allottedUsers)
        await task.save();
      } else {
        return res.status(403).send({
          message:flag + " user/users do not exist in the project!"
        })
      }
      
  }
     else if(!req.body.allottedUsers){
      await task.save();
    }
    return res.status(200).send(task)
  } catch(err){
    res.status(500).json(err.message)
  }
}


module.exports = {
  addProject,
  getSpecificProject,
  getAllProjects,
  deleteProject,
  updateProject,
  addTask,
  getSpecificTask,
  getAllTasksForUser,
  deleteTask,
  updateTask,
  searchProjectwithAccessId
}
