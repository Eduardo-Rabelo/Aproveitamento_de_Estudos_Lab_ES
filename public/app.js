document.addEventListener('DOMContentLoaded', () => {
    const list_of_lists = document.getElementById('lists');
    const newListForm = document.getElementById('new-list-form');
    const newListName = document.getElementById('new-list-name');

    // Função para carregar tarefas
    const loadLists = () => {
        fetch('/listas/:username') // substitua 'lista1' pelo nome da lista desejada
            .then(response => response.json())
            .then(lists => {
                list_of_lists.innerHTML = '';
                lists.forEach(list => {
                    const listElement = document.createElement('div');
                    listElement.innerHTML = `
                        <span>Nome: ${list.nome} Criador: ${list.nome_criador} ultima_modificação: ${list.data_mod} ultimo_a_modificar: ${list.responsavel_mod}</span>
                        <button onclick="deleteList('${list.nome}', '${list.nome_criador}')">Excluir</button>                
                        <button onclick="enterList('${list.nome}', '${list.nome_criador}')">entrar</button>

                    `;
                    // <button onclick="deleteList('${list.nome}', '${list.nome_criador}')">Excluir</button>
                    list_of_lists.appendChild(listElement);
                });
            });
    };

    //Função pra entrar na lista
    window.enterList = (list_nome,list_nome_criador)=>{
        console.log("Entrar na lista:", list_nome, list_nome_criador);
        localStorage.setItem('nome_lista',list_nome);
        localStorage.setItem('nome_criador',list_nome_criador);
        window.location.href = '/index';
    }

    // // Função para adicionar nova lista
    // newListForm.addEventListener('submit', (e) => {
    //     e.preventDefault();
    //     const name = newListName.value;

    //     fetch('/listas/:username', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify({
    //             nome: name
    //         })
    //     }).then(() => {
    //         newListName.value = '';
    //         loadLists();
    //     });
    // });

     // Função para adicionar nova lista
     newListForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = newListName.value;
        console.log("name : ", name)
        try {
            const response = await fetch(`/listas/${name}/existe`);
            const data = await response.json();
            console.log("DATA: ",data)
            if (data.exists) {
                alert('Este usuário já criou uma lista com este nome');
                return;
            }

            await fetch(`/listas/:username`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome: name
                })
            });

            newListName.value = '';
            loadLists();
        } catch (error) {
            console.error('Erro ao verificar ou criar a lista:', error);
        }
    });

   // Função para deletar uma lista
    // window.deleteList = (nome_lista,criador_lista) => {
    //     console.log("Entrou na função")
    //     fetch(`/listas/${nome_lista}/${criador_lista}`, {
    //         method: 'DELETE',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //         // body: JSON.stringify({
    //         //     nome_lista: localStorage.getItem("nome_criador"), // substitua pelo nome da lista desejada
    //         //     nome_criador_lista: localStorage.getItem("nome_criador"), // substitua pelo nome do criador da lista
    //         // })
    //     }).then(() => {
    //         loadLists();
    //     });
    // };
    window.deleteList = (nome_lista, nome_criador_lista) => {
       
        fetch(`/listas/${nome_lista}/${nome_criador_lista}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(() => {
            loadLists();
        });
    };
    


    // Carregar tarefas ao carregar a página
    loadLists();

    const goBackButton = document.getElementById("backButton");
        goBackButton.addEventListener('click',() => {
        window.location.href = '/login'     
    })
    // loadTasks();
});
