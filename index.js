const url = `http://localhost:3000`
const contentContainer = document.querySelector('div#content-container')
const taskDiv = document.querySelector(`div#task-card`)
const hideTaskDiv = document.querySelector('#hide-task')
const hideNewOrgDiv = document.querySelector('#hide-new-form')
const newOrgForm = document.querySelector("form#new-org-form")
const editTaskDiv = taskDiv.querySelector(`div#edit-task-div`)
const editTaskForm = taskDiv.querySelector(`form#edit-task-form`)
const newTaskDiv = document.querySelector(`div#new-task-div`)
const newTaskForm = document.querySelector(`form#new-task-form`)



const loadUser = id =>{
    fetch(`${url}/users/${id}`)
        .then(resp => resp.json())
        .then(user => populatePage(user))
    loadOrgForm()
}

const populatePage = userObj =>{
    populateAside(userObj)
}

const populateAside = userObj => {
    document.querySelector(`p#name`).textContent = userObj.name
    document.querySelector(`p#username`).textContent = userObj.username
    userObj.organizations.forEach(org => {addOrgToAside(org)});
}

const addOrgToAside = org => {
    const orgList = document.querySelector(`div#my-organizations ul`)
    const li = document.createElement('li')
        li.innerHTML = `<h4>${org.name}</h4>`
        orgList.append(li)
        li.dataset.id = org.id
        clickOrg(li)
}

const clickOrg = li => {
    li.addEventListener('click', () =>{
        fetch(`${url}/organizations/${li.dataset.id}`)
            .then(resp => resp.json())
            .then(org => displayOrg(org))
    })
}

const displayOrg = org => {
    contentContainer.querySelectorAll('*').forEach(n => n.remove());
    if(org.lists.length >= 1){
        org.lists.forEach(list => {contentContainer.append(showList(list))})
    }
}

const showList = list =>{
    const div = document.createElement('div')
        div.dataset.id = list.id
        div.classList.add('list')
        div.innerHTML = `<div>
                    <h3>${list.title}</h3>
                    <ul></ul>
                </div>`
        list.taskcards.forEach(task => addTaskCard(task, div))
        const createTaskBtn = document.createElement('button')
        newTask(createTaskBtn, div)
        const ul = div.querySelector('ul').parentElement.append(createTaskBtn)
        
        
        
    return div
}

const addTaskCard = (task, div) => {
    const card = document.createElement('li')
            card.dataset.id = task.id
            card.innerHTML = `<h4>${task.title}</h4>`
            const ul = div.querySelector('ul').append(card)
            clickTask(card)
            
}
const clickTask = card => {
    card.addEventListener(`click`, function(event){
        const mytask = getTaskInfo(parseInt(event.currentTarget.dataset.id))
        hideTaskDiv.style="display:block"
        hideTask()
    })
}

const getTaskInfo = id => {
        fetch(`${url}/taskcards/${id}`)
        .then(resp => resp.json())
        .then(task => {
            displayTaskInfo(task)   
            editTask()
            deleteTask()
        })
}

const displayTaskInfo = task =>{
    const taskInfo = taskDiv.querySelector('div#task-info')
    taskInfo.dataset.id = task.id
    taskInfo.innerHTML = `<h2>${task.title}</h2>
            <h3 class="created">Date Created: ${task["date_created"]}</h3>
            <h3 class = "due">Date Due: ${task["deadline"]}</h3>
            <p>Description: ${task.description}</p>
            <button id="edit-task-btn">Update Task</button>
            <button id="delete-task-btn">Delete Task</button>`
    editTaskForm.dataset.id = task.id
}

const hideTask = () =>{
    hideTaskDiv.addEventListener('click', function(event){
        if(event.target.dataset.action === "close"){
            hideTaskDiv.style="display:none"
            editTaskDiv.style="display:none"
        }
    })
}

const loadOrgForm = () => {
    const bttn = document.querySelector(`#new-org`)
    bttn.addEventListener('click', function(event){
        hideNewOrgDiv.style ="display:block"
        hideNewOrgForm()
        submitNewOrgForm()
    })
}

const hideNewOrgForm = () => {
    hideNewOrgDiv.addEventListener('click', function(event){
        if(event.target.dataset.action === "close"){
            hideNewOrgDiv.style="display:none"
        }
    })
}

const submitNewOrgForm = () => {
    newOrgForm.addEventListener('submit', function(e){
        event.preventDefault()
        const name = event.target[0].value
        const newOrg = {name}
        createOrg(newOrg)
    })
}

const createOrg = newOrg => {
    fetch(`${url}/organizations`,{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(newOrg)
    })
    .then(resp =>resp.json())
    .then(org => {joinOrg(org)})
}

const joinOrg = org =>{
    const organization_id = org.id
    const user_id = 1
    const membership = {organization_id, user_id}
    fetch(`${url}/memberships`,{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(membership)
    })
    .then(resp => resp.json())
    .then(membership => {addOrgToAside(org);
        hideNewOrgDiv.style="display:none" })
}

const editTask = () =>{
    const btn = document.querySelector('button#edit-task-btn')
    btn.addEventListener('click', function(event){
        editTaskDiv.style="display:block"
        submitEditTask()
    })
}

const submitEditTask = () =>{
    editTaskForm.addEventListener('submit', function(event){
        event.preventDefault()
        const title =  event.target[0].value
        const deadline = event.target[1].value
        const description = event.target[2].value
        const task = {title, deadline, description}
        updateTask(task)
    })
}

const updateTask = task => {
    fetch(`${url}/taskcards/${editTaskForm.dataset.id}`,{
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(task)
    })
    .then(resp => resp.json())
    .then(mynewTask => {
        displayTaskInfo(mynewTask)
        document.querySelector(`div.list li[data-id="${mynewTask.id}"] h4`).textContent = mynewTask.title
    })
}

const deleteTask = () =>{
    const bttn = document.querySelector('button#delete-task-btn')
    bttn.addEventListener('click', function(event){
        fetch(`${url}/taskcards/${event.target.parentElement.dataset.id}`, {
            method: "DELETE",
        })
        .then(resp => resp.json())
        .then(task => {
            document.querySelector(`div.list li[data-id="${event.target.parentElement.dataset.id}"]`).remove()
            hideTaskDiv.style="display:none"

        })
            
    })
}

const newTask = (button, div) => {
        button.textContent= "Add Task"
        submitNewTask(div)
        button.addEventListener('click', function(event){
            newTaskDiv.style="display:block"})
}

const submitNewTask = div => {
    newTaskForm.addEventListener('submit', function(event){
        event.preventDefault()
        const title =  event.target[0].value
        const deadline = event.target[1].value
        const description = event.target[2].value
        const task = {title, deadline, description, list_id: div.dataset.id}
        createTask(task, div)
    })
}

const createTask = (task, div) => {
    console.log("3")
    fetch(`${url}/taskcards`,{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(task)
    })
    .then(resp => resp.json())
    .then(newTask => {
        displayTaskInfo(newTask)
        addTaskCard(newTask, div)
        newTaskDiv.style = "display:none"
    })
}

loadUser(1)
