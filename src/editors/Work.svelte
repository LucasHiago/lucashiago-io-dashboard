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
                            {#if item.title}
                                <span class="title" data-id={item.id}>
                                    {item.title}
                                </span>
                            {/if}
                            {#if item.description}
                                <span class="description">
                                    {item.description}
                                </span>
                            {/if}
                            {#if item.location}
                                <span class="location">
                                    {item.location}
                                </span>
                            {/if}
                            {#if item.language}
                                <span class="language">
                                    {item.language}
                                </span>
                            {/if}
                            {#if item.icon}
                                <span class="icon-list" contenteditable="true" bind:innerHTML={item.icon}></span>
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

        <div class="three-inputs">
            <div class="input-control">
                <input type="text" class="title" bind:value={exampleTitle} />
            </div>
            <div class="input-control">
                <input type="text" class="location" bind:value={location}>
            </div>
            <div class="input-control">
                <select name="language" id="language" on:change={getLanguage}>
                    <option value="pt-br" default selected>PT-BR</option>
                    <option value="en">EN</option>
                </select>
            </div>
        </div>

        <textarea bind:value={exampleLorem} id="" cols="30" rows="10"></textarea>
        <div class="icon-controller">
            <span contenteditable="true" bind:innerHTML={exampleIcon}></span>
            <textarea bind:value={exampleIcon} id="" cols="30" rows="10"></textarea>
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
 
    let exampleTitle = 'Example Work';
    let exampleLorem = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi ex aliquam nesciunt repudiandae provident eius, rerum inventore veniam ducimus? Placeat animi illum repellat accusantium nemo beatae repudiandae. Aspernatur, magni quo!';
    let editorCreated = true;
    let identifier = null;
    let location = 'work-01';
    let language = 'pt-br';
    let exampleIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M192 384h192c53 0 96-43 96-96h32c70.6 0 128-57.4 128-128S582.6 32 512 32H120c-13.3 0-24 10.7-24 24v232c0 53 43 96 96 96zM512 96c35.3 0 64 28.7 64 64s-28.7 64-64 64h-32V96h32zm47.7 384H48.3c-47.6 0-61-64-36-64h583.3c25 0 11.8 64-35.9 64z"/></svg>';
    let Titles = [];
    let Token = getCookie('token');


    onMount(async () => {

        checkLogged();
        await feedUpdate();
        
	});

    const getLanguage = (e) =>{
       language = e.target.value;
    }

    const feedUpdate = async () => {

       startRestLoading();
    
       const res = await startARest('/work', 'GET', null, true, null, null, Token);

       if(res != undefined){
        Titles = res[0].getWorks;
        setNewNotification('Serviços carregados com sucesso!', 'success');
       } else {
        Titles = 'Sem Serviços';
       }


       rollDown();

    }

    const createWord = async () => {

        let json = {
            location: location,
			title: exampleTitle,
			description: exampleLorem,
            icon: exampleIcon,
            language: language
		};

        await startARest('/work/create', 'POST', json);

        setTimeout(() => {
            feedUpdate();
        }, 500);

    }

    const updateWord = async () => {

        let json = {
            location: location,
			title: exampleTitle,
			description: exampleLorem,
            icon: exampleIcon,
            language: language
		};

        await startARest(`/work/update/${identifier}`, 'PUT', json);

        setTimeout(() => {
            feedUpdate();
        }, 550);


    }

    const deleteWord = async (e) => {

        await startARest(`/work/delete/${e.target.dataset.id}`, 'DELETE', null);

        setTimeout(() => {
            feedUpdate();
        }, 500);

    }

    const startEditor = (e) => {

        exampleTitle = 'Example Work';
        exampleLorem = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi ex aliquam nesciunt repudiandae provident eius, rerum inventore veniam ducimus? Placeat animi illum repellat accusantium nemo beatae repudiandae. Aspernatur, magni quo!';
        language = 'pt-br';
        exampleIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M192 384h192c53 0 96-43 96-96h32c70.6 0 128-57.4 128-128S582.6 32 512 32H120c-13.3 0-24 10.7-24 24v232c0 53 43 96 96 96zM512 96c35.3 0 64 28.7 64 64s-28.7 64-64 64h-32V96h32zm47.7 384H48.3c-47.6 0-61-64-36-64h583.3c25 0 11.8 64-35.9 64z"/></svg>'
        location = 'work-01';
        editorCreated = true;

    }

    const handleEditValue = (e) => {

        let title = e.target.parentElement.parentElement.children[0].children[0].innerHTML;
        let subtitle = e.target.parentElement.parentElement.children[0].children[1].innerHTML;
        let locationHtml = e.target.parentElement.parentElement.children[0].children[2].innerHTML;
        let languageHtml = e.target.parentElement.parentElement.children[0].children[3].innerHTML;
        let iconHtml = e.target.parentElement.parentElement.children[0].children[4].innerHTML;
        let ident = e.target.parentElement.parentElement.children[0].children[0].dataset.id;

        exampleTitle = title;
        exampleLorem = subtitle;
        identifier = ident;
        location = locationHtml;
        language = languageHtml;
        exampleIcon = iconHtml;
        editorCreated = false;

    }


</script>