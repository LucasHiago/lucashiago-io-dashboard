<div class="content word-editor collab">
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
                            {#if item.devPic}
                                <span class="devPic" data-id={item.id}>
                                    <div class="mini-player">
                                        <img src="https://cdnlucashiagoio.s3.sa-east-1.amazonaws.com/{item.devPic}" data-media="{item.devPic}" alt="">  
                                    </div>
                                </span>
                            {/if}
                            {#if item.devName}
                                <span class="devName">
                                    {item.devName}
                                </span>
                            {/if}
                            {#if item.devLink}
                                <span class="devLink">
                                    {item.devLink}
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
                {#if devRender != undefined}
                    <div class="image-control">
                        <i class="fas fa-times" on:click="{deletFeedDevMedia}"></i>
                        <img src={devRender} alt="">
                    </div>
                {:else}
                    <button class="btn first image-list" on:click="{openModal}"> Adicionar foto </button>
                {/if}
                <input type="text" class="email" bind:value={devEmail} placeholder="Nome do dev">
                <input type="text" class="points" bind:value={devDiscord} placeholder="Link de portifólio">
            </div>

        </div>

        <div class="modal-controller unview">
            <i class="fas fa-times" on:click="{closeModal}"></i>
            <div class="modal image-list">
                <ul class="list-editors">
                    {#if Images.length <= 0}
                        <h3>
                            Não há imagens cadastradas
                        </h3>
                    {/if}
                    {#if Images.length >= 1}
                        {#each Images as item, i}
                            <li class="item-editor" data-media="{item}" data-item="{item}">
                                <p>
                                    <span>
                                        <div class="mini-player">
                                            <img src="https://cdnlucashiagoio.s3.sa-east-1.amazonaws.com/{item}" alt="{item.slice(47)}">
                                        </div>
                                    </span>
                                    <span>
                                        {item.slice(47)}
                                    </span>
                                </p>
                                <div class="action-editors">
                                    <i class="fas fa-file" data-id="{item.id}" on:click="{feedDevMedia}"></i>
                                </div>
                            </li>
                        {/each}
                    {/if}
                </ul>
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

    let devName, devRender, devEmail, devDiscord;
    let editorCreated = true;
    let identifier = null;
    let Titles = [];
    let Images = [];



    onMount(async () => {

        checkLogged();
        feedUpdate();
        
	});

    const feedUpdate = async () => {

       //startRestLoading();
    
       const res = await startARest('/collab', 'GET');

       if(res != undefined){
        Titles = res[0].getCollabs;
        setNewNotification('Colaboradores carregados com sucesso!', 'success');
       } else {
        Titles = 'Sem itens';
       }

       const imgs = await startARest('/media/list', 'GET', null);

        if(imgs != undefined){

            let treatImages = imgs[0].listStream;
            let treatedImages = [];

            treatImages.filter(media => {
                if(media.replace('media/', '').length != 0) { 
                    treatedImages.push(media) 
                }
            })

            Images = treatedImages;

            setNewNotification('Imagens carregadas com sucesso!', 'success');

        } else {
            Images = 'Imagens não cadastradas';
        }


       rollDown();

    }


    const createWord = async () => {

        let json = {
            picture: devName, 
            name: devEmail, 
            link: devDiscord == undefined ? devDiscord = '' : devDiscord
		};

        await startARest('/collab/create', 'POST', json);

        setTimeout(() => {
            feedUpdate();
        }, 500);


    }

    const updateWord = async () => {

        let json = {
            picture: devName, 
            name: devEmail, 
            link: devDiscord == undefined ? devDiscord = '' : devDiscord
		};

        await startARest(`/collab/update/${identifier}`, 'PUT', json);

        setTimeout(() => {
            feedUpdate();
        }, 550);


    }

    const deleteWord = async (e) => {

        await startARest(`/collab/delete/${e.target.dataset.id}`, 'DELETE', null);

        setTimeout(() => {
            feedUpdate();
        }, 500);

    }

    const startEditor = (e) => {

        devName = '', devRender = undefined, devEmail = '', devDiscord = '';

        editorCreated = true;

    }

    const handleEditValue = (e) => {

        identifier = e.target.parentElement.parentElement.children[0].children[0].dataset.id;
        
        devName = e.target.parentElement.parentElement.children[0].children[0].children[0].children[0].dataset.media;
        devRender = e.target.parentElement.parentElement.children[0].children[0].children[0].children[0].src;
        devEmail = e.target.parentElement.parentElement.children[0].children[1].innerHTML;
        devDiscord = e.target.parentElement.parentElement.children[0].children[2] == undefined ? '' : e.target.parentElement.parentElement.children[0].children[2].innerHTML;

        editorCreated = false;

    }

    const deletFeedDevMedia = () => {
        devRender = undefined;
        devName = undefined;
    }

    const feedDevMedia = (e) => {
        devName = e.target.parentElement.parentElement.dataset.media;
        devRender = `https://cdnlucashiagoio.s3.sa-east-1.amazonaws.com/${devName}`;
        
        closeModal();
    }

    const openModal = () => {
        let modalController = document.querySelector('.modal-controller');
        modalController.classList.remove('unview');
    }

    const closeModal = () => {
        let modalController = document.querySelector('.modal-controller');
        modalController.classList.add('unview');
    }


</script>