//Globals vars
let API_SERVER='https://flightdemy.com/';

//Check if the user is logged in by checking the local storage var
let loggedIn= localStorage.getItem('loggedIn');

//Check if uuid is setted, if not... create a new one and store it
let uuid=localStorage.getItem('uuid');
if(!uuid){
    uuid=generateRandomString();
    localStorage.setItem('uuid',uuid);
}

$(document).ready(function(){
    //Store an event when the user click on the ad (ad-box)
    $('.ad-box a').click(function(){
        trackEvent('clickAd');
    });

    /**
     * Check if the user is logged in...
     * If it is, show the trainer
     * If it is not, show the popup
     */
    if(loggedIn){
        //Track the event
        trackEvent('loadTrainer');

        //Show trainer
        showTrainer();

    }else{
        //Track the event
        trackEvent('open_NoRegistered');
        //Show the popup
        showPopup();
    }
    /**
     * Registration
     *
     * Grab the data from the form and send it to the server to generate the OTP Code
     */

    $('#firststep-register').submit(function(e){
        e.preventDefault();

        //Grab vars
        let name=$('#register_name').val();
        let email=$('#register_email').val();
        let company=$('#register_company').val();

        //Email Pattern
        var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

        if(name=="" || email=="" || !email.match(validRegex)){
            showAlert('Please fill all the fields with valid data','error');
            return false;
        }

        //Show loading animation
        loadingAnimationButton('#register-btn');

        //Sending to the server
        $.get(API_SERVER+'api.php',
            {
                m:'apps',
                f:'registerOTP',
                name:name,
                email:email,
                company:company,
                uuid:uuid,
                app:"a320-fap-mockup",
            },function (rta) {
                //Remove loading animation
                clearLoadingAnimationButton();

                //Parse the response
                rta=JSON.parse(rta);
                //If the result is error, show the error
                if(rta.result=='error'){
                    showAlert('#registration-error-msg',rta.msg);
                }

                //If the result is success, show the otp validation form
                if(rta.result=='success'){
                    //Show the correct form
                    $('#firststep-register').slideUp();
                    $('#otp-validation').slideDown();

                    //Show the option to re-send it
                    setTimeout(function(){
                        $('.resend-btn').show();
                    },3000);

                    //Store the variables
                    localStorage.setItem('user_name',name);
                    localStorage.setItem('user_email',email);

                    //Set name and email in account section
                    $('#user_name').text(localStorage.getItem('user_name'));
                    $('#user_email').text(localStorage.getItem('user_email'));
                }
            }
        );
    });

    /**
     * When the last .otp-digit is filled, let's submit the form
     */
    $('.otp-digit').change(function(){
        if($(this).val().length==1){
            //Grab the code from the inputs
            var otp='';
            otp=$('.otp-digit').map(function(){
                return $(this).val();
            }).get().join('');

            if(otp.length==4){
                //Show animation
                $('.otp-box .loading').show();

                $.getJSON(API_SERVER+'api.php',
                    {
                        m:'apps',
                        f:'validateOTP',
                        app:"a320-fap-mockup",
                        uuid:uuid,
                        otp:otp
                    },function(rta){

                        //Clear the inputs
                        $('#register_name').val('');
                        $('#register_email').val('');
                        $('#register_company').val('');

                        //Hide animation
                        $('.otp-box .loading').hide();
                        //Clear the inputs
                        $('.otp-digit').val('');

                        if(rta.result=='error'){
                            showAlert(rta.msg,'error');
                        }

                        if(rta.result=='success'){
                            //Hide the popup
                            hidePopup();

                            //Show trainer
                            showTrainer();

                            //Show account box
                            $('.account_box').show();

                            //Save the event
                            trackEvent('register');

                            //Store our flag
                            localStorage.setItem('loggedIn',true);

                        }
                    });
            }
        }
    });

    //Once the user enter a digit in .otp-digit let's focus on the next one
    $('.otp-digit').keyup(function(){
        if($(this).val().length==1){
            $(this).next('.otp-digit').focus();
        }
    });

    //If the user paste a 4-digit code in the first .otp-digit, let's divide it in 4 inputs
    $('.otp-digit').on('paste',function(){
        var $this=$(this);
        setTimeout(function(){
            var val=$this.val();
            if(val.length==4){
                for(var i=0;i<4;i++){
                    $this.val(val[i]);
                    $this=$this.next('.otp-digit');
                }
            }
        },50);
        //Unfocus the last input
        setTimeout(function(){
            $('.otp-digit').blur();
        },200);
    });

    //When last .otp-digit is filled, focus out
    $('.otp-digit').last().keyup(function(){
        if($(this).val().length==1){
            $(this).blur();
        }
    });
});

/**
 * Resend the OTP code
 */
function resendOTP(){
    $.getJSON(API_SERVER+'api.php',{
        m:'apps',
        f:'resendOTP',
        app:"a320-fap-mockup",
        uuid:uuid
    },function(rta){
        showAlert(rta.msg,rta.result);
    });
}

/**
 * Generate a random string
 * Default length is 20
 * @param length
 * @return {string}
 */
function generateRandomString(length = 20) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }

    return result;
}

/**
 * Show the first step of the registration
 */
function backBtn(){
    //Show the correct step
    $('#firststep-register').slideDown();
    $('#otp-validation').slideUp();
}

/**
 * Logout the user
 *
 * @return {boolean}
 */
function logout(){

    if(!confirm('Do you want to logout?')){
        return false;
    }

    //Remove local storage
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');

    //Hide trainer
    hideTrainer();

    //Show the correct step
    $('#firststep-register').slideDown();
    $('#otp-validation').slideUp();

    //Show the popup
    showPopup();

    //Track the event
    trackEvent('logout');
}


/**
 * Track an event
 *
 * @param name
 * @param value
 */
function trackEvent(name,value){

    var eventData={};
    eventData.m='apps';
    eventData.f='registerEvent';
    eventData.app='a320-fap-mockup';
    eventData.uuid=uuid;
    eventData.eventName=name;
    eventData.eventValue=value;

    //Other params
    eventData.screenSize=screen.width+'x'+screen.height;

    //If the event is loadTrainer... let's send user info to identify it
    if(name=='register'){
        eventData.name=localStorage.getItem('user_name');
        eventData.email=localStorage.getItem('user_email');
    }

    //Sending to the server
    $.get(API_SERVER+'api.php',eventData);
}

/**
 * Show the trainer
 */
function showTrainer(){
    //Set name and email in account section
    $('.account_box #user_name').text(localStorage.getItem('user_name'));
    $('.account_box #uuid').text(localStorage.getItem('uuid').substring(0,8));

    //Show trainer
    $('.trainer-container').show();
    //Show account box
    $('.account_box').show();
    //Show menu toggler
    $('.menu-button').show();
}

/**
 * Hide the trainer
 */
function hideTrainer(){
    //Hide trainer
    $('.trainer-container').hide();
    //Hide account box
    $('.account_box').hide();
    //Hide menu toggler
    $('.menu-button').hide();
}

/**
 * Show the popup for registration
 */
function showPopup(){
    //Show the popup
    $('.welcome-container').show();
}

/**
 * Hide the popup for registration
 */
function hidePopup(){
    //Remove the popup
    $('.welcome-container').hide();
}

/**
 * Show a loading animation in a button
 *
 * @param id
 */
function loadingAnimationButton(id){
    //Add the spinner to the button
    $(id).append('<img id="loadingSpinner" src="img/spinner.svg" style="margin-left:20px;max-height: 30px">');
}

/**
 * Remove the loading animation from a button
 */
function clearLoadingAnimationButton(){
    //Remove the spinner
    $('#loadingSpinner').remove();
}

/**
 * This will show an error message related to the account
 */
function showAccountProblem(){
    //Generate a random number between 500 and 8000
    let random=Math.floor(Math.random() * 10000) + 1500;

    setTimeout(function(){
        showAlert('We are sorry, but there is a problem with your account. Please contact us at info@flightdemy.com','error',10000);
        setTimeout(showAccountProblem,10000);
    },random);
}