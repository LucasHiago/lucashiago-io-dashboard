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
    {   
        name: 'Codes',
        icon: `<i class="fas fa-file-code"></i>`,
        path: 'codes'
    }
]);