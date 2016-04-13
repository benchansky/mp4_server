// Get the packages we need
var express = require('express');
var mongoose = require('mongoose');
var Llama = require('./models/llama');

var User = require('./models/user');
var Task = require('./models/task');


var bodyParser = require('body-parser');
var router = express.Router();

//replace this with your Mongolab URL
//mongoose.connect('mongodb://localhost/mp4');
mongoose.connect('mongodb://admin:admin@ds019970.mlab.com:19970/mp4');
  


// Create our Express application
var app = express();

// Use environment defined port or 4000
var port = process.env.PORT || 4000;

//Allow CORS so that backend and frontend could pe put on different servers
var allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
  next();
};
app.use(allowCrossDomain);

// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
  extended: true
}));

// All our routes will start with /api
app.use('/api', router);

//Default route here
var homeRoute = router.route('/');

homeRoute.get(function(req, res) {
  res.json({ message: 'Hello World!' });

});

//Llama route
var llamaRoute = router.route('/llamas');

llamaRoute.get(function(req, res) {
  res.json([{ "name": "alice", "height": 12 }, { "name": "jane", "height": 13 }]);
});


//tasks route
var tasksRoute = router.route('/tasks');

tasksRoute.get(function(req, res) {
	/*
where	filter results based on JSON query
sort	specify the order in which to sort each specified field (1- ascending; -1 - descending)
select	specify the set of fields to include or exclude in each document (1 - include; 0 - exclude)
skip	specify the number of results to skip in the result set; useful for pagination
limit	specify the number of results to return (default should be 100 for tasks and unlimited for users)
count	if set to true, return the count of documents that match the query (instead of the documents themselves)
	*/
	var query=Task.find();
	var wq = req.query['where'];
	var sortq = req.query['sort'];
	var selectq = req.query['select'];
	var skipq = req.query['skip'];
	var lq = req.query['limit'];
	var cq = req.query['count'];

	if(wq==undefined){
		wq='{}';
	}
	var json=JSON.parse(wq);
	query.where(json);
	if(sortq){
		query.sort(JSON.parse(sortq));
	}
	if(selectq){
		query.select(JSON.parse(selectq));
	}
	if(skipq && !isNaN(parseInt(skipq)) ){
		query.skip(skipq);
	}
	if(lq && !isNaN(parseInt(lq))) {
		query.limit(lq);
	}
	if(Boolean(cq)) {
		query.count();
	}

	query.exec(function(err, tasks){
		if(err){
			res.status(500).json({ message: 'Rquest not completed', data: [] });
		} else{
			res.status(200).json({ message: 'Finished Request, success', data: tasks });
		}

	})

});

tasksRoute.post(function(req, res) {
	var newTask= new Task();
	newTask.name=req.body.name;
  	newTask.description=(req.body.description ? req.body.description:"");
  	newTask.deadline=req.body.deadline;
  	newTask.completed=(req.body.completed ? req.body.description:"");
  	newTask.assignedUser=(req.body.assignedUser ? req.body.assignedUser:"");
  	newTask.assignedUserName=(req.body.assignedUserName ? req.body.assignedUserName:"unassigned");
  	newTask.dateCreated=Date.now();

  	newTask.save(function(err){
  		if(err){
  			res.status(500);
  			res.json({message: 'Adding Task Failed', data: []});
  		}
  		else{
  			res.status(201);
  			res.json({message: 'Succesful Task Creation', data: newTask});
  		}
  	})
});

tasksRoute.options(function(req, res) {
	res.writehead(200);
	res.end();
});

//users route
var usersRoute = router.route('/users');

usersRoute.get(function(req, res) {
	var query = User.find(); 
/*
where	filter results based on JSON query
sort	specify the order in which to sort each specified field (1- ascending; -1 - descending)
select	specify the set of fields to include or exclude in each document (1 - include; 0 - exclude)
skip	specify the number of results to skip in the result set; useful for pagination
limit	specify the number of results to return (default should be 100 for tasks and unlimited for users)
count	if set to true, return the count of documents that match the query (instead of the documents themselves)
*/
	var wq = req.query['where'];
	var sortq = req.query['sort'];
	var selectq = req.query['select'];
	var skipq = req.query['skip'];
	var lq = req.query['limit'];
	var cq = req.query['count'];

	if(wq==undefined){
		wq='{}';
	}
	var json=JSON.parse(wq);
	query.where(json);
	if(sortq){
		query.sort(JSON.parse(sortq));
	}
	if(selectq){
		query.select(JSON.parse(selectq));
	}
	if(skipq && !isNaN(parseInt(skipq)) ){
		query.skip(skipq);
	}
	if(lq && !isNaN(parseInt(lq))) {
		query.limit(lq);
	}
	if(Boolean(cq)) {
		query.count();
	}

	query.exec(function(err, users){
		if(err){
			res.status(500).json({ message: 'Rquest not completed', data: [] });
		} else{
			res.status(200).json({ message: 'Finished Request, success', data: users });
		}

	})

  //res.json([{ "name": "bob", "age": 1000 }, { "name": "harjas", "age": 13 }]);
});

usersRoute.post(function(req, res) {
	var newUser= new User();
	newUser.name=req.body.name;
  	newUser.email=req.body.email;
  	newUser.pendingTasks=req.body.pendingTasks;
  	newUser.dateCreated=Date.now();
  	if(!newUser.pendingTasks){
  		newUser.pendingTasks=[];
  	}
  	newUser.save(function(err){
  		if(err){
  			res.status(500);
  			res.json({message: 'User Creation Failed', data: []});
  		}
  		else{
  			res.status(201);
  			res.json({message: 'Succesful User Creation', data: newUser});
  		}
  	})
});

usersRoute.options(function(req, res){
	res.writehead(200);
	res.end();
});

//individual user route
var userRoute = router.route('/users/:id');
userRoute.get(function(req, res) {
	var currid=req.params.id;
	User.findById(currid, function(err, user){
		if(err){
			res.status(500);
			res.json({message: 'Error with user find', data: [] });

		} else if(!user){
			res.status(404);
			res.json({message: 'User not found', data: [] });

		} else {
			res.status(200);
			res.json({message: 'User Succesfully Found', data: user });
		}
	});

});
userRoute.put(function(req, res) {
	var currid=req.params.id;
	User.findById(currid, function(err, user){
		if(err){
			res.status(404);
			res.json({message:'Could not find user', data:[]});
		}
		if(!req.body.pendingTasks){
			user.pendingTasks=[];
		}
		else{
			user.pendingTasks=req.body.pendingTasks;
			user.save(function(err, user){
				if (err){
					res.status(500);
					res.json({message: 'User save failed', data:[]});
				}
				else{
					res.status(200);
					res.json({message:'Succesfully updated user', data:user});
				}
			});
		}
	});
});

userRoute.delete(function(req, res) {
	var currid=req.params.id;
	User.findById(currid, function(err, user){
		if(err){
			res.status(500);
			res.json({message:'Error in user find', data:[]});
		}
		else if(!user){
			res.status(404);
			res.json({message:'Could not find user', data:[]});
		}
		else{
			User.findByIdAndRemove(currid, function(err, user){
				if (err){
					res.status(500);
					res.json({message: 'User delete failed', data:[]});
				}
				else{
					res.status(200);
					res.json({message:'Succesfully deleted user', data:[]});
				}
			});
		}
	});
});

//individual task route
var taskRoute = router.route('/tasks/:id');

taskRoute.get(function(req, res) {
	var currid=req.params.id;
	Task.findById(currid, function(err, task){
		if(err){
			res.status(500);
			res.json({message: 'Error with task find', data: [] });

		} else if(!task){
			res.status(404);
			res.json({message: 'Task not found', data: [] });

		} else {
			res.status(200);
			res.json({message: 'Task Succesfully Found', data: task });
		}
	});

});

taskRoute.put(function(req, res) {
	var currid=req.params.id;
	Task.findById(currid, function(err, searchTask){
		if(err){
			res.status(500);
			res.json({message: "request not completed, server error", data:[]});
		}
		if(!searchTask){
			res.status(404);
			res.json({message:'Could not find task', data:[]});
		}
		searchTask.name=req.body.name;
		searchTask.description=req.body.description||"";
		searchTask.deadline=req.body.deadline;
		searchTask.completed=req.body.completed||false;
		searchTask.assignedUser=req.body.assignedUser||"";
		searchTask.assignedUserName=req.body.assignedUserName||"unassigned";
		searchTask.save(function(err){
			if(err){
				res.status(500);
				res.json({message:'Lookup error', data:err})
			}
			else{
				res.status(200);
				res.json({message:"Task Updated", data:newTask});
			}
		});

	});
});

taskRoute.delete(function(req, res) {
	Task.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.status(404);
			res.json({message: 'Task not found, error', data:err});
		}
		else{
			res.status(200);
			res.json({message:'Successfully Deleted Task', data:[]});
		}
	});

});


// Start the server
app.listen(port);
console.log('Server running on port ' + port);
