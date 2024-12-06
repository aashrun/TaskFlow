const { Task } = require('../Models/taskModel')



//===============  Create a Task  ============//

const createTask = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required.' });
        }

        const task = new Task({ title, description });
        await task.save();

        return res.status(201).json({
            message: 'Task created successfully',
            task,
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message })
    }
};







//===========  Get All Tasks  ============//

const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find();
        return res.status(200).json(tasks);

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message })
    }
}



//===========  Update a Task  ============//

const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['pending', 'completed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value.' })
        }

        const task = await Task.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!task) {
            return res.status(404).json({ error: 'Task not found.' })
        }

        return res.status(200).json({
            message: 'Task updated successfully',
            task,
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message })
    }
}



//===========  Delete a Task  ============//

const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findByIdAndDelete(id);

        if (!task) {
            return res.status(404).json({ error: 'Task not found.' });
        }

        return res.status(200).json({ message: 'Task deleted successfully.' })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message })
    }
}




//========= Filter Tasks by Status  ==========//

const filterTasksByStatus = async (req, res) => {
    try {
        const { status } = req.params;

        if (!['pending', 'completed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value.' });
        }

        const tasks = await Task.find({ status });

        return res.status(200).json(tasks);

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message })
    }
}







module.exports = { createTask, getTasks, updateTask, deleteTask, filterTasksByStatus }