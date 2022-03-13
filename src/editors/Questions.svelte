<div class="content word-editor faq">
    <div class="actions">
        <div class="list-icon">
            <i class="fas fa-list"></i>
        </div>
        <div class="action-create" on:click={startEditor}>
            <p>
                Criar
            </p>
            <i class="fas fa-magic"></i>
        </div>
    </div>
    <div class="list-inside-content">
        <ul class="list-editors">

            {#if typeof Titles == 'string'}
                <h3>
                    {Titles}
                </h3>
            {/if}

            {#if typeof Titles != 'string'}
                {#each Titles as item, key}
                    <li class="item-editor">
                        <p>
                            {#if item.question}
                                <span class="question" data-id={item.id}>
                                    {item.question}
                                </span>
                            {/if}
                            {#if item.answer}
                                <span class="answer">
                                    {item.answer}
                                </span>
                            {/if}
                            {#if item.language}
                                <span class="language location">
                                    {item.language}
                                </span>
                            {/if}
                        </p>
                        <div class="action-editors">
                            <i class="fas fa-edit" on:click="{handleEditValue}"></i>
                            <i class="fas fa-trash" data-id="{item.id}" on:click="{deleteWord}"></i>
                        </div>
                    </li>
                {/each}
            {/if}

        </ul>
    </div>
    <div class="divider"></div>
    <div class="content-creator">

        <div class="four-inputs">
            <div class="input-control">
                <textarea type="text" class="name" bind:value={devName} placeholder="Pergunta"  rows="5" cols="33"/>
                <textarea type="text" class="email" bind:value={devEmail} placeholder="Resposta" rows="5" cols="33"/>
                <select name="language" id="language" on:change={getLanguage}>
                    <option value="pt-BR" default selected>PT-BR</option>
                    <option value="en">EN</option>
                </select>
            </div>
        </div>




        {#if editorCreated}
            <button class="btn first" on:click={createWord}>Criar</button>
        {:else}
            <button class="btn second" on:click={updateWord}>Atualizar</button>
        {/if}
     
    </div>
</div>

<script>
    import { onMount } from 'svelte';
    import  startARest, {startRestLoading, setNewNotification, getCookie, checkLogged}  from '../data/httpRequest.js';
    import rollDown from '../data/rollDown.js'; 

    let devName, devEmail, devDiscord, devPoints;
    let editorCreated = true;
    let identifier = null;
    let language = 'pt-BR';
    let Titles = [];



    onMount(async () => {

        checkLogged();
        await feedUpdate();
        
	});

    const feedUpdate = async () => {

       //startRestLoading();
    
       const res = await startARest('/faq', 'GET');

       if(res != undefined){
        Titles = res[0].getQuestions;
        setNewNotification('Questions carregados com sucesso!', 'success');
       } else {
        Titles = 'Sem itens';
       }


       rollDown();

    }

    const getLanguage = (e) =>{
       language = e.target.value;
    }


    const createWord = async () => {

        let json = {
            question: devName, 
            answer: devEmail, 
            language: language
		};

        await startARest('/faq/create', 'POST', json);

        setTimeout(() => {
            feedUpdate();
        }, 500);


    }

    const updateWord = async () => {

        let json = {
            question: devName, 
            answer: devEmail, 
            language: language
		};

        await startARest(`/faq/update/${identifier}`, 'PUT', json);

        setTimeout(() => {
            feedUpdate();
        }, 550);


    }

    const deleteWord = async (e) => {

        await startARest(`/faq/delete/${e.target.dataset.id}`, 'DELETE', null);

        setTimeout(() => {
            feedUpdate();
        }, 500);

    }

    const startEditor = (e) => {

        editorCreated = true;

    }

    const handleEditValue = (e) => {

        identifier = e.target.parentElement.parentElement.children[0].children[0].dataset.id;
        
        devName = e.target.parentElement.parentElement.children[0].children[0].innerHTML;
        devEmail = e.target.parentElement.parentElement.children[0].children[1].innerHTML;
        devDiscord = e.target.parentElement.parentElement.children[0].children[2].innerHTML;

        editorCreated = false;

    }


</script>