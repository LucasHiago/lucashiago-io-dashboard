<div class="content word-editor">
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
                            {#if item.name}
                                <span class="devName" data-id={item.id}>
                                    {item.name}
                                </span>
                            {/if}
                            {#if item.email}
                                <span class="devEmail">
                                    {item.email}
                                </span>
                            {/if}
                            {#if item.telefone}
                                <span class="devDiscord">
                                    {item.telefone}
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
                <input type="text" class="name" bind:value={devName} placeholder="Nome" />
                <input type="text" class="email" bind:value={devEmail} placeholder="Email">
                <input type="text" class="discord" bind:value={devTelefone} placeholder="Telefone">
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

    let devName, devEmail, devTelefone;
    let editorCreated = true;
    let identifier = null;
    let Titles = [];



    onMount(async () => {

        checkLogged();
        await feedUpdate();
        
	});

    const feedUpdate = async () => {

       //startRestLoading();
    
       const res = await startARest('/client', 'GET');

       if(res != undefined){
        Titles = res[0].getLeads;
        setNewNotification('Leads carregados com sucesso!', 'success');
       } else {
        Titles = 'Sem itens';
       }


       rollDown();

    }

    const createWord = async () => {

        let json = {
            name: devName, 
            email: devEmail, 
            tekefibe: devTelefone
		};

        await startARest('/client/create', 'POST', json);

        setTimeout(() => {
            feedUpdate();
        }, 500);


    }

    const updateWord = async () => {

        let json = {
            name: devName, 
            email: devEmail, 
            discord: devDiscord, 
            points: devPoints
		};

        await startARest(`/client/update/${identifier}`, 'PUT', json);

        setTimeout(() => {
            feedUpdate();
        }, 550);


    }

    const deleteWord = async (e) => {

        await startARest(`/client/delete/${e.target.dataset.id}`, 'DELETE', null);

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
        devTelefone = e.target.parentElement.parentElement.children[0].children[2].innerHTML;

        editorCreated = false;

    }


</script>