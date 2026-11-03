let tasks = [
    { id: 1, title: "Write the API skeleton", done: false, userId: 1 },
    { id: 2, title: "Add the logger middleware", done: true, userId: 1 }
];

let nextId = 3;

function listTasks(req, res) {
    res.status(200).json(tasks);
}

function getTask(req, res) {
    const id = Number(req.params.id);
    const task = tasks.find((t) => t.id === id);

    if (!task) {
        return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json(task);
}
function createTask(req, res) {
    const { title, done, userId } = req.body;

    if (typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({ error: "title is required" });
    }

    const task = {
        id: nextId,
        title: title,
        done: done === true,
        userId: userId ?? null
    };

    nextId = nextId + 1;
    tasks.push(task);

    res.status(201).location(`/tasks/${task.id}`).json(task);
}
function updateTask(req, res) {
    const id = Number(req.params.id);
    const index = tasks.findIndex((t) => t.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Task not found" });
    }

    const { title, done, userId } = req.body;

    if (typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({ error: "title is required" });
    }

    const replaced = {
        id: id,
        title: title,
        done: done === true,
        userId: userId ?? null
    };

    tasks[index] = replaced;

    res.status(200).json(replaced);
}
function deleteTask(req, res) {
    const id = Number(req.params.id);
    const index = tasks.findIndex((t) => t.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Task not found" });
    }

    tasks.splice(index, 1);

    res.status(204).end();
}
module.exports = { listTasks, getTask, createTask , updateTask, deleteTask};

