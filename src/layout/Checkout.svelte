<svelte:head>
	<script src="https://sdk.mercadopago.com/js/v2" on:load={initializeRemarkable}></script>
</svelte:head>

<h1>{cardType}</h1>

<div class="form-controller">
    <form id="form-checkout" >

        <input type="text" value="49" name="amount"> <button name="donate">Doar</button>

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
</div>

<script>

    import  startARest  from '../data/httpRequest.js';
    let mppublic;
    let cardType;

    const feedPaymentData = (cardData) => {
 
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

        console.log(json)

        startARest('/payment', 'POST', json, 'Pagamento enviado');

        setTimeout(() => {
            json = {};
            console.log('token limpo:', json)
        }, 500);

    }


    const initializeRemarkable = async () => {
        const res = await startARest('/publicmp', 'GET', null);
        mppublic = res.mpublic;
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