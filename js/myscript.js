$(function(){
    var modalBox;
    modalBox = {
        createBox: function (){

            $(this.template()).appendTo('body');
            $('.dumbBoxWrap input[type="number"]').on('change', function(){
                var $this = $(this);

                var isOk = $this.val() > 0 ? true : false;

                if($this.attr('name') == 'minutes'){
                    isOk = isOk || $this.next().val() > 0 ? true : false;
                }
                else {
                    isOk = isOk || $this.prev().val() > 0 ? true : false;
                }

                isOk ?
                    $('.dumbBoxWrap input[name="ok"]').removeAttr('disabled') :
                    $('.dumbBoxWrap input[name="ok"]').attr('disabled', 'disabled');
            })
                .on('keypress', function(event){
                    var code = (event.charCode) ? event.charCode : event.keyCode;
                    if(code >=48 && code <=57){
                        $('.dumbBoxWrap input[name="ok"]').removeAttr('disabled')
                        return true;
                    }
                    else{
                        return false;
                    }
                });

            $('.dumbBoxWrap input[name="ok"]').on('click', this.okHandler);
            $('.dumbBoxWrap input[name="cancel"]').on('click', this.cancelHandler);

            $('.dumbBoxWrap').show();
            return false;
        },
        template: function(){

            var html = "<div class='dumbBoxWrap' draggable='true'><div class='vertical-offset'><div class='dumbBox'><header>"+chrome.i18n.getMessage("modalTitle")+"</header><div class='inner'><div><input type='number' name='minutes' min='0' placeholder='"+chrome.i18n.getMessage("minutes")+"' /><input type='number' name='seconds' min='0' max='59' placeholder='"+chrome.i18n.getMessage("seconds")+"' /></div><div class='buttons'><input type='submit' name='ok' value='OK' disabled/><input type='submit' name='cancel' value='"+chrome.i18n.getMessage("cancel")+"' /></div></div></div></div></div>";

            return html;
        },
        okHandler: function (event) {
            var seconds = 0*0;
            if($('.dumbBoxWrap input[name="minutes"]').val()){
                seconds += $('.dumbBoxWrap input[name="minutes"]').val()*60;
            }
            if($('.dumbBoxWrap input[name="seconds"]').val()){
                seconds += $('.dumbBoxWrap input[name="seconds"]').val()*1;
            }
            if(seconds == 0){
                $('.dumbBoxWrap input[name="ok"]').attr('disabled', 'disabled');
            }
            else {
                $('.dumbBoxWrap').remove();
                chrome.runtime.sendMessage({action: "startReload", value: seconds}, function(response) {});
            }

        },
        cancelHandler: function (event) {
            $('.dumbBoxWrap').remove();
            chrome.runtime.sendMessage({action: "resetMenu"}, function(response) {});
        }
    }
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.run == "createBox") {
            modalBox.createBox();
        }
    });
});
