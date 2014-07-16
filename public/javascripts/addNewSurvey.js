$('#addnewquestion').on('click', function(){

  //getting the textinput field
  $.get('/getSurveyField/' + 'textinputeditfull', function(data){
    var li = $('<li class="line"></li>').append($(data));

    //adding event to the Answer Type field to reload answer on change
    var answerType = li.find('.answertype select');
    //answertype change event: reloads the surveyfield keeping the same question
    answerType.on('change', function(e){
      var self=this;
      var option = $(this).val();
      var answer = $(this).parent().parent().find('.answer');
      //var title=li.find('.question input').val();
      
      console.log(answer);
      
      $.get('/getSurveyField/' + option, function(data){
        var newAnswer = $(data);
        console.log(newAnswer.attr('name'));
        //newli.find('.question input').val(title);                   //keep title
        //answer.replaceWith(newAnswer);
        answer.attr('name', newAnswer.attr('name') );
        answer.html( newAnswer.html() ); 
      });
    })

    $('.surveyListEdit ol').append(li);
  })
});

//starts with a survey field visible
$('#addnewquestion').trigger('click');

$('#saveNewSurvey').on('click', function(){
  var $surveyEditor = $('.survey-editor');

  //TODO: validateFields($surveyEditor);

  var survey = { 
    title : $surveyEditor.find('.title input').val(),
    fields: []
  }

  //add each field
  $surveyEditor.find('.line').each(function(){
    var oneField = {
      question: $(this).find('.question input').val(),
      answerType: $(this).find('.answer').attr('name'),
      data: getFieldData($(this))
    }

    survey.fields.push(oneField);

  })

  //survey = JSON.stringify(survey);
  //post to server
  $.post('/addsurvey', {survey:survey}, function(data, status){
    //console.log(data);
    console.log('Status: ', status);
    var url = window.location.pathname= '/' + window.location.pathname.split('/')[1];
    if (status === 'success') redirectUrl(url);
  })
})


function getFieldData($field) {
  var answerType = $field.find('.answer').attr('name');
  var data = [];

  switch(answerType) {
    case 'textInput':
      data.push( $field.find('.answer label').text() );
      break;
    case 'minMaxInput':
      data.push( $field.find('.answer .min label').text() );
      data.push( $field.find('.answer .max label').text() );
      break;
    case 'multipleChecks':
      $field.find('.answer .check label').each(function(){ data.push($(this).text()) })
      break;
    case 'singleRadio':
      $field.find('.answer .radio label').each(function(){ data.push($(this).text()) })
      break;
    case 'textarea':
      data.push( $field.find('.answer label').text() );
      break;
  }

  return data;
}



function redirectUrl(url) {
    var ua        = navigator.userAgent.toLowerCase(),
        isIE      = ua.indexOf('msie') !== -1,
        version   = parseInt(ua.substr(4, 2), 10);

    // IE8 and lower
    if (isIE && version < 9) {
        var link = document.createElement('a');
        link.href = url;
        document.body.appendChild(link);
        link.click();
    }

    // All other browsers
    else { window.location.replace(url); }
}