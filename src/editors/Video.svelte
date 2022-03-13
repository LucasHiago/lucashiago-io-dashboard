<div class="content video-editor">
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

            {#if Videos.length <= 0}
                <h3>
                    Não há vídeos cadastrados
                </h3>
            {/if}

            {#if Videos.length >= 1}
                {#each Videos as item, i}
                    <li class="item-editor" data-video="https://cdnlucashiagoio.s3.sa-east-1.amazonaws.com/videos/{item}" data-item="{item}">
                        <p>
                            <span>
                                <div class="mini-player">
                                    <video autoplay muted loop>
                                        <source src="https://cdnlucashiagoio.s3.sa-east-1.amazonaws.com/videos/{item}" />
                                    </video>
                                </div>
                            </span>
                            <span>
                                {item.slice(47)}
                            </span>
                        </p>
                        <div class="action-editors">
                            <i class="fas fa-edit" on:click="{handleEditValue}"></i>
                            <i class="fas fa-trash" data-id="{item.id}" on:click="{deleteVideo}"></i>
                        </div>
                    </li>
                {/each}
            {/if}
 
        </ul>
    </div>
    <div class="divider"></div>

    {#if thisVideo != undefined}
        <div class="video-controller">
            <i class="fas fa-times" on:click={closeVideo}></i>
            <video controls>
                <source  src="{thisVideo}" />
                <track kind="captions">
            </video>
            {#if editorCreated}
                <button class="btn first" on:click={createVideo}>Cadastrar video</button>
            {:else}
                <!-- <button class="btn second" on:click={updateVideo}>Atualizar</button> -->
            {/if}
        </div>
    {/if}


    <div class="content-creator">

        <input type="file" name="video" id="video" accept="video/mp4">
        <button class="btn first" on:click={previewVideo}>Visualizar video</button>

    </div>
</div>

<script>

    import { onMount } from 'svelte';
    import startARest, {startRestLoading, setNewNotification, checkLogged} from '../data/httpRequest.js';
    import rollDown from '../data/rollDown.js'; 

    let Videos = [];
    let editorCreated = true;
    let preview = false;
    let thisVideo;

    onMount(async () => {

        checkLogged();
        feedUpdate();

    });

    const feedUpdate = async () => {

        startRestLoading();

        const res = await startARest('/video/list', 'GET', null);
        if(res != undefined){

            let treatVideos = res[0].listStream;
            let treatedVideos = [];

            treatVideos.filter(video => {
                if(video.replace('videos/', '').length != 0) { 
                    treatedVideos.push(video.replace('videos/', '')) 
                }
            })

            Videos = treatedVideos;

            setNewNotification('Vídeos carregados com sucesso!', 'success');

        } else {
            Videos = 'Videos não cadastrados';
        }


    }

    const handleEditValue = (e) => {
        thisVideo = e.target.parentElement.parentElement.dataset.video;
        editorCreated = false;
    }

    const deleteVideo = (e) => {
        
        startARest(`/video/delete/${e.target.parentElement.parentElement.dataset.item}`, 'DELETE', null);
        
        setTimeout(() => {
            feedUpdate();
            preview = false;
        }, 500);

        rollDown();
        setNewNotification('Vídeo deletado com sucesso!', 'success');
    }

    const previewVideo = () => {
        let getVideo = document.querySelector('#video')
        thisVideo = window.URL.createObjectURL(getVideo.files[0]);

        preview = true;
        editorCreated = true;

    }

    
    const createVideo = () => {

        let getVideo = document.querySelector('#video');
        let video = getVideo.files[0];

        startARest('/video/create', 'POST', video, null, false, 'video');

        setTimeout(() => {
            feedUpdate();
            preview = false;
            thisVideo = undefined;
        }, 500);

        rollDown();
        
        //CRIAR UMA MANEIRA DE PREVENIR MENSAGEM CASO RETORNE ERRO
        setNewNotification('Vídeo criado com sucesso!', 'success');
    
    }

    const closeVideo = () => {
        thisVideo = undefined;
    }

    const updateVideo = () => {
        console.log('em construção')
    }
</script>