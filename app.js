const express=require("express");
const bodyParser=require("body-parser");
const https=require("https");
const { request, get } = require("http");
const app=express();
app.use(bodyParser.urlencoded({extended:false}));

app.use(express.static("public"));  //IS REQUIRED SO THAT OUR SERVER CAN SERVE UP ALL OUR STATIC FILES(THAT ARE IN OUR LOCAL FILESYSTEM, LIKE styles.css & monke.png).
//We created a folder "public" as our static folder. This folder contains all the static files required to serve up the local content. 

app.get("/",function(req,res){
    res.sendFile(__dirname+"/signup.html");
})
app.post("/failure",function(req,res){
    res.redirect("/");
})
app.post("/",function(req,res){
    const firstName=req.body.fname;
    const lastName=req.body.lname;
    const email=req.body.email;
    const chimpData={     //this js object has to have keys that are recognisable by the mailchimp api. See them at https://mailchimp.com/developer/marketing/api/lists/batch-subscribe-or-unsubscribe/
        members:[   //can send upto 500 members with a single api call. But we want to add one by one. so only one member in the members array.
            {
                email_address:email,
                status:"subscribed",
                merge_fields:{      //for firstname,lastname etc. See it at https://us1.admin.mailchimp.com/lists/settings/merge-tags?id=1601710
                    FNAME:firstName,    //FNAME is the tag given to the firstname field on mailchimp. So,it becomes our key here.
                    LNAME:lastName
                }
            }
        ]
    }   //this object is a js object. We need to turn it into a flatpack json
    const jsonData=JSON.stringify(chimpData);   //turned it into a flatpack json.

    //Below is the part to send a request to mailchimp to store this data.
    const list_id="18452fbb2a";
    const url="https://us1.api.mailchimp.com/3.0/lists/"+list_id+"";  //mailchimp endpoint. Got this from the endpoint to batch subscribe/unsubscribe. https://mailchimp.com/developer/marketing/api/lists/batch-subscribe-or-unsubscribe/
    //us1 is the server that we have been assigned to. See the api key ka last part.
    const options={
        method:"POST",
        auth:"Tejas:11d51131190777266c83c1ccc6e6ab78-us1"   //auth requires username and password. username can be anything you want(mailchimp says so). password is your api.
    }
    const request=https.request(url,options,function(response){   //We save this https request in a const. so that we can use this const ahead to send the actual jsonData that we want to send to mailchimp.
        //we send an https request. And we get back a response. Ye woh hi response hai which is in the callback function.
        if(response.statusCode==200)
        {
            res.sendFile(__dirname+"/success.html");
        }
        else
        {
            res.sendFile(__dirname+"/failure.html");
        }
        response.on("data",function(data){  //when we receive a response from the server which contains "data",we console log it.
            console.log(JSON.parse(data));
        })
    })
    request.write(jsonData);     //Basically,add your wanted data to the request. Then this request is sent to the endpoint. Sends a chunk of the body. By calling this method many times, a request body can be sent to a server. In that case, it is suggested to use the ['Transfer-Encoding', 'chunked'] header line when creating the request.
    request.end();  //to say that we are done with the request.
})

app.listen(process.env.PORT || 3000,function(){     //dynamic port that heroku will decide. this process.env is defined by heroku,so wont work on your pc. The || will cause our code to be able to run on both heroku and our local file system.
    console.log("server running on port 3000");
})

//API KEY: 11d51131190777266c83c1ccc6e6ab78-us1
//LIST ID: 18452fbb2a   identifies which list you want to put your subscriber into