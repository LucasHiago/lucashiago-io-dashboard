<svelte:head>
	<script src="https://sdk.mercadopago.com/js/v2" on:load={initializeRemarkable}></script>
</svelte:head>

<h1>{cardType}</h1>

<div class="form-controller">
    <form id="form-checkout" >

        <input type="text" bind:value={amount} name="amount"> <button name="donate">Doar</button>

        <input type="text" name="cardNumber" id="form-checkout__cardNumber" />
        <input type="text" name="cardExpirationMonth" id="form-checkout__cardExpirationMonth" />
        <input type="text" name="cardExpirationYear" id="form-checkout__cardExpirationYear" />
        <input type="text" name="cardholderName" id="form-checkout__cardholderName"/>
        <input type="email" name="cardholderEmail" id="form-checkout__cardholderEmail"/>
        <input type="text" name="securityCode" id="form-checkout__securityCode" />
        <select name="issuer" id="form-checkout__issuer"></select>
        <select name="identificationType" id="form-checkout__identificationType"></select>
        <input type="text" name="identificationNumber" id="form-checkout__identificationNumber"/>
        <select name="installments" id="form-checkout__installments"></select>
        <button type="submit" id="form-checkout__submit">Pay</button>
     
        <progress value="0" class="progress-bar">loading...</progress>
    </form>

    <div id="form-checkout-pix">
        <h3 class="title">Buyer Details</h3>
        <div class="row">
            <div class="form-group col-sm-6">
                <input id="form-checkout__payerPixFirstName" name="name" type="text" class="form-control" placeholder="First name"/>
                <span></span>
            </div>
            <div class="form-group col-sm-6">
                <input id="form-checkout__payerPixLastName" name="lastName" type="text" class="form-control" placeholder="Last name"/>
                <span></span>
            </div>
        </div>
        <div class="row">
            <div class="form-group col">
                <input id="form-checkout__payerPixEmail" name="email" type="email" class="form-control" placeholder="E-mail"/>
                <span></span>
            </div>
        </div>
        <div class="row">
            <div class="form-group col-sm-5">
                <select id="form-checkout__identificationPixType" name="identificationType" class="form-control">
                    <option value="CPF">CPF</option>
                    <option value="CNPJ">CNPJ</option>
                </select>
            </div>
            <div class="form-group col-sm-7">
                <input id="form-checkout__identificationPixNumber" name="identificationNumber" type="text" class="form-control" placeholder="Identification number" />
                <span></span>
            </div>
        </div>
        <br>
        <div class="row">
            <div class="form-group col-sm-12">
                <input type="hidden" id="amount" bind:value={amount} />
                <input type="hidden" id="description" bind:value={description} />
                <button id="form-checkout__submit" class="btn btn-primary btn-block" on:click="{paymentPix}">Gerar Pix</button>
            </div>
        </div>
    </div>

    <div class="pix-payment">
        {#if pixResponse != undefined}
             <span> Pix total: R$ {pixResponse.total_paid_amount} </span>
             <img style="width: 250px; margin: 25px;" src="data:image/jpeg;charset=utf-8;base64, {pixResponse.qr_code_base64}" alt="">
             <span>
                 {pixResponse.qr_code}
             </span>
        {/if}
    </div>
</div>

<script>

    import  startARest, { setNewNotification }  from '../data/httpRequest.js';
    let mppublic;
    let cardType;
    let amount = 49;
    let description = 'Donate pix';
    let pixResponse;

    const feedPaymentData = async (cardData) => {
 
        let json = {
            transactionAmount: cardData.amount,
            token: cardData.token,
            installments: cardData.installments,
            paymentMethodId: cardData.paymentMethodId,
            issuerId: cardData.issuerId,
            email: cardData.cardholderEmail,
            type: cardData.identificationType,
            number: cardData.identificationNumber
        }

        let res = await startARest('/payment', 'POST', json, 'Pagamento enviado');

        if(res){
            setTimeout(() => {
                json = {};
                console.log('token limpo:', json)
            }, 500);
        }

    }

    const paymentPix = async () => {

        let getAllInputs = document.querySelectorAll('#form-checkout-pix input');
        let getType = document.querySelector('#form-checkout__identificationPixType');
        let email = getAllInputs[2].value;
        let name = getAllInputs[0].value;
        let last_name = getAllInputs[1].value;
        let type = getType.value;
        let number = getAllInputs[3].value;
        let transactionAmount = amount;
        
        [...getAllInputs].map(pixData => {
            if(pixData.value == ''){
                pixData.parentElement.children[1].innerHTML = `<span>O campo ${pixData.name} está vazio véio</span>`;
            } else {
                pixData.parentElement.children[1].innerHTML = '';
            }
        })
        

        let json = {
            email,
            name,
            last_name,
            type,
            number,
            transactionAmount
        }

        console.log(json)

        if(![email, name, last_name, type, number, transactionAmount].includes('')){
            const res = await startARest('/payment/pix', 'POST', json, 'Pix gerado com sucesso!');
            pixResponse = res[0].makePayment;
            console.log(pixResponse)
        }
        



    }


    const initializeRemarkable = async () => {
        const res = await startARest('/publicmp', 'GET', null);
        mppublic = res[0].mpublic;

        console.log(mppublic)

        const mp = new MercadoPago(mppublic, {
            locale: 'pt-BR',
            advancedFraudPrevention: true,
        });

        let amnt = document.querySelector('[name="amount"]');
        let donate = document.querySelector('[name="donate"]');

        donate.addEventListener('click', (e) => {
            e.preventDefault();
            changeCardForm(amnt.value);
        })

        const changeCardForm = (pay) => {

            cardForm.unmount();

            setTimeout(() => {
                if(pay >= 1 && pay < 5000){

                    cardForm = mp.cardForm({
                        amount: pay,
                        autoMount: true,
                        processingMode: 'aggregator',
                        form: {
                            id: 'form-checkout',
                            cardholderName: {
                                id: 'form-checkout__cardholderName',
                                placeholder: 'Cardholder name',
                            },
                            cardholderEmail: {
                                id: 'form-checkout__cardholderEmail',
                                placeholder: 'Email',
                            },
                            cardNumber: {
                                id: 'form-checkout__cardNumber',
                                placeholder: 'Card number',
                            },
                            cardExpirationMonth: {
                                id: 'form-checkout__cardExpirationMonth',
                                placeholder: 'MM'
                            },
                            cardExpirationYear: {
                                id: 'form-checkout__cardExpirationYear',
                                placeholder: 'YYYY'
                            },
                            securityCode: {
                                id: 'form-checkout__securityCode',
                                placeholder: 'CVV',
                            },
                            installments: {
                                id: 'form-checkout__installments',
                                placeholder: 'Total installments'
                            },
                            identificationType: {
                                id: 'form-checkout__identificationType',
                                placeholder: 'Document type'
                            },
                            identificationNumber: {
                                id: 'form-checkout__identificationNumber',
                                placeholder: 'Document number'
                            },
                            issuer: {
                                id: 'form-checkout__issuer',
                                placeholder: 'Emissor'
                            }
                        },
                        callbacks: {
                            onFormMounted: error => {
                                if (error) return console.warn('Form Mounted handling error: ', error)
                                console.log('Form mounted')
                            },
                            onFormUnmounted: error => {
                                if (error) return console.warn('Form Unmounted handling error: ', error)
                                console.log('Form unmounted')
                            },
                            onIdentificationTypesReceived: (error, identificationTypes) => {
                                if (error) return console.warn('identificationTypes handling error: ', error)
                                console.log('Identification types available: ', identificationTypes)
                            },
                            onPaymentMethodsReceived: (error, paymentMethods) => {
                                if (error) return console.warn('paymentMethods handling error: ', error)
                                console.log('Payment Methods available: ', paymentMethods)
                                cardType = paymentMethods[0].name;
                            },
                            onIssuersReceived: (error, issuers) => {
                                if (error) return console.warn('issuers handling error: ', error)
                                console.log('Issuers available: ', issuers)
                            },
                            onInstallmentsReceived: (error, installments) => {
                                if (error) return console.warn('installments handling error: ', error)
                                console.log('Installments available: ', installments)
                            },
                            onCardTokenReceived: (error, token) => {
                                if (error) return console.warn('Token handling error: ', error)
                                console.log('Token available: ', token)
                            },
                            onSubmit: (event) => {
                                event.preventDefault();
                                const cardData = cardForm.getCardFormData();
                                //console.log('CardForm data available: ', cardData)
                                feedPaymentData(cardData);


                            },
                            onFetching:(resource) => {
                                console.log('Fetching resource: ', resource)

                                // Animate progress bar
                                const progressBar = document.querySelector('.progress-bar')
                                progressBar.removeAttribute('value')

                                return () => {
                                    progressBar.setAttribute('value', '0')
                                }
                            },
                        }
                    });

                }
            }, 250);

        }

        let cardForm = mp.cardForm({
                amount: '49',
                autoMount: true,
                processingMode: 'aggregator',
                form: {
                    id: 'form-checkout',
                    cardholderName: {
                        id: 'form-checkout__cardholderName',
                        placeholder: 'Cardholder name',
                    },
                    cardholderEmail: {
                        id: 'form-checkout__cardholderEmail',
                        placeholder: 'Email',
                    },
                    cardNumber: {
                        id: 'form-checkout__cardNumber',
                        placeholder: 'Card number',
                    },
                    cardExpirationMonth: {
                        id: 'form-checkout__cardExpirationMonth',
                        placeholder: 'MM'
                    },
                    cardExpirationYear: {
                        id: 'form-checkout__cardExpirationYear',
                        placeholder: 'YYYY'
                    },
                    securityCode: {
                        id: 'form-checkout__securityCode',
                        placeholder: 'CVV',
                    },
                    installments: {
                        id: 'form-checkout__installments',
                        placeholder: 'Total installments'
                    },
                    identificationType: {
                        id: 'form-checkout__identificationType',
                        placeholder: 'Document type'
                    },
                    identificationNumber: {
                        id: 'form-checkout__identificationNumber',
                        placeholder: 'Document number'
                    },
                    issuer: {
                        id: 'form-checkout__issuer',
                        placeholder: 'Emissor'
                    }
                },
                callbacks: {
                    onFormMounted: error => {
                        if (error) return console.warn('Form Mounted handling error: ', error)
                        console.log('Form mounted')
                    },
                    onFormUnmounted: error => {
                        if (error) return console.warn('Form Unmounted handling error: ', error)
                        console.log('Form unmounted')
                    },
                    onIdentificationTypesReceived: (error, identificationTypes) => {
                        if (error) return console.warn('identificationTypes handling error: ', error)
                        console.log('Identification types available: ', identificationTypes)
                    },
                    onPaymentMethodsReceived: (error, paymentMethods) => {
                        if (error) return console.warn('paymentMethods handling error: ', error)
                        console.log('Payment Methods available: ', paymentMethods)
                        cardType = paymentMethods[0].name;
                    },
                    onIssuersReceived: (error, issuers) => {
                        if (error) return console.warn('issuers handling error: ', error)
                        console.log('Issuers available: ', issuers)
                    },
                    onInstallmentsReceived: (error, installments) => {
                        if (error) return console.warn('installments handling error: ', error)
                        console.log('Installments available: ', installments)
                    },
                    onCardTokenReceived: (error, token) => {
                        if (error) return console.warn('Token handling error: ', error)
                        console.log('Token available: ', token)
                    },
                    onSubmit: (event) => {
                        event.preventDefault();
                        const cardData = cardForm.getCardFormData();
                        //console.log('CardForm data available: ', cardData)
                        feedPaymentData(cardData);

                    },
                    onFetching:(resource) => {
                        console.log('Fetching resource: ', resource)

                        // Animate progress bar
                        const progressBar = document.querySelector('.progress-bar')
                        progressBar.removeAttribute('value')

                        return () => {
                            progressBar.setAttribute('value', '0')
                        }
                    },
                }
            });

    }

    //const mp = new MercadoPago('YOUR_PUBLIC_KEY');
</script>