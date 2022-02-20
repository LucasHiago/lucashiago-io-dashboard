<svelte:head>
    <script src="https://unpkg.com/frappe-charts@latest"></script>
</svelte:head>

<div class="content dash">
    <div id="frost-chart"></div>
    <div class="donates">
        <div class="title">
            TOTAL DE DOAÇÕES
        </div>
        <div class="donate-result">
            <i class="fas fa-gift"></i>
            {#if getTotal != undefined}
                <span>
                    R$ {getTotal}
                </span>
            {/if}
        </div>
    </div>
</div>

<script>

    import { onMount } from 'svelte';
    import startARest, { setNewNotification, startRestLoading } from '../data/httpRequest.js';

    let titles = [];
    let videos = [];
    let images = [];
    let audios = [];
    let donate = [];
    let totalMedia = [];
    let totalAmount = [];
    let getTotal;
    let getTotalMedias;

    onMount(async () => {

        feedUpdate();

    });

    const feedUpdate = async () => {

        startRestLoading();

        const titlesList = await startARest('/title', 'GET', null);
        const videoList  = await startARest('/video/list', 'GET', null);
        const imagesList = await startARest('/media/list', 'GET', null);
        const audiosList = await startARest('/audio/list', 'GET', null);
        const donateList = await startARest('/history/payments', 'GET', null);

        titles = titlesList.getTitles;
        videos = videoList.listStream;
        images = imagesList.listStream;
        audios = audiosList.listStream;
        donate = donateList.getPayments;

        if(titles == undefined){
            titles = [];
        }

        if(donate){
            donate.map(item => totalAmount.push(Number(item.transaction_amount)));
            getTotal = totalAmount.reduce((previousValue, currentValue) => previousValue + currentValue, 0);

            totalMedia.push(titles.length, videos.length, images.length, audios.length, donate.length)
            getTotalMedias = totalMedia.reduce((previousValue, currentValue) => previousValue + currentValue, 0);
        } else {
            getTotalMedias = 20;
            getTotal = 0;
            donate = 0;
        }   

        initializeRemarkable(titles, videos, images, audios, donate, getTotalMedias);

        setNewNotification('Dados carregados com sucesso!', 'success');


    }
 

    const initializeRemarkable = async (titles, videos, images, audios, donate, total) => {
  
        new frappe.Chart( "#frost-chart", {
        data: {
            labels: ["Títulos", "Vídeos", "Imagens", "Audios", "Doações"],
            datasets: [
                {
                    values: [titles.length, videos.length - 1, images.length - 1, audios.length - 1, donate.length]
                }
            ],
            yMarkers: [
                {
                    label: " ",
                    value: total*1.15,
                    options: { labelPos: 'left' } // default: 'right'
                }
            ],
        },



        lineOptions: {
            regionFill: 1 // default: 0
        },

        title: "Medias cadastradas",
        type: 'line', // or 'bar', 'line', 'pie', 'percentage'
        height: 300,
        colors: ['purple', '#ffa3ef', 'light-blue'],

        tooltipOptions: {
            formatTooltipX: d => (d + '').toUpperCase(),
            formatTooltipY: d => d + ' ',
        }
    });

    }
</script>