import {readFile, writeFile} from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

// Import readFile and writeFile from 'fs/promises'. Write an async loadTasks() function that reads tasks.json and returns the parsed array — but wrap it in try/catch, because the file won't exist the first time you run the program. Check err.code === 'ENOENT' and return an empty array in that case instead of crashing. Then write a saveTasks(tasks) function that writes the array back with JSON.stringify(tasks, null, 2).

const _fileName = fileURLToPath(import.meta.url);
const _dirName = path.dirname(_fileName);
const DATA_FILE = path.join(_dirName, 'tasks.json')

console.log(DATA_FILE);


async function loadTasks() {
    try {
        const raw = await readFile(DATA_FILE, 'utf8');
        console.log('tasks loaded');
        console.log("raw: ",raw)
        return JSON.parse(raw);
    }
    catch(err) {
        if(err.code === 'ENOENT'){
            console.log("enoent");
            return [];
        } else {
            console.error("Error reading file ", DATA_FILE);
            throw err;
        }
    }
}

async function saveTasks(tasks) {
    try {
        await writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf8');
    }
    catch(err){
        console.error("Error writing to file ");
        throw err
    }
}


// 4. When command === 'add', load the existing tasks, build a new task object ({ id, description, done: false, createdAt }), figure out the next id (hint: one line either tracks a counter or does Math.max on existing ids), push it into the array, and save. Print a confirmation. Think about what should happen if someone runs 'add' with no description — decide what your program should do, then handle it.

//Getting next id for new task

function nextId(tasks){
    const ID = tasks.length === 0 ? 1 : Math.max(...tasks.map((t) => t.id)) + 1;
    return ID;
}

async function addTask(description) {
    if(!description){
        console.error("You have not given a description of your task");
        process.exitCode = 1;
        return 
    }

    const tasks = await loadTasks();

    const task = {
        id: nextId(tasks),
        description,
        done: false, 
        createdAt: new Date().toLocaleString()
    };
    console.log(task.id)

    tasks.push(task);
    await saveTasks(tasks);
    console.log(`New task ${task.id}: ${task.description} has been added`)
    
}

// 5. Load the tasks and print each one in a readable format, e.g. '[ ] #1 Buy groceries' or '[x] #2 Done thing'. Handle the empty case — what should print if there are no tasks yet? Optional stretch: support 'node index.js list done' and 'list pending' by reading args[0] as a filter.
async function readList(filter) {
    const tasks = await loadTasks();

    let filtered;

    if (filter === "done"){
        filtered = tasks.filter(t => t.done)
    }else if (filter === "pending") {
        filtered = tasks.filter(t => !t.done);
    } else {
        filtered = tasks;
    }

    if (filtered.length === 0) {
        console.log('Nothing to read here!');
        return;
    }else {
        for (const task of filtered) {
            const message = task.done ? `[x] #${task.id} ${task.description}` : `[ ] #${task.id} ${task.description}`;
            console.log(message)
        }
    }
}

// 6. Both need a task id from the command line — convert it with Number() and check Number.isInteger() before trusting it. For complete, find the matching task and set done = true, then save. For delete, use findIndex and splice to remove it, then save. Both should print a clear error if no task matches that id.

async function completeTask(argId) {
    const id = Number(argId);
    if (!Number.isInteger(id)) {
        console.log("You need to input a number");
        process.exitCode = 1;
        return;
    };

    const tasks = await loadTasks();
    const task = tasks.find(t => t.id === id);

    if(!task) {
        console.log("Task not found!");
        return;
    } else {
        task.done = true;
        await saveTasks(tasks);
        console.log(`Task #${id} has been completed`)
    }
};

async function deleteTask(argId) {
    const id = Number(argId);
    if(!Number.isInteger(id)){
        console.log('You have to input a number');
        process.exitCode = 1;
        return;
    }

    const tasks = await loadTasks();
    const taskToDelete = tasks.findIndex(task => task.id === id);

    if(taskToDelete === -1){
        console.error("Task id does not exist!");
        return;
    }

    const deleted = tasks.splice(taskToDelete, 1);
    await saveTasks(tasks);
    console.log(`Task ${id} has been deleted.`)
};

function printHelp() {
    console.log(`
  Task Tracker CLI
  
  Usage:
    node index.js add "<description>"     Add a new task
    node index.js list                    List all tasks (no filter)
    node index.js list [done|pending]     List all tasks (optionally filtered)
    node index.js complete <id>           Mark a task as done
    node index.js delete <id>             Delete a task
    node index.js help                    Show this help message
  `);
  }


// 7. Write a printHelp() function listing all commands and their usage. Then build the main dispatcher — a switch (or if/else chain) on the command that calls the right function, with a default case for unknown commands. Wrap the whole call in try/catch so an unexpected error doesn't dump a raw stack trace on the user.

async function main() {

    const [command, ...args] = process.argv.slice(2);

    try {
        switch (command) {
            case "delete":
                await deleteTask(args[0]);
                break;
            case "complete" : 
                await completeTask(args[0]);
                break;
            case "list" :
                await readList(args[0]);
                break;
            case "add" : 
                await addTask(args.join(" "));
                break;
            case "help" : 
            case undefined :
                printHelp();
                break;
            default : 
                console.error(`Unknown command at ${command}`);
                printHelp();
                process.exitCode = 1;
        }
    }catch(err) {
        console.error("Unknown Error: ", err);
        process.exitCode = 1;
    }
}

main();







