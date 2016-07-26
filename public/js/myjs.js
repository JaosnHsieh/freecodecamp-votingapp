

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
