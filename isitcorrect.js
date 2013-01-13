var configs = require("./config.js");
var request = require('request');

var wordGroups = ["اعآ","تط","سثص","حه","زذظض","قغ"];

function allPossibleCases (arr) 
{
	if (arr.length == 1) 
	{
		return arr[0];
	} 
	else 
	{
		var result = [];
		var allCasesOfRest = allPossibleCases(arr.slice(1));  // recur with the rest of array
		for (var i = 0; i < allCasesOfRest.length; i++) 
		{
			for (var j = 0; j < arr[0].length; j++) 
			{
				result.push(arr[0][j] + allCasesOfRest[i]);
			}
		}
		return result;
	}
}


function IsItCorrect()
{

}

IsItCorrect.prototype.otherForms = function(word)
{
	var result = [];
	var charachters = word.split("");
	var charachter;
	var group;
	var permutations = [];
	for(var i=0;i<charachters.length;i++)
	{
		charachter = charachters[i];
		permutations[i] = [charachter];
		for(var j=0;j<wordGroups.length;j++)
		{
			group = wordGroups[j];
			if(group.indexOf(charachter) != -1)
			{
				permutations[i] = group.split("");
				break
			}
		}
	}
	return allPossibleCases(permutations);
}


IsItCorrect.prototype.checkWord = function(value,cb)
{
	result = null;
	var path = configs.api;
	path = path.split("%word%").join(value);
	//console.log("Request sent to :",path);
	request(path, function (error, response, body) 
	{
		if (!error && response.statusCode == 200) 
		{
			cb(error, response, body);
		}
	});
}

IsItCorrect.prototype.check = function(value,cb)
{
	var words = value.split(" ");
	var word;
	var otherWord;
	console.log("The main sentence is : ",value);
	for(var i=0;i<words.length;i++)
	{
		word = words[i];
		word = word.replace(/[0-9]/g, '').replace(/[۰-۹]/g, '').replace(/[a-z]/g, '').replace(/[A-Z]/g, '');
		if(word.length > 2)
		{
			this.checkWord(word,function(error, response, body){
				var hasBody = false;
				if(body)
				{
					body = body.replace(/(<([^>]+)>)/ig,"");
				}
				else
				{
					body = "";
				}
				if(body.indexOf(" "+this.word+"@") !=-1)
				{
					hasBody = true;	
					console.log("Founded :",this.word);	
				}
				else
				{
					var result = this.me.otherForms(this.word);
					for(var j=0;j<result.length;j++)
					{
						otherWord = result[j];
						this.me.checkWord(otherWord,function(error, response, body){
							var hasBody = false;
							if(body)
							{
								body = body.replace(/(<([^>]+)>)/ig,"");
								if(body.indexOf(" "+this.word+"@") !=-1)
								{
									hasBody = true;	
								}
								
							}
							if(hasBody)
							{
								console.log("Simillar to ",this.word," : ",this.base);
							}
						}.bind({word:otherWord,base:this.word}));
					}
				}
			}.bind({me:this,word:word}));
		}
	}
}

var correctMe = new IsItCorrect();
correctMe.check("این باسه من طنبان نمیشه!",function(reslt){

});
