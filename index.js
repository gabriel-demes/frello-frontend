const url = `http://localhost:3000`
const contentContainer = document.querySelector('div#content-container')
const taskDiv = document.querySelector(`div#task-card`)
const hideTaskDiv = document.querySelector('#hide-task')
const hideNewOrgDiv = document.querySelector('#hide-new-form')
const newOrgForm = document.querySelector("form#new-org-form")

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
    const orgList = document.querySelector(`div#my-organizations ul`)
    userObj.organizations.forEach(org => {
        const li = document.createElement('li')
        li.innerHTML = `<h4>${org.name}</h4>`
        orgList.append(li)
        li.dataset.id = org.id
        clickOrg(li)
    });
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
    org.lists.forEach(list => {contentContainer.append(showList(list))})
}

const showList = list =>{
    const div = document.createElement('div')
        div.id = list.id
        div.classList.add('list')
        div.innerHTML = `<div>
                    <h3>${list.title}</h3>
                    <ul></ul>
                </div>`
        list.taskcards.forEach(task => addTaskCard(task, div))
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
        let obj = ``
        fetch(`${url}/taskcards/${id}`)
        .then(resp => resp.json())
        .then(task => {
            taskDiv.innerHTML = `<h2>${task.title}</h2>
            <h3 class="created">Date Created: ${task["date_created"]}</h3>
            <h3 class = "due">Date Due: ${task["date_due"]}</h3>
            <p>Description: ${task.description}</p>`
        })
}

const hideTask = () =>{
    hideTaskDiv.addEventListener('click', function(event){
        if(event.target.dataset.action === "close"){
            hideTaskDiv.style="display:none"
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
    console.log(newOrg)
    fetch(`${url}/organizations`,{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(newOrg)
    })
}






loadUser(1)
