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
                            {#if item.subtitle}
                                <span class="subtitle">
                                    {item.subtitle}
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



        {#if editorCreated}
            <button class="btn first" on:click={createWord}>Criar</button>
        {:else}
            <button class="btn second" on:click={updateWord}>Atualizar</button>
        {/if}
     
    </div>
</div>

<script>
    import { onMount } from 'svelte';
    import  startARest  from '../data/httpRequest.js';
    import rollDown from '../data/rollDown.js'; 
 
    let exampleTitle = 'Example Title';
    let exampleLorem = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi ex aliquam nesciunt repudiandae provident eius, rerum inventore veniam ducimus? Placeat animi illum repellat accusantium nemo beatae repudiandae. Aspernatur, magni quo!';
    let editorCreated = true;
    let identifier = null;
    let location = 'section-default';
    let language = 'pt-br';
    let Titles = [];


    onMount(async () => {

        feedUpdate();

	});

    const getLanguage = (e) =>{
       language = e.target.value;
    }

    const feedUpdate = async () => {

       const res = await startARest('/title', 'GET', null);
       if(typeof res != 'string'){
        Titles = res.getTitles;
       } else {
        Titles = res;
       }


       rollDown();

    }

    const createWord = () => {

        let json = {
                location: location,
				title: exampleTitle,
				subtitle: exampleLorem,
                language: language
		};

        startARest('/title/create', 'POST', json);

        setTimeout(() => {
            feedUpdate();
        }, 500);

    }

    const updateWord = () => {

        let json = {
            location: location,
			title: exampleTitle,
			subtitle: exampleLorem,
            language: language
		};

        startARest(`/title/update/${identifier}`, 'PUT', json);

        setTimeout(() => {
            feedUpdate();
        }, 550);

    }

    const deleteWord = (e) => {

        startARest(`/title/delete/${e.target.dataset.id}`, 'DELETE', null);

        setTimeout(() => {
            feedUpdate();
        }, 500);

    }

    const startEditor = (e) => {

        exampleTitle = 'Example Title';
        exampleLorem = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi ex aliquam nesciunt repudiandae provident eius, rerum inventore veniam ducimus? Placeat animi illum repellat accusantium nemo beatae repudiandae. Aspernatur, magni quo!';
        language = 'pt-br';
        location = 'section-default';
        editorCreated = true;

    }

    const handleEditValue = (e) => {

        let title = e.target.parentElement.parentElement.children[0].children[0].innerHTML;
        let subtitle = e.target.parentElement.parentElement.children[0].children[1].innerHTML;
        let locationHtml = e.target.parentElement.parentElement.children[0].children[2].innerHTML;
        let languageHtml = e.target.parentElement.parentElement.children[0].children[3].innerHTML;
        let ident = e.target.parentElement.parentElement.children[0].children[0].dataset.id;

        exampleTitle = title;
        exampleLorem = subtitle;
        identifier = ident;
        location = locationHtml;
        language = languageHtml;
        editorCreated = false;

    }


</script>