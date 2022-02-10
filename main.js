let currentTasks ='';
let executors ='';
const daysNum = 10;

function setStyle(td1, td){
    td1.className = 'task-blue';
    td1.style.height = td.style.height/2;
    td1.style.border = 'none';
}
function setDataTooltip(taskElem, task){
    let str = JSON.stringify(task);
    taskElem.setAttribute('data-tooltip', str);
}
function createTable(dateZero){

    let users = JSON.parse(executors);
    let table = document.getElementById('table');
    table.innerHTML='';
    let datesTr = document.createElement('tr');
    datesTr.id = 'dates';
    table.appendChild(datesTr);
    let date0 = dateZero.split('-');
    let date = new Date(Number(date0[0]), Number(date0[1])-1, Number(date0[2]));
    for(let i=0; i<daysNum;i++){
        let td = document.createElement('td');
        td.textContent = `${date.getDate()}.${date.getMonth()+1}`;
        datesTr.appendChild(td);
        date.setDate(date.getDate() + 1);
    }
    users.forEach(user =>{
        let trElem = document.createElement('tr');
        date = new Date(Number(date0[0]), Number(date0[1])-1, Number(date0[2]));
        trElem.id = user.id;
        for(let i=0; i<daysNum;i++){
            let tdElem = document.createElement('td');
            tdElem.id = `${user.id}-${date.getDate()}-${date.getMonth() + 1}`;
            trElem.appendChild(tdElem);
            date.setDate(date.getDate() + 1);
        }
        table.appendChild(trElem);
    })
}
function distributeTasks(){
    let tasks = JSON.parse(currentTasks);
    let tasksDiv = document.getElementById("tasks");
    tasksDiv.innerHTML='';
    for(let task of tasks){
        if (task.executor){
            let planEndDate = new Date(task.planEndDate);
            planEndDate.setDate(planEndDate.getDate()+1);
            let planStartDate = new Date(task.planStartDate);
            while(planStartDate.toString() !== planEndDate.toString()){
                let td = document.getElementById(`${task.executor}-${planStartDate.getDate()}-${planStartDate.getMonth() + 1}`);
                if (td){
                    if(td.innerText === ''){
                        td.className = 'task-blue';
                        td.innerText = task.subject;
                        setDataTooltip(td, task);
                    }
                    else if (td.getElementsByTagName('table')[0]){
                        let table = td.getElementsByTagName('table')[0];
                        let tr = document.createElement('tr');
                        let td = document.createElement('td');
                        td.className = 'task-blue';
                        td.innerText = task.subject;
                        setDataTooltip(td, task);
                        tr.appendChild(td);
                        table.appendChild(tr);

                        let trs = table.getElementsByTagName('tr');
                        let trCount = trs.count();
                        trs.forEach(tr=>{
                            let td1 = tr.getElementsByTagName('td');
                            td1.style.borderBottom = '1px solid black';
                            td1.style.height = td.style.height / trCount;
                        })
                    }else{
                        let str = td.innerText;
                        td.innerText = '';
                        let dataStr = td.dataset.tooltip;
                        td.removeAttribute('data-tooltip');
                        td.style.padding = 0;
                        let table = document.createElement('table');
                        table.style.height = '100%';
                        let tr1 = document.createElement('tr');
                        let td1 = document.createElement('td');
                        let tr2 = document.createElement('tr');
                        let td2 = document.createElement('td');
                        td1.innerText = str;
                        setStyle(td1, td);
                        td1.setAttribute('data-tooltip', dataStr);
                        td1.style.borderBottom = '1px solid black';
                        td2.innerText = task.subject;
                        setStyle(td2, td);
                        setDataTooltip(td2, task);
                        tr1.appendChild(td1);
                        tr2.appendChild(td2);
                        table.append(tr1, tr2);
                        td.appendChild(table);
                    }
                }
                planStartDate.setDate(planStartDate.getDate() + 1);
            }
        }
        else{
            let title = document.createElement('h4');
            title.innerText = task.creationAuthor + ' (' + task.subject + ')';
            let description = document.createElement('p');
            description.innerText = task.description;
            let taskElement = document.createElement('div');
            taskElement.className = 'task';
            taskElement.draggable = true;
            taskElement.ondragstart = dragStart;
            setDataTooltip(taskElement, task);
            taskElement.append(title, description);
            tasksDiv.appendChild(taskElement);
        }
    }
}

document.addEventListener("DOMContentLoaded", async function() {
    let url = 'https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/tasks';
    let url2 = 'https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/users';

    await fetch(url)
        .then(
            function(response) {
                if (response.status !== 200) {
                    console.log('Status Code: ' +  response.status);
                    return;
                }
                response.json().then(function(data) {
                    currentTasks = JSON.stringify(data);
                });
            }
        )
        .catch(function(err) {
            console.log('FAIL', err);
        });
    await fetch(url2)
        .then(
            function(response) {
                if (response.status !== 200) {
                    console.log('Status Code: ' +  response.status);
                    return;
                }
                response.json().then(function(data2) {
                    executors = JSON.stringify(data2);

                    let users = JSON.parse(executors);
                    let zeroDate = '2021-6-23';
                    createTable(zeroDate);
                    let namesDiv = document.getElementById('names');
                    users.forEach(user =>{
                        let nameDiv = document.createElement('div');
                        nameDiv.className = 'name';
                        nameDiv.id = user.id;
                        let p =document.createElement('p');
                        p.textContent = user.firstName;
                        p.id = user.id;
                        nameDiv.appendChild(p);
                        namesDiv.appendChild(nameDiv);
                        let plan = document.getElementById('plan');
                        plan.ondragover = dragOver;
                        plan.ondrop = drop;
                    });
                    distributeTasks();
                });
            }

        )
        .catch(function(err) {
            console.log('FAIL', err);
        });


});
function getLeftDate(){
    let datesTr = document.getElementById('dates');
    let leftDate = datesTr.getElementsByTagName('td')[0].innerText;
    let date = leftDate.split('.');
    return new Date(2021, Number(date[1])-1, Number(date[0]));
}

function moveToLeft(){
    let day0 = getLeftDate();
    day0.setDate(day0.getDate() - daysNum);

    createTable(`${day0.getFullYear()}-${day0.getMonth()+1}-${day0.getDate()}`);
    distributeTasks();
}
function moveToRight(){
    let datesTr = document.getElementById('dates');
    let datesTds = datesTr.getElementsByTagName('td');
    let rightDate = datesTds[datesTds.length - 1].innerText;
    let date = rightDate.split('.');
    let day0 = new Date(2021, Number(date[1])-1, Number(date[0]) +1);

    createTable(`${day0.getFullYear()}-${day0.getMonth()+1}-${day0.getDate()}`);
    distributeTasks();
}

function moveDayLeft(){
    let day0 = getLeftDate();
    day0.setDate(day0.getDate()-1);
    createTable(`${day0.getFullYear()}-${day0.getMonth()+1}-${day0.getDate()}`);
    distributeTasks();
}
function moveDayRight(){
    let day0 = getLeftDate();
    day0.setDate(day0.getDate()+1);
    createTable(`${day0.getFullYear()}-${day0.getMonth()+1}-${day0.getDate()}`);
    distributeTasks();
}

function dragStart(e) {
    e.dataTransfer.setData('data', e.target.getAttribute('data-tooltip'));
}
function dragOver(e){
    if (e.stopPropagation) {
    e.preventDefault()
    }
}
function drop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    let data = JSON.parse(e.dataTransfer.getData('data'));
    let tasks = JSON.parse(currentTasks);

    data.executor = e.target.id.split('-')[0];
    tasks.forEach(el =>{
        if (el.id === data.id){
            el.executor = data.executor;
        }
    });

    currentTasks = JSON.stringify(tasks);
    let day0 = getLeftDate();
    createTable(`${day0.getFullYear()}-${day0.getMonth()+1}-${day0.getDate()}`);
    distributeTasks();
}
