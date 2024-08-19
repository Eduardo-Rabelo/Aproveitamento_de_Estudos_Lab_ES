// document.addEventListener('DOMContentLoaded', () => {
//     // const params = new URLSearchParams(window.location.search);
//     // const nome_lista = localStorage.getItem("nome_lista");
//     // const nome_criador = localStorage.getItem("nome_criador");
//     // const titulo = params.get('titulo');
//     const titulo = localStorage.getItem("titulo")
//     const criador_lista = localStorage.getItem("nome_criador")
//     const lista = localStorage.getItem("nome_lista")

//     const taskTitle = document.getElementById('task-title');
//     const taskDescription = document.getElementById('task-description');
//     const taskDueDate = document.getElementById('task-due-date');
//     const taskCompleted = document.getElementById('task-completed');

//     fetch(`/tarefas/${titulo}/${lista}/${criador_lista}`)
//         .then(response => response.json())
//         .then(task => {
//             taskTitle.textContent = task.titulo;
//             taskDescription.textContent = task.descricao;
//             taskDueDate.textContent = task.data_vencimento;
//             taskCompleted.textContent = task.verifica_conclusao ? 'Sim' : 'Não';
//         });
    

//         // taskTitle.innerHTML("<h1>TESTE</h1>")
//     });


document.addEventListener('DOMContentLoaded', () => {
    const titulo = localStorage.getItem("titulo");
    const criador_lista = localStorage.getItem("nome_criador");
    const lista = localStorage.getItem("nome_lista");

    const taskTitle = document.getElementById('task-title');
    const taskDescription = document.getElementById('task-description');
    const taskDueDate = document.getElementById('task-due-date');
    const taskCompleted = document.getElementById('task-completed');

    const editTitleButton = document.getElementById('edit-title-button');
    const newTitleInput = document.getElementById('new-title');
    const saveTitleButton = document.getElementById('save-title-button');

    const editDescriptionButton = document.getElementById('edit-description-button');
    const newDescriptionInput = document.getElementById('new-description');
    const saveDescriptionButton = document.getElementById('save-description-button');

    const editDueDateButton = document.getElementById('edit-due-date-button');
    const newDueDateInput = document.getElementById('new-due-date');
    const saveDueDateButton = document.getElementById('save-due-date-button');

    const editCompletedButton = document.getElementById('edit-completed-button');
    const newCompletedInput = document.getElementById('new-completed');
    const saveCompletedButton = document.getElementById('save-completed-button');

    fetch(`/tarefas/${encodeURI(titulo)}/${encodeURI(lista)}/${encodeURI(criador_lista)}`)
        .then(response => response.json())
        .then(task => {
            taskTitle.textContent = task.titulo;
            taskDescription.textContent = task.descricao;
            taskDueDate.textContent = task.data_vencimento;
            taskCompleted.textContent = task.verifica_conclusao ? 'Sim' : 'Não';
        });

    editTitleButton.addEventListener('click', () => {
        newTitleInput.style.display = 'inline';
        saveTitleButton.style.display = 'inline';
        newTitleInput.value = taskTitle.textContent;
    });

    saveTitleButton.addEventListener('click', () => {
        
        const newTitle = newTitleInput.value;
        localStorage.setItem("titulo",newTitle);
        console.log("newTitleInput: ",newTitle);
        console.log("Título pré update: ",titulo)
        updateTaskAttribute(titulo, lista, criador_lista, { novo_titulo: newTitle }, () => {
            taskTitle.textContent = newTitle;
            newTitleInput.style.display = 'none';
            saveTitleButton.style.display = 'none';
        });
        titulo = newTitle
        console.log("\n\n\n\n\nTítulo pós update: ",titulo)
    });

    editDescriptionButton.addEventListener('click', () => {
        newDescriptionInput.style.display = 'inline';
        saveDescriptionButton.style.display = 'inline';
        newDescriptionInput.value = taskDescription.textContent;
    });

    saveDescriptionButton.addEventListener('click', () => {
        const newDescription = newDescriptionInput.value;
        updateTaskAttribute(titulo, lista, criador_lista, { descricao: newDescription }, () => {
            taskDescription.textContent = newDescription;
            newDescriptionInput.style.display = 'none';
            saveDescriptionButton.style.display = 'none';
        });
    });

    editDueDateButton.addEventListener('click', () => {
        newDueDateInput.style.display = 'inline';
        saveDueDateButton.style.display = 'inline';
        newDueDateInput.value = taskDueDate.textContent;
    });

    saveDueDateButton.addEventListener('click', () => {
        const newDueDate = newDueDateInput.value;
        updateTaskAttribute(titulo, lista, criador_lista, { data_vencimento: newDueDate }, () => {
            taskDueDate.textContent = newDueDate;
            newDueDateInput.style.display = 'none';
            saveDueDateButton.style.display = 'none';
        });
    });

    editCompletedButton.addEventListener('click', () => {
        newCompletedInput.style.display = 'inline';
        saveCompletedButton.style.display = 'inline';
        newCompletedInput.checked = taskCompleted.textContent === 'Sim';
    });

    saveCompletedButton.addEventListener('click', () => {
        const newCompleted = newCompletedInput.checked;
        updateTaskAttribute(titulo, lista, criador_lista, { verifica_conclusao: newCompleted }, () => {
            taskCompleted.textContent = newCompleted ? 'Sim' : 'Não';
            newCompletedInput.style.display = 'none';
            saveCompletedButton.style.display = 'none';
        });
    });
});


const goBackButton = document.getElementById("backButton");
goBackButton.addEventListener('click',() => {
    window.location.href = '/index'
})





function updateTaskAttribute(titulo, lista, criador_lista, updates, callback) {
    
    console.log("titulo: ",titulo,"\nlista: ",lista,"\ncriador_lista: ",criador_lista,"\nupdates: ",updates,"\ncallback: ",callback)
    fetch(`/tarefas/${encodeURIComponent(titulo)}/${encodeURIComponent(lista)}/${encodeURIComponent(criador_lista)}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
    })
    .then(response => {
        console.log("response: ",response)
        if (!response.ok) {
            throw new Error('Erro ao atualizar a tarefa.');
        }
        return response.json();
    })
    .then(data => {
        console.log('Tarefa atualizada com sucesso:', data);
        callback();
    })
    .catch(error => {
        console.error('Erro:', error);
    });
}