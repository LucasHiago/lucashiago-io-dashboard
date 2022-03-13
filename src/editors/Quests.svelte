<div class="content word-editor quest">
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
                            {#if item.title}
                                <span class="title" data-id={item.id}>
                                    {item.title}
                                </span>
                            {/if}
                            {#if item.price}
                                <span class="price">
                                    {item.price}
                                </span>
                            {/if}
                            {#if item.description}
                                <span class="description">
                                    {item.description}
                                </span>
                            {/if}
                            {#if item.questPoint >= 0}
                                <span class="questPoint">
                                    {item.questPoint}
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
                <input type="text" class="name" bind:value={devName} placeholder="Título da quest" />
                <input type="text" class="email" bind:value={devEmail} placeholder="Preço da quest">
                <input type="text" class="points" bind:value={devPoints} placeholder="Pontos da quest">
                <select name="language" id="language" on:change={getLanguage}>
                    <option value="pt-BR" default selected>PT-BR</option>
                    <option value="en">EN</option>
                </select>
            </div>
            <div class="input-control">
                <textarea type="text" class="discord" bind:value={devDiscord} placeholder="Descrição da quest" rows="5" cols="33"/>
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
    
       const res = await startARest('/quest', 'GET');

       if(res != undefined){
        Titles = res[0].getQuests;
        setNewNotification('Quests carregados com sucesso!', 'success');
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
            title: devName, 
            price: devEmail, 
            description: devDiscord, 
            points: Number(devPoints),
            language: language
		};

        await startARest('/quest/create', 'POST', json);

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

        await startARest(`/quest/update/${identifier}`, 'PUT', json);

        setTimeout(() => {
            feedUpdate();
        }, 550);


    }

    const deleteWord = async (e) => {

        await startARest(`/quest/delete/${e.target.dataset.id}`, 'DELETE', null);

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
        devPoints = e.target.parentElement.parentElement.children[0].children[3].innerHTML;

        editorCreated = false;

    }


</script>