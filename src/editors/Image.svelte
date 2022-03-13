<div class="content media-editor">
    <div class="actions">
        <div class="list-icon">
            <i class="fas fa-list"></i>
        </div>
        <div class="action-create">
            <p>
                Criar
            </p>
            <i class="fas fa-magic"></i>
        </div>
    </div>
    <div class="list-inside-content">
        <ul class="list-editors">

            {#if Images.length <= 0}
                <h3>
                    Não há imagens cadastradas
                </h3>
            {/if}

            {#if Images.length >= 1}
                {#each Images as item, i}
                    <li class="item-editor" data-media="https://cdnlucashiagoio.s3.sa-east-1.amazonaws.com/media/{item}" data-item="{item}">
                        <p>
							<span>
                                <div class="mini-player">
									<img src="https://cdnlucashiagoio.s3.sa-east-1.amazonaws.com/media/{item}" alt="{item.slice(47)}">
                                </div>
                            </span>
                            <span>
                                {item.slice(47)}
                            </span>
                        </p>
                        <div class="action-editors">
                            <i class="fas fa-edit" on:click="{handleEditValue}"></i>
                            <i class="fas fa-trash" data-id="{item.id}" on:click="{deleteMedia}"></i>
                        </div>
                    </li>
                {/each}
            {/if}
 
        </ul>
    </div>
    <div class="divider"></div>

    {#if thisMedia != undefined}
        <div class="media-controller">
            <i class="fas fa-times" on:click={closeMedia}></i>
			
			<!-- svelte-ignore a11y-missing-attribute -->
			<img src="{thisMedia}" alt="register image">

            {#if editorCreated}
                <button class="btn first" on:click={createMedia}>Cadastrar imagem</button>
            {:else}
                <!-- <button class="btn second" on:click={updateVideo}>Atualizar</button> -->
            {/if}
        </div>
    {/if}


    <div class="content-creator">

        <input type="file" name="image" id="image" accept="image/*">
        <button class="btn first" on:click={previewVideo}>Visualizar imagem</button>

    </div>
</div>

<script>

    import { onMount } from 'svelte';
    import startARest, {startRestLoading, setNewNotification, checkLogged} from '../data/httpRequest.js';
    import rollDown from '../data/rollDown.js'; 

    let Images = [];
    let editorCreated = true;
    let preview = false;
    let thisMedia;

    onMount(async () => {

        checkLogged();
        feedUpdate();

    });

    const feedUpdate = async () => {

        startRestLoading();

        const res = await startARest('/media/list', 'GET', null);

        if(res != undefined){

            let treatImages = res[0].listStream;
            let treatedImages = [];

            treatImages.filter(media => {
                if(media.replace('media/', '').length != 0) { 
                    treatedImages.push(media.replace('media/', '')) 
                }
            })

            Images = treatedImages;

            setNewNotification('Imagens carregadas com sucesso!', 'success');

        } else {
            Images = 'Imagens não cadastradas';
        }


    }

    const handleEditValue = (e) => {
        thisMedia = e.target.parentElement.parentElement.dataset.media;
        editorCreated = false;
    }

    const deleteMedia = async (e) => {
        
        await startARest(`/media/delete/${e.target.parentElement.parentElement.dataset.item}`, 'DELETE', null);
        
        setTimeout(() => {
            feedUpdate();
            preview = false;
        }, 500);

        rollDown();

        //setNewNotification('Imagem deletada com sucesso!', 'success');
    }

    const previewVideo = () => {
        let getMedia = document.querySelector('#image')
        thisMedia = window.URL.createObjectURL(getMedia.files[0]);

        preview = true;
        editorCreated = true;

    }

    
    const createMedia = async () => {

        let getMedia = document.querySelector('#image');
        let media = getMedia.files[0];

        await startARest('/media/create', 'POST', media, null, false, 'image');

        setTimeout(() => {
            feedUpdate();
            preview = false;
            thisMedia = undefined;
        }, 500);

        rollDown();
        
        //setNewNotification('Imagem criada com sucesso!', 'success');
    
    }

    const closeMedia = () => {
        thisMedia = undefined;
    }

    const updateMedia = () => {
        //console.log('em construção')
    }
</script>