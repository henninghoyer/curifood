var express = require('express');
var app = express();
app.use(express.logger());


// Mysql credentials
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'healkdb.cff4ld4u4nak.us-east-1.rds.amazonaws.com',
  database : 'healkdb',
  user     : 'healkusr',
  password : 'letZallTalk2013',
});

// Returns categories of ingredients
app.get('/categories', function(request, response) {
 
    var query = connection.query('select id, name from cf_categories', function(err, rows, fields) {
 	if (err) {
	        console.log('ERROR: ' + err);
	        response.send('{"success":"false", "general_message":"Error while connecting to the curifood DB","errors":"' + err + '"}');
	   } else {
	       response.send('{"success":"true", "categories":' + JSON.stringify(rows) + ' }');
	}
    });
});

// Returns ingredients of specified category
// If no category is selected... returns all ingredients
app.get('/ingredients/:id?', function(request, response) {

    var id = request.params.id;
    var sql = '';
    if (id) {
        sql = 'select * from cf_ingredients where id = ' + id;
    } else {
        sql = 'select * from cf_ingredients';
    }
    var query = connection.query(sql, function(err, rows, fields) {
        if (err) {
                console.log('ERROR: ' + err);
                response.send('{"success":"false", "general_message":"Error while connecting to the curifood DB","errors":"' + err + '"}');           } else {
               response.send('{"success":"true", "ingredients":' + JSON.stringify(rows) + ' }');        }
    });});

// Returns recipes by id.
// If no id is selected... returns all recipes
app.get('/recipes/:id?', function(request, response) {

    var id = request.params.id;
    var sql = '';
    if (id) {
        sql = 'select * from cf_recipes where id = ' + id;
    } else {
        sql = 'select * from cf_recipes';
    }
    var query = connection.query(sql, function(err, rows, fields) {
        if (err) {
                console.log('ERROR: ' + err);
                response.send('{"success":"false", "general_message":"Error while connecting to the curifood DB","errors":"' + err + '"}');
           } else {
               response.send('{"success":"true", "ingredients":' + JSON.stringify(rows) + ' }');
        }
    });
});

// Returns recipes based on selected ingredients with percentage of recipe completion
app.get('/recipes/ingredients/:id?', function(request, response) {
    var id = request.params.id;
    var sql = '';    
    if (id) {
        
	var ingredients = id.split(',');
	var ingredientsLength = ingredients.length;
	sql = 'select cf_recipes.id, cf_recipes.name, (select count(*) from cf_relation where cf_relation.recipe = cf_recipes.id) as total_ingredients, count(*) as my_ingredients, count(*)/(select count(*) from cf_relation where cf_relation.recipe = cf_recipes.id) AS percent from cf_relation INNER JOIN cf_recipes ON cf_relation.recipe = cf_recipes.id where ';
	for( var i = 0; i < ingredientsLength; i++ ) {
	 
	    if (i === 0) {
		sql = sql + 'cf_relation.ingredient = ' + ingredients[i];
	    }  else {
		sql = sql + ' or cf_relation.ingredient = ' + ingredients[i];
	    }
	}
	sql = sql + ' group by recipe order by percent desc';
	// console.log('sql: ' + sql); 
	// response.send('{"count":' + ingredientsLength + ', "":' + JSON.stringify(ingredients) + ' ,"ingredients": ' + sql + ' }');
	
    } else {
	response.send('{"success":"false", "general_message":"No ingredients selected"}');
	return;
    }
   
	var query = connection.query(sql, function(err, rows, fields) {        
	if (err) {
            console.log('ERROR: ' + err);                

	    response.send('{"success":"false", "general_message":"Error while connecting to the curifood DB","errors":"' + err + '"}');
	} else {               
	    response.send('{"success":"true", "recipes":' + JSON.stringify(rows) + ' }');
        }    
    });
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
