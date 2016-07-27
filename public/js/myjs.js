

function autosubmit() {
    $("#picForm").submit();
}

$('#picForm').on('submit', function(e) {

    var formElem = $("#picForm");
    var formdata = new FormData(formElem[0]);

        e.preventDefault();
        $.ajax({
            
            url : $(this).attr('action') || window.location.pathname,
            type: "POST",
            processData: false,
            contentType: false,
            data:formdata,
            // data: $(this).serialize(),
            mimeType: 'multipart/form-data',
            success: function (data) {
                $("#form_output").html("Upload Success!!").removeClass('hidden').fadeOut(5000);
                d = new Date();
                $("#profilePic").attr("src",'/profile/'+data+"?timestamp="+ new Date().getTime());
            },
            error: function (jXHR, textStatus, errorThrown) {
                $("#form_output").html("Upload Failed!!");
            }
        });
    });

  function updateMyinfo(){
      console.log('qqqq');
      $('#editBtn').addClass('hidden');
      $('#saveBtn').removeClass('hidden');
      $('#inputName').removeAttr('disabled');
      $('#inputEmail').removeAttr('disabled');
  }
  
  function saveMyInfo(){
      $('#updateInfoForm').submit();
  }

  $('#updateInfoForm').on('submit', function(e) {

        e.preventDefault();
           $.ajax({
           type: "POST",
           url: '/updateMyinfo',
           data: $("#updateInfoForm").serialize(), // serializes the form's elements.
           success: function(data)
           {
               $('#saveBtn').addClass('hidden');
               $('#editBtn').removeClass('hidden');
               $('#nameTag').html($('#inputName').val());
           }
         });
    });

function addOneOption(){
    var cloneField = $('#optionsForm fieldset:nth-last-child(3)').clone(); //clone the 2nd last ele which is option field
    var num =parseInt(cloneField.children('input').prop('id').match(/\d+/g),10) + 1; //get the number from id prop and++
    cloneField.children('input').prop('id','inputOption'+num); // set new id to new option
    cloneField.children('input').prop('name','nameOption'+num); // set new name to new option
    cloneField.children('input').prop('placeholder','Option '+num); // set new name to new option
    cloneField.children('label').text('Option '+num); // set new text to new option
     $('#optionsForm fieldset:nth-last-child(3)').after(cloneField); // insert to the 2nd last field
    
    if(num >10 ){$("#addOneOptionBtn").html('Reached Maximum').attr("disabled", true); return;}


    // console.log();
}



function vote(){
      $('#voteForm').attr('action','/updateVote/'+voteId).submit();
  }

$("i.fa-remove").click(function(e) {
    var parentLi = $(this).parent()[0];
    var deleteVoteId = $(this).attr("id");
           $.ajax({
           type: "DELETE",
           url: '/vote/'+deleteVoteId,
          //data: $("#updateInfoForm").serialize(), // serializes the form's elements.
           success: function(data)
           {
              console.log('delete successfully');
            parentLi.remove();
            //   $(this).parent("li").remove();
           }
         });
});
