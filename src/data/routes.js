import { readable } from "svelte/store";

export const routesArray = readable([
    {
        name: 'Home',
        icon: '',
        path: '/'
    },
    {
        name: 'Word',
        icon: `<i class="fas fa-file-word"></i>`,
        path: 'word'
    },
    {   
        name: 'Video',
        icon: `<i class="fas fa-file-video"></i>`,
        path: 'video'
    },
    {
        name: 'Image',
        icon: `<i class="fas fa-file-image"></i>`,
        path: 'image'
    },
    {
        name: 'Audio',
        icon: `<i class="fas fa-file-audio"></i>`,
        path: 'audio'
    },
    {
        name: 'Payment',
        icon: `<i class="fas fa-file-invoice-dollar"></i>`,
        path: 'payment'
    },
    // {   
    //     name: 'Codes',
    //     icon: `<i class="fas fa-file-code"></i>`,
    //     path: 'codes'
    // },
    {
        name: 'Skills',
        icon: `<i style="font-size:24px;" class="fas fa-chart-pie"></i>`,
        path: 'skills'
    },
    {
        name: 'Leads',
        icon: '<i style="font-size:22px;" class="fas fa-leaf"></i>',
        path: 'leads'
    },
    {
        name: 'Quest',
        icon: '<i style="font-size:22px;" class="fas fa-scroll"></i>',
        path: 'quest'
    },
    {
        name: 'Faq',
        icon: '<i class="fas fa-clipboard-list"></i>',
        path: 'faq'
    },
    {
        name: 'Collab',
        icon: '<i style="font-size:22px;" class="fas fa-coffee"></i>',
        path: 'collab'
    }
]);