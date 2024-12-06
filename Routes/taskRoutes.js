const express = require('express');
const router = express.Router();
const { createTask, getTasks, updateTask, deleteTask, filterTasksByStatus } = require('../Controllers/taskController')


router.post("/tasks", createTask)

router.get("/tasks", getTasks)

router.put("/tasks/:id", updateTask)

router.delete("/tasks/:id", deleteTask)

router.delete("/tasks/status/:status", filterTasksByStatus)




//====================================  Invalid API  ==========================================//
router.all("/**", function (req, res) {
    res.status(404).send({
        message: "The api you requested is not available!"
    })
})




module.exports = router;