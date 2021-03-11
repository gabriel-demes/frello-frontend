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
const newListForm = document.querySelector('form#new-list-form')
const newListDiv = document.querySelector('div#new-list-div')
const newListBtn = document.querySelector('button#new-list-btn')
const hideListDiv = document.querySelector('#new-list-div')
const hideNewTaskDiv = document.querySelector('#new-task-div')
const loginDiv = document.querySelector('div#login-div')
const loginForm = document.querySelector(`form#login-form`)
const signupDiv = document.querySelector('div#signup-div')
const signupForm = document.querySelector(`form#signup-form`)
const hideStart = document.querySelector('div#hide-start-page')
const startPageDiv = document.querySelector('div#start-page')
const hideJoinOrgDiv = document.querySelector('div#hide-join-form')
const joinOrgForm = document.querySelector('form#join-org-form')
const members = document.querySelector('div#members')
const hideMembersDiv = document.querySelector('div#hide-members')
const membersBtn = document.querySelector('button#org-members')
const hideCalDiv = document.querySelector('#hide-cal')

const startPage = () => {
    hideStart.style="display:block"
    startPageDiv.addEventListener('click', function(event){
        switch (event.target.id){
            case "login":
                signinPage()
                hideStart.style="display:none"
                break;
            case "signup":
                signupPage()
                hideStart.style="display:none"
                break
        }
    })
}
const signupPage = () =>{
    signupDiv.style = "display:block"
     signupForm.addEventListener('submit', function(event){
        event.preventDefault()
        const name = event.target[0].value
        const username = event.target[1].value
        const password = event.target[2].value
        const user = {name, username, password}
        fetch(`${url}/users`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(user)
        })
        .then(resp => resp.json())
        .then(newUser => {
            if(!!newUser.id){
                loadUser(newUser.id)
                signupDiv.style = "display:none"
            }else{
                alert('username already taken. Please try again.')
                event.target.reset()
            }
        })
        .catch((error) => {
            alert('username already taken. Please try again.')
        })   
    })
}

const signinPage = () =>{
    loginDiv.style = "display:block"
    loginForm.addEventListener('submit', function(event){
        event.preventDefault()
        const username = event.target[0].value
        const password = event.target[1].value
        fetch(`${url}/users`)
        .then(resp => resp.json())
        .then(users => {
            const current = users.find(user => (user.username === username && user.password === password))
            if(!!current){
                loadUser(current.id)
                loginDiv.style="display:none"
                event.target.reset()
            }else{
                alert('Incorrect username/password')
                event.target.reset()
            }
        }) 
    })
}
const loadUser = id =>{
    fetch(`${url}/users/${id}`)
        .then(resp => resp.json())
        .then(user => {populateAside(user)
        newOrgForm.dataset.id = user.id
        makeCal(getEvents(user))
    })

    showMembers()
    joinNewOrg()
    loadOrgForm()
    newList()
    contentContainerEvents()
    editTask()
    deleteTask()
    seeCal()
    
}


const populateAside = userObj => {
    document.querySelector(`p#name`).textContent = `Name: ${userObj.name}`
    document.querySelector(`p#username`).textContent = `Username: ${userObj.username}`
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
    document.querySelector('div#org-name').textContent = `Name: ${org.name}`
    document.querySelector('div#org-code').textContent = `Code: ${org.memembership_code}`
    membersBtn.dataset.id = org.id
    membersBtn.style ="display:block"
    newListForm.dataset.id = org.id
    newListBtn.style = "display:block"
    newListBtn.dataset.id = org.id
    contentContainer.querySelectorAll('*').forEach(n => n.remove());
    if(org.lists.length >= 1){
        org.lists.forEach(list => {contentContainer.append(showList(list))})
    }
}

const showList = list =>{
    const div = document.createElement('div')
        div.dataset.id = list.id
        div.classList.add('list')
        div.innerHTML = `<div class="listul">
                    <h3>${list.title}</h3>
                    <ul data-id="${list.id}"></ul>
                </div>`
        if (list.taskcards){
            list.taskcards.forEach(task => addTaskCard(task, div))
            }

        const createTaskBtn = document.createElement('button')
        createTaskBtn.dataset.id = list.id
        createTaskBtn.id = "create-task-btn"
        createTaskBtn.textContent = "Add Task"
        const buttonDiv = document.createElement('div')
        const ul = div.querySelector('ul').parentElement
        buttonDiv.append(createTaskBtn)
        const deleteListBtn = document.createElement('button')
        deleteListBtn.dataset.id = list.id
        deleteListBtn.id = "delete-list-btn"
        deleteListBtn.textContent = "Delete List"
        buttonDiv.append(deleteListBtn)
        ul.append(buttonDiv)
        // const check =document.createElement('input')
        // check.type ="checkbox"
        // ul.append(check)
    return div
}

const contentContainerEvents = () => {
    contentContainer.addEventListener('click', function(event){
        switch (event.target.id){
            case "create-task-btn":
                newTaskDiv.style="display:block"
                hideNewTask() 
                newTaskForm.dataset.id = event.target.dataset.id
                break
            case "delete-list-btn":
                deleteList(event.target.dataset.id)
                break

        }
    })
    newTaskForm.addEventListener('submit', function(event){
        event.preventDefault()
        const title =  event.target[0].value
        const deadline = event.target[1].value
        const description = event.target[2].value
        const task = {title, deadline, description, list_id: newTaskForm.dataset.id}
        createTask(task)
        
        })
    
    contentContainer.addEventListener('dragstart', function(event){
        if (event.target.classList[0] === 'taskcard'){
            event.target.classList.add('dragging')
        }
    })
    contentContainer.addEventListener('dragend', function(event){
        if (event.target.classList[1] === 'dragging'){
            event.target.classList.remove('dragging')
            handleMovement(event.target)
        }
    })
    contentContainer.addEventListener("dragover", function(event){
        if(event.target.classList[0]==="listul"){
            event.preventDefault()
            const taskcard = document.querySelector(".dragging")
            const ul = event.target.querySelector('ul')
            ul.append(taskcard)
        }
    })
}

const addTaskCard = (task, div) => {
    const card = document.createElement('li')
    card.classList.add('taskcard')
    card.draggable ="true"
    card.dataset.id = task.id
    card.dataset.list = div.dataset.id
    card.innerHTML = `<h4>${task.title}</h4>`
    const ul = div.querySelector('ul')
    ul.append(card)
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
        })
}

const displayTaskInfo = task =>{   
    const taskInfo = taskDiv.querySelector('div#task-info')
    taskInfo.dataset.id = task.id
    const time = new Date(task.created_at).toDateString()
    taskInfo.innerHTML = `<h2>${task.title}</h2>
            <h3 class="created">Date Created: ${time}</h3>
            <h3 class = "due">Date Due: ${new Date(task["deadline"]).toDateString()}</h3>
            <p>Description: ${task.description}</p>`
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
const hideNewList = () =>{
    hideListDiv.addEventListener('click', function(event){
        if(event.target.dataset.action === "close"){
            hideListDiv.style="display:none"
        }
    })
}

const hideNewTask = () =>{
    hideNewTaskDiv.addEventListener('click', function(event){
        if(event.target.dataset.action === "close"){
            hideNewTaskDiv.style="display:none"
        }
    })
}

const loadOrgForm = () => {
    const bttn = document.querySelector(`#new-org`)
    submitNewOrgForm()
    bttn.addEventListener('click', function(event){
        hideNewOrgDiv.style ="display:block"
        hideNewOrgForm()
        
    })
}

const joinNewOrg = () => {
    const bttn = document.querySelector(`#join-org`)
    submitJoinOrgForm()
    bttn.addEventListener('click', function(event){
        hideJoinOrgDiv.style ="display:block"
        hideJoinOrgForm()})
}

const hideNewOrgForm = () => {
    hideNewOrgDiv.addEventListener('click', function(event){
        if(event.target.dataset.action === "close"){
            hideNewOrgDiv.style="display:none"
        }
    })
}
const hideJoinOrgForm = () => {
    hideJoinOrgDiv.addEventListener('click', function(event){
        if(event.target.dataset.action === "close"){
            hideJoinOrgDiv.style="display:none"
        }
    })
}

const submitNewOrgForm = () => {
    newOrgForm.addEventListener('submit', function(e){
        e.preventDefault()
        const name = event.target[0].value
        const user_id = event.target.dataset.id
        const newOrg = {name, user_id}
        createOrg(newOrg)
    })
}

const submitJoinOrgForm = () => {
    joinOrgForm.addEventListener('submit', function(event){
        event.preventDefault()
        const memembership_code = event.target[0].value
        findOrg(memembership_code)
    })
}

const findOrg = code =>{
    fetch(`${url}/organizations`)
    .then(resp => resp.json())
    .then(orgs => {
        const found = orgs.find(org =>(org.memembership_code === code))
        if(!!found && !document.querySelector(`aside li[data-id="${found.id}"]` )){
            joinOrg(found)
        }
        else if(!!found && !!document.querySelector(`aside li[data-id="${found.id}"]`)){
            alert("You are Aleady a member of this org")
        } else {
            alert("Membership Code Does not exist")
        }
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
    const user_id = newOrgForm.dataset.id
    const membership = {organization_id, user_id}
    fetch(`${url}/memeberships`,{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(membership)
    })
    .then(resp => resp.json())
    .then(membership => {addOrgToAside(org);
        hideNewOrgDiv.style="display:none" })
}

const editTask = () =>{
    submitEditTask()
    const btn = document.querySelector('button#edit-task-btn')
    btn.addEventListener('click', function(event){
        editTaskDiv.style="display:block"
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

const createTask = (task) => {
    fetch(`${url}/taskcards`,{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(task)
    })
    .then(resp => resp.json())
    .then(newTask => {
        displayTaskInfo(newTask)
        addTaskCard(newTask, document.querySelector(`div[data-id="${newTask.list_id}"]`))
        hideTaskDiv.style = "display:block"
        newTaskDiv.style = "display:none"
        hideTask()
    })
}

const deleteList = id =>{
    fetch(`${url}/lists/${id}`,{
        method: "DELETE"
    })
    .then(resp => resp.json())
    .then(list => {
        document.querySelector(`div[data-id="${id}"]`).remove()
    })
}

const newList = () =>{
    submitNewList()
    newListBtn.addEventListener('click', function(){
        newListDiv.style="display:block"
        hideNewList()
    })
}

const submitNewList = () =>{
    newListForm.addEventListener('submit', function(event){
        event.preventDefault()
        const title = event.target[0].value
        const organization_id = event.target.dataset.id
        const list = {title, organization_id}
        createList(list)
    })
}

const createList = (list) => {
    let y = {}
    fetch(`${url}/lists`,{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(list)
    })
    .then(resp => resp.json())
    .then(newList => {
        contentContainer.append(showList(newList))
        newListDiv.style = "display:none"
        Object.assign(y, newList)
    })
}

const handleMovement = card =>{
    let currList = card.dataset.list
    if(currList != card.parentElement.dataset.id){
        currList = card.parentElement.dataset.id
        fetch(`${url}/taskcards/${card.dataset.id}`,{
            method: "PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({list_id: currList})
        })
        .then(resp => resp.json())
        .then(task => {card.dataset.list = task.user_list})
    }
}

const showMembers = () => {
    membersBtn.addEventListener('click', function(event){
        fetch(`${url}/users`)
        .then(resp => resp.json())
        .then(users => {
            members.querySelector('ul').querySelectorAll('*').forEach(n => n.remove());
            users.forEach(user =>{
                user.organizations.forEach(org => {
                    if (org.id === parseInt(event.target.dataset.id)){
                        const li = document.createElement('li')
                        li.textContent = user.name
                        members.querySelector('ul').append(li)
                    }

                });
            })
            hideMembersDiv.style = "display:block"
        })
        
    })
    hideMembers()
}

const hideMembers = () =>{
    hideMembersDiv.addEventListener('click', function(event){
        if(event.target.dataset.action === "close"){
            hideMembersDiv.style="display:none"
        }
    })
}

const seeCal = () => {
    const calBtn = document.querySelector('#my-cal')
    calBtn.addEventListener('click', function(event){
        hideCalDiv.style ="display:block"
    })
    hideCal()
}

const hideCal = () => {
    hideCalDiv.addEventListener('click', function(event){
        if(event.target.dataset.action === "close"){
            hideCalDiv.style="display:none"
        }
    })
}
const makeCal = eventList => {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      aspectRatio: 1.5,
      contentHeight: 'auto',
      events: eventList
    });
    calendar.render();
}

const getEvents = user =>{
    let events = []
    if(!!user.organizations){
        user.organizations.forEach(org =>{
            if(!!org.lists){
                org.lists.forEach(list =>{
                    if(!!list.taskcards){
                        list.taskcards.forEach(task =>{
                            events.push({title: task.title, start: task.deadline})
                        })
                    }
                })
            }
        })
    }
   return events
}
startPage()
