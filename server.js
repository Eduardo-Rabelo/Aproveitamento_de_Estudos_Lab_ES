const moment = require('moment')
const express = require('express');
const mysql = require('mysql2');
// const mysql = require('mysql2/promise'); // Importe a versão de promessas
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'sua_chave_secreta',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // secure: true em produção com HTTPS
}));

const connection =  mysql.createConnection({
    host: 'localhost',
    user: 'root', // substitua pelo seu usuário do MySQL
    password: 'q12345q', // substitua pela sua senha do MySQL
    database: 'Aproveitamento_de_estudos'
});

connection.connect(err => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err);
        return;
    }
    console.log('Conectado ao MySQL!');
});













// Rota para obter todas as listas
app.get('/listas', (req, res) => {
    connection.query('SELECT * FROM lista', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Rota para obter todas as listas do usuário atual
app.get('/listas/:username', isAuthenticated, (req, res) => {
    const username = req.session.user;

    const sqlQuery = `
    SELECT l.*
    FROM lista_usuario AS lu
    LEFT JOIN lista AS l ON l.nome = lu.nome_lista AND l.nome_criador = lu.nome_criador_lista
    WHERE lu.nome_usuario = ?
`   ;

// Execução da consulta SQL
    connection.query(sqlQuery, [username], (err, results) => {
        if (err) {
            console.error('Erro ao recuperar listas do usuário:', err);
            res.status(500).json({ success: false, message: 'Erro ao recuperar listas do usuário' });
            return;
        }
        res.json(results);
    });
});

//Rota para deletar uma lista
// app.delete('/listas/:nome_lista/:nome_criador', (req, res) => {
    
//     const { nome_lista } = req.params;
//     const { nome_criador_lista } = req.params;
//     console.log("Entrou na rota, nome_lista = ",nome_lista,", nome_criador = ", nome_criador_lista)
//     alert("ENTROU NO SERVER")

//     connection.query('DELETE FROM lista WHERE nome = ? AND nome_criador = ?', [nome_lista, nome_criador_lista], (err, results) => {
//         if (err) throw err;
//         res.status(204).send();
//     });
// });




// //Rota para deletar uma lista

app.delete('/listas/:nome_lista/:nome_criador_lista', (req, res) => {
    const { nome_lista, nome_criador_lista } = req.params;

    // Execute a primeira consulta
    connection.query('DELETE FROM lista_usuario WHERE nome_lista = ? AND nome_criador_lista = ?;', [nome_lista, nome_criador_lista], (err) => {
        if (err) {
            console.error('Erro ao excluir lista_usuario:', err);
            res.status(500).send('Erro ao excluir lista_usuario.');
            return;
        }

        // Execute a segunda consulta
        connection.query('DELETE FROM tarefa WHERE nome_lista = ? AND nome_criador_lista = ?;', [nome_lista, nome_criador_lista], (err) => {
            if (err) {
                console.error('Erro ao excluir tarefa:', err);
                res.status(500).send('Erro ao excluir tarefa.');
                return;
            }

            // Execute a terceira consulta
            connection.query('DELETE FROM lista WHERE nome = ? AND nome_criador = ?', [nome_lista, nome_criador_lista], (err) => {
                if (err) {
                    console.error('Erro ao excluir lista:', err);
                    res.status(500).send('Erro ao excluir lista.');
                    return;
                }

                // Todas as operações de exclusão foram concluídas com sucesso
                res.status(204).send();
            });
        });
    });
});




//Rota para deletar uma lista
// app.delete('/listas/:nome_lista/:nome_criador_lista', (req, res) => {
//     const { nome_lista, nome_criador_lista } = req.params;

//         // await connection.query('DELETE FROM lista_usuario WHERE nome_lista = ? AND nome_criador_lista = ?;', [nome_lista, nome_criador_lista]);
//         connection.query('DELETE FROM lista_usuario WHERE nome_lista = ? AND nome_criador_lista = ?;', [nome_lista, nome_criador_lista], (err) => {
//             if (err) {
//                 console.error('Erro ao excluir lista_usuario:', err);
//                 res.status(500).send('Erro ao excluir lista_usuario.');
//                 return;
//             }

//         connection.query('DELETE FROM tarefa WHERE nome_lista = ? AND nome_criador_lista = ?;', [nome_lista, nome_criador_lista], (err) =>{
//             if(err){
//                 console.error("Erro ao excluir tarefa",err);
//                 res.status(500).send("Erro ao excluir tarefa")
//                 return;
//             }
        

//         connection.query('DELETE FROM lista WHERE nome = ? AND nome_criador = ?', [nome_lista, nome_criador_lista], (err) =>{
//             if(err){
//                 console.error('Erro ao excluir lista:', err);
//                 res.status(500).send('Erro ao excluir lista.');
//                 return;
//             }

//             res.status(204).send();
//         });
//         });
//         });
//     });



// Rota para obter todas as tarefas de uma lista
app.get('/listas/:nome_lista/:nome_criador/tarefas', (req, res) => {
    const { nome_lista } = req.params;
    const { nome_criador } = req.params;
    connection.query('SELECT * FROM tarefa WHERE nome_lista = ? AND nome_criador_lista = ? ', [nome_lista,nome_criador], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});









































// Rota para atualizar a descrição de uma tarefa
// app.put('/tarefas/:id_tarefa', (req, res) => {
//     console.log("entrei no id_tarefa")
//     const { id_tarefa } = req.params;
//     const { descricao } = req.body;
//     connection.query(
//         'UPDATE tarefa SET descricao = ? WHERE id_tarefa = ?',
//         [descricao, id_tarefa],
//         (err, results) => {
//             if (err) throw err;
//             res.json(results);
//         }
//     );
// });



//Rota pra ver se a tarefa já existe
app.patch('/tarefas/:nome_tarefa/existe', (req, res) => {
    const { nome_tarefa } = req.params;
    const { criador, lista_nome } = req.body;

    // console.log(nome_tarefa,criador,lista_nome)
    // console.log('nome_criador_lista:', criador); // Debugging
    // console.log('nome_lista:', lista_nome); // Debugging

    connection.query(
        'SELECT COUNT(*) as count FROM tarefa WHERE nome_criador_lista = ? AND nome_lista = ?  AND titulo = ?',
        [criador, lista_nome, nome_tarefa],
        (err, results) => {
            if (err) throw err;
            const count = results[0].count;
            res.json({ exists: count > 0 });
        }
    );
});




















































// Rota para deletar uma tarefa
// app.delete('/tarefas/:titulo_tarefa', (req, res) => {
//     const { titulo_tarefa } = req.params;
//     const { nome_lista } = 'lista1';
//     const { nome_criador_lista } = 'user1';
//     connection.query('DELETE FROM tarefa WHERE nome_lista = ? AND nome_criador_lista = ? and titulo = ?', [nome_lista, nome_criador_lista, titulo_tarefa], (err, results) => {
//         if (err) throw err;
//         res.status(204).send();
//     });
// });


// Rota para deletar uma tarefa
app.delete('/tarefas/:titulo_tarefa', (req, res) => {
    const { titulo_tarefa } = req.params;
    const { nome_lista, nome_criador_lista } = req.body;
    connection.query(
        'DELETE FROM tarefa WHERE nome_lista = ? AND nome_criador_lista = ? AND titulo = ?',
        [nome_lista, nome_criador_lista, titulo_tarefa],
        (err, results) => {
            if (err) {
                console.error('Erro ao deletar tarefa: ', err);
                res.status(500).send('Erro ao deletar tarefa');
                return;
            }
            if (results.affectedRows === 0) {
                res.status(404).send('Tarefa não encontrada');
                return;
            }
            res.status(204).send();
        }
    );

});









// Rota para a página de login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Rota para autenticação
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    connection.query(
        'SELECT * FROM usuario WHERE nome_usuario = ? AND senha = ?',
        [username, password],
        (err, results) => {
            if (err) {
                console.error('Erro ao autenticar usuário: ', err);
                res.status(500).json({ success: false, message: 'Erro ao autenticar usuário' });
                return;
            }

            if (results.length > 0) {
                req.session.user = username;
                res.json({ success: true });
            } else {
                res.json({ success: false, message: 'Usuário ou senha inválidos' });
            }
        }
    );
});

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Rota para a aplicação principal
app.get('/app', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'app.html'));
});



//Rota pra index  FUNCIONA
app.get('/index', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

//Rota pra tarefa  FUNCIONA
app.get('/tarefa', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tarefa.html'));
});


// app.get('/tarefas/:nome_lista/:nome_criador/:titulo', isAuthenticated, (req, res) => {
//     const { nome_lista, nome_criador, titulo } = req.params;
//     connection.query(
//         'SELECT * FROM tarefa WHERE nome_lista = ? AND nome_criador_lista = ? AND titulo = ?',
//         [nome_lista, nome_criador, titulo],
//         (err, results) => {
//             if (err) throw err;
//             if (results.length === 0) {
//                 res.status(404).send('Tarefa não encontrada');
//             } else {
//                 res.json(results[0]);
//             }
//         }
//     );
// });


// Rota para criar uma nova tarefa
// app.post('/tarefas', isAuthenticated, (req, res) => {
//     const { nome_criador_lista,nome_lista, titulo, descricao,data_vencimento} = req.body;
//     const nome_criador_tarefa = req.session.user;
//     console.log("Título: ",titulo," \n\n\n")

//     const responsavel = req.session.user
//     let queryParamsLista = []
//     currentTime = moment().format('YYYY-MM-DD HH:mm:ss')
//     console.log("date.now: ",currentTime)

//     queryParamsLista.push(currentTime,responsavel,nome_lista,nome_criador_lista)
//     const queryLista = `UPDATE lista SET data_mod = ?, responsavel_mod = ? WHERE nome = ? AND nome_criador = ?`

//     connection.query(
//         'INSERT INTO tarefa (nome_lista, nome_criador_lista, titulo, descricao, data_cadastro, verifica_conclusao, data_vencimento,nome_criador_tarefa) VALUES (?, ?, ?, ?, NOW(), False, ?, ?)',
//         [nome_lista, nome_criador_lista, titulo, descricao,data_vencimento,nome_criador_tarefa],
//         (err, results) => {
//             if (err) throw err;
//             res.status(201).json({ id_tarefa: results.insertId });

//         connection.query(queryLista, queryParamsLista, (err, results) => {
//                     if (err) {
//                         console.error('Erro ao atualizar a lista pela tarefa:', err);
//                         return res.status(500).json({ error: 'Erro ao atualizar a lista pela tarefa' });
//                     }
//                     res.json({ message: 'Lista pela Tarefa atualizada com sucesso', results });
//                 });
//         }
//     );
// });

app.post('/tarefas', isAuthenticated, (req, res) => {
    const { nome_criador_lista, nome_lista, titulo, descricao, data_vencimento } = req.body;
    const nome_criador_tarefa = req.session.user;
    const responsavel = req.session.user;
    const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');

    const queryParamsLista = [currentTime, responsavel, nome_lista, nome_criador_lista];
    const queryLista = `UPDATE lista SET data_mod = ?, responsavel_mod = ? WHERE nome = ? AND nome_criador = ?`;

    // Inserção da tarefa
    const queryInsertTask = 'INSERT INTO tarefa (nome_lista, nome_criador_lista, titulo, descricao, data_cadastro, verifica_conclusao, data_vencimento, nome_criador_tarefa) VALUES (?, ?, ?, ?, NOW(), False, ?, ?)';
    const queryInsertParams = [nome_lista, nome_criador_lista, titulo, descricao, data_vencimento, nome_criador_tarefa];

    // Executa ambas as queries em sequência e retorna uma única resposta
    connection.query(queryInsertTask, queryInsertParams, (err, results) => {
        if (err) {
            console.error('Erro ao inserir a tarefa:', err);
            return res.status(500).json({ error: 'Erro ao criar a tarefa' });
        }

        // Após a tarefa ser inserida, atualiza a lista
        connection.query(queryLista, queryParamsLista, (err, updateResults) => {
            if (err) {
                console.error('Erro ao atualizar a lista pela tarefa:', err);
                return res.status(500).json({ error: 'Erro ao atualizar a lista pela tarefa' });
            }

            // Resposta final ao cliente
            res.status(201).json({ id_tarefa: results.insertId, message: 'Tarefa e lista atualizadas com sucesso' });
        });
    });
});






//Rota pra ver se a lista já existe
app.get('/listas/:nome_lista/existe', (req, res) => {
    const { nome_lista } = req.params;
    const criador = req.session.user;
    connection.query(
        'SELECT COUNT(*) as count FROM lista WHERE nome_criador = ? AND nome = ?',
        [criador, nome_lista],
        (err, results) => {
            if (err) throw err;
            const count = results[0].count;
            res.json({ exists: count > 0 });
        }
    );
});






// Rota pra adicionar uma lista
app.post('/listas/:username', isAuthenticated, (req, res) => {
    const username = req.session.user;
    const { nome } = req.body;
    connection.query(
        'INSERT INTO lista (nome, nome_criador, data_criacao,data_mod,responsavel_mod ) VALUES (?, ?, NOW(), NOW(), ?)',
        [nome, username , username]
    );
    connection.query(
        'INSERT INTO lista_usuario (nome_usuario, nome_lista, nome_criador_lista ) VALUES (?, ?, ?)',
        [username,nome, username],
        (err, results) => {
            if (err) throw err;
            res.status(201).json({ id_tarefa: results.insertId });
        }
    );
});

// Rota para obter os detalhes de uma tarefa específica
app.get('/tarefas/:titulo_tarefa/:nome_lista/:nome_criador', (req, res) => {
    const { titulo_tarefa, nome_lista, nome_criador } = req.params;
    connection.query('SELECT * FROM tarefa WHERE titulo = ? AND nome_lista = ? AND nome_criador_lista = ?', [titulo_tarefa, nome_lista, nome_criador], (err, results) => {
        if (err) throw err;
        res.json(results[0]);
    });
});










































// Rota para atualizar tarefa
app.put('/tarefas/:titulo/:nome_lista/:nome_criador', (req, res) => {
    const responsavel = req.session.user
    console.log("Responsável: ",responsavel)
    const { titulo, nome_lista, nome_criador } = req.params;
    const { novo_titulo, descricao, data_vencimento, verifica_conclusao } = req.body;
    console.log("titulo: ",titulo,"\nlista: ",nome_lista,"\ncriador_lista: ",nome_criador,"\nnovo_titulo: ",novo_titulo,"\ndescricao: ",descricao,"\ndata_vencimento: ", data_vencimento,"\nverifica_conclusão: ", verifica_conclusao)
    console.log("novo_titulo: ",novo_titulo)
    // console.log("descricao: ",descricao)
    // console.log("data_vencimento: ",data_vencimento)
    // console.log("verifica_conclusao: ",verifica_conclusao)
    // Array para armazenar as partes da consulta
    let queryParts = [];
    let queryParams = [];

    // Adiciona os campos a serem atualizados dinamicamente
    if (novo_titulo !== undefined) {
        queryParts.push('titulo = ?');
        queryParams.push(novo_titulo);
    }
    if (descricao !== undefined) {
        console.log("entrei pra mudar a descrição, a nova é: ",descricao)
        queryParts.push('descricao = ?');
        queryParams.push(descricao);
    }
    if (data_vencimento !== undefined) {
        queryParts.push('data_vencimento = ?');
        queryParams.push(data_vencimento);
    }
    if (verifica_conclusao !== undefined) {
        queryParts.push('verifica_conclusao = ?');
        queryParams.push(verifica_conclusao);
    }

    // Se não há campos a serem atualizados, retorne um erro
    if (queryParts.length === 0) {
        return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    // Adiciona os campos identificadores aos parâmetros
    queryParams.push(titulo, nome_lista, nome_criador);

    // Constrói a consulta SQL
    let queryParamsLista = []
    currentTime = moment().format('YYYY-MM-DD HH:mm:ss')
    console.log("date.now: ",currentTime)

    queryParamsLista.push(currentTime,responsavel,nome_lista,nome_criador)


    const queryLista = `UPDATE lista SET data_mod = ?, responsavel_mod = ? WHERE nome = ? AND nome_criador = ? `

    const query = `UPDATE tarefa SET ${queryParts.join(', ')} WHERE titulo = ? AND nome_lista = ? AND nome_criador_lista = ?`;
    console.log("query: ",query)
    console.log("queryParams: ",queryParams)

    connection.query(query, queryParams, (err, results) => {
        if (err) {
            console.error('Erro ao atualizar a tarefa:', err);
            return res.status(500).json({ error: 'Erro ao atualizar a tarefa' });
        }

        connection.query(queryLista, queryParamsLista, (err, results) => {
            if (err) {
                console.error('Erro ao atualizar a lista pela tarefa:', err);
                return res.status(500).json({ error: 'Erro ao atualizar a lista pela tarefa' });
            }
            res.json({ message: 'Lista pela Tarefa atualizada com sucesso', results });
        });
    });

    
    
   
});



























































// ('/listas/:username', isAuthenticated, (req, res) => {
//     const username = req.session.user;

//     const sqlQuery = `
//     SELECT l.*
//     FROM lista_usuario AS lu
//     LEFT JOIN lista AS l ON l.nome = lu.nome_lista AND l.nome_criador = lu.nome_criador_lista
//     WHERE lu.nome_usuario = ?
// `   ;

// // Execução da consulta SQL
//     connection.query(sqlQuery, [username], (err, results) => {
//         if (err) {
//             console.error('Erro ao recuperar listas do usuário:', err);
//             res.status(500).json({ success: false, message: 'Erro ao recuperar listas do usuário' });
//             return;
//         }
//         res.json(results);
//     });
// });


// app.post('/addTask', isAuthenticated, (req, res) => {
//     const { taskTitle, taskDescription } = req.body;
//     const username = req.session.user;

//     const nome_lista = 'lista1'; // Substitua pelo nome_lista apropriado
//     const nome_criador_lista = username;

//     connection.query(
//         'INSERT INTO tarefa (nome_lista, nome_criador_lista, titulo, descricao, data_cadastro, verifica_conclusao) VALUES (?, ?, ?, ?, NOW(), false)',
//         [nome_lista, nome_criador_lista, taskTitle, taskDescription],
//         (err, results) => {
//             if (err) {
//                 console.error('Erro ao adicionar tarefa: ', err);
//                 res.status(500).json({ success: false, message: 'Erro ao adicionar tarefa' });
//                 return;
//             }
//             res.json({ success: true });
//         }
//     );
// });


// app.get('/getLists', isAuthenticated, (req, res) => {
//     const username = req.session.user;

//     connection.query(
//         'SELECT nome FROM lista WHERE nome_criador = ?',
//         [username],
//         (err, results) => {
//             if (err) {
//                 console.error('Erro ao recuperar listas do usuário:', err);
//                 res.status(500).json({ success: false, message: 'Erro ao recuperar listas do usuário' });
//                 return;
//             }
//             res.json(results);
//         }
//     );
// });



app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});