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
                            {#if item.businessPic}
                                <span class="businessPic" data-id={item.id}>
                                    <div class="mini-player">
                                        <img src="https://cdnlucashiagoio.s3.sa-east-1.amazonaws.com/{item.businessPic}" data-media="{item.businessPic}" alt="">  
                                    </div>
                                </span>
                            {/if}
                            {#if item.businessName}
                                <span class="businessName">
                                    {item.businessName}
                                </span>
                            {/if}
                            {#if item.businessDescription}
                                <span class="businessDescription">
                                    {item.businessDescription}
                                </span>
                            {/if}
                            {#if item.businessLink}
                                <span class="businessLink">
                                    {item.businessLink}
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
                    <button class="btn first image-list" on:click="{openModal}"> Adicionar Logo </button>
                {/if}
                <input type="text" class="email" bind:value={devEmail} placeholder="Nome do cliente">
                <input type="text" class="points" bind:value={devDiscord} placeholder="Link do cliente">
                <textarea type="text" class="name" bind:value={devDescription} placeholder="Descrição"  rows="5" cols="33"/>
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

    let devName, devRender, devEmail, devDiscord, devDescription;
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
    
       const res = await startARest('/cases', 'GET');

       if(res != undefined){
        Titles = res[0].getCollabs;
        setNewNotification('Cases carregados com sucesso!', 'success');
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
            description: devDescription,  
            link: devDiscord == undefined ? devDiscord = '' : devDiscord
		};

        await startARest('/cases/create', 'POST', json);

        setTimeout(() => {
            feedUpdate();
        }, 500);


    }

    const updateWord = async () => {

        let json = {
            picture: devName, 
            name: devEmail, 
            description: devDescription,  
            link: devDiscord == undefined ? devDiscord = '' : devDiscord
		};

        await startARest(`/cases/update/${identifier}`, 'PUT', json);

        setTimeout(() => {
            feedUpdate();
        }, 550);


    }

    const deleteWord = async (e) => {

        await startARest(`/cases/delete/${e.target.dataset.id}`, 'DELETE', null);

        setTimeout(() => {
            feedUpdate();
        }, 500);

    }

    const startEditor = (e) => {

        devName = '', devRender = undefined, devEmail = '', devDiscord = '', devDescription = '';

        editorCreated = true;

    }

    const handleEditValue = (e) => {

        identifier = e.target.parentElement.parentElement.children[0].children[0].dataset.id;
        
        devName = e.target.parentElement.parentElement.children[0].children[0].children[0].children[0].dataset.media;
        devRender = e.target.parentElement.parentElement.children[0].children[0].children[0].children[0].src;
        devEmail = e.target.parentElement.parentElement.children[0].children[1].innerHTML;
        devDescription = e.target.parentElement.parentElement.children[0].children[2].innerHTML;
        devDiscord = e.target.parentElement.parentElement.children[0].children[3] == undefined ? '' : e.target.parentElement.parentElement.children[0].children[3].innerHTML;

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