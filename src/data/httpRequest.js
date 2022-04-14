import { urlEnv } from '../data/environtment.js';
import { readable } from "svelte/store";

let urlDev;
export let Items = readable([]); 

export const startRestLoading = () => {
    document.body.classList.add('loading');
    let startDance = document.createElement('div');
    let startDanceExists = document.querySelector('.startdance');

    if(startDanceExists != undefined || startDanceExists != null) return;

    startDance.setAttribute('class', 'startdance active');

    startDance.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="100%" height="100%" viewBox="0 0 567.000000 681.000000" preserveAspectRatio="xMidYMid meet"><g transform="translate(100,555) scale(0.100000,-0.100000)" fill="currentColor" stroke="none"><path class="hair" d="M2590 6269 c-441 -44 -841 -237 -1152 -557 l-88 -89 -52 18 c-143 49 -216 -4 -316 -226 l-40 -90 -93 0 c-138 -1 -202 -34 -235 -122 -32 -84 -5 -354 46 -454 32 -62 87 -116 138 -136 95 -37 253 -11 376 61 39 23 44 30 51 73 9 65 36 196 42 205 2 5 13 3 24 -3 28 -15 146 17 305 82 144 59 561 267 814 406 173 95 226 114 420 152 371 71 865 60 1248 -30 78 -18 112 -18 86 -1 -5 4 -18 30 -28 57 -102 280 -373 492 -746 585 -280 70 -554 93 -800 69z"/><path class="side-hair" d="M2405 5372 c-554 -302 -980 -490 -1089 -480 -34 3 -36 -3 -61 -142 -48 -273 25 -902 201 -1724 49 -230 52 -240 69 -226 25 21 117 171 142 232 13 32 30 84 38 114 l14 56 -47 48 c-58 59 -142 198 -182 302 -55 142 -65 193 -65 328 0 117 2 129 29 188 78 170 304 278 440 212 61 -29 127 -105 162 -185 l28 -65 184 0 c172 0 184 1 177 18 -23 53 -14 538 11 639 5 16 39 40 129 87 137 71 232 131 314 196 l55 43 -50 17 c-155 50 -269 183 -311 361 l-18 74 -170 -93z"/><path class="left-eyebrow" d="M3625 4735 c-33 -7 -91 -25 -130 -39 -70 -27 -209 -105 -201 -113 2 -2 28 3 57 11 29 9 100 21 158 28 91 10 120 9 206 -6 121 -20 252 -80 333 -152 29 -26 57 -43 61 -38 4 5 29 37 54 71 l47 61 -48 42 c-63 55 -191 117 -277 135 -85 18 -180 18 -260 0z"/><path class="right-eyebrow" d="M4482 4597 c-7 -18 -29 -53 -49 -76 -31 -37 -33 -43 -15 -37 12 3 32 9 45 12 43 12 59 35 52 74 -11 57 -20 64 -33 27z"/><path class="beard" d="M2087 3908 c-9 -123 -59 -227 -130 -270 l-38 -23 4 -515 c4 -542 8 -603 58 -843 68 -329 210 -632 416 -887 143 -177 401 -402 635 -554 l87 -57 108 11 c699 70 1121 261 1383 628 71 99 175 307 216 432 15 47 32 87 36 88 5 2 -19 17 -52 33 -122 57 -229 202 -274 369 l-18 65 -104 -51 c-229 -113 -431 -132 -594 -56 -70 32 -175 137 -216 217 -44 83 -79 185 -99 287 l-17 85 -76 7 c-548 50 -900 430 -958 1034 l-7 72 -177 0 -177 0 -6 -72z"/><path class="mustache" d="M4388 3426 c-121 -50 -241 -178 -351 -376 -65 -118 -59 -119 47 -15 152 150 309 228 487 242 44 3 76 9 70 12 -6 4 -26 41 -45 84 l-35 77 -58 0 c-37 0 -78 -9 -115 -24z"/><path class="goatee" d="M4480 2872 c0 -22 -61 -80 -103 -97 l-42 -17 65 -25 c36 -14 80 -27 99 -30 32 -6 34 -5 28 18 -3 13 -11 51 -18 84 -11 55 -29 96 -29 67z"/></g></svg>`;

    document.body.append(startDance);

    //PREVENTS STOP NEVER CALLS
    // if(startDance != undefined){
    //     setTimeout(() => {
    //         startDance.remove();
    //     }, 1800);
    // }

}

export const stopRestLoading = () => {
    document.body.classList.remove('loading');
    let startDanceExists = document.querySelector('.startdance');

    if(startDanceExists != undefined){
        startDanceExists.classList.add('inactive');
        setTimeout(() => {
            startDanceExists.remove();
        }, 1500);
    }

}

export const setNewNotification = (message, propClass = null) => {
    let divNotification = document.createElement('div');
    let progressBar = document.createElement('progress');
    let notificationController = document.querySelector('.notifications-controller');
    // let notificationClassExists = document.querySelector('.notification');
    // if(notificationClassExists != undefined || notificationClassExists != null) return;
    propClass != null ? divNotification.setAttribute('class', `notification ${propClass}`) : divNotification.setAttribute('class', 'notification');

    progressBar.setAttribute('max', '100');
    progressBar.setAttribute('value', '100');

    divNotification.innerHTML = ` <p> ${message} </p> `;
    divNotification.append(progressBar);
    notificationController.append(divNotification);

    let clearProgress = setInterval(function() {

        progressBar.value = progressBar.value - 1;

        if (progressBar.value == 0) {
            clearInterval(clearProgress);
            divNotification.classList.add('hide');
            setTimeout(() => {
                  divNotification.remove();
            }, 1000);
        }
    }, 25);

}

export const setCookie = (cname, cvalue, expiring) => {
    const d = new Date();
    d.setTime(d.getTime() + (expiring*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires;
}

export const getCookie = (cname) => {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
}

export const checkCookie = (cname) => {
    let check = getCookie(cname);
    if (check != "") {
      console.log("cookie exists:" + check);
    } else {
       console.log("cookie not exists");
    }
}

urlEnv.subscribe(url => urlDev = url);

export const checkLogged = async () => {
    let Token = getCookie('token');
    Token == '' ? window.location.href = '/unauthorized' : '' ;
}

const startARest = async (url, meth, json, customResponse = null, mult = true, file, Token = undefined) => {
    const urls = [
        `${urlDev}${url}`
    ]

    startRestLoading();

    let fetchHeader;
    let fetchType;
    let tken;
 
    Token != undefined ? tken = `Bearer ${Token}` : undefined;

    if(meth == 'POST' || meth == 'PUT'){
        if(mult){
            fetchHeader = {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': tken
            }
    
            fetchType = {
                method: meth,
                body: JSON.stringify(json),
                headers: fetchHeader
            }
        } else {
            const formData = new FormData();
            formData.append(file, json);

            fetchType = {
                method: meth,
                body: formData
            }
        }

        let getReturn = await callFetch(urls, fetchType, customResponse);

        return getReturn;

    } else if (meth == 'DELETE'){

        fetchType = {
            method: meth
        }

        let getReturn = await callFetch(urls, fetchType, customResponse);
        return getReturn;

    } else {

        fetchHeader = {
            'Content-type': 'application/json; charset=UTF-8',
            'Authorization': tken
        }

        fetchType = {
            method: meth,
            headers: new Headers(fetchHeader)
        }

        let getReturn = await callFetch(urls, fetchType, customResponse);

        return getReturn;

    }
}

const callFetch = async (urls, fetchType, customResponse = undefined) => {
    try {
        let res = await Promise.all(urls.map(result => fetch(result, fetchType).then(
                treatResult => {
                    if(!treatResult.ok){
                        treatResult.json().then(responseError => {
                            if(typeof responseError != 'object'){
                                setNewNotification(responseError, 'error');
                            } else {
                                setNewNotification(responseError.error, 'error');

                                return responseError;
                            }
                        })
                    } else if (treatResult == 401){
                        return {error: 'Unauthorized'};
                    } else {
                        return treatResult;
                    }
                }
            )
        ));


        stopRestLoading();
        
        let resJson = await Promise.all(res.map(result => result.json()));
        resJson = resJson.map(result => result);

        (customResponse != undefined && customResponse != true && customResponse != null) ? setNewNotification(customResponse, 'success') : '';

        return resJson;

    }
    catch(err){

        stopRestLoading();

        console.warn(err);
        //setNewNotification(err, 'error');
    }
}

export default startARest;
