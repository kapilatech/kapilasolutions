/**
* search related functions
* requires jQuery
*/
var searchInput;
var offSearch;
var whereToGo;
(function($) {
	
searchInput = function(id) {
	var searchValue = $(id).val();
	if (searchValue == "Search" || searchValue == "Enter Keyword" || searchValue == "Enter Name or Keyword")
	{
		$(id).val('');
	}
	else
	{
		return false;
	}
}
	

offSearch = function(id, value) {
	var searchValue = $(id).val();
	if(value == "Search")
	{
		if (searchValue == "Search" || searchValue === "")
		{
				$(id).val('Search');
		}
	}
	else if(value == "Enter Keyword")
	{
		if (searchValue == "Enter Keyword" || searchValue === "")
		{
				$(id).val('Enter Keyword');
		}
	}
	else if(value == "Enter Name or Keyword")
	{
		if (searchValue == "Enter Name or Keyword" || searchValue === "")
		{
				$(id).val('Enter Name or Keyword');
		}
	}
	else
	{
		return false;
	}
}

whereToGo = function() {
       var valWhatWeDo = $('#homwhatWeDo option:selected').val()
       var valWhoWeServe = $('#whoWeServer option:selected').val();

       valWhatWeDo = valWhatWeDo.replace(/ /gi, "+");
       valWhoWeServe = valWhoWeServe.replace(/ /gi, "+");
       if(valWhatWeDo == "" && valWhoWeServe != "")
       {
              window.location = 'http://search.boozallen.com/?x=0&y=0&q=' + '"' + valWhoWeServe + '"';
       }
       else if(valWhatWeDo != "" && valWhoWeServe == "")
       {
              window.location = 'http://search.boozallen.com/?x=0&y=0&q=' + '"' + valWhatWeDo + '"';
       }
       else if(valWhatWeDo != "" && valWhoWeServe != "")
       {
              window.location = 'http://search.boozallen.com/?x=0&y=0&q=' + '"' + valWhatWeDo + '"' + '+and+' + '"' + valWhoWeServe + '"';
       }
       else
       {
              return;
       }
}

   
$(document).ready(function(){
		$('#HeaderSearch .Button').click(function(){
		  var value = $('#HeaderSearch input[type="text"]').val();
		  if(value == "Search" || value == "")
		  {
		      $('#HeaderSearch input[type="text"]').val('');
		  }
		});
 
          $("#ideasInsightsearchform input[type='image']").click(function(){
                   var value = $('#ideasInsightsearchform input[type="text"]').val();
                   if(value == "Enter Keyword" || value == "")
                   {
                             $('#ideasInsightsearchform input[type="text"]').val('');
                   }
          }); 
 
          $("#mediaCentersearchform input[type='image']").click(function(){
                   var value = $('#mediaCentersearchform input[type="text"]').val();
                   if(value == "Enter Keyword" || value == "")
                   {
                             $('#mediaCentersearchform input[type="text"]').val('');
                   }
          });     
         
});


})(jQuery);
