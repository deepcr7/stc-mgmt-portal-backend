const express= require("express");
const router = express.Router();
const checkAuth = require('../middleware/checkAuth')

const projectHandler = require('../handlers/projectHandler')
const taskHandler = require('../handlers/projectHandler')

//Project Routes

router.post('/addproject',checkAuth,projectHandler.addProject)
router.get('/getproject',checkAuth,projectHandler.getSpecificProject)
router.get('/getallprojects',checkAuth,projectHandler.getAllProjects)
router.delete('/deleteproject/:projectId',checkAuth,projectHandler.deleteProject)
router.post('/updateproject/:projectId/:creatorId',checkAuth,projectHandler.updateProject)
router.post('/searchproject',checkAuth,projectHandler.searchProjectwithAccessId)

//Task Routes

router.post('/addtask',checkAuth,taskHandler.addTask)
router.get('/getspecifictask',checkAuth,taskHandler.getSpecificTask)
router.get('/getalltasks',checkAuth,taskHandler.getAllTasksForUser)
router.delete('/deletetask/:taskId/:projectId',checkAuth,taskHandler.deleteTask)
router.post('/updatetask/:taskId',checkAuth,taskHandler.updateTask);


module.exports = router

