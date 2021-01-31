const Project = require("../../models/project")
const Task = require("../../models/task")
const User = require("../../models/user")

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
    await project.save((err,data) => {
      
      var users = req.body.users;

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
    });
    return res.status(201).send(project);
  } catch(err){
    console.error(err)
    res.status(500).send({
      message:"Error"
    })
  }
}

//get a specific project(everyone is allowed to see the data in this)

async function getSpecificProject(req,res) {

  try{
    let project = await Project.findOne({_id:req.query.projectId}).populate("tasks");

    if(!project){
      return res.status(404).send({
        message:"Project does not exist!"
      })
    }

    return res.status(200).send(project)

  } catch(err){
    return res.status(500).send({
      message:"Error"
    })
  }

}

//get all projects for a particular user

async function getAllProjects(req,res){
  try{
    let projects = await Project.find({users:req.user._id}).sort({createdAt:'desc'}).limit(5)

    if(!projects){
      return res.status(400).send({message:"No Projects found!"})
    }
    return res.status(200).send(projects)
  } catch(err){
    return res.status(500).send({
      message:"Error!"
    })
  }
}

//delete a project

async function deleteProject(req,res) {
  try{
    await Project.findByIdAndRemove(req.params.projectId);

    return res.status(200).send({message:"Project has been deleted!"})
  } catch(err){
    return res.status(500).send({
      message:"Error!"
    })
  }
}

//edit the project(given permission only to creator)

async function updateProject(req,res) {
try{
 let project = await Project.findOneAndUpdate({_id:req.params.projectId,creatorId:req.params.creatorId},req.body,{new:true})

 if(!project){
   return res.status(403).send({message:"Invalid Request!"})
 }
 return res.status(200).send(project)
}
catch(err){
  return res.status(500).send({
    message:"Error!"
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
        message:"No Project Found"
      })
    }
    const taskData = {
      ...req.body
    }
    const task = new Task({
      ...taskData
    });

    await task.save();
    await project.tasks.push(task._id)
    await project.save();

    return res.status(201).send({message:"Task has been added!"})

  } catch(err){
    return res.status(500).send({
      message:"Error!"
    })
  }
}


//get a particular task

async function getSpecificTask(req,res) {

  try{
    let task = await Project.findOne({_id:req.query.taskId})

    if(!task){
      return res.status(404).send({
        message:"Task does not exist!"
      })
    }

    return res.status(200).send(task)

  } catch(err){
    return res.status(500).send({
      message:"Error"
    })
  }

}

//get all the tasks for a particular user

async function getAllTasksForUser(req,res){
    try{
      let tasks = await Task.find({allotedUsers:req.user._id}).sort({createdAt:'desc'}).limit(5)
  
      if(!tasks){
        return res.status(400).send({message:"No Tasks found!"})
      }
      return res.status(200).send(tasks)
    } catch(err){
      return res.status(500).send({
        message:"Error!"
      })
    }
}

//delete a task

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
    return res.status(500).send({
      message:"Error"
    })
  }
}

//update a task
async function updateTask(req,res){
  let{taskId} = req.params
  let {title,type,status,priority,description,allotedUsers,startDate,endDate} = req.body;

  try{
    let task = await Task.findById(taskId)

    if(!task){
      res.status(400).send({
        message:"Task to be updated not found!"
      })
    }
    task.title = title;
    task.type = type;
    task.status = status;
    task.priority = priority,
    task.description = description,
    task.allotedUsers = allotedUsers,
    task.startDate = startDate,
    task.endDate = endDate
    await task.save();
    res.status(200).send(task)
  } catch(err){
    res.status(500).send({
      message:"Error"
    })
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
  updateTask
}
