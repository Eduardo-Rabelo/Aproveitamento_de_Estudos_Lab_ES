document.addEventListener('DOMContentLoaded', () => {
    const todoList = document.getElementById('todo-list');
    const newTaskForm = document.getElementById('new-task-form');
    const newTaskTitle = document.getElementById('new-task-title');
    const lista = localStorage.getItem("nome_lista");
    const criador = localStorage.getItem("nome_criador")
    // const nome_criador_lista = localStorage.getItem("nome_criador_lista")



    // Função para deletar uma tarefa
    window.deleteTask = (titulo_tarefa) => {
        // alert("ENTROU NA FUNÇÂO DE DELETAR")
        fetch(`/tarefas/${titulo_tarefa}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome_lista: lista, // substitua pelo nome da lista desejada
                nome_criador_lista: criador, // substitua pelo nome do criador da lista
            })
        }).then(() => {
            loadTasks();
        });
    };

    // // Função para carregar tarefas
    // const loadTasks = () => {
    //     fetch(`/listas/${lista}/${criador}/tarefas`) // substitua 'lista1' pelo nome da lista desejada
    //         .then(response => response.json())
    //         .then(tasks => {
    //             todoList.innerHTML = '';
    //             tasks.forEach(task => {
    //                 const safeTitle =  encodeURIComponent(task.titulo); //JSON.stringify(task.titulo);
    //                 const taskElement = document.createElement('div');
    //                 // console.log("oi")
    //                 taskElement.innerHTML = `
    //                     <span>Título:${task.titulo} Criador:${task.nome_criador_tarefa}</span>
    //                     <button onclick="deleteTask('${task.titulo}')">Excluir</button>
    //                     <button onclick="viewTask('${task.titulo}')">Verificar</button>
    //                     <button onclick="enterTask('${safeTitle}')">Entrar</button>
    //                 `;
    //                 todoList.appendChild(taskElement);
    //             });
    //         });
    // };

      //Função pra entrar na tarefa
    window.enterTask = (titulo)=>{
        // alert("Entrei na função")
        titulo = decodeURIComponent(titulo)
        console.log("safeTitle: ",titulo)
        list_nome = localStorage.getItem("nome_lista")
        list_nome_criador = localStorage.getItem("nome_criador")
        console.log("Entrar na tarefa:", titulo,list_nome, list_nome_criador);
        localStorage.setItem('titulo',titulo);
        window.location.href = '/tarefa';
    }

    

    const loadTasks = () => {
        fetch(`/listas/${encodeURIComponent(lista)}/${encodeURIComponent(criador)}/tarefas`)
            .then(response => response.json())
            .then(tasks => {
                todoList.innerHTML = '';
                tasks.forEach(task => {
                    const safeTitle = encodeURIComponent(task.titulo); 
                    const taskElement = document.createElement('div');
                    taskElement.innerHTML = `
                        <span>Título: ${task.titulo} Criador: ${task.nome_criador_tarefa}</span>
                        <button class="enter-task-button" data-title="${safeTitle}">Entrar</button>
                        <button class="delete-task-button" data-title="${safeTitle}">Excluir</button>
                        <button class="view-task-button" data-title="${safeTitle}">Verificar</button>
                    `;
                    todoList.appendChild(taskElement);
                });
    
                // Adiciona os event listeners
                document.querySelectorAll('.enter-task-button').forEach(button => {
                    button.addEventListener('click', (event) => {
                        const titulo = event.target.getAttribute('data-title');
                        enterTask(titulo);
                    });
                });
    
                document.querySelectorAll('.delete-task-button').forEach(button => {
                    button.addEventListener('click', (event) => {
                        const titulo = event.target.getAttribute('data-title');
                        deleteTask(titulo);
                    });
                });
    
                document.querySelectorAll('.view-task-button').forEach(button => {
                    button.addEventListener('click', (event) => {
                        const titulo = event.target.getAttribute('data-title');
                        viewTask(titulo);
                    });
                });
            });
    };
    


















    // // Função para adicionar nova tarefa
    // newTaskForm.addEventListener('submit', async (e) => {
    //     e.preventDefault();
    //     const name = newTaskTitle.value;
    //     console.log("name : ", name)
    //     try {
    //         const response = await fetch(`/listas/${name}/existe`);
    //         const data = await response.json();
    //         console.log("DATA: ",data)
    //         if (data.exists) {
    //             alert('Este usuário já criou uma lista com este nome');
    //             return;
    //         }

    //         await fetch(`/listas/:username`, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             },
    //             body: JSON.stringify({
    //                 nome: name
    //             })
    //         });

    //         newListName.value = '';
    //         loadLists();
    //     } catch (error) {
    //         console.error('Erro ao verificar ou criar a lista:', error);
    //     }
    // });

    //Função para adicionar nova tarefa
    newTaskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = newTaskTitle.value;
        const description = prompt('Digite a descrição da tarefa:');
        const data_vencimento = prompt('Digite a data de vencimento da tarefa  (YYYY-MM-DD):');
        if (!isValidDate(data_vencimento)) {
            alert('Data de vencimento inválida. Use o formato YYYY-MM-DD.');
            return;
        }

        try{
            console.log("Lista_Pré:",lista)
            const url = `/tarefas/${encodeURIComponent(title)}/existe`;
            console.log('URL gerada:', url); // Debugging
    
            const response = await fetch(url,{
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        criador: criador,
                        lista_nome: lista
                    })

            });
        // const response = await fetch(`/tarefas/${encodeURIComponent(title)}/existe?criador = ${2} & nome_lista = listaDoCarlos`);
        const data = await response.json();
        console.log(data)
        if(data.exists){
                alert('Este usuário já criou uma lista com este nome');
                return;
        }
        
        await fetch('/tarefas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome_criador_lista : criador,
                nome_lista: lista, // substitua pelo nome da lista desejada
                titulo: title,
                descricao: description,
                data_vencimento: data_vencimento // substitua pelo nome do responsável pela modificação
            })
        }).then(() => {
            newTaskTitle.value = '';
            loadTasks();
        });} catch (error) {
            console.error('Erro ao verificar ou criar a tarefa:', error);
        }
    });















    // Função para validar a data
    const isValidDate = (dateString) => {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateString.match(regex)) return false;

        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    };


    //Funçao pra ver Tarefa
    window.viewTask = (titulo_tarefa) => {
        const lista = localStorage.getItem("nome_lista");
        const criador = localStorage.getItem("nome_criador");
        fetch(`/tarefas/${titulo_tarefa}/${lista}/${criador}`)
            .then(response => response.json())
            .then(task => {
                // Aqui você pode exibir os detalhes da tarefa como desejar
                const taskDetails = `
                    <div>
                        <h3>Detalhes da Tarefa</h3>
                        <p><strong>Título:</strong> ${task.titulo}</p>
                        <p><strong>Descrição:</strong> ${task.descricao}</p>
                        <p><strong>Data de Cadastro:</strong> ${task.data_cadastro}</p>
                        <p><strong>Data de Vencimento:</strong> ${task.data_vencimento}</p>
                        <p><strong>Concluída:</strong> ${task.verifica_conclusao}</p>
                    </div>
                `;
                // Exibir os detalhes da tarefa, por exemplo, em um modal ou na própria página
                document.getElementById('task-details').innerHTML = taskDetails;
            });
    };

   


// document.addEventListener('DOMContentLoaded', () => {
//     const todoList = document.getElementById('todo-list');
//     const newTaskForm = document.getElementById('new-task-form');
//     const newTaskTitle = document.getElementById('new-task-title');
//     const lista = localStorage.getItem("nome_lista");
//     const criador = localStorage.getItem("nome_criador");

//     // Função para carregar tarefas
//     const loadTasks = () => {
//         fetch(`/listas/${lista}/${criador}/tarefas`) // Correção da string template
//             .then(response => response.json())
//             .then(tasks => {
//                 todoList.innerHTML = '';
//                 tasks.forEach(task => {
//                     const taskElement = document.createElement('div');
//                     taskElement.innerHTML = `
//                         <span>${task.titulo}: ${task.descricao}</span>
//                         <button onclick="deleteTask('${task.titulo}')">Excluir</button>
//                     `;
//                     todoList.appendChild(taskElement);
//                 });
//             });
//     };

//     // Função para adicionar nova tarefa
//     newTaskForm.addEventListener('submit', (e) => {
//         e.preventDefault();
//         const title = newTaskTitle.value;
//         const description = prompt('Digite a descrição da tarefa:');
//         const data_vencimento = prompt('Digite a data de vencimento da tarefa:');
//         fetch('/tarefas', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 nome_lista: lista, 
//                 titulo: title,
//                 descricao: description,
//                 verifica_conclusao: false, // Adicionado se necessário
//                 data_vencimento: data_vencimento
//             })
//         }).then(() => {
//             newTaskTitle.value = '';
//             loadTasks();
//         });
//     });



    

    // Carregar tarefas ao carregar a página
    loadTasks();
    const goBackButton = document.getElementById("backButton");
        goBackButton.addEventListener('click',() => {
        window.location.href = '/app'     
    })
});
