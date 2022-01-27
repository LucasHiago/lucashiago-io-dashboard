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

            {#each Titles as item}
                <li class="item-editor">
                    <p>
                        {#if item.title}
                            <span class="title">
                                {item.title}
                            </span>
                        {/if}
                        {#if item.subtitle}
                            <span class="subtitle">
                                {item.subtitle}
                            </span>
                        {/if}
                    </p>
                    <div class="action-editors">
                        <i class="fas fa-edit" on:click="{handleEditValue}"></i>
                        <i class="fas fa-trash"></i>
                    </div>
                </li>
            {/each}

        </ul>
    </div>
    <div class="divider"></div>
    <div class="content-creator">

        <input class="title" bind:value={exampleTitle} />
        <textarea bind:value={exampleLorem} id="" cols="30" rows="10"></textarea>

        {#if editorCreated}
            <button on:click={createWord}>Criar</button>
        {:else}
            <button on:click={updateWord}>Atualizar</button>
        {/if}
     
    </div>
</div>

<script>
    import { onMount } from 'svelte';

    let exampleTitle = 'Example Title';
    let exampleLorem = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi ex aliquam nesciunt repudiandae provident eius, rerum inventore veniam ducimus? Placeat animi illum repellat accusantium nemo beatae repudiandae. Aspernatur, magni quo!';
    let editorCreated = true;


    import { urlEnv } from '../data/environtment.js';

    let urlDev;
    let getWord;
    let Titles = [];

    urlEnv.subscribe(url => urlDev = url);

    onMount(async () => {
        //titles

        const urls = [
            `${urlDev}/title`,
            // `${urlDev}/subtitle`
        ];
        
        try{

            let res = await Promise.all(urls.map(e => fetch(e)));
            let resJson = await Promise.all(res.map(e => e.json()));
            resJson = resJson.map(e => e.getTitles);
            console.log(resJson);
            Titles = resJson[0];

        }catch(err) {
            console.log(err)
        }

	});


    const startARest = async (url, meth, json) => {
        const urls = [
            `${urlDev}${url}`,
            // `${urlDev}/subtitle`
        ];

        const fetchHeader = {
            "Content-type": "application/json; charset=UTF-8"
        }

        const fetchType = {
			method: meth,
			body: JSON.stringify(json),
            headers: fetchHeader
		};
        
        try{
            let res = await Promise.all(urls.map(e => fetch(e, fetchType)))
            let resJson = await Promise.all(res.map(e => e.json()))
            resJson = resJson.map(e => e)
            // console.log(resJson)
            Titles = resJson;

        }catch(err) {
            console.log(err)
        }
    }


    const createWord = () => {
        console.log('create', exampleTitle, exampleLorem);
        
        let json = {
                location: 'Word Svelte',
				title: exampleTitle,
				subtitle: exampleLorem,
                language: 'pt'
		};

        startARest('/title/create', 'POST', json);
    }

    const updateWord = () => {
        console.log('update', exampleTitle, exampleLorem)
    }

    const startEditor = (e) => {

        exampleTitle = 'Example Title';
        exampleLorem = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi ex aliquam nesciunt repudiandae provident eius, rerum inventore veniam ducimus? Placeat animi illum repellat accusantium nemo beatae repudiandae. Aspernatur, magni quo!';
        editorCreated = true;

    }

    const handleEditValue = (e) => {

        let title = e.target.parentElement.parentElement.children[0].children[0].innerHTML;
        let subtitle = e.target.parentElement.parentElement.children[0].children[1].innerHTML;
        exampleTitle = title;
        exampleLorem = subtitle;
        editorCreated = false;

    }


</script>